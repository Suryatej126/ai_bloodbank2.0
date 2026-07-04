from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Profile, Inventory, BloodRequest, Donation, AuditLog, Badge, Notification
from app.core.security import get_password_hash
from datetime import datetime, date, timedelta
import random

def seed_db():
    print("Database: Running database migrations and seeding default accounts...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if database is already seeded
    if db.query(User).first():
        print("Database: Already seeded. Skipping.")
        db.close()
        return

    try:
        # 1. CREATE USERS
        users_to_create = [
            # Admins
            {"email": "admin@bloodbank.ai", "name": "Super Admin", "role": "admin", "pass": "admin123", "phone": "+919999999901"},
            
            # Hospitals
            {"email": "city_hospital@bloodbank.ai", "name": "City General Hospital", "role": "hospital", "pass": "hospital123", "phone": "+919999999902"},
            {"email": "metro_clinic@bloodbank.ai", "name": "Metro Emergency Clinic", "role": "hospital", "pass": "clinic123", "phone": "+919999999903"},
            
            # Blood Banks
            {"email": "redcross@bloodbank.ai", "name": "Red Cross Blood Bank", "role": "bloodbank", "pass": "redcross123", "phone": "+919999999904"},
            {"email": "lifesource@bloodbank.ai", "name": "LifeSource Regional Depot", "role": "bloodbank", "pass": "lifesource123", "phone": "+919999999905"},
            
            # Donors
            {"email": "john@bloodbank.ai", "name": "John Doe", "role": "donor", "pass": "donor123", "phone": "+919999999906"},
            {"email": "sarah@bloodbank.ai", "name": "Sarah Connor", "role": "donor", "pass": "donor123", "phone": "+919999999907"},
            {"email": "bruce@bloodbank.ai", "name": "Bruce Banner", "role": "donor", "pass": "donor123", "phone": "+919999999908"},
            {"email": "diana@bloodbank.ai", "name": "Diana Prince", "role": "donor", "pass": "donor123", "phone": "+919999999909"},
            {"email": "clark@bloodbank.ai", "name": "Clark Kent", "role": "donor", "pass": "donor123", "phone": "+919999999910"},
            
            # Patients
            {"email": "jane@bloodbank.ai", "name": "Jane Patient", "role": "patient", "pass": "patient123", "phone": "+919999999911"},
            {"email": "bobby@bloodbank.ai", "name": "Bobby Patient", "role": "patient", "pass": "patient123", "phone": "+919999999912"},
        ]
        
        db_users = {}
        for u in users_to_create:
            hashed_pass = get_password_hash(u["pass"])
            db_user = User(
                email=u["email"],
                hashed_password=hashed_pass,
                full_name=u["name"],
                phone=u["phone"],
                role=u["role"],
                is_verified=True
            )
            db.add(db_user)
            db.flush()
            db_users[u["email"]] = db_user
            
        # 2. CREATE PROFILES
        # Coordinates roughly corresponding to different sectors of a major metro area (e.g. New Delhi/NCR region, India)
        # Lat: ~28.61, Lon: ~77.20
        profiles_to_create = [
            # City General Hospital
            {"email": "city_hospital@bloodbank.ai", "bg": None, "lat": 28.625, "lon": 77.215, "city": "New Delhi", "dist": "Central Delhi", "state": "Delhi", "addr": "Connaught Place, New Delhi"},
            # Metro Emergency Clinic
            {"email": "metro_clinic@bloodbank.ai", "bg": None, "lat": 28.582, "lon": 77.234, "city": "New Delhi", "dist": "South Delhi", "state": "Delhi", "addr": "Lajpat Nagar, New Delhi"},
            # Red Cross Blood Bank
            {"email": "redcross@bloodbank.ai", "bg": None, "lat": 28.631, "lon": 77.220, "city": "New Delhi", "dist": "Central Delhi", "state": "Delhi", "addr": "Parliament Street, New Delhi"},
            # LifeSource Regional Depot
            {"email": "lifesource@bloodbank.ai", "bg": None, "lat": 28.545, "lon": 77.272, "city": "New Delhi", "dist": "South East Delhi", "state": "Delhi", "addr": "Okhla Phase III, New Delhi"},
            
            # Donors
            {"email": "john@bloodbank.ai", "bg": "A+", "lat": 28.615, "lon": 77.195, "city": "New Delhi", "dist": "New Delhi", "state": "Delhi", "addr": "Chanakyapuri, New Delhi", "weight": 75.0, "hemoglobin": 14.5, "dob": date(1995, 5, 12)},
            {"email": "sarah@bloodbank.ai", "bg": "O-", "lat": 28.601, "lon": 77.245, "city": "New Delhi", "dist": "South Delhi", "state": "Delhi", "addr": "Defense Colony, New Delhi", "weight": 58.0, "hemoglobin": 13.1, "dob": date(1993, 11, 4)},
            {"email": "bruce@bloodbank.ai", "bg": "B+", "lat": 28.645, "lon": 77.162, "city": "New Delhi", "dist": "West Delhi", "state": "Delhi", "addr": "Rajouri Garden, New Delhi", "weight": 92.0, "hemoglobin": 16.0, "dob": date(1985, 8, 18)},
            {"email": "diana@bloodbank.ai", "bg": "AB-", "lat": 28.570, "lon": 77.210, "city": "New Delhi", "dist": "South Delhi", "state": "Delhi", "addr": "Green Park, New Delhi", "weight": 62.0, "hemoglobin": 13.8, "dob": date(1991, 1, 23)},
            {"email": "clark@bloodbank.ai", "bg": "O+", "lat": 28.680, "lon": 77.225, "city": "New Delhi", "dist": "North Delhi", "state": "Delhi", "addr": "Model Town, New Delhi", "weight": 85.0, "hemoglobin": 15.2, "dob": date(1988, 3, 29)},
            
            # Patients
            {"email": "jane@bloodbank.ai", "bg": "A+", "lat": 28.630, "lon": 77.218, "city": "New Delhi", "dist": "Central Delhi", "state": "Delhi", "addr": "Barakhamba Road, New Delhi"},
            {"email": "bobby@bloodbank.ai", "bg": "O-", "lat": 28.590, "lon": 77.230, "city": "New Delhi", "dist": "South Delhi", "state": "Delhi", "addr": "Jangpura, New Delhi"},
        ]
        
        for p in profiles_to_create:
            user = db_users[p["email"]]
            db_profile = Profile(
                user_id=user.id,
                blood_group=p.get("bg"),
                latitude=p["lat"],
                longitude=p["lon"],
                city=p["city"],
                district=p["dist"],
                state=p["state"],
                address=p["addr"],
                weight=p.get("weight"),
                hemoglobin=p.get("hemoglobin"),
                date_of_birth=p.get("dob"),
                last_donation_date=date.today() - timedelta(days=120) if user.role == "donor" else None,
                is_eligible=True
            )
            db.add(db_profile)
            
        # 3. CREATE INITIAL INVENTORY STOCK
        # Distribute available blood units among Hospitals and Blood Banks
        blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        facilities = ["city_hospital@bloodbank.ai", "metro_clinic@bloodbank.ai", "redcross@bloodbank.ai", "lifesource@bloodbank.ai"]
        
        for fac_email in facilities:
            facility = db_users[fac_email]
            for bg in blood_groups:
                # Rare groups have smaller supply, standard groups have larger supply
                qty = random.randint(1, 4) if bg in ["AB-", "O-", "A-", "B-"] else random.randint(8, 15)
                db_inv = Inventory(
                    owner_id=facility.id,
                    blood_group=bg,
                    quantity=float(qty),
                    expiry_date=date.today() + timedelta(days=random.randint(10, 35)),
                    storage_temp=random.uniform(3.5, 4.5),
                    status="available"
                )
                db.add(db_inv)
                
        # 4. CREATE SOME SEED EMERGENCY REQUESTS
        # Request 1: Critical AB- request by City Hospital
        req1 = BloodRequest(
            requester_id=db_users["city_hospital@bloodbank.ai"].id,
            recipient_name="Amit Sharma",
            blood_group="AB-",
            units_required=3.0,
            emergency_type="critical",
            priority_score=85.0, # Highly critical priority
            status="matching",
            hospital_name="City General Hospital",
            address="Connaught Place, New Delhi",
            latitude=28.625,
            longitude=77.215
        )
        # Request 2: Urgent O- request by Bobby Patient
        req2 = BloodRequest(
            requester_id=db_users["bobby@bloodbank.ai"].id,
            recipient_name="Bobby Patient",
            blood_group="O-",
            units_required=2.0,
            emergency_type="urgent",
            priority_score=60.0,
            status="pending",
            hospital_name="Metro Emergency Clinic",
            address="Lajpat Nagar, New Delhi",
            latitude=28.582,
            longitude=77.234
        )
        db.add(req1)
        db.add(req2)
        db.flush()
        
        # 5. CREATE DONATION LOGS / COMPLETED APPOINTMENTS
        # Seed John donating blood to Jane in the past
        past_req = BloodRequest(
            requester_id=db_users["jane@bloodbank.ai"].id,
            recipient_name="Jane Patient",
            blood_group="A+",
            units_required=1.0,
            emergency_type="routine",
            priority_score=25.0,
            status="fulfilled",
            hospital_name="City General Hospital",
            address="Connaught Place, New Delhi",
            latitude=28.625,
            longitude=77.215
        )
        db.add(past_req)
        db.flush()
        
        donation = Donation(
            request_id=past_req.id,
            donor_id=db_users["john@bloodbank.ai"].id,
            status="completed",
            donation_date=datetime.now() - timedelta(days=120),
            units_donated=1.0,
            certificate_url="https://bloodbank-certs.s3.amazonaws.com/cert-seed.pdf"
        )
        db.add(donation)
        
        # Award John his first gift badge
        db_badge = Badge(
            donor_id=db_users["john@bloodbank.ai"].id,
            title="First Gift",
            description="Awarded for completing your first life-saving blood donation."
        )
        db.add(db_badge)
        
        # Create standard system Audit Logs
        db_audit1 = AuditLog(action="System Seeding", details="Initial database seed and account setup completed successfully.")
        db.add(db_audit1)
        
        db.commit()
        print("Database: Default seed accounts, inventory, and requests seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Database: Seeding failed due to error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
