import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  Phone,
  X,
  Map,
  Trophy,
  ActivitySquare
} from "lucide-react";

// Leaflet CDN dynamic loader helper
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }
    
    const cssId = "leaflet-cdn-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-cdn-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve((window as any).L);
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          clearInterval(interval);
          resolve((window as any).L);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        if (!(window as any).L) reject(new Error("Leaflet script failed to load"));
      }, 10000);
    }
  });
};

interface MapPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: number, lng: number, addressDetails?: any) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const initialLat = parseFloat(lat) || 16.9823;
  const initialLng = parseFloat(lng) || 82.2475;

  useEffect(() => {
    let active = true;
    let mapInstance: any = null;

    loadLeaflet().then((L) => {
      if (!active) return;
      setLoadingMap(false);

      if (!mapContainerRef.current) return;

      mapInstance = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance);

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                 <div class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></div>
                 <div class="relative w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                   <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                 </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true
      }).addTo(mapInstance);
      markerRef.current = marker;

      mapInstance.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        triggerChange(clickLat, clickLng);
      });

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        triggerChange(position.lat, position.lng);
      });

    }).catch((err) => {
      console.error(err);
      if (active) setErrorMsg("Failed to load map canvas.");
    });

    const triggerChange = async (newLat: number, newLng: number) => {
      let addressDetails = null;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            addressDetails = {
              street: data.address.road || data.address.suburb || data.display_name.split(",")[0] || "",
              city: data.address.city || data.address.town || data.address.village || data.address.county || "",
              district: data.address.state_district || data.address.county || "",
              state: data.address.state || "",
              full_address: data.display_name || ""
            };
          }
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
      onChange(newLat, newLng, addressDetails);
    };

    return () => {
      active = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        const currentLatLng = markerRef.current.getLatLng();
        if (Math.abs(currentLatLng.lat - parsedLat) > 0.0001 || Math.abs(currentLatLng.lng - parsedLng) > 0.0001) {
          markerRef.current.setLatLng([parsedLat, parsedLng]);
          mapRef.current.setView([parsedLat, parsedLng], 14);
        }
      }
    }
  }, [lat, lng]);

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current.setView([latitude, longitude], 14);
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
              .then(res => res.json())
              .then(data => {
                const addressDetails = data && data.address ? {
                  street: data.address.road || data.address.suburb || data.display_name.split(",")[0] || "",
                  city: data.address.city || data.address.town || data.address.village || data.address.county || "",
                  district: data.address.state_district || data.address.county || "",
                  state: data.address.state || "",
                  full_address: data.display_name || ""
                } : undefined;
                onChange(latitude, longitude, addressDetails);
              })
              .catch(() => {
                onChange(latitude, longitude);
              });
          }
        },
        (error) => {
          console.error("Geolocation error", error);
          alert("Could not access location. Please select it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Location on Map</span>
        <button
          onClick={handleLocateMe}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/5 hover:bg-slate-800 text-rose-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
        >
          Locate Me
        </button>
      </div>
      <div className="w-full rounded-xl border border-white/5 bg-slate-950 overflow-hidden relative h-[200px]">
        {loadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-[1000] text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
            Loading Map View...
          </div>
        )}
        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-[1000] text-rose-455 text-xs p-4 text-center">
            {errorMsg}
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-[1]" style={{ filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }} />
      </div>
    </div>
  );
};

export const DonorDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "profile";

  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Appointments schedule form states
  const [selectedCenter, setSelectedCenter] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [scheduledAppts, setScheduledAppts] = useState<any[]>([]);

  // Blood test booking states
  const [testBooking, setTestBooking] = useState<any | null>(null);

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

  // Eligibility Checker
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("68");
  const [hemoglobin, setHemoglobin] = useState("14.5");
  const [lastMonths, setLastMonths] = useState("4");
  const [conditions, setConditions] = useState(false);
  const [travel, setTravel] = useState(false);
  const [vaccine, setVaccine] = useState(false);
  const [eligResult, setEligResult] = useState<any | null>(null);
  const [checking, setChecking] = useState(false);

  // Digital Certificate Popup
  const [activeCert, setActiveCert] = useState<any | null>(null);

  const loadDonorData = async () => {
    setLoading(true);
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setProfile(user.profile);
      
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
      
      setBadges([
        { id: 1, title: "First Gift", description: "Awarded for completing your first life-saving blood donation.", unlocked: true },
        { id: 2, title: "Bronze Hero", description: "Awarded for completing 3 blood donations.", unlocked: false },
        { id: 3, title: "Silver LifeSaver", description: "Awarded for completing 5 blood donations.", unlocked: false }
      ]);

      setScheduledAppts([
        { id: 401, center: "Red Cross Blood Bank", city: "Kakinada", date: new Date(Date.now() + 86400000).toLocaleDateString(), time: "10:30" }
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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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
    setToast({
      message: `Donation slot reserved successfully at ${selectedCenter}, ${selectedCity}!`,
      type: "success"
    });
  };

  const handleBookTest = (e: React.FormEvent) => {
    e.preventDefault();
    setTestBooking({
      id: Date.now(),
      center: selectedCenter,
      city: selectedCity,
      date: appointmentDate,
      time: appointmentTime
    });
    setToast({
      message: "🔬 Blood Typing Test scheduled successfully!",
      type: "success"
    });
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
      
      const userRes = await api.getCurrentUser();
      setCurrentUser(userRes);
      setProfile(userRes.profile);
      
      setTimeout(() => {
        setIsEditing(false);
        setUpdateStatus(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setUpdateStatus({ success: false, message: err.message || "Failed to update profile." });
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptRequest = async (reqId: number, recipientName: string) => {
    try {
      await api.acceptRequest(reqId);
      setToast({
        message: `Life-saving donation scheduled successfully for ${recipientName}!`,
        type: "success"
      });
      setActiveRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      console.error(err);
      alert("Failed to accept donation request.");
    }
  };

  const handleDeclineRequest = (reqId: number) => {
    setActiveRequests(prev => prev.filter(r => r.id !== reqId));
    setToast({
      message: "Emergency request declined.",
      type: "info"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-[#050814]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Donor Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#050814] selection:bg-rose-500 selection:text-white">
      
      {/* Toast Alert banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Certificate Modal */}
      <AnimatePresence>
        {activeCert && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveCert(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl w-full max-w-xl p-8 relative shadow-2xl border border-rose-200 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setActiveCert(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                <X size={20} />
              </button>

              <div className="flex flex-col items-center">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-2" style={{ filter: "drop-shadow(0 0 4px rgba(220,38,38,0.35))" }} />
                <span className="text-[10px] text-rose-600 font-black tracking-widest uppercase">Certificate of Excellence</span>
              </div>

              <div className="border-t border-b border-slate-100 py-6 space-y-4">
                <p className="text-xs text-slate-500 italic">This official digital document recognizes that</p>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 capitalize">{currentUser?.full_name}</h3>
                <p className="text-xs text-slate-650 max-w-sm mx-auto leading-relaxed">
                  has selflessly donated <strong className="text-rose-600">1.0 Unit</strong> of compatible blood group <strong className="text-rose-600">{profile?.blood_group || "O+"}</strong> to support life-saving operations at matching depots.
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <div className="text-left">
                  <p>Certificate ID: <strong className="font-mono text-slate-800">#DON-{activeCert.id}</strong></p>
                  <p className="mt-0.5">Date: {new Date(activeCert.donation_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-rose-600 uppercase">Life Care AI</p>
                  <p className="text-[8px] mt-0.5 text-slate-500">Official System Seal</p>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-800"
              >
                Print Document
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">
          {currentTab === "profile" ? "Donor Profile Hub" : currentTab === "appointments" ? "Reservation Hub" : currentTab === "eligibility" ? "Eligibility Terminal" : currentTab === "bloodtest" ? "Blood Typing diagnostics" : "Urgent Requests"}
        </h2>
        <p className="text-xs text-slate-450 mt-1">
          {currentTab === "profile"
            ? "Inspect your badges, update location variables, and view certificates."
            : currentTab === "appointments"
            ? "Reserve blood donation slots at near hospitals or mobile campaign camps."
            : currentTab === "eligibility"
            ? "Audit clinical parameters to evaluate your eligibility."
            : currentTab === "bloodtest"
            ? "Reserve a typing test appointment or inspect active camps."
            : "Monitor pending compatible blood requests in your geocoded area."}
        </p>
      </div>

      {/* ================= MY PROFILE TAB ================= */}
      <AnimatePresence mode="wait">
        {currentTab === "profile" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Card: Profile overview / edit form */}
            {!isEditing ? (
              <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-600 to-rose-450" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600/10 to-rose-600/20 border border-rose-500/25 flex items-center justify-center text-rose-500 font-extrabold text-lg uppercase flex-shrink-0">
                      {currentUser?.full_name ? currentUser.full_name.charAt(0) : "D"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                        {currentUser?.full_name || "Active Donor"}
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          profile?.availability_status === "available" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                        }`}>
                          {profile?.availability_status === "available" ? "Active Pool" : "On Hold"}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1">ID #{currentUser?.id} • {currentUser?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-tr from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/15"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest pb-1 border-b border-white/5">Biometrics Data</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Blood Group</span>
                        <span className="text-base font-black text-rose-455 mt-1 block">{profile?.blood_group || "O+"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Birth Date</span>
                        <span className="text-xs font-semibold text-slate-200 mt-1 block">
                          {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not set"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Weight</span>
                        <span className="text-xs font-semibold text-slate-200 mt-1 block">{profile?.weight ? `${profile.weight} kg` : "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Hemoglobin</span>
                        <span className="text-xs font-semibold text-slate-200 mt-1 block">{profile?.hemoglobin ? `${profile.hemoglobin} g/dL` : "Not set"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest pb-1 border-b border-white/5">Address Coordinates</h4>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Street Address</span>
                      <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{profile?.address || "Not set"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">City</span>
                        <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">{profile?.city || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">State</span>
                        <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">{profile?.state || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Lat/Lng</span>
                        <span className="text-[10px] font-mono text-slate-350 mt-1 block truncate">Geocoded</span>
                      </div>
                    </div>
                  </div>
                </div>

                {profile?.latitude && profile?.longitude && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Home Marker Location</span>
                    <div className="w-full h-36 rounded-2xl border border-white/5 overflow-hidden">
                      <iframe
                        title="profile-location-overview"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(profile.longitude) - 0.015).toFixed(4)},${(parseFloat(profile.latitude) - 0.01).toFixed(4)},${(parseFloat(profile.longitude) + 0.015).toFixed(4)},${(parseFloat(profile.latitude) + 0.01).toFixed(4)}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Update Profile Details</h3>
                {updateStatus && (
                  <div className={`p-4 rounded-2xl border text-xs ${updateStatus.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {updateStatus.message}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Group</label>
                      <select
                        value={profileBloodGroup}
                        onChange={(e) => setProfileBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Availability</label>
                      <select
                        value={profileAvailability}
                        onChange={(e) => setProfileAvailability(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Date of Birth</label>
                      <input
                        type="date"
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={profileWeight}
                        onChange={(e) => setProfileWeight(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Hemoglobin (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={profileHemoglobin}
                        onChange={(e) => setProfileHemoglobin(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Street Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">City</label>
                      <input
                        type="text"
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl">
                    <MapPicker
                      lat={profileLat}
                      lng={profileLng}
                      onChange={(latVal, lngVal, addressDetails) => {
                        setProfileLat(latVal.toFixed(6));
                        setProfileLng(lngVal.toFixed(6));
                        if (addressDetails) {
                          if (addressDetails.street) setProfileAddress(addressDetails.street);
                          if (addressDetails.city) setProfileCity(addressDetails.city);
                          if (addressDetails.district) setProfileDistrict(addressDetails.district);
                          if (addressDetails.state) setProfileState(addressDetails.state);
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-1/3 py-3 bg-slate-900 border border-white/5 text-slate-450 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Right Shelf: Badges and Certificates */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 flex items-center gap-1.5">
                  <FileCheck2 size={16} className="text-rose-550" />
                  Certificates log
                </h3>
                <div className="space-y-2.5">
                  {donations.map((don) => (
                    <div key={don.id} className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">1.0 Unit • #{don.id}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{new Date(don.donation_date).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setActiveCert(don)}
                        className="px-2.5 py-1 bg-rose-600/10 text-rose-455 border border-rose-500/20 text-[10px] font-bold rounded-lg hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                      >
                        Print
                      </button>
                    </div>
                  ))}
                  {donations.length === 0 && (
                    <p className="text-[10px] text-slate-550 text-center py-4">No donation logs found.</p>
                  )}
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-355 flex items-center gap-1.5">
                  <Trophy size={16} className="text-rose-550" />
                  Milestones
                </h3>
                <div className="space-y-3">
                  {badges.map((b) => (
                    <div key={b.id} className={`p-4 rounded-2xl border flex gap-3 items-center ${
                      b.unlocked ? "bg-rose-500/[0.01] border-rose-500/20 text-rose-450" : "bg-slate-950/20 border-white/5 text-slate-600"
                    }`}>
                      <Award size={20} className={b.unlocked ? "text-rose-500" : "text-slate-700"} />
                      <div>
                        <h4 className="font-bold text-xs text-slate-200 leading-none">{b.title}</h4>
                        <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= APPOINTMENTS TAB ================= */}
        {currentTab === "appointments" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Book Appointment Form */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-5 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-rose-500" />
                Reserve Donation Slot
              </h3>
              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">City Hub</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455">Time Slot</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                    >
                      {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"].map((t) => (
                        <option key={t} value={t}>{t} AM/PM</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Target Facility</label>
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    {filteredHospitals.map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Reservation Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/25 cursor-pointer"
                >
                  Reserve Slot
                </button>
              </form>
            </div>

            {/* Booked list */}
            <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Scheduled Appointments</h3>
              <div className="space-y-3">
                {scheduledAppts.map((appt) => (
                  <div key={appt.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{appt.center}</p>
                      <p className="text-[10px] text-slate-500 mt-1">📍 {appt.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-rose-455">{appt.date}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{appt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= ELIGIBILITY TAB ================= */}
        {currentTab === "eligibility" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Input Form */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-5 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <HeartHandshake size={14} className="text-rose-500" />
                Diagnostic Auditing
              </h3>
              <form onSubmit={handleCheckEligibility} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-450">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-2.5 py-2 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-450">Weight</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-2.5 py-2 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-455">Hemo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={hemoglobin}
                      onChange={(e) => setHemoglobin(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-2.5 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-slate-450">Months Since Last Donation</label>
                  <input
                    type="number"
                    value={lastMonths}
                    onChange={(e) => setLastMonths(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                  />
                </div>

                <div className="space-y-3.5 pt-2 border-t border-white/5">
                  {[
                    { id: "conds", label: "Medical chronic conditions", state: conditions, setter: setConditions },
                    { id: "trav", label: "Suspicious transit history", state: travel, setter: setTravel },
                    { id: "vacc", label: "Vaccines in last 14 days", state: vaccine, setter: setVaccine }
                  ].map((chk) => (
                    <div key={chk.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={chk.id}
                        checked={chk.state}
                        onChange={(e) => chk.setter(e.target.checked)}
                        className="rounded border-white/10 text-rose-600 bg-slate-950 focus:ring-rose-500 cursor-pointer"
                      />
                      <label htmlFor={chk.id} className="text-[10px] text-slate-400 cursor-pointer select-none">
                        {chk.label}
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={checking}
                  className="w-full py-3 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/25 cursor-pointer disabled:opacity-50"
                >
                  {checking ? "Checking..." : "Evaluate Eligibility"}
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Diagnostic Output</h3>
              {eligResult ? (
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center space-y-4">
                  <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center ${
                    eligResult.is_eligible ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" : "bg-red-500/10 border-red-500/20 text-red-450"
                  }`}>
                    {eligResult.is_eligible ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-200">
                      {eligResult.is_eligible ? "Evaluated Status: Eligible" : "Evaluated Status: Ineligible"}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{eligResult.reason}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-10 font-medium">Please submit the eligibility audit parameters.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= NEW BLOOD TYPING TEST TAB ================= */}
        {currentTab === "bloodtest" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Booking Form */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-5 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <ActivitySquare size={14} className="text-rose-500" />
                Book Typing Test
              </h3>
              <form onSubmit={handleBookTest} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455">City Hub</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455">Time Slot</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                    >
                      {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"].map((t) => (
                        <option key={t} value={t}>{t} AM/PM</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Hospital/Camp Center</label>
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    {filteredHospitals.map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Date of Test</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/25 cursor-pointer"
                >
                  Book Typing Slot
                </button>
              </form>
            </div>

            {/* Details for Booking & Near Centers */}
            <div className="lg:col-span-2 space-y-6">
              {testBooking && (
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Check size={14} className="text-rose-455" />
                    Active Reservation Reserved
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Facility Hub</p>
                      <p className="font-extrabold text-slate-200 mt-1">{testBooking.center}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Reservation Code</p>
                      <p className="font-mono text-rose-455 mt-1">#TST-{testBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Date</p>
                      <p className="font-semibold text-slate-350 mt-1">{testBooking.date}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Time</p>
                      <p className="font-semibold text-slate-350 mt-1">{testBooking.time}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Near Hospitals & active Camps</h3>
                <div className="space-y-3">
                  {[
                    { name: "GGH Kakinada Camp #1", address: "GGH Ground, Surya Rao Peta, Kakinada, AP 533001", slots: "3 slots left", status: "Active Today" },
                    { name: "Apollo Blood Typing Lab", address: "Hospital Rd, Beside Apollo Gynae Wing, Kakinada, AP 533001", slots: "6 slots left", status: "Bookable" }
                  ].map((camp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-200">{camp.name}</h4>
                        <p className="text-[10px] text-slate-550 mt-1 truncate max-w-xs">📍 {camp.address}</p>
                        <p className="text-[9px] text-rose-450 mt-1 font-bold">{camp.slots}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 rounded-lg flex-shrink-0">
                        {camp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= REQUESTS LIST TAB ================= */}
        {currentTab === "requests" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Urgent Requests log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Request ID</th>
                    <th className="pb-3 font-bold">Recipient</th>
                    <th className="pb-3 font-bold text-center">Group</th>
                    <th className="pb-3 font-bold text-center">Volume</th>
                    <th className="pb-3 font-bold">Hospital Facility</th>
                    <th className="pb-3 font-bold text-center">Priority score</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#REQ-{r.id}</td>
                      <td className="py-3.5 font-bold text-slate-200">{r.recipient_name}</td>
                      <td className="py-3.5 font-black text-rose-450 text-center">{r.blood_group}</td>
                      <td className="py-3.5 text-slate-300 font-semibold text-center">{r.units_required} U</td>
                      <td className="py-3.5 text-slate-400">{r.hospital_name}</td>
                      <td className="py-3.5 font-mono font-black text-rose-450 text-center">{r.priority_score?.toFixed(1)} / 100</td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleAcceptRequest(r.id, r.recipient_name)}
                            className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-450 hover:text-white border border-emerald-500/20 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(r.id)}
                            className="px-2 py-1 bg-red-650/10 hover:bg-red-650 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-650">No urgent matching broadcasts pending.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
