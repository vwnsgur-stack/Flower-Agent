from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
from datetime import date, time

# Drop and create tables
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if florist exists
florist = db.query(models.Florist).first()
if not florist:
    florist = models.Florist(shop_name="Mock Florist", phone="010-1234-5678")
    db.add(florist)
    db.commit()
    db.refresh(florist)

customers = [
    {"name": "김철수", "phone_number": "010-1111-2222"},
    {"name": "박영희", "phone_number": "010-3333-4444"},
    {"name": "이민수", "phone_number": "010-5555-6666"},
    {"name": "최은지", "phone_number": "010-7777-8888"},
    {"name": "정다운", "phone_number": "010-9999-0000"}
]

db_customers = []
for c in customers:
    db_c = db.query(models.Customer).filter(models.Customer.phone_number == c["phone_number"]).first()
    if not db_c:
        db_c = models.Customer(name=c["name"], phone_number=c["phone_number"])
        db.add(db_c)
        db.commit()
        db.refresh(db_c)
    db_customers.append(db_c)

# Adding 10 reservations for today
today = date.today()
reservations = [
    {"customer_id": db_customers[0].id, "pickup_time": time(10, 30), "is_paid": True, "status": "PENDING", "desc": "장미 100송이 꽃다발 레드"},
    {"customer_id": db_customers[1].id, "pickup_time": time(11, 0), "is_paid": False, "status": "PENDING", "desc": "어버이날 카네이션 바구니"},
    {"customer_id": db_customers[2].id, "pickup_time": time(13, 0), "is_paid": True, "status": "PICKED_UP", "desc": "튤립 10송이 믹스"},
    {"customer_id": db_customers[3].id, "pickup_time": time(14, 30), "is_paid": True, "status": "PENDING", "desc": "수국 한다발 화이트톤"},
    {"customer_id": db_customers[4].id, "pickup_time": time(16, 0), "is_paid": False, "status": "PENDING", "desc": "개업 축하 화분"},
    {"customer_id": db_customers[0].id, "pickup_time": time(17, 30), "is_paid": True, "status": "PENDING", "desc": "프리지아 노랑 꽃다발"},
    {"customer_id": db_customers[1].id, "pickup_time": time(18, 0), "is_paid": True, "status": "PICKED_UP", "desc": "백합 한다발"},
    {"customer_id": db_customers[2].id, "pickup_time": time(19, 0), "is_paid": False, "status": "PENDING", "desc": "서양란 화분"},
    {"customer_id": db_customers[3].id, "pickup_time": time(20, 0), "is_paid": True, "status": "PENDING", "desc": "미니 꽃다발 핑크톤"},
    {"customer_id": db_customers[4].id, "pickup_time": time(20, 30), "is_paid": False, "status": "PENDING", "desc": "해바라기 5송이 포장"},
]

for r in reservations:
    db_res = models.Reservation(
        florist_id=florist.id,
        customer_id=r["customer_id"],
        pickup_date=today,
        pickup_time=r["pickup_time"],
        is_paid=r["is_paid"],
        status=r["status"],
        detailed_description=r["desc"]
    )
    db.add(db_res)

db.commit()
db.close()
print("10 mock data inserted successfully.")
