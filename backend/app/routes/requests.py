from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.models import User, BloodRequest, Donation, Inventory, Notification, Badge, AuditLog
from app.schemas.schemas import BloodRequestCreate, BloodRequestOut, BloodRequestUpdate, DonationOut
from app.ai.engine import calculate_priority_score
from typing import List, Optional
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/requests", tags=["Blood Request & Donation"])

@router.post("/", response_model=BloodRequestOut, status_code=status.HTTP_201_CREATED)
def create_blood_request(
    req_in: BloodRequestCreate,
    current_user: User = Depends(RoleChecker(["admin", "hospital", "patient"])),
    db: Session = Depends(get_db)
):
    # Determine vulnerability indicators based on mock patient details
    # Compute Priority Score with the AI module
    priority_data = calculate_priority_score(
        emergency_type=req_in.emergency_type,
        units_required=req_in.units_required,
        patient_age=35, # Mock default adult age, will map from request patient info
        blood_group=req_in.blood_group,
        is_hospital_partner=(current_user.role == "hospital")
    )
    priority_score = priority_data["priority_score"]
    
    # Save request
    db_req = BloodRequest(
        requester_id=current_user.id,
        recipient_name=req_in.recipient_name,
        blood_group=req_in.blood_group,
        units_required=req_in.units_required,
        emergency_type=req_in.emergency_type,
        priority_score=priority_score,
        status="pending" if req_in.emergency_type != "critical" else "matching",
        hospital_name=req_in.hospital_name,
        address=req_in.address,
        latitude=req_in.latitude,
        longitude=req_in.longitude
    )
    db.add(db_req)
    
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Raise Request",
        details=f"Raised {req_in.emergency_type} request for {req_in.units_required} units of {req_in.blood_group} (Priority Score: {priority_score})"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_req)
    
    # If emergency type is critical or urgent, create alerts for all nearby eligible donors
    # For simulation, we create system notifications for matching blood group users
    matching_donors = db.query(User).options(joinedload(User.profile)).join(User.profile).filter(
        User.role == "donor",
        User.profile.has(blood_group=req_in.blood_group)
    ).all()
    
    for donor in matching_donors:
        db_notif = Notification(
            user_id=donor.id,
            title="CRITICAL BLOOD EMERGENCY",
            message=f"Urgent requirement for {req_in.blood_group} blood at {req_in.hospital_name}. Distance is nearby. Help save a life!",
            notification_type="emergency"
        )
        db.add(db_notif)
        
    db.commit()
    db.refresh(db_req)
    return db_req

@router.get("/", response_model=List[BloodRequestOut])
def list_blood_requests(
    blood_group: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BloodRequest).order_by(desc(BloodRequest.priority_score), desc(BloodRequest.created_at))
    
    # Patients only see their own requests
    if current_user.role == "patient":
        query = query.filter(BloodRequest.requester_id == current_user.id)
    # Hospitals see their requests, and can also view other pending emergencies
    elif current_user.role == "hospital":
        # Can view all pending to track coordination
        pass
        
    if blood_group:
        query = query.filter(BloodRequest.blood_group == blood_group)
    if status:
        query = query.filter(BloodRequest.status == status)
        
    return query.all()

@router.put("/{req_id}", response_model=BloodRequestOut)
def update_blood_request(
    req_id: int,
    req_update: BloodRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_req = db.query(BloodRequest).filter(BloodRequest.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
        
    # Ensure authorization
    if current_user.role not in ["admin", "hospital"] and db_req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    if req_update.status:
        db_req.status = req_update.status
        
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Update Request Status",
        details=f"Updated request ID {req_id} status to {db_req.status}"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_req)
    
    return db_req

@router.post("/{req_id}/accept", response_model=DonationOut)
def accept_emergency_request(
    req_id: int,
    current_user: User = Depends(RoleChecker(["donor"])),
    db: Session = Depends(get_db)
):
    db_req = db.query(BloodRequest).filter(BloodRequest.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
        
    if db_req.status in ["fulfilled", "cancelled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is already closed.")
        
    # Check if donor has active booking
    existing_booking = db.query(Donation).filter(
        Donation.donor_id == current_user.id,
        Donation.status == "scheduled"
    ).first()
    if existing_booking:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a scheduled donation pending.")
        
    # Create donation schedule
    db_donation = Donation(
        request_id=db_req.id,
        donor_id=current_user.id,
        status="scheduled",
        donation_date=datetime.utcnow() + timedelta(days=1),
        units_donated=1.0
    )
    
    db_req.status = "matching"
    
    # Notify patient
    db_notif = Notification(
        user_id=db_req.requester_id,
        title="DONOR MATCH FOUND",
        message=f"Donor {current_user.full_name} has accepted your request for {db_req.blood_group} blood. Coordination scheduled.",
        notification_type="alert"
    )
    db.add(db_donation)
    db.add(db_notif)
    
    db_log = AuditLog(
        user_id=current_user.id,
        action="Accept Donation Request",
        details=f"Accepted blood request ID {req_id} for {db_req.blood_group}"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_donation)
    
    return db_donation

@router.post("/donations/{donation_id}/complete", response_model=DonationOut)
def complete_donation(
    donation_id: int,
    current_user: User = Depends(RoleChecker(["admin", "hospital", "bloodbank"])),
    db: Session = Depends(get_db)
):
    db_don = db.query(Donation).filter(Donation.id == donation_id).first()
    if not db_don:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation record not found")
        
    if db_don.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Donation already completed.")
        
    # Mark donation as completed
    db_don.status = "completed"
    db_don.certificate_url = f"https://bloodbank-certs.s3.amazonaws.com/cert-{db_don.id}.pdf"
    
    # Update matched request if exists
    if db_don.request_id:
        db_req = db.query(BloodRequest).filter(BloodRequest.id == db_don.request_id).first()
        if db_req:
            db_req.status = "fulfilled"
            
    # Add units to inventory of current facility (hospital or bloodbank completing it)
    blood_group = db_don.request.blood_group if db_don.request_id else "O+" # default O+ fallback
    
    # Add to inventory
    db_inv = Inventory(
        owner_id=current_user.id,
        blood_group=blood_group,
        quantity=db_don.units_donated,
        expiry_date=date.today() + func.cast(func.concat('35 days'), func.INTERVAL) if db.bind.name == "postgresql" else date.today(),
        storage_temp=4.0,
        status="available"
    )
    
    if db.bind.name != "postgresql":
        import datetime as dt
        db_inv.expiry_date = date.today() + dt.timedelta(days=35)
        
    db.add(db_inv)
    
    # Donor Profile update: set last donation date and verify eligibility cooldown
    donor_profile = db_don.donor.profile
    if donor_profile:
        donor_profile.last_donation_date = date.today()
        donor_profile.is_eligible = False # Needs cooldown of 3 months
        
    # Gamification: Award badges based on donor's total completed donations count
    donor_donations_count = db.query(Donation).filter(
        Donation.donor_id == db_don.donor_id,
        Donation.status == "completed"
    ).count() + 1
    
    badge_title = None
    badge_desc = None
    
    if donor_donations_count == 1:
        badge_title = "First Gift"
        badge_desc = "Awarded for completing your first life-saving blood donation."
    elif donor_donations_count == 3:
        badge_title = "Bronze Hero"
        badge_desc = "Awarded for completing 3 blood donations."
    elif donor_donations_count == 5:
        badge_title = "Silver LifeSaver"
        badge_desc = "Awarded for completing 5 blood donations."
    elif donor_donations_count >= 10 and donor_donations_count % 5 == 0:
        badge_title = "Platinum Guardian"
        badge_desc = f"Awarded for completing {donor_donations_count} blood donations."
        
    if badge_title:
        # Check if they already have this badge
        existing_badge = db.query(Badge).filter(
            Badge.donor_id == db_don.donor_id,
            Badge.title == badge_title
        ).first()
        if not existing_badge:
            db_badge = Badge(
                donor_id=db_don.donor_id,
                title=badge_title,
                description=badge_desc
            )
            db.add(db_badge)
            
            # Send notification about badge
            db_notif = Notification(
                user_id=db_don.donor_id,
                title="NEW ACHIEVEMENT UNLOCKED!",
                message=f"Congratulations! You've been awarded the '{badge_title}' badge for your donations.",
                notification_type="alert"
            )
            db.add(db_notif)
            
    # Send thank you notification to donor
    db_notif_thanks = Notification(
        user_id=db_don.donor_id,
        title="Donation Completed",
        message="Thank you for your donation. Your digital certificate is ready to download.",
        notification_type="alert"
    )
    db.add(db_notif_thanks)
    
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Complete Donation Check-in",
        details=f"Completed donation check-in ID {donation_id} for donor {db_don.donor.full_name} (+{db_don.units_donated} units)"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_don)
    
    return db_don

@router.get("/donations", response_model=List[DonationOut])
def list_donations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Donation)
    if current_user.role == "donor":
        query = query.filter(Donation.donor_id == current_user.id)
    return query.all()

@router.get("/facilities", response_model=List[dict])
def get_facilities(db: Session = Depends(get_db)):
    # Query all users with role hospital or bloodbank
    facilities = db.query(User).options(joinedload(User.profile)).join(User.profile).filter(
        User.role.in_(["hospital", "bloodbank"])
    ).all()
    
    result = []
    for f in facilities:
        result.append({
            "id": f.id,
            "name": f.full_name,
            "city": f.profile.city or "New Delhi"
        })
    return result
