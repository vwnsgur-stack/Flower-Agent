from database import SessionLocal
from models import Reservation
import datetime

db = SessionLocal()
try:
    today = datetime.date.today().isoformat()
    reservations = db.query(Reservation).all()
    for res in reservations:
        res.pickup_date = today
    db.commit()
    print(f"Successfully updated {len(reservations)} reservations to {today}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
