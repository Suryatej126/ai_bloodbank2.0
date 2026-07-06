import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, HeartHandshake, Brain, Clock, MapPin, ChevronRight, Award, Play, Droplet, Heart, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import { api } from "../services/api";

let hasPlayedSessionIntro = false;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>("O-");
  const [showIntro, setShowIntro] = useState(!hasPlayedSessionIntro);
  const [isMuted, setIsMuted] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");

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

  if (showIntro) {
    return (
      <div className={`fixed inset-0 z-50 bg-slate-950 select-none overflow-hidden ${fadeClass}`}>
        {/* Full-Screen Video (stretches to fill viewport) */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleSkipIntro}
        >
          <source src="/intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay controls inside the video container at the bottom */}
        <div className="absolute inset-x-0 bottom-10 px-8 md:px-16 flex items-center justify-between z-10">
          {/* Glassy Mute/Unmute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <>
                <span className="text-sm">🔇</span> Unmute Sound
              </>
            ) : (
              <>
                <span className="text-sm">🔊</span> Mute Sound
              </>
            )}
          </button>

          {/* Glassy Skip Intro button */}
          <button
            onClick={handleSkipIntro}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl backdrop-blur-md bg-rose-600/40 hover:bg-rose-600/60 border border-rose-500/30 text-xs font-black text-white shadow-xl shadow-rose-600/10 hover:shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Skip Onboarding
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 relative flex-shrink-0 animate-pulse" style={{ filter: "drop-shadow(0px 2px 4px rgba(153, 27, 27, 0.3))" }}>
            <div 
              className="w-full h-full"
              style={{ 
                borderRadius: "0% 100% 100% 100%", 
                background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #dc2626 40%, #991b1b 100%)",
                boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), 2px 4px 6px rgba(153, 27, 27, 0.2)",
                transform: "rotate(45deg)"
              }}
            >
              <div className="absolute w-2.5 h-3 bg-white/70 rounded-full" style={{ top: "15%", left: "15%", transform: "rotate(-45deg)" }}></div>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 leading-none">
              LIFE CARE
            </h1>
            <p className="text-[10px] text-rose-500 uppercase tracking-widest font-semibold mt-1">
              ai smart blood bank
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSosChoiceOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <AlertCircle size={14} />
            SOS Emergency
          </button>
          <button 
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/login?mode=register")}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <Brain size={14} />
            AI-Driven Medical Innovation
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            The Digital Blood Bank, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-orange-400">
              Powered by AI.
            </span>
          </h2>
          
          <p className="text-slate-400 text-base max-w-lg leading-relaxed">
            Eliminating shortages, prioritizing critical emergencies, and mapping compatible donors in real-time. Join the smart network saving lives through intelligent automation.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => {
                resetDonateForm();
                setIsDonateOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 duration-200"
            >
              <Heart size={18} className="fill-white" />
              Quick Donate Blood
            </button>
            <button 
              onClick={() => {
                resetRequestForm();
                setIsRequestOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 border border-slate-800 bg-slate-900/40 hover:bg-slate-900 rounded-2xl font-bold text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 duration-200"
            >
              <Droplet size={18} className="text-rose-500" />
              Request Blood
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900">
            <div>
              <p className="text-2xl font-black text-rose-400">99.4%</p>
              <p className="text-xs text-slate-500 font-medium">Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">&lt; 4 Min</p>
              <p className="text-xs text-slate-500 font-medium">SOS Dispatch Time</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">8,500+</p>
              <p className="text-xs text-slate-500 font-medium">Lives Reached</p>
            </div>
          </div>
        </div>

        {/* Interactive Compatibility Chart Widget */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-right-5 duration-300" id="compatibility">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl group-hover:bg-rose-600/20 transition-all duration-300"></div>
          
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2.5">
              <Activity size={20} className="text-rose-500 animate-pulse" />
              Smart Compatibility Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a donor blood type to see all compatible recipients it can support in real-time.
            </p>
          </div>

          {/* Grid of donor keys */}
          <div className="grid grid-cols-4 gap-2.5">
            {Object.keys(compatibilities).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`py-3 font-extrabold text-sm rounded-xl transition-all cursor-pointer ${
                  selectedGroup === group 
                    ? "bg-rose-600 text-white scale-105 shadow-md shadow-rose-600/20 border border-rose-500" 
                    : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Compatibility output visual */}
          {selectedGroup && (
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Donor Group <span className="underline">{selectedGroup}</span> can give to:
              </p>
              <div className="flex flex-wrap gap-2">
                {compatibilities[selectedGroup].map((recipient) => (
                  <span 
                    key={recipient} 
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-in zoom-in-95 duration-100"
                  >
                    {recipient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility note */}
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Note: Blood bank matching engines check compatibility and geographical transit times to maximize the success of emergency operations.
          </p>
        </div>
      </main>
      {/* Feature section */}
      <section className="bg-slate-950/80 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Brain size={20} />
            </div>
            <h4 className="font-bold text-sm">Smart Recommendation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">AI ranks donors by distance, safety eligibility parameters, and compatibility scores.</p>
          </div>
          
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-sm">Shortage Regressor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Time-series forecasting models train on seasonality logs to predict stock deficits.</p>
          </div>
          
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <MapPin size={20} />
            </div>
            <h4 className="font-bold text-sm">Live Routing Maps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Integrates real-time tracking, heatmap density, and traffic-adjusted travel ranges.</p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Award size={20} />
            </div>
            <h4 className="font-bold text-sm">Gamification Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Donor profiles unlock digital achievement badges, levels, and certificates.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 bg-slate-950/40">
        &copy; {new Date().getFullYear()} AI Powered Digital Blood Bank. Designed for Final Year B.Tech Academic Showcase.
      </footer>

      {/* ================= QUICK DONATE MODAL ================= */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsDonateOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                <Heart className="fill-rose-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Quick Donate Blood</h3>
                <p className="text-xs text-slate-400">Register as a simulated donor and check eligibility.</p>
              </div>
            </div>

            {!donateResult ? (
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={donateName}
                    onChange={(e) => setDonateName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                    <select
                      value={donateBloodGroup}
                      onChange={(e) => setDonateBloodGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      {Object.keys(compatibilities).map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={donateAge}
                      onChange={(e) => setDonateAge(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={donateWeight}
                      onChange={(e) => setDonateWeight(e.target.value)}
                      placeholder="e.g. 68"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hb Level</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="1"
                      value={donateHemoglobin}
                      onChange={(e) => setDonateHemoglobin(e.target.value)}
                      placeholder="e.g. 13.5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 leading-none uppercase">Last Donated</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={donateLastDonation}
                      onChange={(e) => setDonateLastDonation(e.target.value)}
                      placeholder="Months ago"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <input
                    type="checkbox"
                    id="conditions"
                    checked={donateConditions}
                    onChange={(e) => setDonateConditions(e.target.checked)}
                    className="mt-1 accent-rose-600 rounded"
                  />
                  <label htmlFor="conditions" className="text-xs text-slate-400 leading-normal select-none">
                    I have pre-existing medical conditions (e.g. hypertension, diabetes, recent surgeries, chronic diseases)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={donateLoading}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {donateLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing Health Profile...
                    </>
                  ) : (
                    "Register & Check Eligibility"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className={`p-5 rounded-2xl border text-center ${
                  donateResult.is_eligible 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-current/10 mb-3">
                    {donateResult.is_eligible ? (
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={28} className="text-red-400" />
                    )}
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-wide">
                    {donateResult.is_eligible ? "Safe to Donate" : "Temporarily Deferred"}
                  </h4>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {donateResult.reason}
                  </p>
                  {donateResult.is_eligible && (
                    <div className="mt-2 text-xs text-slate-400">
                      AI Health Score: <span className="font-bold text-emerald-400">{donateResult.score}%</span>
                    </div>
                  )}
                </div>

                {donateResult.is_eligible && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Your Blood Group Compatibilities:</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      As an <span className="font-bold text-slate-200">{donateBloodGroup}</span> donor, your blood can help recipients with:{" "}
                      <span className="font-bold text-emerald-400">{compatibilities[donateBloodGroup].join(", ")}</span>.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-xs text-slate-400 text-center">
                  {donateResult.is_eligible ? (
                    <p>
                      🎉 Mock Donor registration successful for <strong>{donateName}</strong>! To claim achievement badges and schedule real donation slots, please register a complete account.
                    </p>
                  ) : (
                    <p>
                      Donating blood is subject to strict safety regulations. If you feel this was a mistake or your indicators have improved, you can recheck at any time.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetDonateForm();
                    }}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-slate-300 hover:text-slate-100 font-bold transition-all cursor-pointer"
                  >
                    Reset Form
                  </button>
                  <button
                    onClick={() => {
                      setIsDonateOpen(false);
                      if (donateResult.is_eligible) {
                        navigate("/login?mode=register");
                      }
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl text-white font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    {donateResult.is_eligible ? "Sign Up As Donor" : "Close Window"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= REQUEST BLOOD MODAL ================= */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsRequestOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                <Droplet className="fill-rose-500 text-rose-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Quick Request Blood</h3>
                <p className="text-xs text-slate-400">Broadcast a simulated emergency blood request immediately.</p>
              </div>
            </div>

            {!requestResult ? (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Patient's name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                    <select
                      value={requestBloodGroup}
                      onChange={(e) => setRequestBloodGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      {Object.keys(compatibilities).map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units (bags)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={unitsRequired}
                      onChange={(e) => setUnitsRequired(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency</label>
                    <select
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Compatibility Explorer (embedded directly under blood group select) */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1.5 flex items-center gap-1.5">
                    <Activity size={12} />
                    Compatibility Explorer for {requestBloodGroup} Recipient
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Invert compatibilities lookup: which donors can donate to recipient's group */}
                    {Object.keys(compatibilities).filter(donorBg => compatibilities[donorBg].includes(requestBloodGroup)).map((donorBg) => (
                      <span
                        key={donorBg}
                        className="px-2 py-0.5 text-[10px] font-black rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {donorBg}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 leading-normal">
                    {requestBloodGroup === "O-" ? (
                      "Universal Donor group needed. O- recipients can ONLY receive O- blood."
                    ) : requestBloodGroup === "AB+" ? (
                      "Universal Recipient group. AB+ recipients can receive blood from ALL donor groups."
                    ) : (
                      `The matching engine will filter and notify compatible local donors (${Object.keys(compatibilities).filter(donorBg => compatibilities[donorBg].includes(requestBloodGroup)).join(", ")}) based on physical proximity.`
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. City Hospital"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital Address</label>
                    <input
                      type="text"
                      required
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      placeholder="e.g. Kakinada, AP"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={requestLoading}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {requestLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      AI Matcher Ranking Donors...
                    </>
                  ) : (
                    "Broadcast Emergency SOS Request"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl border text-center bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500/20 mb-3 animate-pulse">
                    <Activity size={28} className="text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-wide">
                    SOS Request Broadcasted!
                  </h4>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    AI priority score computed: <span className="font-bold text-rose-400">{requestResult.priority_score}%</span>. SMS stubs and push alerts have been sent to eligible matching donors.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Donor Recommendations:</h5>
                  <div className="space-y-2">
                    {recommendedDonors.map((donor, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            {donor.full_name}
                            <span className="px-1.5 py-0.2 bg-rose-500/15 text-rose-400 border border-rose-500/10 rounded font-black text-[10px]">{donor.blood_group}</span>
                          </div>
                          <div className="text-slate-500 text-[10px] mt-1">
                            📍 {donor.distance_km} km away ({donor.travel_time_mins} mins transit)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-rose-400 text-sm">{Math.round(donor.overall_score)}%</div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Match Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  To view live maps routing, track donor acceptances, or cancel request, please register a Patient account.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetRequestForm();
                    }}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-slate-300 hover:text-slate-100 font-bold transition-all cursor-pointer"
                  >
                    New Request
                  </button>
                  <button
                    onClick={() => {
                      setIsRequestOpen(false);
                      navigate("/login?mode=register");
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl text-white font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    Register as Patient
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SOS CHOICE MODAL ================= */}
      {isSosChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-red-900/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsSosChoiceOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 animate-pulse">
                <AlertCircle size={32} className="text-red-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">SOS Emergency Portal</h3>
              <p className="text-xs text-slate-400 mt-2">
                Connect with the AI smart blood network instantly. Choose your emergency status.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSosChoiceOpen(false);
                  resetRequestForm();
                  setIsRequestOpen(true);
                }}
                className="w-full p-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-lg shadow-rose-600/10 hover:shadow-rose-500/20 hover:scale-102 border border-rose-500"
              >
                <span className="font-extrabold text-base flex items-center gap-2">
                  <Droplet size={18} className="fill-white text-white" />
                  I Need Blood (Request SOS)
                </span>
                <span className="text-[10px] text-rose-200 font-medium">Broadcast urgent request to nearby matching donors</span>
              </button>

              <button
                onClick={() => {
                  setIsSosChoiceOpen(false);
                  resetDonateForm();
                  setIsDonateOpen(true);
                }}
                className="w-full p-5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:scale-102 hover:border-emerald-500/40"
              >
                <span className="font-extrabold text-base flex items-center gap-2 text-emerald-400">
                  <Heart size={18} className="fill-emerald-500 text-emerald-500" />
                  I Want to Donate (Quick Give)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Register as available donor & check eligibility status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
