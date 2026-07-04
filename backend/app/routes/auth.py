from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token,
    get_current_user, decode_token
)
from app.models.models import User, Profile, AuditLog
from app.schemas.schemas import UserCreate, UserOut, UserUpdate, Token, ProfileUpdate
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Create user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize empty profile
    db_profile = Profile(user_id=db_user.id)
    db.add(db_profile)
    
    # Add audit log
    db_log = AuditLog(
        user_id=db_user.id,
        action="Register",
        details=f"User {db_user.email} registered as role {db_user.role}"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(username: str = "", password: str = "", db: Session = Depends(get_db)):
    """OAuth2 password flow / standard JSON credentials. Expects email/password."""
    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Add audit log
    db_log = AuditLog(
        user_id=user.id,
        action="Login",
        details=f"User {user.email} logged in"
    )
    db.add(db_log)
    db.commit()

    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
def refresh_token(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token type"
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer"
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_profile(
    user_update: UserUpdate,
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user data
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
        
    # Update profile data
    profile = current_user.profile
    if profile is None:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        
    for key, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, key, value)
        
    # Recalculate eligibility if health markers updated (Donor role specific)
    if current_user.role == "donor" and profile_update.dict(exclude_unset=True):
        # Apply standard rules: weight >= 50, hemoglobin >= 12.5
        weight = profile.weight or 0
        hemo = profile.hemoglobin or 0
        if weight >= 50.0 and hemo >= 12.5 and not profile.health_conditions:
            profile.is_eligible = True
        else:
            profile.is_eligible = False

    # Add audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Update Profile",
        details="User updated account info and medical indicators"
    )
    db.add(db_log)
    db.commit()
    db.refresh(current_user)
    
    return current_user
