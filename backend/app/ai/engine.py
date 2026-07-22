import os
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import requests
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

# Paths for saved models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
SHORTAGE_MODEL_PATH = os.path.join(MODEL_DIR, "shortage_model.joblib")
ELIGIBILITY_MODEL_PATH = os.path.join(MODEL_DIR, "eligibility_model.joblib")

# Blood Compatibility Matrix (Donor -> Recipient)
BLOOD_COMPATIBILITY = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
}

# Rare blood groups
RARE_BLOOD_GROUPS = ["AB-", "O-", "A-", "B-"]

# ----------------- DATASET GENERATORS & ML TRAINING -----------------

def train_models():
    """Generates synthetic datasets and trains ML models."""
    print("AI Engine: Training forecasting and eligibility models...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # 1. Train Demand & Shortage Prediction Model (Random Forest Regressor)
    # Generate time series data for the past 2 years (daily demand per blood group)
    blood_groups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    start_date = datetime.now() - timedelta(days=730)
    data = []
    
    for i in range(730):
        current_date = start_date + timedelta(days=i)
        month = current_date.month
        day_of_week = current_date.weekday()
        # Seasonality, holiday effects, festival spikes
        is_holiday = 1 if month in [10, 11, 12] and current_date.day in [24, 25, 31, 1, 15] else 0
        is_festival = 1 if month in [3, 8, 9, 10, 11] else 0 # Holi, Diwali, etc.
        
        for bg in blood_groups:
            # Base demand depending on rarity
            base_demand = 12 if bg in ["O+", "A+", "B+"] else 3
            if bg == "AB-":
                base_demand = 1
            
            # Add random fluctuations, festival spike (up to +50%), holiday spike (up to +40%)
            spike = 1.0
            if is_holiday:
                spike += 0.4
            if is_festival:
                spike += 0.3
                
            noise = np.random.normal(0, 1)
            demand = max(0.5, base_demand * spike + noise)
            
            data.append({
                "month": month,
                "day_of_week": day_of_week,
                "is_holiday": is_holiday,
                "is_festival": is_festival,
                "blood_group_encoded": blood_groups.index(bg),
                "demand": demand
            })
            
    df_demand = pd.DataFrame(data)
    X_demand = df_demand[["month", "day_of_week", "is_holiday", "is_festival", "blood_group_encoded"]]
    y_demand = df_demand["demand"]
    
    demand_model = RandomForestRegressor(n_estimators=30, random_state=42)
    demand_model.fit(X_demand, y_demand)
    joblib.dump(demand_model, SHORTAGE_MODEL_PATH)
    
    # 2. Train Donation Eligibility Classifier (Random Forest Classifier)
    # Features: age, weight, hemoglobin, last_donation_months, medical_cond, travel_suspicious, vaccine_recent
    np.random.seed(42)
    N = 1000
    ages = np.random.randint(15, 75, size=N)
    weights = np.random.uniform(40, 110, size=N)
    hemoglobins = np.random.uniform(9.0, 18.0, size=N)
    last_donation_months = np.random.uniform(1.0, 12.0, size=N)
    medical_cond = np.random.choice([0, 1], size=N, p=[0.85, 0.15])
    travel = np.random.choice([0, 1], size=N, p=[0.9, 0.1])
    vaccine = np.random.choice([0, 1], size=N, p=[0.8, 0.2])
    
    # Rule-based targets for training
    eligible = []
    for idx in range(N):
        is_el = 1
        if ages[idx] < 18 or ages[idx] > 65:
            is_el = 0
        if weights[idx] < 50.0:
            is_el = 0
        if hemoglobins[idx] < 12.5:
            is_el = 0
        if last_donation_months[idx] < 3.0:
            is_el = 0
        if medical_cond[idx] == 1:
            is_el = 0
        if travel[idx] == 1:
            is_el = 0
        if vaccine[idx] == 1:
            is_el = 0
        eligible.append(is_el)
        
    X_elig = pd.DataFrame({
        "age": ages,
        "weight": weights,
        "hemoglobin": hemoglobins,
        "last_donation_months": last_donation_months,
        "has_medical_conditions": medical_cond,
        "travel_history_suspicious": travel,
        "vaccination_recent": vaccine
    })
    y_elig = np.array(eligible)
    
    elig_model = RandomForestClassifier(n_estimators=30, random_state=42)
    elig_model.fit(X_elig, y_elig)
    joblib.dump(elig_model, ELIGIBILITY_MODEL_PATH)
    print("AI Engine: Models trained and serialized successfully!")

# Auto-train models on import if they don't exist
if not os.path.exists(SHORTAGE_MODEL_PATH) or not os.path.exists(ELIGIBILITY_MODEL_PATH):
    train_models()

# ----------------- CORE AI LOGIC FUNCTIONS -----------------

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine distance calculation in kilometers."""
    if None in [lat1, lon1, lat2, lon2]:
        return 9999.0 # Sentinel value for unknown location
    R = 6371.0 # Radius of Earth
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_blood_compatible(donor_group, recipient_group):
    """Determines blood compatibility."""
    return recipient_group in BLOOD_COMPATIBILITY.get(donor_group, [])

def recommend_donors(recipient_lat, recipient_lon, recipient_blood_group, donors_list):
    """
    Ranks donors from 0-100 based on distance, compatibility, health, eligibility history.
    donors_list is a list of dicts with keys: id, name, blood_group, lat, lon, age, weight,
    hemoglobin, last_donation_date, health_conditions, travel_history, vaccination_status,
    acceptance_rate (float 0-1).
    """
    recommendations = []
    
    for donor in donors_list:
        # 1. Blood Compatibility Check
        compat = is_blood_compatible(donor["blood_group"], recipient_blood_group)
        if not compat:
            continue
        
        # 2. Distance and Travel Time
        distance = calculate_distance(recipient_lat, recipient_lon, donor["lat"], donor["lon"])
        # Estimate travel speed of ~30km/h in urban settings
        travel_time = int((distance / 30.0) * 60) if distance < 9000 else 999
        
        # Compute Distance Score (max 30 points, decays exponentially)
        dist_score = 30 * math.exp(-distance / 15.0)
        
        # 3. Compatibility Score (max 20 points)
        # Identical match gets full points, compatible but different gets slightly less
        compat_score = 20 if donor["blood_group"] == recipient_blood_group else 12
        
        # 4. Eligibility Score (max 30 points, computed from ML model)
        elig_features = preprocess_eligibility_features(donor)
        try:
            model = joblib.load(ELIGIBILITY_MODEL_PATH)
            elig_prob = model.predict_proba([elig_features])[0][1] # Probability of being eligible
        except Exception:
            # Fallback heuristic
            elig_prob = 1.0 if (50 <= donor.get("weight", 60) and 12.5 <= donor.get("hemoglobin", 14.0)) else 0.2
            
        elig_score = 30 * elig_prob
        
        # 5. History / Acceptance rate (max 20 points)
        acceptance = donor.get("acceptance_rate", 0.8)
        history_score = 20 * acceptance
        
        # Overall Score out of 100
        overall_score = round(dist_score + compat_score + elig_score + history_score, 1)
        
        recommendations.append({
            "donor_id": donor["id"],
            "full_name": donor["name"],
            "blood_group": donor["blood_group"],
            "distance_km": round(distance, 2),
            "travel_time_mins": travel_time,
            "eligibility_probability": round(elig_prob, 2),
            "compatibility_score": compat_score,
            "overall_score": overall_score
        })
        
    # Sort recommendations by highest overall score
    recommendations.sort(key=lambda x: x["overall_score"], reverse=True)
    return recommendations[:10]

def preprocess_eligibility_features(donor):
    """Helper to structure fields for eligibility prediction."""
    last_donation = donor.get("last_donation_date")
    if last_donation:
        if isinstance(last_donation, str):
            last_donation = datetime.strptime(last_donation, "%Y-%m-%d").date()
        days_diff = (datetime.now().date() - last_donation).days
        months_diff = days_diff / 30.4
    else:
        months_diff = 12.0 # No recent donation
        
    return [
        donor.get("age", 25),
        donor.get("weight", 70.0),
        donor.get("hemoglobin", 14.0),
        months_diff,
        1 if donor.get("health_conditions") else 0,
        1 if donor.get("travel_history") else 0,
        1 if donor.get("vaccination_status") == "recent" else 0
    ]

def predict_shortage(blood_group, available_units):
    """
    Predicts demand using the ML model and calculates shortages for the next 7 days.
    """
    model = joblib.load(SHORTAGE_MODEL_PATH)
    blood_groups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    bg_encoded = blood_groups.index(blood_group) if blood_group in blood_groups else 0
    
    predictions = []
    current_date = datetime.now()
    
    for i in range(7):
        future_date = current_date + timedelta(days=i)
        month = future_date.month
        day_of_week = future_date.weekday()
        is_holiday = 1 if month in [10, 11, 12] and future_date.day in [24, 25, 31, 1, 15] else 0
        is_festival = 1 if month in [3, 8, 9, 10, 11] else 0
        
        # ML Inference
        features = [[month, day_of_week, is_holiday, is_festival, bg_encoded]]
        predicted_demand = float(model.predict(features)[0])
        
        # Rarity weighting
        historical_avg = 3.5 if blood_group in RARE_BLOOD_GROUPS else 9.0
        
        # Calculate shortage risk
        deficit = max(0.0, predicted_demand - available_units)
        
        if deficit > (available_units * 0.5) and deficit > 2.0:
            risk = "High"
        elif deficit > 0:
            risk = "Medium"
        else:
            risk = "Low"
            
        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "blood_group": blood_group,
            "historical_avg": round(historical_avg, 1),
            "predicted_demand": round(predicted_demand, 1),
            "available_units": float(available_units),
            "shortage_risk": risk,
            "deficit_units": round(deficit, 1)
        })
        
    return predictions

def calculate_priority_score(emergency_type, units_required, patient_age, blood_group, is_hospital_partner=False):
    """
    Computes an Emergency Priority Score from 0 to 100.
    """
    score = 0.0
    factors = []
    
    # 1. Emergency Type (max 45 points)
    if emergency_type.lower() == "critical":
        score += 45
        factors.append("Critical Emergency Level (+45)")
    elif emergency_type.lower() == "urgent":
        score += 25
        factors.append("Urgent Emergency Level (+25)")
    else:
        score += 10
        factors.append("Routine Emergency Level (+10)")
        
    # 2. Blood Rarity (max 20 points)
    if blood_group in RARE_BLOOD_GROUPS:
        score += 20
        factors.append(f"Rare Blood Group {blood_group} (+20)")
    else:
        score += 5
        factors.append(f"Standard Blood Group {blood_group} (+5)")
        
    # 3. Patient Vulnerability (max 15 points)
    if patient_age < 12:
        score += 15
        factors.append("Pediatric Patient Vulnerability (+15)")
    elif patient_age > 65:
        score += 15
        factors.append("Geriatric Patient Vulnerability (+15)")
    else:
        score += 5
        factors.append("Adult Patient Category (+5)")
        
    # 4. Request Volume (max 10 points)
    if units_required >= 5:
        score += 10
        factors.append("High Unit Volume Request (5+ units) (+10)")
    elif units_required >= 2:
        score += 5
        factors.append("Medium Unit Volume Request (+5)")
        
    # 5. Hospital Partnership Status (max 10 points)
    if is_hospital_partner:
        score += 10
        factors.append("Partner Hospital Facility (+10)")
        
    rank_level = "Low"
    if score >= 75:
        rank_level = "Critical"
    elif score >= 50:
        rank_level = "High"
    elif score >= 30:
        rank_level = "Medium"
        
    return {
        "priority_score": score,
        "factors": factors,
        "rank_level": rank_level
    }

def detect_fraud_and_duplicates(national_id, phone, email, lat, lon, existing_users_profiles):
    """
    Analyzes parameters to detect spam registrations and location spoofing.
    Returns: (is_suspicious, reasons)
    """
    reasons = []
    
    # 1. Duplicate check
    for user_profile in existing_users_profiles:
        if national_id and user_profile.get("national_id") == national_id:
            reasons.append("Duplicate National ID (Aadhaar) registered.")
        if phone and user_profile.get("phone") == phone:
            reasons.append("Duplicate phone number registered.")
        if email and user_profile.get("email") == email:
            reasons.append("Duplicate email address registered.")
            
    # 2. Location Spoofing Check
    # Check if lat/long coordinates are extremely outlier for typical locations
    # (E.g. outside typical bounding box of India/user target region, or 0.0/0.0)
    if lat == 0.0 and lon == 0.0:
        reasons.append("Location coordinates at center of coordinate system (0,0) - likely spoofed/mocked.")
    elif lat is not None and lon is not None:
        # Bounding box for India: Latitude 8.4 N to 37.6 N, Longitude 68.7 E to 97.2 E
        if not (6.0 <= lat <= 38.0 and 65.0 <= lon <= 99.0):
            reasons.append("Location coordinates are outside acceptable operational bounds (spoofing indicator).")
            
    return len(reasons) > 0, reasons

def run_chatbot_query(query, current_user_role="guest", api_key=None):
    """
    AI Chatbot engine. Handles blood queries, eligibility inquiries, and donor support.
    """
    # 1. Check if Gemini API key is configured
    gemini_api_key = api_key or os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            headers = {"Content-Type": "application/json"}
            system_instruction = (
                "You are Life Care AI, the official intelligent assistant for the AI Powered Digital Blood Bank. "
                "You must help users with queries regarding blood donation eligibility, compatibility maps, "
                "emergency SOS broadcasts, and how to schedule donations. "
                "Keep responses concise, friendly, and clinical. Make sure to reference that users can use "
                "the dynamic eligibility check and emergency request forms on the platform."
            )
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"User Role: {current_user_role}\nUser Query: {query}"}
                        ]
                    }
                ],
                "systemInstruction": {
                    "parts": [
                        {"text": system_instruction}
                    ]
                }
            }
            response = requests.post(url, headers=headers, json=payload, timeout=8)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text_response = parts[0].get("text", "")
                        if text_response.strip():
                            return text_response.strip()
        except Exception as e:
            print(f"Error calling live Gemini API chatbot: {e}")

    # Fallback to local rule-based chatbot if API key is missing or call fails
    q = query.lower()
    
    # Check for basic greetings
    if any(g in q for g in ["hello", "hi", "hey", "greetings"]):
        return "Hello! I am the AI Blood Bank Assistant. How can I help you today? You can ask about donor eligibility criteria, blood compatibility rules, or how to locate rare groups."
        
    # Check for eligibility rules
    if "eligible" in q or "eligibility" in q or "can i donate" in q:
        return ("To be eligible for blood donation, you generally must be:\n"
                "- Age: between 18 and 65 years\n"
                "- Weight: at least 50 kg (110 lbs)\n"
                "- Hemoglobin level: at least 12.5 g/dl\n"
                "- Last Donation: at least 3 months ago (90 days)\n"
                "- Free from active medical conditions, infection, or recent travel history outliers.\n\n"
                "You can use the 'Eligibility Predictor' in the Donor Dashboard to run a real-time check!")
        
    # Check for blood group compatibility
    if "compatible" in q or "recipient" in q or "who can receive" in q or "compatibility" in q:
        return ("Here are standard blood compatibility guidelines:\n"
                "- O- is the universal donor (can donate to all groups) but can only receive from O-.\n"
                "- AB+ is the universal recipient (can receive from all groups) but can only donate to AB+.\n"
                "- Group A+ can receive from A+, A-, O+, O-.\n"
                "- Group B+ can receive from B+, B-, O+, O-.\n"
                "Emergency requests are automatically ranked by compatibility.")
        
    # Check for rare blood groups
    if "rare" in q or "rarest" in q:
        return ("Rare blood groups include O-negative, AB-negative, A-negative, and B-negative. "
                "Our platform uses an AI-powered 'Rare Blood Finder' which searches across partner blood banks "
                "and nearby cities in real-time when an emergency request is raised.")
        
    # Check for SOS / Emergency search
    if "sos" in q or "emergency" in q or "need blood" in q or "find donor" in q:
        return ("If you have an urgent blood requirement, please use the 'SOS Emergency Request' button "
                "on your patient or hospital dashboard. The system will calculate priority, "
                "alert matching donors, and provide live route tracking.")
        
    # Default response
    return ("Thank you for your query. I can help you search blood inventories, check donor eligibility, "
            "calculate emergency priority, or locate rare blood groups. Please ask a specific question.")
