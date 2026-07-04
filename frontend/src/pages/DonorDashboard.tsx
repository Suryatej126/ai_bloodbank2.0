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
  AlertTriangle
} from "lucide-react";

export const DonorDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "profile";

  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointments schedule form states
  const [selectedCenter, setSelectedCenter] = useState("Red Cross Blood Bank");
  const [appointmentDate, setAppointmentDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [scheduledAppts, setScheduledAppts] = useState<any[]>([]);

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
      
      const donRes = await api.getDonations();
      setDonations(donRes);

      const reqRes = await api.getRequests();
      setActiveRequests(reqRes);
      
      // Mock Badges
      setBadges([
        { id: 1, title: "First Gift", description: "Awarded for completing your first life-saving blood donation.", unlocked: true },
        { id: 2, title: "Bronze Hero", description: "Awarded for completing 3 blood donations.", unlocked: false },
        { id: 3, title: "Silver LifeSaver", description: "Awarded for completing 5 blood donations.", unlocked: false }
      ]);

      // Seed scheduled appts
      setScheduledAppts([
        { id: 401, center: "Red Cross Blood Bank", date: new Date(Date.now() + 86400000).toLocaleDateString(), time: "10:30 AM" }
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
    const newAppt = {
      id: Date.now(),
      center: selectedCenter,
      date: new Date(appointmentDate).toLocaleDateString(),
      time: appointmentTime
    };
    setScheduledAppts(prev => [newAppt, ...prev]);
    alert("Donation slot reserved successfully! Details sent to your email.");
  };

  if (loading) return <div className="flex-1 p-8 text-center text-slate-400 bg-slate-950">Loading donor profile...</div>;

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificates Drawer */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileCheck2 size={18} className="text-rose-500" />
              Digital Donation Certificates
            </h3>
            
            <div className="space-y-3">
              {donations.map((don) => (
                <div key={don.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">1.0 Unit Donation - Certificate ID #{don.id}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Donation Date: {new Date(don.donation_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveCert(don)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Download size={12} />
                    View Certificate
                  </button>
                </div>
              ))}
              
              {donations.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No completed donation certificates available yet.</p>
              )}
            </div>
          </div>

          {/* Gamified Achievements shelf */}
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
                    : "bg-slate-900/40 border-slate-900 text-slate-600"
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
      )}

      {/* ================= APPOINTMENTS TAB ================= */}
      {currentTab === "appointments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reservation Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
              <Calendar size={18} />
              Schedule Donation Appointment
            </h3>
            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Select Facility Center</label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                >
                  <option value="Red Cross Blood Bank">Red Cross Blood Bank</option>
                  <option value="City General Hospital Depot">City General Hospital Depot</option>
                  <option value="LifeSource Regional Depot">LifeSource Regional Depot</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
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
                    <p className="text-slate-500 mt-1">Date: {appt.date} • Time: {appt.time}</p>
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
        <div className="space-y-6">
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
                      ? "border-red-500/30 bg-red-500/5"
                      : req.emergency_type === "urgent"
                        ? "border-amber-500/25 bg-amber-500/5"
                        : "border-slate-800"
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
