from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, index=True, nullable=True)
    role = Column(String, nullable=False) # admin, hospital, bloodbank, donor, patient
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    inventory = relationship("Inventory", back_populates="owner")
    requests = relationship("BloodRequest", back_populates="requester")
    donations = relationship("Donation", back_populates="donor")
    notifications = relationship("Notification", back_populates="user")
    badges = relationship("Badge", back_populates="donor")
    logs = relationship("AuditLog", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    national_id = Column(String, unique=True, index=True, nullable=True) # E.g., Aadhaar / National ID
    date_of_birth = Column(Date, nullable=True)
    weight = Column(Float, nullable=True)
    hemoglobin = Column(Float, nullable=True)
    last_donation_date = Column(Date, nullable=True)
    health_conditions = Column(Text, nullable=True)
    travel_history = Column(Text, nullable=True)
    vaccination_status = Column(String, nullable=True)
    blood_group = Column(String, index=True, nullable=True) # A+, A-, B+, B-, AB+, AB-, O+, O-, Rare
    city = Column(String, index=True, nullable=True)
    district = Column(String, index=True, nullable=True)
    state = Column(String, index=True, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    is_eligible = Column(Boolean, default=True)
    availability_status = Column(String, default="available") # available, unavailable

    user = relationship("User", back_populates="profile")

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    blood_group = Column(String, index=True, nullable=False)
    quantity = Column(Float, default=0.0) # In Units (e.g. 350ml or 450ml units)
    expiry_date = Column(Date, nullable=False)
    storage_temp = Column(Float, default=4.0) # Standard is 2-6 °C for whole blood
    status = Column(String, default="available") # available, reserved, expired
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="inventory")

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    recipient_name = Column(String, nullable=False)
    blood_group = Column(String, index=True, nullable=False)
    units_required = Column(Float, nullable=False)
    emergency_type = Column(String, default="routine") # critical, urgent, routine
    priority_score = Column(Float, default=0.0) # Calculated by AI
    status = Column(String, default="pending") # pending, matching, approved, fulfilled, cancelled
    hospital_name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    requester = relationship("User", back_populates="requests")
    donations = relationship("Donation", back_populates="request")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("blood_requests.id", ondelete="SET NULL"), nullable=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    donation_date = Column(DateTime, nullable=False)
    units_donated = Column(Float, default=1.0)
    certificate_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    donor = relationship("User", back_populates="donations")
    request = relationship("BloodRequest", back_populates="donations")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String, default="alert") # sms, email, push, emergency
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False) # Bronze, Silver, Gold, Platinum, Hero, LifeSaver
    description = Column(String, nullable=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    donor = relationship("User", back_populates="badges")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")
