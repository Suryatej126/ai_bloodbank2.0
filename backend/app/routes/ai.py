from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.models import User, BloodRequest, Profile, Inventory
from app.schemas.schemas import (
    DonorRecommendation, ShortagePredictionResponse, EligibilityCheckRequest,
    EligibilityCheckResponse, ChatRequest, ChatResponse, ShortagePredictionItem
)
from app.ai.engine import (
    recommend_donors, predict_shortage, calculate_distance, run_chatbot_query,
    preprocess_eligibility_features
)
import joblib
import os
from typing import List

router = APIRouter(prefix="/ai", tags=["AI Prediction Module"])

@router.get("/recommend-donors/{req_id}", response_model=List[DonorRecommendation])
def get_donor_recommendations(
    req_id: int,
    current_user: User = Depends(RoleChecker(["admin", "hospital"])),
    db: Session = Depends(get_db)
):
    # Fetch blood request
    req = db.query(BloodRequest).filter(BloodRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # Fetch all registered donors
    donors = db.query(User).options(joinedload(User.profile)).join(User.profile).filter(
        User.role == "donor",
        User.profile.has(availability_status="available")
    ).all()
    
    # Structure donors list for AI engine
    donors_list = []
    for d in donors:
        # Calculate donor acceptance rate stub
        # We query past accepted donations vs cancelled ones
        donors_list.append({
            "id": d.id,
            "name": d.full_name,
            "blood_group": d.profile.blood_group,
            "lat": d.profile.latitude,
            "lon": d.profile.longitude,
            "age": 28, # Mock default or calculated from DOB
            "weight": d.profile.weight or 72.0,
            "hemoglobin": d.profile.hemoglobin or 14.5,
            "last_donation_date": d.profile.last_donation_date,
            "health_conditions": d.profile.health_conditions,
            "travel_history": d.profile.travel_history,
            "vaccination_status": d.profile.vaccination_status,
            "acceptance_rate": 0.85
        })
        
    recommendations = recommend_donors(
        recipient_lat=req.latitude,
        recipient_lon=req.longitude,
        recipient_blood_group=req.blood_group,
        donors_list=donors_list
    )
    return recommendations

@router.get("/predict-shortages", response_model=ShortagePredictionResponse)
def get_shortage_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sum available inventory per group
    inventory_sums = db.query(
        Inventory.blood_group,
        func.sum(Inventory.quantity).label("total_quantity")
    ).filter(Inventory.status == "available").group_by(Inventory.blood_group).all()
    
    inventory_map = {bg: 0.0 for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
    for item in inventory_sums:
        if item.blood_group in inventory_map:
            inventory_map[item.blood_group] = float(item.total_quantity)
            
    all_predictions = []
    for bg, units in inventory_map.items():
        predictions = predict_shortage(blood_group=bg, available_units=units)
        for pred in predictions:
            all_predictions.append(ShortagePredictionItem(**pred))
            
    return ShortagePredictionResponse(predictions=all_predictions)

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility(req: EligibilityCheckRequest):
    features = [
        req.age,
        req.weight,
        req.hemoglobin,
        req.last_donation_months,
        1 if req.has_medical_conditions else 0,
        1 if req.travel_history_suspicious else 0,
        1 if req.vaccination_recent else 0
    ]
    
    # 1. Base eligibility check (hard rules)
    is_eligible = True
    reason = "Donor criteria met. Suitable to donate."
    
    if req.age < 18 or req.age > 65:
        is_eligible = False
        reason = "Age must be between 18 and 65 years."
    elif req.weight < 50.0:
        is_eligible = False
        reason = "Weight must be at least 50 kg."
    elif req.hemoglobin < 12.5:
        is_eligible = False
        reason = "Hemoglobin must be at least 12.5 g/dl."
    elif req.last_donation_months < 3.0:
        is_eligible = False
        reason = "Last donation must be at least 3 months ago."
    elif req.has_medical_conditions:
        is_eligible = False
        reason = "Disqualified due to active medical indicators."
    elif req.travel_history_suspicious:
        is_eligible = False
        reason = "Disqualified due to recent travel risk indicators."
    elif req.vaccination_recent:
        is_eligible = False
        reason = "Temporary deferral due to recent vaccination."

    # 2. Score probability using Random Forest Classifier model
    try:
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "eligibility_model.joblib")
        model = joblib.load(model_path)
        prob = float(model.predict_proba([features])[0][1])
    except Exception:
        prob = 1.0 if is_eligible else 0.0
        
    return EligibilityCheckResponse(
        is_eligible=is_eligible,
        score=round(prob * 100, 1),
        reason=reason
    )

@router.post("/chatbot", response_model=ChatResponse)
def process_chatbot_query(
    chat_req: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    # Fetch last message
    if not chat_req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
        
    last_user_message = chat_req.messages[-1].content
    response = run_chatbot_query(last_user_message, current_user_role=current_user.role)
    
    return ChatResponse(response=response)
