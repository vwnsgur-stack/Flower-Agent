from sqlalchemy import Column, Integer, String, Date, Time, Text, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Florist(Base):
    __tablename__ = "florists"
    id = Column(Integer, primary_key=True, index=True)
    shop_name = Column(String, index=True)
    phone = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    business_number = Column(String, nullable=False)
    address = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    reservations = relationship("Reservation", back_populates="florist")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    total_reservations = Column(Integer, default=0)
    
    reservations = relationship("Reservation", back_populates="customer")

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    florist_id = Column(Integer, ForeignKey("florists.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    pickup_date = Column(Date)
    pickup_time = Column(Time)
    is_paid = Column(Boolean, default=False)
    price = Column(Integer, nullable=True)
    status = Column(String, default="PENDING")
    detailed_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    florist = relationship("Florist", back_populates="reservations")
    customer = relationship("Customer", back_populates="reservations")
    images = relationship("ReferenceImage", back_populates="reservation")

class ReferenceImage(Base):
    __tablename__ = "reference_images"
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    image_url = Column(String)
    ai_detected_flowers = Column(JSON, nullable=True)
    ai_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reservation = relationship("Reservation", back_populates="images")
