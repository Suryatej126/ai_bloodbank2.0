import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Database,
  Bell,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  Calendar,
  CheckCircle
} from "lucide-react";

export const HospitalDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Form States for new SOS request
  const [recipientName, setRecipientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [units, setUnits] = useState("2");
  const [emergencyType, setEmergencyType] = useState("critical");
  const [address, setAddress] = useState("City Hospital, Kakinada");

  // Edit Inventory Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editStorageTemp, setEditStorageTemp] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [selectedChartGroup, setSelectedChartGroup] = useState("O+");

  const getChartDataForGroup = (group: string) => {
    const baseDemand = group.includes("-") ? 2.5 : 7.0;
    const baseAvail = group === "AB-" ? 1.0 : group === "O-" ? 2.5 : group.includes("-") ? 4.0 : 9.5;
    
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      const demand = Math.max(1, baseDemand + Math.sin(i) * 1.5 + (i % 2 === 0 ? 0.8 : -0.5));
      const avail = Math.max(0.5, baseAvail + Math.cos(i) * 2.0 + (i % 3 === 0 ? 1.2 : -0.8));
      return {
        day,
        demand: Math.round(demand * 10) / 10,
        availability: Math.round(avail * 10) / 10
      };
    });
  };
  
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  const loadHospitalData = async () => {
    setLoading(true);
    try {
      const userRes = await api.getCurrentUser();
      setCurrentUser(userRes);

      const reqRes = await api.getRequests();
      setRequests(reqRes);
      
      const invRes = await api.getInventory();
      setInventory(invRes);

      setPatients([
        { id: 301, name: "David Miller", age: 42, blood_group: "O-", conditions: "Severe Anemia", admission_date: "2026-08-01" },
        { id: 302, name: "Sarah Connor", age: 29, blood_group: "A+", conditions: "Trauma Deficit", admission_date: "2026-08-02" },
        { id: 303, name: "Clark Kent", age: 35, blood_group: "O+", conditions: "Acute Bleeding", admission_date: "2026-08-03" }
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

  useEffect(() => {
    if (currentUser?.profile?.address) {
      setAddress(currentUser.profile.address);
    }
  }, [currentUser]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;
    
    const lat = currentUser?.profile?.latitude || 16.9823;
    const lon = currentUser?.profile?.longitude || 82.2475;

    try {
      const newReq = await api.createRequest({
        recipient_name: recipientName,
        blood_group: bloodGroup,
        units_required: parseFloat(units),
        emergency_type: emergencyType,
        hospital_name: currentUser?.full_name || "City General Hospital",
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

  const handleUpdateStatus = async (reqId: number, status: string) => {
    try {
      await api.updateRequestStatus(reqId, status);
      alert(`Request status updated to ${status}!`);
      loadHospitalData();
    } catch (e) {
      console.error(e);
      alert("Failed to update request status.");
    }
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
    setEditExpiryDate(item.expiry_date.split("T")[0]);
    setEditStorageTemp(item.storage_temp.toString());
    setEditStatus(item.status);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.updateInventory(editingItem.id, {
        quantity: parseFloat(editQuantity),
        expiry_date: editExpiryDate,
        storage_temp: parseFloat(editStorageTemp),
        status: editStatus
      });
      alert("Inventory batch updated successfully!");
      setEditModalOpen(false);
      setEditingItem(null);
      const invRes = await api.getInventory();
      setInventory(invRes);
    } catch (err) {
      console.error(err);
      alert("Failed to update inventory.");
    }
  };

  const handleDeleteInventory = async (itemId: number) => {
    if (confirm("Are you sure you want to discard this inventory batch?")) {
      try {
        await api.deleteInventory(itemId);
        setInventory(prev => prev.filter(i => i.id !== itemId));
        alert("Inventory batch discarded.");
      } catch (err) {
        console.error(err);
        alert("Failed to delete inventory.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-[#050814]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Hospital Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#050814] selection:bg-rose-500 selection:text-white">
      
      {/* Edit Inventory Batch Modal */}
      <AnimatePresence>
        {editModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setEditModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-450 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>

              <h3 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                <Database size={16} />
                Edit Stock Batch #{editingItem.id}
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Volume (Units)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Storage Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editStorageTemp}
                      onChange={(e) => setEditStorageTemp(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Inventory Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    <option value="stored">Stored</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="wasted">Wasted</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-650 hover:bg-rose-655 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20"
                >
                  Save Batch Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">
          {currentTab === "dashboard" ? "Clinical Operations Terminal" : currentTab === "sos" ? "Emergency SOS center" : currentTab === "requests" ? "Patient Request logs" : currentTab === "inventory" ? "Blood Inventory Depot" : "Patients Registry"}
        </h2>
        <p className="text-xs text-slate-450 mt-1">
          {currentTab === "dashboard"
            ? "Coordinate critical local dispatches, monitor demand, and manage facility stocks."
            : currentTab === "sos"
            ? "Submit priority O- negative broadcasts to nearby voluntary networks."
            : currentTab === "requests"
            ? "Review patient requests and dispatch matching donor lists."
            : currentTab === "inventory"
            ? "Manage, edit, or discard stored blood supply batches."
            : "Monitor admitted patient details and compatibility configurations."}
        </p>
      </div>

      {/* ================= DASHBOARD TAB ================= */}
      <AnimatePresence mode="wait">
        {currentTab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 animate-in fade-in"
          >
            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: "Emergency SOS Broadcasts", val: requests.length, icon: AlertTriangle, color: "text-rose-500" },
                { label: "Admitted Patients", val: patients.length, icon: Users, color: "text-blue-500" },
                { label: "Stored Supply Batches", val: inventory.length, icon: Database, color: "text-emerald-500" }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-slate-900/35 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                      <p className="text-lg md:text-2xl font-black mt-1 text-slate-100">{card.val}</p>
                    </div>
                    <div className={`p-2.5 bg-white/[0.01] border border-white/5 rounded-xl ${card.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Split layout for broadcasts list and weekly analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Broadcasts panel */}
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Active broadcasts</h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Quick look of raised SOS dispatches pending matches.</p>
                </div>
                <div className="space-y-2 mt-4 flex-1">
                  {requests.slice(0, 4).map((r) => (
                    <div key={r.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{r.recipient_name}</span> • <span className="text-rose-455 font-black">{r.blood_group}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px]">{r.units_required} Units</span>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-10">No active emergency logs found.</p>
                  )}
                </div>
              </div>

              {/* Weekly Analytics forecast */}
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Demand Predictions</h3>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/15 px-2.5 py-1 rounded-lg">
                    Gemini 1.5 Forecast
                  </span>
                </div>
                
                {/* Select Group selectors */}
                <div className="flex flex-wrap gap-1">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedChartGroup(bg)}
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        selectedChartGroup === bg
                          ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/15"
                          : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-slate-500"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                {/* Inline chart columns */}
                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-2 items-end h-28 border-b border-white/5 pb-2">
                    {getChartDataForGroup(selectedChartGroup).map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                        <div className="flex gap-0.5 w-full items-end h-full">
                          {/* Demand Column */}
                          <div 
                            className="bg-rose-600/75 rounded-t-sm w-1/2" 
                            style={{ height: `${(item.demand / 10) * 100}%` }}
                            title={`Demand: ${item.demand} units`}
                          />
                          {/* Availability Column */}
                          <div 
                            className="bg-blue-650/75 rounded-t-sm w-1/2" 
                            style={{ height: `${(item.availability / 12) * 100}%` }}
                            title={`Availability: ${item.availability} units`}
                          />
                        </div>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">{item.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-600 rounded-sm" /> Demand Forecast</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-650 rounded-sm" /> Stock Available</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= EMERGENCY SOS TAB ================= */}
        {currentTab === "sos" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-6 max-w-xl mx-auto"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 flex items-center gap-2">
              <AlertTriangle className="text-rose-500 animate-pulse" size={16} />
              Trigger Live SOS Broadcast
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Patient / Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Required Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Volume (Units)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Severity</label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Transit Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/25"
              >
                Broadcast SOS Alert
              </button>
            </form>
          </motion.div>
        )}

        {/* ================= PATIENT REQUESTS TAB ================= */}
        {currentTab === "requests" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* List */}
            <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-3">Triage Emergency Queue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="pb-3">Recipient</th>
                      <th className="pb-3 text-center">Group</th>
                      <th className="pb-3 text-center">Volume</th>
                      <th className="pb-3 text-right">Priority score</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests.map((r) => (
                      <tr key={r.id} className={`hover:bg-white/[0.01] ${selectedReq?.id === r.id ? "bg-rose-500/[0.02]" : ""}`}>
                        <td className="py-3 font-bold text-slate-200">{r.recipient_name}</td>
                        <td className="py-3 font-black text-rose-400 text-center">{r.blood_group}</td>
                        <td className="py-3 text-slate-350 text-center">{r.units_required} U</td>
                        <td className="py-3 font-mono font-black text-rose-455 text-right">{r.priority_score?.toFixed(1)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleFetchRecommendations(r)}
                            className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-450 hover:text-white border border-rose-500/20 text-[10px] font-bold rounded-lg transition-all"
                          >
                            Resolve AI Matches
                          </button>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-650">No patient requests raised.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donor recommendation details */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350">AI recommendation details</h3>
              {selectedReq ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">Selected Request</p>
                    <p className="font-extrabold text-slate-200 mt-2 truncate">{selectedReq.recipient_name} ({selectedReq.blood_group})</p>
                  </div>

                  {recLoading ? (
                    <div className="py-6 text-center text-slate-500 animate-pulse font-medium">Resolving geolocated matching pools...</div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Top Compatible Donors</p>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {recommendations.map((donor) => (
                          <div key={donor.id} className="p-3 bg-slate-950 border border-white/5 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-200">{donor.name}</p>
                              <p className="text-[9px] text-slate-500 mt-1">📍 {donor.distance_km} km away ({donor.travel_time_mins} mins)</p>
                            </div>
                            <button
                              onClick={() => handleAlertDonor(donor.id, donor.name)}
                              className="px-2.5 py-1 bg-rose-600/10 text-rose-455 hover:bg-rose-650 hover:text-white border border-rose-500/20 text-[9px] font-bold rounded-md"
                            >
                              Dispatch Alert
                            </button>
                          </div>
                        ))}
                        {recommendations.length === 0 && (
                          <p className="text-[10px] text-slate-550 text-center py-4">No matching donors in geocoded radius.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-550 text-center py-10 font-medium">Select a patient request row to evaluate matching donor arrays.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= INVENTORY TAB ================= */}
        {currentTab === "inventory" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350">Facility Inventory batches</h3>
              <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-1 rounded-lg">Stored supply</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Batch ID</th>
                    <th className="pb-3 text-center">Group</th>
                    <th className="pb-3 text-center">Volume</th>
                    <th className="pb-3">Storage Temp</th>
                    <th className="pb-3">Expiry Date</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 font-mono text-slate-500">#BAT-{item.id}</td>
                      <td className="py-3 font-black text-rose-400 text-center">{item.blood_group}</td>
                      <td className="py-3 text-slate-300 font-semibold text-center">{item.quantity} U</td>
                      <td className="py-3 text-slate-400 font-medium">{item.storage_temp}°C</td>
                      <td className="py-3 text-slate-400 font-medium">{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                          item.status === "stored" 
                            ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-450" 
                            : item.status === "dispatched" 
                              ? "bg-blue-500/10 border-blue-500/15 text-blue-450" 
                              : "bg-red-500/10 border-red-500/15 text-red-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-slate-300 text-[10px] font-bold rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(item.id)}
                            className="p-1 text-slate-450 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-650">No blood stock batches stored in this facility.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= PATIENTS TAB ================= */}
        {currentTab === "patients" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Admitted Patients Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Admit ID</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Age</th>
                    <th className="pb-3 text-center">Blood Group</th>
                    <th className="pb-3">Diagnostics Condition</th>
                    <th className="pb-3 text-right">Admission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {patients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#PAT-{pat.id}</td>
                      <td className="py-3.5 font-bold text-slate-200">{pat.name}</td>
                      <td className="py-3.5 text-slate-400 font-semibold">{pat.age} Yrs</td>
                      <td className="py-3.5 font-black text-rose-400 text-center">{pat.blood_group}</td>
                      <td className="py-3.5 text-slate-400 font-medium">{pat.conditions}</td>
                      <td className="py-3.5 text-slate-550 font-mono text-right">{pat.admission_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
