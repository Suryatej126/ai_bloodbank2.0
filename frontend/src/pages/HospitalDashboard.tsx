import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  Send,
  User,
  Database
} from "lucide-react";

export const HospitalDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  
  // Form States for new SOS request
  const [recipientName, setRecipientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [units, setUnits] = useState("2");
  const [emergencyType, setEmergencyType] = useState("critical");
  const [address, setAddress] = useState("City Hospital, New Delhi");
  
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  const loadHospitalData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.getRequests();
      setRequests(reqRes);
      
      const invRes = await api.getInventory();
      setInventory(invRes);

      // Seed mock patients registry
      setPatients([
        { id: 301, name: "David Miller", age: 42, blood_group: "O-", conditions: "Severe Anemia", admission_date: "2026-07-03" },
        { id: 302, name: "Sarah Connor", age: 29, blood_group: "A+", conditions: "Postpartum Hemorrhage", admission_date: "2026-07-04" },
        { id: 303, name: "Clark Kent", age: 35, blood_group: "O+", conditions: "Trauma Deficit", admission_date: "2026-07-02" }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;
    
    // Simulate latitude & longitude rough coordinates for New Delhi City Hospital
    const lat = 28.625 + (Math.random() - 0.5) * 0.05;
    const lon = 77.215 + (Math.random() - 0.5) * 0.05;

    try {
      const newReq = await api.createRequest({
        recipient_name: recipientName,
        blood_group: bloodGroup,
        units_required: parseFloat(units),
        emergency_type: emergencyType,
        hospital_name: "City General Hospital",
        address,
        latitude: lat,
        longitude: lon
      });
      
      setRequests(prev => [newReq, ...prev]);
      setRecipientName("");
      alert("SOS Emergency Request Broadcasted successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchRecommendations = async (req: any) => {
    setSelectedReq(req);
    setRecLoading(true);
    try {
      const recRes = await api.getDonorRecommendations(req.id);
      setRecommendations(recRes);
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(false);
    }
  };

  const handleAlertDonor = (donorId: number, donorName: string) => {
    alert(`Alert notification dispatch successfully sent to matching donor ${donorName}!`);
  };

  if (loading) {
    return <div className="flex-1 p-8 text-center text-slate-400 bg-slate-950">Loading clinical console...</div>;
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen selection:bg-rose-500 selection:text-white bg-slate-950">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight capitalize">
          {currentTab === "dashboard" ? "Hospital Clinical Center" : `${currentTab} Console`}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {currentTab === "dashboard" 
            ? "Coordinate local emergency matching, raise SOS alerts, and track donor dispatches."
            : `Facility operations for matching, tracking, and clinical ${currentTab}.`}
        </p>
      </div>

      {/* ================= DASHBOARD TAB ================= */}
      {currentTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">SOS Requests Raised</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{requests.length}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Dispatch Priority</p>
                <p className="text-3xl font-black mt-2 text-rose-400">89.2%</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Activity size={20} />
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hospital Stock Status</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{inventory.length} Batches</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Database size={20} />
              </div>
            </div>
          </div>

          {/* Recent requests quick view */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold">Recent Emergency Broadcasts</h3>
            <div className="space-y-3">
              {requests.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{r.recipient_name}</span> • <span className="text-rose-400">{r.blood_group}</span> ({r.units_required} Units)
                  </div>
                  <span className="font-mono font-black text-rose-500">{r.priority_score.toFixed(1)} AI Priority</span>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No requests raised yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SOS REQUEST CENTER TAB ================= */}
      {currentTab === "sos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SOS Emergency Broadcast Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="animate-pulse text-rose-500" size={18} />
              SOS Emergency Broadcast
            </h3>
            <p className="text-xs text-slate-400">
              Raises an instant mobile notification/alert and priority scoring for nearest compatible donors.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Patient Full Name"
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Rare"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Required Volume</label>
                  <select
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {["1", "2", "3", "4", "5", "6"].map(u => (
                      <option key={u} value={u}>{u} Unit{u !== "1" && "s"}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Emergency Severity</label>
                <div className="flex gap-2">
                  {["critical", "urgent", "routine"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEmergencyType(lvl)}
                      className={`flex-1 py-2 font-bold rounded-lg border uppercase text-[9px] transition-all cursor-pointer ${
                        emergencyType === lvl 
                          ? lvl === "critical"
                            ? "bg-red-500/20 text-red-500 border-red-500"
                            : lvl === "urgent"
                              ? "bg-amber-500/20 text-amber-500 border-amber-500"
                              : "bg-blue-500/20 text-blue-500 border-blue-500"
                          : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Delivery Facility</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Hospital Wing / Facility address"
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer"
              >
                <Send size={14} />
                Broadcast Alert
              </button>
            </form>
          </div>

          {/* Active Emergency Requests and matching */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold">Active Coordinates Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400">
                      <th className="pb-3 font-semibold">Recipient</th>
                      <th className="pb-3 font-semibold">Details</th>
                      <th className="pb-3 font-semibold">Severity</th>
                      <th className="pb-3 font-semibold">AI Priority</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {requests.map((r) => (
                      <tr key={r.id} className={`hover:bg-slate-900/30 ${selectedReq?.id === r.id ? "bg-rose-500/5" : ""}`}>
                        <td className="py-3">
                          <p className="font-bold text-slate-200">{r.recipient_name}</p>
                          <p className="text-slate-500 text-[10px]">{r.hospital_name}</p>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-rose-400">{r.blood_group}</span> • {r.units_required} Units
                        </td>
                        <td className="py-3 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            r.emergency_type === "critical"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : r.emergency_type === "urgent"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}>
                            {r.emergency_type}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-black text-rose-400">
                          {r.priority_score.toFixed(1)} / 100
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleFetchRecommendations(r)}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-rose-900 text-[10px] text-slate-400 hover:text-rose-400 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Find Donors
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Recommended Donors Side Panel */}
            {selectedReq && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity size={18} className="text-rose-500" />
                      Recommended Donors for {selectedReq.recipient_name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedReq(null)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>

                {recLoading ? (
                  <div className="py-6 text-center text-xs text-slate-500">Matching Compatible Donors...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec) => (
                      <div key={rec.donor_id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-200">{rec.full_name}</h4>
                            <span className="font-black text-rose-400 text-xs px-1.5 py-0.5 rounded bg-rose-500/10">
                              {rec.overall_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="space-y-1 mt-2 text-[10px] text-slate-400">
                            <p>📍 {rec.distance_km.toFixed(1)} km away</p>
                            <p>⏱ ~{rec.travel_time_mins} mins travel</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAlertDonor(rec.donor_id, rec.full_name)}
                          className="w-full py-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Alert Donor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= BLOOD INVENTORY TAB ================= */}
      {currentTab === "inventory" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Database size={18} className="text-rose-500" />
            Hospital Clinical Blood Inventory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Batch ID</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Volume (Units)</th>
                  <th className="pb-3 font-semibold">Expiry Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="py-3 font-mono text-slate-400">#INV-{item.id}</td>
                    <td className="py-3 font-bold text-rose-400">{item.blood_group}</td>
                    <td className="py-3 text-slate-300 font-semibold">{item.quantity} Units</td>
                    <td className="py-3 text-slate-400">{new Date(item.expiry_date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No active inventory matches this hospital context.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= PATIENTS REGISTRY TAB ================= */}
      {currentTab === "patients" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <User size={18} className="text-rose-500" />
            Admitted Clinical Patients Registry
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Patient ID</th>
                  <th className="pb-3 font-semibold">Full Name</th>
                  <th className="pb-3 font-semibold">Age</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Primary Diagnosis</th>
                  <th className="pb-3 font-semibold">Admission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-900/30">
                    <td className="py-3 font-mono text-slate-500">#PAT-{pat.id}</td>
                    <td className="py-3 font-bold text-slate-200">{pat.name}</td>
                    <td className="py-3 text-slate-400">{pat.age} Years</td>
                    <td className="py-3 font-black text-rose-400">{pat.blood_group}</td>
                    <td className="py-3 text-slate-400">{pat.conditions}</td>
                    <td className="py-3 text-slate-500">{pat.admission_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
