from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, time, datetime
from sqlalchemy import Column, Integer, String, Date, Time, Text, ForeignKey, JSON, Boolean

class FloristCreate(BaseModel):
    email: str
    password: str
    shop_name: str
    phone: str
    business_number: str
    address: str

class FloristLogin(BaseModel):
    email: str
    password: str

class FloristResponse(BaseModel):
    id: int
    email: str
    shop_name: str
    phone: str
    business_number: str
    address: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReferenceImageBase(BaseModel):
    image_url: str
    ai_detected_flowers: Optional[Any] = None
    ai_notes: Optional[str] = None
    created_at: Optional[datetime] = None

class CustomerBase(BaseModel):
    name: str
    phone_number: str

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    total_reservations: int = 0
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ReservationBase(BaseModel):
    pickup_date: date
    pickup_time: time
    is_paid: bool = False
    price: Optional[int] = None
    detailed_description: Optional[str] = None

class ReservationCreate(ReservationBase):
    customer_name: str
    phone_number: str
    image_url: Optional[str] = None
    ai_notes: Optional[str] = None
    ai_detected_flowers: Optional[List[str]] = []

class ReservationResponse(ReservationBase):
    id: int
    status: str
    customer: CustomerResponse
    images: List[ReferenceImageBase] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
