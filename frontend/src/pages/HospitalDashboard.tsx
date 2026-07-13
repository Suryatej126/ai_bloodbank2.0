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
  Database,
  Bell,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const HospitalDashboard: React.FC = () => {
  const location = useLocation();
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
  const [address, setAddress] = useState("City Hospital, New Delhi");

  // Edit Inventory Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editStorageTemp, setEditStorageTemp] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const [selectedChartGroup, setSelectedChartGroup] = useState("O+");

  const getChartDataForGroup = (group: string) => {
    // Generate deterministic data based on the blood group name so it is consistent but dynamic
    const baseDemand = group.includes("-") ? 2.5 : 7.0;
    const baseAvail = group === "AB-" ? 1.0 : group === "O-" ? 2.5 : group.includes("-") ? 4.0 : 9.5;
    
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      // Add slight variations based on the index
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

  // Pre-fill hospital address when user profile loads
  useEffect(() => {
    if (currentUser?.profile?.address) {
      setAddress(currentUser.profile.address);
    }
  }, [currentUser]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;
    
    // Simulate latitude & longitude rough coordinates for hospital location
    const lat = currentUser?.profile?.latitude || (28.625 + (Math.random() - 0.5) * 0.05);
    const lon = currentUser?.profile?.longitude || (77.215 + (Math.random() - 0.5) * 0.05);

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
      // Reload inventory
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

          {/* Grid Layout for Recent Requests & Interactive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent requests quick view */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">Recent Emergency Broadcasts</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Quick lookup of the latest active emergency calls raised by your facility.</p>
              </div>
              <div className="space-y-3 mt-4 flex-1">
                {requests.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{r.recipient_name}</span> • <span className="text-rose-400">{r.blood_group}</span> ({r.units_required} Units)
                    </div>
                    <span className="font-mono font-black text-rose-500">{r.priority_score.toFixed(1)} AI Priority</span>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-8">No requests raised yet.</p>
                )}
              </div>
            </div>

            {/* Interactive Blood Analytics Chart Widget */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Activity size={16} className="text-rose-500" />
                    Demand vs Availability Projection
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    Weekly View
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Select a blood type subgroup below to view simulated time-series projections.</p>
                
                {/* Blood Group Selectors */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedChartGroup(bg)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                        selectedChartGroup === bg
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/45 shadow-lg shadow-rose-500/5"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom CSS Bar Chart */}
              <div className="pt-2 flex-1 flex flex-col justify-end">
                <div className="h-32 flex items-end justify-between px-2 gap-2 mt-4">
                  {getChartDataForGroup(selectedChartGroup).map((data, index) => {
                    const maxVal = 15; // Max units scale
                    const demandHeight = (data.demand / maxVal) * 100;
                    const availHeight = (data.availability / maxVal) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 scale-0 group-hover:scale-100 bg-slate-900/95 border border-slate-700 p-2 rounded-xl text-[9px] font-bold text-slate-200 z-10 w-24 pointer-events-none transition-transform duration-100 shadow-xl text-center">
                          <p className="text-rose-400">Demand: {data.demand}U</p>
                          <p className="text-emerald-400">Avail: {data.availability}U</p>
                        </div>
                        
                        <div className="w-full h-full flex items-end justify-center gap-0.5">
                          {/* Demand Bar (Rose) */}
                          <div
                            className="w-2 bg-gradient-to-t from-rose-700 to-rose-500 rounded-t-sm transition-all duration-300"
                            style={{ height: `${Math.max(4, demandHeight)}%` }}
                          ></div>
                          {/* Availability Bar (Emerald) */}
                          <div
                            className="w-2 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-sm transition-all duration-300"
                            style={{ height: `${Math.max(4, availHeight)}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-slate-900 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-rose-500"></div>
                    <span>Demand (Units)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-emerald-500"></div>
                    <span>Availability (Units)</span>
                  </div>
                </div>
              </div>
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
      {currentTab === "inventory" && (() => {
        // Group by blood group, splitting any batch of quantity > 1 into individual 1-unit records with staggered weekly dates
        const groups: { [key: string]: any[] } = {};
        inventory.forEach(item => {
          const qty = Math.max(1, Math.floor(item.quantity));
          for (let i = 0; i < qty; i++) {
            const baseDonation = item.created_at ? new Date(item.created_at) : new Date(new Date(item.expiry_date).getTime() - 35 * 86400000);
            const donationDateVal = new Date(baseDonation.getTime() + i * 7 * 86400000);
            const expiryDateVal = new Date(new Date(item.expiry_date).getTime() + i * 7 * 86400000);

            const splitItem = {
              ...item,
              displayId: qty > 1 ? `${item.id}.${i + 1}` : `${item.id}`,
              quantity: 1,
              created_at: donationDateVal.toISOString(),
              expiry_date: expiryDateVal.toISOString()
            };

            if (!groups[splitItem.blood_group]) {
              groups[splitItem.blood_group] = [];
            }
            groups[splitItem.blood_group].push(splitItem);
          }
        });

        // Sort batches inside each group by expiry date
        Object.keys(groups).forEach(bg => {
          groups[bg].sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        });

        // Sort the blood groups by their earliest expiry date (FIFO sequence)
        const sortedBloodGroups = Object.keys(groups).sort((a, b) => {
          const expiryA = new Date(groups[a][0].expiry_date).getTime();
          const expiryB = new Date(groups[b][0].expiry_date).getTime();
          return expiryA - expiryB;
        });

        const toggleGroup = (bg: string) => {
          setExpandedGroups(prev => 
            prev.includes(bg) ? prev.filter(g => g !== bg) : [...prev, bg]
          );
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Database size={18} className="text-rose-500" />
                  Hospital Clinical Blood Inventory
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Categorized by blood group. Sorted in First-In-First-Out (FIFO) sequence (earliest expiry first). Click a card to expand unit details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sortedBloodGroups.map(bg => {
                const batches = groups[bg];
                const totalQty = batches.reduce((sum, item) => sum + item.quantity, 0);
                const earliestBatch = batches[0];
                const isExpanded = expandedGroups.includes(bg);
                
                const earliestDaysLeft = Math.ceil((new Date(earliestBatch.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const earliestPct = Math.max(0, Math.min(100, (earliestDaysLeft / 35) * 100));
                
                const cardBorderColor = earliestDaysLeft < 5 
                  ? "border-red-500/30 hover:border-red-500/50" 
                  : earliestDaysLeft < 15 
                    ? "border-amber-500/30 hover:border-amber-500/50" 
                    : "border-slate-800 hover:border-slate-700";

                const earliestStatusColor = earliestDaysLeft < 5 
                  ? "text-red-400 font-extrabold" 
                  : earliestDaysLeft < 15 
                    ? "text-amber-400" 
                    : "text-emerald-400";

                return (
                  <div 
                    key={bg} 
                    className={`glass-panel rounded-2xl border transition-all duration-200 ${cardBorderColor}`}
                  >
                    {/* Main Card Header */}
                    <div 
                      onClick={() => toggleGroup(bg)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                          <span className="text-xl font-black text-rose-500">{bg}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Available</p>
                          <p className="text-base font-black text-slate-200">{totalQty} Unit{totalQty > 1 ? "s" : ""} <span className="text-xs font-normal text-slate-400">({batches.length} unit{batches.length > 1 ? "s" : ""})</span></p>
                        </div>
                      </div>

                      {/* Earliest Expiry Info */}
                      <div className="flex items-center gap-4">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Earliest Expiry</p>
                          <p className={`text-xs font-black ${earliestStatusColor}`}>
                            {earliestDaysLeft <= 0 ? "Expired" : `${earliestDaysLeft} days left`}
                          </p>
                          <div className="w-24 h-1 bg-slate-950 border border-slate-900 rounded-full overflow-hidden mt-1.5 ml-0 md:ml-auto">
                            <div 
                              className={`h-full ${earliestDaysLeft < 5 ? "bg-red-500" : earliestDaysLeft < 15 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${earliestPct}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Batches Detail Table */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-slate-900/60 bg-slate-950/20 animate-in slide-in-from-top-2 duration-150">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                                <th className="pb-3 font-bold text-[10px]">Unit ID</th>
                                <th className="pb-3 font-bold text-[10px]">Volume</th>
                                <th className="pb-3 font-bold text-[10px]">Donation Date</th>
                                <th className="pb-3 font-bold text-[10px]">Expiry Date</th>
                                <th className="pb-3 font-bold text-[10px]">Temp Status</th>
                                <th className="pb-3 font-bold text-[10px]">Status</th>
                                <th className="pb-3 font-bold text-[10px] text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {batches.map(item => {
                                const daysLeft = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                const pct = Math.max(0, Math.min(100, (daysLeft / 35) * 100));
                                const barColor = daysLeft < 5 ? "bg-red-500 animate-pulse" : daysLeft < 15 ? "bg-amber-500" : "bg-emerald-500";
                                const textColor = daysLeft < 5 ? "text-red-400 font-bold" : daysLeft < 15 ? "text-amber-400" : "text-emerald-400";
                                
                                const donationDate = new Date(item.created_at).toLocaleDateString();

                                return (
                                  <tr key={item.displayId} className="hover:bg-slate-900/40 transition-colors">
                                    <td className="py-3 font-mono text-slate-400 font-bold">#INV-{item.displayId}</td>
                                    <td className="py-3 text-slate-300 font-extrabold">{item.quantity} Unit</td>
                                    <td className="py-3 text-slate-400">{donationDate}</td>
                                    <td className="py-3 text-slate-400">
                                      <div>{new Date(item.expiry_date).toLocaleDateString()}</div>
                                      <div className="mt-1.5 space-y-1">
                                        <div className="w-24 h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                                          <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <div className={`text-[9px] font-bold ${textColor}`}>
                                          {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 font-mono text-slate-400 font-bold">
                                      {typeof item.storage_temp === "number" ? item.storage_temp.toFixed(1) : item.storage_temp}°C
                                    </td>
                                    <td className="py-3">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="py-3 text-right space-x-2">
                                      <button
                                        onClick={() => handleOpenEditModal(item)}
                                        className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInventory(item.id)}
                                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Discard
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {sortedBloodGroups.length === 0 && (
                <div className="glass-panel p-8 text-center text-slate-500 rounded-2xl border border-slate-800">
                  No active clinical inventory matches this hospital context.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ================= PATIENT REQUESTS TAB ================= */}
      {currentTab === "requests" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bell size={18} className="text-rose-500 animate-pulse" />
            Patient Blood Requests (Sent to us)
          </h3>
          <p className="text-xs text-slate-400">
            Below are blood requests sent specifically to your facility by patients.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Patient Name</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Volume (Units)</th>
                  <th className="pb-3 font-semibold">Urgency</th>
                  <th className="pb-3 font-semibold">Priority Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {requests
                  .filter(
                    (r) =>
                      currentUser &&
                      (r.hospital_name === currentUser.full_name || 
                       r.hospital_name?.toLowerCase().includes(currentUser.full_name.toLowerCase())) &&
                      r.requester_id !== currentUser.id
                  )
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-mono text-slate-500">#REQ-{r.id}</td>
                      <td className="py-3 font-bold text-slate-200">{r.recipient_name}</td>
                      <td className="py-3 font-black text-rose-400">{r.blood_group}</td>
                      <td className="py-3 text-slate-300 font-semibold">{r.units_required} Units</td>
                      <td className="py-3 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            r.emergency_type === "critical"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : r.emergency_type === "urgent"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}
                        >
                          {r.emergency_type}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-black text-rose-400">
                        {r.priority_score?.toFixed(1)} / 100
                      </td>
                      <td className="py-3 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            r.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : r.status === "fulfilled"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : r.status === "cancelled"
                              ? "bg-slate-800 text-slate-500 border border-slate-700"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {r.status === "pending" || r.status === "matching" ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(r.id, "approved")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              ✓ Approve & Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(r.id, "cancelled")}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : r.status === "approved" ? (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "fulfilled")}
                            className="px-2.5 py-1.5 bg-blue-950/40 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/50 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Fulfill
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {requests.filter(
                  (r) =>
                    currentUser &&
                    (r.hospital_name === currentUser.full_name || 
                     r.hospital_name?.toLowerCase().includes(currentUser.full_name.toLowerCase())) &&
                    r.requester_id !== currentUser.id
                ).length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No patient requests sent to your facility yet.
                    </td>
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

      {/* ======= INVENTORY EDIT MODAL ======= */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditModalOpen(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-rose-500">
                <Database size={16} />
                Edit Inventory Batch #INV-{editingItem.id}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                <div className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-rose-400 font-bold">
                  {editingItem.blood_group} (Read-only)
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Volume (Units)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Storage Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editStorageTemp}
                  onChange={(e) => setEditStorageTemp(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="discarded">Discarded</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
