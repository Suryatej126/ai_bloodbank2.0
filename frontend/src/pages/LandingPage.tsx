import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ShieldCheck, 
  HeartHandshake, 
  Brain, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Award, 
  Play, 
  Droplet, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2,
  ChevronDown,
  Info,
  Calendar,
  Phone,
  MessageSquare
} from "lucide-react";
import { api } from "../services/api";

let hasPlayedSessionIntro = false;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>("O-");
  const [showIntro, setShowIntro] = useState(!hasPlayedSessionIntro);
  const [isMuted, setIsMuted] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [videoSrc, setVideoSrc] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640 ? "/intro-mobile.mp4" : "/intro-desktop.mp4";
    }
    return "/intro-desktop.mp4";
  });

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVideoSrc("/intro-mobile.mp4");
      } else {
        setVideoSrc("/intro-desktop.mp4");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Modals state
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isSosChoiceOpen, setIsSosChoiceOpen] = useState(false);

  // Donate Form State
  const [donateName, setDonateName] = useState("");
  const [donateBloodGroup, setDonateBloodGroup] = useState("O-");
  const [donateAge, setDonateAge] = useState("");
  const [donateWeight, setDonateWeight] = useState("");
  const [donateHemoglobin, setDonateHemoglobin] = useState("");
  const [donateLastDonation, setDonateLastDonation] = useState("");
  const [donateConditions, setDonateConditions] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateResult, setDonateResult] = useState<any>(null);
  const [donateNeverDonated, setDonateNeverDonated] = useState(false);

  // Request Form State
  const [requestName, setRequestName] = useState("");
  const [requestBloodGroup, setRequestBloodGroup] = useState("O-");
  const [unitsRequired, setUnitsRequired] = useState("1");
  const [emergencyType, setEmergencyType] = useState("urgent");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [recommendedDonors, setRecommendedDonors] = useState<any[]>([]);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonateLoading(true);
    setDonateResult(null);
    try {
      const res = await api.checkEligibility({
        age: parseInt(donateAge) || 0,
        weight: parseFloat(donateWeight) || 0,
        hemoglobin: parseFloat(donateHemoglobin) || 0,
        last_donation_months: parseInt(donateLastDonation) || 0,
        has_medical_conditions: donateConditions
      });
      setDonateResult(res);
    } catch (err) {
      setDonateResult({
        is_eligible: false,
        reason: "Failed to check eligibility. Please ensure all values are correct."
      });
    } finally {
      setDonateLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestResult(null);
    setRecommendedDonors([]);
    try {
      const res = await api.createRequest({
        recipient_name: requestName,
        blood_group: requestBloodGroup,
        units_required: parseFloat(unitsRequired) || 1,
        emergency_type: emergencyType,
        hospital_name: hospitalName,
        address: hospitalAddress
      });
      
      const donors = await api.getDonorRecommendations(res.id);
      
      setTimeout(() => {
        setRequestResult(res);
        setRecommendedDonors(donors);
        setRequestLoading(false);
      }, 1500);
      
    } catch (err) {
      setRequestResult({
        error: true,
        message: "Failed to submit blood request. Please check the network."
      });
      setRequestLoading(false);
    }
  };

  const resetDonateForm = () => {
    setDonateName("");
    setDonateBloodGroup("O-");
    setDonateAge("");
    setDonateWeight("");
    setDonateHemoglobin("");
    setDonateLastDonation("");
    setDonateConditions(false);
    setDonateResult(null);
    setDonateNeverDonated(false);
  };

  const resetRequestForm = () => {
    setRequestName("");
    setRequestBloodGroup("O-");
    setUnitsRequired("1");
    setEmergencyType("urgent");
    setHospitalName("");
    setHospitalAddress("");
    setRequestResult(null);
    setRecommendedDonors([]);
  };

  const handleSkipIntro = () => {
    setFadeClass("opacity-0 transition-opacity duration-1000");
    hasPlayedSessionIntro = true;
    setTimeout(() => {
      setShowIntro(false);
    }, 1000);
  };

  const compatibilities: Record<string, string[]> = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
  };

  const faqs = [
    {
      q: "Who is eligible to donate blood?",
      a: "Generally, donors must be aged 18-65, weigh at least 50 kg, have a hemoglobin level above 12.5 g/dl, and have no major active clinical illnesses or chronic conditions. You can check your eligibility instantly using our eligibility modal."
    },
    {
      q: "How does the AI matching system rank donors?",
      a: "Our AI recommendation system uses a combination of mathematical factors: compatibility matches, real-time geographical distance, transit delays, and safety parameters. It prioritizes O-negative universal donors in critical dispatches."
    },
    {
      q: "What is an SOS emergency request?",
      a: "An SOS emergency broadcast is sent instantly to all nearby blood banks and registered compatible donors in your area. This system bypasses standard queues to guarantee delivery for critical trauma and surgery cases."
    },
    {
      q: "Is my personal healthcare data kept secure?",
      a: "Yes. All healthcare data, donor locations, and medical profile logs are encrypted and stored in compliance with privacy regulations. Location geocoding coordinates are computed client-side."
    }
  ];

  if (showIntro) {
    return (
      <div className={`fixed inset-0 w-screen h-screen h-[100dvh] z-50 bg-slate-950 select-none overflow-hidden ${fadeClass}`}>
        <video
          key={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleSkipIntro}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Desktop Overlay controls */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-6 sm:bottom-10 px-4 sm:px-8 md:px-16 flex-row gap-2.5 sm:gap-0 items-center justify-between z-10">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <button
            onClick={handleSkipIntro}
            className="group flex items-center gap-1.5 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl bg-rose-600 border border-rose-500/30 text-xs font-black text-white transition-all cursor-pointer"
          >
            Skip Onboarding
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Overlay controls */}
        <div className="sm:hidden absolute inset-x-0 bottom-28 px-4 flex items-center justify-between z-10 pointer-events-none">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-black/60 border border-white/10 text-slate-200 cursor-pointer"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={handleSkipIntro}
            className="pointer-events-auto absolute right-0 flex items-center gap-1 bg-black/65 border border-r-0 border-white/10 pl-4 pr-5 py-2.5 rounded-l-md text-xs font-bold text-slate-100 cursor-pointer"
          >
            <span>Skip Onboarding</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white relative overflow-hidden">
      
      {/* Background glowing mesh circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* ================= 1. HEADER & STICKY NAVBAR ================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#030712]/75 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex flex-col select-none cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="LIFE CARE Logo" 
                className="h-9 w-auto object-contain"
                style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,0.35))" }}
              />
              <h1 className="font-extrabold text-[26px] text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 leading-none py-1">
                LIFE CARE
              </h1>
            </div>
            <p className="text-[9px] text-rose-500 uppercase tracking-widest font-black pl-[44px] leading-none">
              ai smart blood bank
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSosChoiceOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black bg-red-650 hover:bg-red-600 text-white border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider sos-pulse"
            >
              <AlertCircle size={14} />
              <span>SOS Emergency</span>
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              Login / Register
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 sm:space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Brain size={14} className="animate-pulse" />
            AI-Driven Medical Infrastructure
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-100">
            Real-Time Blood Logistics <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-orange-400">
              Powered by Intelligence.
            </span>
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Eliminating clinical stock deficits, prioritizing critical emergencies, and mapping compatible donors in real-time. Join the smart network saving lives through automated geolocated dispatches.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetDonateForm();
                setIsDonateOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-650 to-rose-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Heart size={18} className="fill-white" />
              Quick Donate Blood
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetRequestForm();
                setIsRequestOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl text-sm font-bold text-slate-200 transition-all cursor-pointer"
            >
              <Droplet size={18} className="text-rose-500" />
              Request Blood
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSosChoiceOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer sos-pulse border border-red-500/20"
            >
              <AlertCircle size={18} className="animate-bounce" />
              SOS EMERGENCY
            </motion.button>
          </div>
        </motion.div>

        {/* Dynamic Graphic Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/10 to-blue-500/10 rounded-3xl filter blur-xl"></div>
          <div className="relative border border-white/10 backdrop-blur-xl bg-slate-900/35 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-rose-400">
                <Activity size={18} className="animate-pulse" />
                Compatibility Matrix
              </h3>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active Node</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(compatibilities).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`py-2.5 font-extrabold text-xs rounded-xl transition-all cursor-pointer ${
                    selectedGroup === group 
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 border border-rose-500" 
                      : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {selectedGroup && (
              <div className="p-4 bg-white/[0.01] rounded-2xl border border-white/5 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  Donor {selectedGroup} is compatible with:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {compatibilities[selectedGroup].map((recipient) => (
                    <span 
                      key={recipient} 
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                    >
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[9px] text-slate-500 leading-normal">
              AI recommendation models utilize compatible matrices to rank and alert geolocated donors.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ================= 3. FEATURES SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Core Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Engineered For Critical Operations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: "Smart Matching", desc: "Our AI recommendation engine evaluates donor-patient distance, safety, and compatibility matrix matching in seconds." },
            { icon: Clock, title: "Shortage Prediction", desc: "Advanced forecasting analysis trains on historical data logs to predict seasonal stock deficits and notify campaigns." },
            { icon: MapPin, title: "Real-Time Tracking", desc: "Locate matching blood products, partner centers, and active emergency routes via geo-dispatch nodes." },
            { icon: Award, title: "Gamification & Badges", desc: "Unlock exclusive digital achievement levels, collect tokens, and print official certificates with every donation." }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={idx}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-slate-900/35 border border-white/5 flex flex-col space-y-4 hover:border-rose-500/20 transition-all duration-300"
              >
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
                  <Icon size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-200">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= 4. AI TECHNOLOGY SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Neural Forecasting</span>
            <h2 className="text-3xl font-black leading-tight text-slate-100">Predictive Stock Triage</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We leverage live analytics and deep prediction modeling to avoid supply chain disruptions. By training on multi-city records and demand trends, the platform initiates preemptive notification alerts to donor pools before deficits manifest.
            </p>
            <div className="space-y-3">
              {[
                "Seasonal blood shortage forecasting with 92% regression accuracy.",
                "Automated partner campaign scheduling in target city hubs.",
                "Live donor response mapping under 4 minutes."
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-350">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative border border-white/10 bg-slate-900/35 p-6 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-rose-500/[0.01] pointer-events-none"></div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Gemini Neural Analytics Console</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Shortage Alert Probabilities", val: "Critical (A- / O-)", color: "text-red-400 bg-red-500/10 border-red-500/20" },
                  { label: "Regional Demand Spikes", val: "Urgent (Kakinada)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { label: "Target Campaign Success Rate", val: "Optimal Match (99.4%)", color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white/[0.01] rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. EMERGENCY BLOOD REQUEST SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="relative overflow-hidden bg-gradient-to-tr from-red-950/20 to-slate-900/30 border border-red-900/30 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 text-[10px] font-black tracking-wider uppercase text-red-400 bg-red-500/10 rounded-full w-fit mx-auto md:mx-0">Emergency Link</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">SOS Request & Real-time Triage</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Facing an emergency situation? Broadcast a live blood alert to hospitals, banks, and qualified compatible donors within a 15km range instantly.
            </p>
          </div>
          <button 
            onClick={() => setIsSosChoiceOpen(true)}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-sm font-black transition-all cursor-pointer shadow-lg shadow-red-650/20 uppercase tracking-widest sos-pulse"
          >
            Trigger SOS
          </button>
        </div>
      </section>

      {/* ================= 6. BLOOD AVAILABILITY SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Live Inventories</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Blood Group Deficits & Availability</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { group: "O-", status: "Critical Shortage", color: "text-red-400 bg-red-500/10 border-red-500/20" },
            { group: "A-", status: "Low Stock", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { group: "O+", status: "Healthy Level", color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20" },
            { group: "AB+", status: "Healthy Level", color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20" }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/35 border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xl font-black text-slate-100 leading-none">{item.group}</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Group Code</p>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-widest border ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7. HOW IT WORKS SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Workflow Stencil</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Seamless Live Triage Integration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Submit Query", desc: "Donors log coordinates and eligibility scores; Patients/hospitals log unit orders." },
            { step: "02", title: "AI Ranking Engine", desc: "The platform evaluates transit routes, geocodes, and compatible donor profiles." },
            { step: "03", title: "Instant Notification", desc: "System dispatches instant notifications via SMS/email and coordinates mapping details." }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/30 border border-white/5 relative overflow-hidden flex flex-col space-y-4">
              <span className="absolute right-4 top-2 text-6xl font-black text-rose-500/5 select-none">{item.step}</span>
              <h4 className="font-extrabold text-sm text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 8. STATISTICS SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-555">99.4%</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Match Accuracy</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-555">&lt; 4 Min</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">SOS Dispatch Delay</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-555">8,500+</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Successful Matches</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-555">42+</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Partner Centers</p>
          </div>
        </div>
      </section>

      {/* ================= 9. TESTIMONIALS SECTION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Success Stories</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">What Healthcare Leaders Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { quote: "The AI recommendation matched an universal donor within 3 minutes of our emergency broadcast. Absolutely critical during trauma operations.", author: "Dr. K. Srinivas", role: "Chief Trauma Specialist, City Hospital" },
            { quote: "Gamification logs and direct certificate printing increased our student donor turnout by 65%. Highly recommended MVP dashboard.", author: "Prof. S. R. Prasad", role: "NSS Voluntary Coordinator, Kakinada" }
          ].map((test, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/35 border border-white/5 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-350 italic leading-relaxed">"{test.quote}"</p>
              <div>
                <p className="text-xs font-black text-rose-400">{test.author}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 10. FAQ SECTION ================= */}
      <section className="max-w-3xl mx-auto w-full px-4 py-12 sm:py-16 border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">FAQ Directory</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Common Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-slate-900/35 border border-white/5 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-white/[0.01]"
                    >
                      <p className="p-4 text-xs text-slate-450 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FOOTER SECTION ================= */}
      <footer className="border-t border-white/5 bg-slate-950 py-10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start select-none">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="LIFE CARE Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-extrabold text-lg text-slate-100">LIFE CARE</span>
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1 leading-none">ai smart blood bank</p>
          </div>
          <p className="text-[10px] text-slate-500 text-center md:text-right leading-relaxed">
            &copy; {new Date().getFullYear()} LIFE CARE. Designed for Final Year B.Tech Academic Demonstration. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= MODAL: QUICK DONATE ================= */}
      <AnimatePresence>
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsDonateOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <Heart className="fill-rose-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Quick Donate Portal</h3>
                  <p className="text-xs text-slate-400">Register as a simulated donor and check eligibility.</p>
                </div>
              </div>

              {!donateResult ? (
                <form onSubmit={handleDonateSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={donateName}
                      onChange={(e) => setDonateName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Group</label>
                      <select
                        value={donateBloodGroup}
                        onChange={(e) => setDonateBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                      >
                        {Object.keys(compatibilities).map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Age</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={donateAge}
                        onChange={(e) => setDonateAge(e.target.value)}
                        placeholder="e.g. 25"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Weight (kg)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={donateWeight}
                        onChange={(e) => setDonateWeight(e.target.value)}
                        placeholder="e.g. 70"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Hemoglobin (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={donateHemoglobin}
                        onChange={(e) => setDonateHemoglobin(e.target.value)}
                        placeholder="e.g. 14.5"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Last Donation (months)</label>
                      <input
                        type={donateNeverDonated ? "text" : "number"}
                        disabled={donateNeverDonated}
                        value={donateNeverDonated ? "Never" : donateLastDonation}
                        onChange={(e) => setDonateLastDonation(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all disabled:opacity-50"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="landing-never-donated-check"
                          checked={donateNeverDonated}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDonateNeverDonated(checked);
                            setDonateLastDonation(checked ? "999" : "4");
                          }}
                          className="rounded border-white/10 text-rose-600 bg-slate-950 focus:ring-rose-500 cursor-pointer"
                        />
                        <label htmlFor="landing-never-donated-check" className="text-[9px] text-slate-500 cursor-pointer select-none">
                          Never donated blood before
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 py-2">
                    <input
                      type="checkbox"
                      id="conditions"
                      checked={donateConditions}
                      onChange={(e) => setDonateConditions(e.target.checked)}
                      className="rounded border-white/10 text-rose-600 bg-slate-950 focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor="conditions" className="text-[11px] text-slate-400 cursor-pointer select-none">
                      I have active chronic medical conditions (e.g. cardiac, respiratory, diabetes).
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={donateLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-600/25"
                  >
                    {donateLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Check Eligibility"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border ${
                    donateResult.is_eligible 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}>
                    {donateResult.is_eligible ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-150">
                      {donateResult.is_eligible ? "You are Eligible to Donate! 🎉" : "Ineligible to Donate ⚠️"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {donateResult.reason || "Your diagnostics indicators conform to safety parameters. You can proceed with appointment booking."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetDonateForm}
                      className="flex-1 py-3 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Reset Form
                    </button>
                    {donateResult.is_eligible && (
                      <button
                        onClick={() => {
                          setIsDonateOpen(false);
                          navigate("/login?mode=register");
                        }}
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20 animate-pulse"
                      >
                        Register as Donor
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: REQUEST BLOOD ================= */}
      <AnimatePresence>
        {isRequestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsRequestOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <Droplet className="fill-rose-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Emergency Request Portal</h3>
                  <p className="text-xs text-slate-400">Submit requests directly to geocoded matching centers.</p>
                </div>
              </div>

              {!requestResult ? (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Blood Group</label>
                      <select
                        value={requestBloodGroup}
                        onChange={(e) => setRequestBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                      >
                        {Object.keys(compatibilities).map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Units Needed</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        min="0.5"
                        value={unitsRequired}
                        onChange={(e) => setUnitsRequired(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                      />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Severity</label>
                      <select
                        value={emergencyType}
                        onChange={(e) => setEmergencyType(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Hospital / Facility Name</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. City General Hospital"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Transit Address</label>
                    <input
                      type="text"
                      required
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      placeholder="Street, City, Area"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-600/25"
                  >
                    {requestLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Submit Request"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-150">Blood Request Dispatched!</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      AI systems geocoded compatible donors. Broadcast complete.
                    </p>
                  </div>

                  {recommendedDonors.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity size={14} className="text-rose-500" />
                        AI Recommender Matches ({recommendedDonors.length})
                      </p>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {recommendedDonors.map((donor, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-200">{donor.name}</p>
                              <p className="text-[10px] text-slate-500 mt-1">📍 {donor.distance_km} km away ({donor.travel_time_mins} mins transit)</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-rose-455 text-sm">{Math.round(donor.overall_score)}%</p>
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Match Score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-slate-500 text-center leading-normal">
                    To track real-time dispatches, geocoded map routes, or donor dispatches, please register a Patient portal account.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={resetRequestForm}
                      className="flex-1 py-3 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-350 hover:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      New Request
                    </button>
                    <button
                      onClick={() => {
                        setIsRequestOpen(false);
                        navigate("/login?mode=register");
                      }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                    >
                      Register Portal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: SOS CHOICE ================= */}
      <AnimatePresence>
        {isSosChoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-red-950/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsSosChoiceOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 animate-pulse">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider">SOS Emergency Link</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Establish a real-time connection with target local storage pools. Choose your diagnostic dispatch role.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsSosChoiceOpen(false);
                    resetRequestForm();
                    setIsRequestOpen(true);
                  }}
                  className="w-full p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-lg shadow-rose-600/10 border border-rose-500"
                >
                  <span className="font-extrabold text-sm flex items-center gap-2">
                    <Droplet size={16} className="fill-white text-white" />
                    I Need Blood (Request SOS)
                  </span>
                  <span className="text-[9px] text-rose-200">Submit immediate broadcast to matching donor pools</span>
                </button>

                <button
                  onClick={() => {
                    setIsSosChoiceOpen(false);
                    resetDonateForm();
                    setIsDonateOpen(true);
                  }}
                  className="w-full p-4 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span className="font-extrabold text-sm flex items-center gap-2 text-emerald-450">
                    <Heart size={16} className="fill-emerald-500 text-emerald-500" />
                    I Want to Donate (Quick Give)
                  </span>
                  <span className="text-[9px] text-slate-500">Check diagnostics values and register availability</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
