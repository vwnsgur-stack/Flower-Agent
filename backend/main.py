from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, schemas, ai_service
from database import engine, get_db
import json
import os
import base64
import uuid

os.makedirs("uploads", exist_ok=True)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Florist AI Reservation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

async def notify_clients(message: str):
    await manager.broadcast(message)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Florist AI Reservation API"}

import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/auth/register", response_model=schemas.FloristResponse)
def register_florist(florist: schemas.FloristCreate, db: Session = Depends(get_db)):
    db_florist = db.query(models.Florist).filter(models.Florist.email == florist.email).first()
    if db_florist:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_florist = models.Florist(
        email=florist.email,
        hashed_password=hash_password(florist.password),
        shop_name=florist.shop_name,
        phone=florist.phone,
        business_number=florist.business_number,
        address=florist.address
    )
    db.add(new_florist)
    db.commit()
    db.refresh(new_florist)
    return new_florist

@app.post("/auth/login", response_model=schemas.FloristResponse)
def login_florist(florist: schemas.FloristLogin, db: Session = Depends(get_db)):
    db_florist = db.query(models.Florist).filter(models.Florist.email == florist.email).first()
    if not db_florist or db_florist.hashed_password != hash_password(florist.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return db_florist

@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/analyze-image/")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_location = f"uploads/{filename}"
    
    file_bytes = await file.read()
    with open(file_location, "wb") as f:
        f.write(file_bytes)
        
    base64_image = base64.b64encode(file_bytes).decode('utf-8')
    mime_type = file.content_type or "image/jpeg"
    data_url = f"data:{mime_type};base64,{base64_image}"
    
    ai_result = ai_service.analyze_flower_image(data_url)
    
    return {
        "image_url": f"http://localhost:8000/uploads/{filename}",
        "ai_summary": ai_result.get("summary", "분석 실패, 이미지를 다시 등록해주세요."),
        "ai_flowers": ai_result.get("flowers")
    }

@app.post("/reservations/", response_model=schemas.ReservationResponse)
def create_reservation(reservation: schemas.ReservationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.phone_number == reservation.phone_number).first()
    if not db_customer:
        db_customer = models.Customer(
            name=reservation.customer_name,
            phone_number=reservation.phone_number,
            total_reservations=1
        )
        db.add(db_customer)
    else:
        db_customer.total_reservations += 1
    
    db.commit()
    db.refresh(db_customer)

    ai_summary = reservation.ai_notes or ""
    detected_flowers = reservation.ai_detected_flowers or []

    db_reservation = models.Reservation(
        florist_id=1, 
        customer_id=db_customer.id,
        pickup_date=reservation.pickup_date,
        pickup_time=reservation.pickup_time,
        is_paid=reservation.is_paid,
        price=reservation.price,
        detailed_description=reservation.detailed_description,
        status="PENDING"
    )
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    
    if reservation.image_url:
        db_image = models.ReferenceImage(
            reservation_id=db_reservation.id,
            image_url=reservation.image_url,
            ai_detected_flowers=detected_flowers,
            ai_notes=ai_summary
        )
        db.add(db_image)
        db.commit()

    # WebSocket Broadcast Notification
    msg = json.dumps({"type": "new_reservation", "message": f"{db_customer.name} 고객님의 새 예약이 등록되었습니다!"})
    background_tasks.add_task(notify_clients, msg)

    return db_reservation

@app.delete("/reservations/{reservation_id}")
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    db_reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    db.query(models.ReferenceImage).filter(models.ReferenceImage.reservation_id == reservation_id).delete()
    db.delete(db_reservation)
    db.commit()
    return {"message": "Reservation deleted successfully"}

@app.get("/reservations/", response_model=list[schemas.ReservationResponse])
def read_reservations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reservations = db.query(models.Reservation).offset(skip).limit(limit).all()
    return reservations
