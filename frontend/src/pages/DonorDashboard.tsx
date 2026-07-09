import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import { 
  User, 
  HeartHandshake, 
  Award, 
  Download, 
  CheckCircle,
  HelpCircle,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Save,
  MapPin,
  Activity,
  Check,
  Clock
} from "lucide-react";

const SkeletonProfile: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-pulse">
      <div className="h-6 bg-slate-900 rounded w-1/4 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-900 rounded w-1/3" />
            <div className="h-10 bg-slate-900 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-900 rounded w-1/2 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-900 rounded w-full" />
        ))}
      </div>
    </div>
  </div>
);

const SkeletonAppointments: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-pulse">
      <div className="h-6 bg-slate-900 rounded w-1/2 mb-4" />
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-900 rounded w-1/3" />
          <div className="h-10 bg-slate-900 rounded w-full" />
        </div>
      ))}
    </div>
    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-900 rounded w-1/3 mb-4" />
      {[1, 2].map(i => (
        <div key={i} className="h-20 bg-slate-900 rounded w-full" />
      ))}
    </div>
  </div>
);

const SkeletonRequests: React.FC = () => (
  <div className="space-y-4">
    <div className="h-12 bg-slate-900 rounded w-full animate-pulse" />
    {[1, 2, 3].map(i => (
      <div key={i} className="h-32 bg-slate-900 rounded w-full animate-pulse border border-slate-800/40" />
    ))}
  </div>
);

export const DonorDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "profile";

  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointments schedule form states
  const [selectedCenter, setSelectedCenter] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [scheduledAppts, setScheduledAppts] = useState<any[]>([]);

  // City and hospital dynamic selection
  const [facilities, setFacilities] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);

  // Edit Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileWeight, setProfileWeight] = useState("");
  const [profileHemoglobin, setProfileHemoglobin] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileLat, setProfileLat] = useState("");
  const [profileLng, setProfileLng] = useState("");
  const [profileHealthConditions, setProfileHealthConditions] = useState("");
  const [profileTravelHistory, setProfileTravelHistory] = useState("");
  const [profileVaccineStatus, setProfileVaccineStatus] = useState("");
  const [profileAvailability, setProfileAvailability] = useState("available");
  const [updateStatus, setUpdateStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  // Eligibility Form States
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("68");
  const [hemoglobin, setHemoglobin] = useState("14.5");
  const [lastMonths, setLastMonths] = useState("4");
  const [conditions, setConditions] = useState(false);
  const [travel, setTravel] = useState(false);
  const [vaccine, setVaccine] = useState(false);
  
  // Eligibility Result
  const [eligResult, setEligResult] = useState<any | null>(null);
  const [checking, setChecking] = useState(false);

  // Digital Certificate popup
  const [activeCert, setActiveCert] = useState<any | null>(null);

  const loadDonorData = async () => {
    setLoading(true);
    try {
      const user = await api.getCurrentUser();
      setProfile(user.profile);
      
      // Initialize edit profile form states
      setProfileName(user.full_name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
      if (user.profile) {
        setProfileBloodGroup(user.profile.blood_group || "O+");
        setProfileDob(user.profile.date_of_birth ? new Date(user.profile.date_of_birth).toISOString().split("T")[0] : "");
        setProfileWeight(user.profile.weight ? user.profile.weight.toString() : "");
        setProfileHemoglobin(user.profile.hemoglobin ? user.profile.hemoglobin.toString() : "");
        setProfileCity(user.profile.city || "");
        setProfileDistrict(user.profile.district || "");
        setProfileState(user.profile.state || "");
        setProfileAddress(user.profile.address || "");
        setProfileLat(user.profile.latitude ? user.profile.latitude.toString() : "");
        setProfileLng(user.profile.longitude ? user.profile.longitude.toString() : "");
        setProfileHealthConditions(user.profile.health_conditions || "");
        setProfileTravelHistory(user.profile.travel_history || "");
        setProfileVaccineStatus(user.profile.vaccination_status || "");
        setProfileAvailability(user.profile.availability_status || "available");
      }

      const donRes = await api.getDonations();
      setDonations(donRes);

      const reqRes = await api.getRequests();
      setActiveRequests(reqRes);

      const facs = await api.getFacilities();
      setFacilities(facs);
      
      const uniqueCities = Array.from(new Set(facs.map((f: any) => f.city))) as string[];
      setCities(uniqueCities);
      
      if (uniqueCities.length > 0) {
        setSelectedCity(uniqueCities[0]);
        const filtered = facs.filter((f: any) => f.city === uniqueCities[0]);
        setFilteredHospitals(filtered);
        if (filtered.length > 0) {
          setSelectedCenter(filtered[0].name);
        }
      }
      
      // Mock Badges
      setBadges([
        { id: 1, title: "First Gift", description: "Awarded for completing your first life-saving blood donation.", unlocked: true },
        { id: 2, title: "Bronze Hero", description: "Awarded for completing 3 blood donations.", unlocked: false },
        { id: 3, title: "Silver LifeSaver", description: "Awarded for completing 5 blood donations.", unlocked: false }
      ]);

      // Seed scheduled appts
      setScheduledAppts([
        { id: 401, center: "Red Cross Blood Bank", city: "New Delhi", date: new Date(Date.now() + 86400000).toLocaleDateString(), time: "10:30 AM" }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const filtered = facilities.filter((f: any) => f.city === city);
    setFilteredHospitals(filtered);
    if (filtered.length > 0) {
      setSelectedCenter(filtered[0].name);
    } else {
      setSelectedCenter("");
    }
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await api.checkEligibility({
        age: parseInt(age),
        weight: parseFloat(weight),
        hemoglobin: parseFloat(hemoglobin),
        last_donation_months: parseFloat(lastMonths),
        has_medical_conditions: conditions,
        travel_history_suspicious: travel,
        vaccination_recent: vaccine
      });
      setEligResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (appointmentDate < today) {
      alert("Please select a current or future date for the appointment.");
      return;
    }
    if (!selectedCity) {
      alert("Please select a city.");
      return;
    }
    if (!selectedCenter) {
      alert("Please select a center.");
      return;
    }

    const newAppt = {
      id: Date.now(),
      center: selectedCenter,
      city: selectedCity,
      date: new Date(appointmentDate).toLocaleDateString(),
      time: appointmentTime
    };
    setScheduledAppts(prev => [newAppt, ...prev]);
    alert(`Donation slot reserved successfully at ${selectedCenter}, ${selectedCity}! Details sent to your email.`);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateStatus(null);
    
    if (!profileName.trim()) {
      setUpdateStatus({ success: false, message: "Full Name is required." });
      setUpdating(false);
      return;
    }
    
    if (profileDob) {
      const birthDate = new Date(profileDob);
      const today = new Date();
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      if (ageYears < 18 || ageYears > 65) {
        setUpdateStatus({ success: false, message: "Donor age must be between 18 and 65 years." });
        setUpdating(false);
        return;
      }
    }

    const weightNum = parseFloat(profileWeight);
    if (profileWeight && (isNaN(weightNum) || weightNum < 45 || weightNum > 200)) {
      setUpdateStatus({ success: false, message: "Please enter a valid weight (between 45kg and 200kg)." });
      setUpdating(false);
      return;
    }

    const hemoglobinNum = parseFloat(profileHemoglobin);
    if (profileHemoglobin && (isNaN(hemoglobinNum) || hemoglobinNum < 5 || hemoglobinNum > 25)) {
      setUpdateStatus({ success: false, message: "Please enter a valid hemoglobin level (between 5 and 25 g/dL)." });
      setUpdating(false);
      return;
    }

    const latNum = parseFloat(profileLat);
    if (profileLat && (isNaN(latNum) || latNum < -90 || latNum > 90)) {
      setUpdateStatus({ success: false, message: "Please enter a valid latitude (-90 to 90)." });
      setUpdating(false);
      return;
    }

    const lngNum = parseFloat(profileLng);
    if (profileLng && (isNaN(lngNum) || lngNum < -180 || lngNum > 180)) {
      setUpdateStatus({ success: false, message: "Please enter a valid longitude (-180 to 180)." });
      setUpdating(false);
      return;
    }

    try {
      const userPayload = {
        full_name: profileName,
        email: profileEmail,
        phone: profilePhone
      };
      const profilePayload = {
        blood_group: profileBloodGroup,
        date_of_birth: profileDob || null,
        weight: profileWeight ? parseFloat(profileWeight) : null,
        hemoglobin: profileHemoglobin ? parseFloat(profileHemoglobin) : null,
        city: profileCity,
        district: profileDistrict,
        state: profileState,
        address: profileAddress,
        latitude: profileLat ? parseFloat(profileLat) : null,
        longitude: profileLng ? parseFloat(profileLng) : null,
        health_conditions: profileHealthConditions,
        travel_history: profileTravelHistory,
        vaccination_status: profileVaccineStatus,
        availability_status: profileAvailability
      };
      
      const updatedUser = await api.updateProfile(userPayload, profilePayload);
      setProfile(updatedUser.profile);
      setUpdateStatus({ success: true, message: "Profile details updated successfully!" });
      
      // Reload values in backend
      const userRes = await api.getCurrentUser();
      setProfile(userRes.profile);
    } catch (err: any) {
      console.error(err);
      setUpdateStatus({ success: false, message: err.message || "Failed to update profile." });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen selection:bg-rose-500 selection:text-white bg-slate-950">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight capitalize">
          {currentTab === "profile" ? "Donor Hub" : `${currentTab} Console`}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {currentTab === "profile" 
            ? "Monitor your eligibility status, check achievements, and retrieve donation certificates."
            : `Donor console interface for scheduled ${currentTab}.`}
        </p>
      </div>

      {/* ================= PROFILE TAB ================= */}
      {currentTab === "profile" && (
        loading ? <SkeletonProfile /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Edit Profile Form */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 lg:col-span-2">
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
                <User size={18} />
                Update Donor Profile Details
              </h3>
              
              {updateStatus && (
                <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
                  updateStatus.success 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {updateStatus.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{updateStatus.message}</span>
                </div>
              )}
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                    <select
                      value={profileBloodGroup}
                      onChange={(e) => setProfileBloodGroup(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-rose-500/50 animate-fadeIn"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Availability</label>
                    <select
                      value={profileAvailability}
                      onChange={(e) => setProfileAvailability(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-rose-500/50"
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileWeight}
                      onChange={(e) => setProfileWeight(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Hemoglobin (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileHemoglobin}
                      onChange={(e) => setProfileHemoglobin(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">District</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={profileLat}
                      onChange={(e) => setProfileLat(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={profileLng}
                      onChange={(e) => setProfileLng(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Health Conditions</label>
                    <input
                      type="text"
                      value={profileHealthConditions}
                      onChange={(e) => setProfileHealthConditions(e.target.value)}
                      placeholder="E.g., none, hypertension, diabetes"
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Travel History Risk</label>
                    <input
                      type="text"
                      value={profileTravelHistory}
                      onChange={(e) => setProfileTravelHistory(e.target.value)}
                      placeholder="E.g., none, malaria-risk zones recently"
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Recent Vaccine Status</label>
                    <input
                      type="text"
                      value={profileVaccineStatus}
                      onChange={(e) => setProfileVaccineStatus(e.target.value)}
                      placeholder="E.g., none, covid vaccine 5 days ago"
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <Save size={14} />
                  {updating ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </form>
            </div>

            {/* Certificates & Badges Side Shelf */}
            <div className="space-y-8 lg:col-span-1">
              {/* Certificates Drawer */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileCheck2 size={18} className="text-rose-500" />
                  Digital Donation Certificates
                </h3>
                
                <div className="space-y-3">
                  {donations.map((don) => (
                    <div key={don.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-bold text-[10px] text-slate-200 truncate">1.0 Unit Donation - ID #{don.id}</h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          Date: {new Date(don.donation_date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveCert(don)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold rounded-lg transition-all cursor-pointer flex-shrink-0"
                      >
                        <Download size={10} />
                        View
                      </button>
                    </div>
                  ))}
                  
                  {donations.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-4">No completed donation certificates available.</p>
                  )}
                </div>
              </div>

              {/* Achievements shelf */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award size={18} className="text-rose-500" />
                  Achievement Badges
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {badges.map((b) => (
                    <div key={b.id} className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 transition-all duration-300 ${
                      b.unlocked 
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                        : "bg-slate-900/40 border-slate-900/10 text-slate-650"
                    }`}>
                      <Award size={24} className={b.unlocked ? "text-rose-400" : "text-slate-700"} />
                      <div>
                        <h4 className="font-bold text-xs text-slate-200">{b.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ================= APPOINTMENTS TAB ================= */}
      {currentTab === "appointments" && (
        loading ? <SkeletonAppointments /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Reservation Form */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
                <Calendar size={18} />
                Schedule Donation Appointment
              </h3>
              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                {/* Select City */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Select City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    {cities.length === 0 && (
                      <option value="">No cities available</option>
                    )}
                  </select>
                </div>

                {/* Select Hospital */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Select Facility Center</label>
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {filteredHospitals.map((hosp) => (
                      <option key={hosp.name} value={hosp.name}>{hosp.name}</option>
                    ))}
                    {filteredHospitals.length === 0 && (
                      <option value="">No hospitals available in this city</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Preferred Time</label>
                    <input
                      type="time"
                      required
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </form>
            </div>

            {/* Reserved Appointments List */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold">Your Scheduled Donations</h3>
              <div className="space-y-3">
                {scheduledAppts.map((appt) => (
                  <div key={appt.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200">{appt.center}</h4>
                      <p className="text-slate-500 mt-1">
                        Location: {appt.city || "New Delhi"} • Date: {appt.date} • Time: {appt.time}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold uppercase text-[9px] border border-emerald-500/20">
                      Confirmed
                    </span>
                  </div>
                ))}
                {scheduledAppts.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No donation appointments scheduled.</p>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* ================= ELIGIBILITY CHECKER TAB ================= */}
      {currentTab === "eligibility" && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HeartHandshake size={18} className="text-rose-500" />
            AI Eligibility Analyzer
          </h3>
          <p className="text-xs text-slate-400">
            Enter your health metrics. Our machine learning classifier will assess donation eligibility probability.
          </p>

          <form onSubmit={handleCheckEligibility} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Weight (Kg)</label>
                <input
                  type="number"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Last Donated (Months)</label>
                <input
                  type="number"
                  required
                  value={lastMonths}
                  onChange={(e) => setLastMonths(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Checkbox markers */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={conditions}
                  onChange={(e) => setConditions(e.target.checked)}
                  className="rounded border-slate-800 text-rose-600 focus:ring-0 cursor-pointer"
                />
                Active medical conditions?
              </label>

              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={travel}
                  onChange={(e) => setTravel(e.target.checked)}
                  className="rounded border-slate-800 text-rose-600 focus:ring-0 cursor-pointer"
                />
                Recent malaria-risk travel?
              </label>

              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaccine}
                  onChange={(e) => setVaccine(e.target.checked)}
                  className="rounded border-slate-800 text-rose-600 focus:ring-0 cursor-pointer"
                />
                Vaccinated in last 14 days?
              </label>
            </div>

            <button
              type="submit"
              disabled={checking}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {checking ? "Analyzing indicators..." : "Check Safety Profile"}
            </button>
          </form>

          {eligResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in zoom-in-95 duration-100 ${
              eligResult.is_eligible 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>{eligResult.is_eligible ? "✓ Safe to Donate" : "✗ Temporarily Deferred"}</span>
                <span>{eligResult.score.toFixed(0)}% Match Score</span>
              </div>
              <p className="text-slate-400 font-normal leading-relaxed">{eligResult.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* ================= REQUESTS TAB ================= */}
      {currentTab === "requests" && (
        loading ? <SkeletonRequests /> : (
          <div className="space-y-6 animate-fadeIn">
            {/* Header alert */}
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-semibold">
              <AlertTriangle size={18} className="animate-pulse flex-shrink-0" />
              <span>
                {activeRequests.filter(r => r.emergency_type === "critical").length} critical blood request{activeRequests.filter(r => r.emergency_type === "critical").length !== 1 ? "s" : ""} need your help. Review and respond below.
              </span>
              <button
                onClick={loadDonorData}
                className="ml-auto text-[10px] px-3 py-1.5 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {/* Request Notification Cards */}
            <div className="space-y-4">
              {activeRequests.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
                  No active patient blood requests at the moment.
                </div>
              ) : (
                activeRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`glass-panel p-5 rounded-2xl border transition-all duration-200 ${
                      req.emergency_type === "critical"
                        ? "glow-critical bg-red-500/5"
                        : req.emergency_type === "urgent"
                          ? "glow-urgent bg-amber-500/5"
                          : "glow-regular border-slate-850 bg-slate-900/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Severity Icon */}
                        <div className={`mt-0.5 p-2.5 rounded-xl flex-shrink-0 ${
                          req.emergency_type === "critical" ? "bg-red-500/15 text-red-500" :
                          req.emergency_type === "urgent" ? "bg-amber-500/15 text-amber-500" :
                          "bg-blue-500/15 text-blue-500"
                        }`}>
                          <AlertTriangle size={18} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-slate-100 text-sm">{req.recipient_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              req.emergency_type === "critical" ? "bg-red-500/15 text-red-500 border border-red-500/20" :
                              req.emergency_type === "urgent" ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" :
                              "bg-blue-500/15 text-blue-500 border border-blue-500/20"
                            }`}>
                              {req.emergency_type}
                            </span>
                            <span className="text-[10px] text-slate-500">#{req.id}</span>
                          </div>

                          <p className="text-xs text-slate-400 mt-1">{req.hospital_name}</p>

                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                            <span>
                              Blood Group: <strong className="text-rose-400 font-black">{req.blood_group}</strong>
                            </span>
                            <span>
                              Volume: <strong className="text-slate-300">{req.units_required} Units</strong>
                            </span>
                            <span>
                              AI Priority: <strong className="text-rose-400 font-mono">{req.priority_score?.toFixed(1)} / 100</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => alert(`🩸 Response confirmed! The hospital ${req.hospital_name} has been notified that you are on your way. Safe travels, hero!`)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                        >
                          Respond Now
                        </button>
                        <button
                          onClick={() => setActiveRequests(prev => prev.filter(r => r.id !== req.id))}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[11px] font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      )}


      {/* Certificate Modal Overlay */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[500px] bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveCert(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
            >
              Close
            </button>

            <div className="border-4 border-double border-rose-600/30 p-6 rounded-2xl space-y-5">
              <span className="text-4xl">🏆</span>
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
                  DIGITAL DONATION CERTIFICATE
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Powered Digital Blood Bank</p>
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-300">
                <p>This is proudly awarded to our distinguished life saver</p>
                <p className="text-lg font-black text-slate-100 underline decoration-rose-500 underline-offset-4">John Doe</p>
                <p>for donating 1.0 unit of blood to support clinical emergencies.</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-5 mt-4">
                <div className="text-left text-[9px] text-slate-500 font-bold">
                  <p>CERTIFICATE ID: #{activeCert.id}</p>
                  <p>DATE: {new Date(activeCert.donation_date).toLocaleDateString()}</p>
                </div>
                <div className="h-14 w-14 bg-white p-1 rounded-md shadow-md flex items-center justify-center">
                  <div className="h-12 w-12 border-2 border-black flex flex-col justify-between p-0.5">
                    <div className="flex justify-between"><div className="w-3 h-3 bg-black"></div><div className="w-3 h-3 bg-black"></div></div>
                    <div className="flex justify-between"><div className="w-3 h-3 bg-black"></div><div className="w-3.5 h-3.5 bg-black border-2 border-white rounded-full"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
