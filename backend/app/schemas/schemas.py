from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

# ----------------- TOKEN SCHEMAS -----------------
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

# ----------------- PROFILE SCHEMAS -----------------
class ProfileBase(BaseModel):
    national_id: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight: Optional[float] = None
    hemoglobin: Optional[float] = None
    last_donation_date: Optional[date] = None
    health_conditions: Optional[str] = None
    travel_history: Optional[str] = None
    vaccination_status: Optional[str] = None
    blood_group: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    availability_status: Optional[str] = "available"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: int
    is_eligible: bool

    class Config:
        from_attributes = True

# ----------------- USER SCHEMAS -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_verified: bool
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True

# ----------------- INVENTORY SCHEMAS -----------------
class InventoryBase(BaseModel):
    blood_group: str
    quantity: float
    expiry_date: date
    storage_temp: Optional[float] = 4.0
    status: Optional[str] = "available"

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[float] = None
    expiry_date: Optional[date] = None
    storage_temp: Optional[float] = None
    status: Optional[str] = None

class InventoryOut(InventoryBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- BLOOD REQUEST SCHEMAS -----------------
class BloodRequestBase(BaseModel):
    recipient_name: str
    blood_group: str
    units_required: float
    emergency_type: str # critical, urgent, routine
    hospital_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequestUpdate(BaseModel):
    status: Optional[str] = None

class BloodRequestOut(BloodRequestBase):
    id: int
    requester_id: int
    priority_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- DONATION SCHEMAS -----------------
class DonationBase(BaseModel):
    request_id: Optional[int] = None
    donation_date: datetime
    units_donated: Optional[float] = 1.0

class DonationCreate(DonationBase):
    donor_id: int

class DonationUpdate(BaseModel):
    status: Optional[str] = None
    certificate_url: Optional[str] = None

class DonationOut(DonationBase):
    id: int
    donor_id: int
    status: str
    certificate_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- NOTIFICATION SCHEMAS -----------------
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- BADGE SCHEMAS -----------------
class BadgeOut(BaseModel):
    id: int
    donor_id: int
    title: str
    description: Optional[str] = None
    awarded_at: datetime

    class Config:
        from_attributes = True

# ----------------- AUDIT LOG SCHEMAS -----------------
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- AI SCHEMAS -----------------
class DonorRecommendation(BaseModel):
    donor_id: int
    full_name: str
    blood_group: str
    distance_km: float
    travel_time_mins: int
    eligibility_probability: float
    compatibility_score: float
    overall_score: float # 0 - 100

class ShortagePredictionItem(BaseModel):
    date: str
    blood_group: str
    historical_avg: float
    predicted_demand: float
    available_units: float
    shortage_risk: str # High, Medium, Low
    deficit_units: float

class ShortagePredictionResponse(BaseModel):
    predictions: List[ShortagePredictionItem]

class PriorityRankingResponse(BaseModel):
    priority_score: float # 0 - 100
    factors: List[str]
    rank_level: str # Critical, High, Medium, Low

class EligibilityCheckRequest(BaseModel):
    age: int
    weight: float
    hemoglobin: float
    last_donation_months: float
    has_medical_conditions: bool
    travel_history_suspicious: bool
    vaccination_recent: bool

class EligibilityCheckResponse(BaseModel):
    is_eligible: bool
    score: float # 0 - 100 (probability)
    reason: str

class ChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str
