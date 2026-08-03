import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { 
  Database, 
  Thermometer, 
  CalendarCheck, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle,
  FileCheck2,
  Trash2,
  Activity,
  ChevronDown,
  ChevronUp,
  Bell,
  X,
  MapPin,
  ClipboardList
} from "lucide-react";

export const BloodBankDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ stock: {}, batches: {}, expiring_soon: [] });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New stock item form state
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [quantity, setQuantity] = useState("1");
  const [expiry, setExpiry] = useState(new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0]); // 35 days standard
  const [temperature, setTemperature] = useState("4.0");

  const loadBloodBankData = async () => {
    setLoading(true);
    try {
      const me = await api.getCurrentUser();
      setCurrentUser(me);

      const reqRes = await api.getRequests();
      setRequests(reqRes);

      const summaryRes = await api.getInventorySummary();
      setSummary(summaryRes);
      
      const invRes = await api.getInventory();
      setInventory(invRes);
      
      setAppointments([
        { id: 201, donor_name: "John Doe", email: "john@bloodbank.ai", blood_group: "A+", appointment_date: new Date().toISOString(), status: "scheduled" },
        { id: 202, donor_name: "Sarah Connor", email: "sarah@bloodbank.ai", blood_group: "O-", appointment_date: new Date().toISOString(), status: "scheduled" }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBloodBankData();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !expiry) return;

    try {
      const qVal = Math.max(1, Math.floor(parseFloat(quantity)));
      const promises = [];
      for (let i = 0; i < qVal; i++) {
        promises.push(
          api.addInventory({
            blood_group: bloodGroup,
            quantity: 1.0,
            expiry_date: expiry,
            storage_temp: parseFloat(temperature),
            status: "available"
          })
        );
      }
      await Promise.all(promises);
      
      alert(`Registered ${qVal} unit(s) of ${bloodGroup} successfully!`);
      loadBloodBankData();
      setQuantity("1");
    } catch (err) {
      console.error(err);
      alert("Failed to register some blood units.");
    }
  };

  const handleCompleteCheckin = async (apptId: number, donorName: string) => {
    try {
      await api.completeDonation(apptId);
      alert(`Donation checkout complete! Digitally certified certificate generated for ${donorName}. Added 1.0 unit of blood to the active inventory.`);
      setAppointments(prev => prev.filter(a => a.id !== apptId));
      loadBloodBankData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm("Are you sure you want to discard this inventory batch?")) {
      try {
        await api.deleteInventory(itemId);
        setInventory(prev => prev.filter(i => i.id !== itemId));
        loadBloodBankData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateStatus = async (reqId: number, status: string) => {
    try {
      await api.updateRequestStatus(reqId, status);
      alert(`Request status updated to ${status}!`);
      loadBloodBankData();
    } catch (e) {
      console.error(e);
      alert("Failed to update request status.");
    }
  };

  const systemTemp = parseFloat(temperature);
  const isTempCritical = systemTemp < 2.0 || systemTemp > 6.0;
  const totalStock = Object.values(summary.stock).reduce((a: any, b: any) => a + b, 0) as number;

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-[#050814]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Storage Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#050814] selection:bg-rose-500 selection:text-white">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">
            {currentTab === "dashboard" ? "Depot & Storage Control" : `${currentTab} Console`}
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            {currentTab === "dashboard" 
              ? "Monitor blood bank storage temp logs, track incoming patient requests, and audit stocks."
              : `Operational console log for matching, tracking, and collection ${currentTab}.`}
          </p>
        </div>
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
            {/* Quick Stat summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Active Stock", val: `${totalStock} Units`, icon: Database, color: "text-rose-500" },
                { label: "Pending Requests", val: requests.filter(r => r.status === "pending").length, icon: Bell, color: "text-blue-500" },
                { label: "Depot Temperature", val: `${temperature}°C`, icon: Thermometer, color: isTempCritical ? "text-red-500 animate-pulse" : "text-emerald-500" },
                { label: "Check-in Queue", val: appointments.length, icon: CalendarCheck, color: "text-amber-500" }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-slate-900/35 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                      <p className="text-lg md:text-xl font-black mt-1 text-slate-100">{card.val}</p>
                    </div>
                    <div className={`p-2 bg-white/[0.01] border border-white/5 rounded-xl ${card.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* IoT Alert warnings if critical */}
            {isTempCritical && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} />
                <span>IoT SENSORS DETECT CRITICAL STORAGE TEMPERATURE DEVIAITON! MUST BE KEPT BETWEEN 2°C AND 6°C.</span>
              </div>
            )}

            {/* Split layout for add stock form and stock counts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add Stock Card */}
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-5 h-fit shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <PlusCircle size={14} className="text-rose-500" />
                  Register Blood Stock
                </h3>

                <form onSubmit={handleAddStock} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Volume (Units)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Sensor Temp (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Commit Stock
                  </button>
                </form>
              </div>

              {/* Stock breakdown counts */}
              <div className="lg:col-span-2 bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-350">Depot blood stocks (Groups)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(compatibilities).map((group) => {
                    const count = summary.stock[group] || 0;
                    return (
                      <div key={group} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
                        <span className="text-lg font-black text-rose-455">{group}</span>
                        <div className="mt-2.5">
                          <p className="text-[14px] font-black text-slate-200">{count} U</p>
                          <p className="text-[8px] text-slate-550 uppercase tracking-widest mt-0.5">Stored volume</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ================= PATIENT REQUESTS TAB ================= */}
        {currentTab === "requests" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Patient emergency queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Request ID</th>
                    <th className="pb-3">Recipient</th>
                    <th className="pb-3 text-center">Group</th>
                    <th className="pb-3 text-center">Units</th>
                    <th className="pb-3">Emergency Facility</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#REQ-{r.id}</td>
                      <td className="py-3.5 font-bold text-slate-200">{r.recipient_name}</td>
                      <td className="py-3.5 font-black text-rose-400 text-center">{r.blood_group}</td>
                      <td className="py-3.5 text-slate-300 font-semibold text-center">{r.units_required} U</td>
                      <td className="py-3.5 text-slate-450 truncate max-w-xs">{r.hospital_name}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                          r.status === "pending" 
                            ? "bg-rose-500/10 border-rose-500/15 text-rose-455" 
                            : "bg-emerald-500/10 border-emerald-500/15 text-emerald-450"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {r.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "approved")}
                            className="px-2.5 py-1.5 bg-emerald-650/10 hover:bg-emerald-600 text-emerald-450 hover:text-white border border-emerald-500/20 text-[10px] font-bold rounded-lg transition-all"
                          >
                            Approve Dispatch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-650">No patient requests raised.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= MANAGE INVENTORY TAB ================= */}
        {currentTab === "inventory" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Stored Supply Batches</h3>
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
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#BAT-{item.id}</td>
                      <td className="py-3.5 font-black text-rose-400 text-center">{item.blood_group}</td>
                      <td className="py-3.5 text-slate-300 font-semibold text-center">{item.quantity} U</td>
                      <td className="py-3.5 text-slate-400 font-medium">{item.storage_temp}°C</td>
                      <td className="py-3.5 text-slate-450 font-medium">{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                          item.status === "available" 
                            ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-450" 
                            : "bg-red-500/10 border-red-500/15 text-red-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          title="Discard batch"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-650">No stock batches stored.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= COLLECTION CENTER TAB ================= */}
        {currentTab === "collection" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-350 mb-5">Scheduled donation Check-ins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Appointment ID</th>
                    <th className="pb-3">Donor Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-center">Target Group</th>
                    <th className="pb-3">Appointment Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#APT-{appt.id}</td>
                      <td className="py-3.5 font-bold text-slate-200">{appt.donor_name}</td>
                      <td className="py-3.5 text-slate-450">{appt.email}</td>
                      <td className="py-3.5 font-black text-rose-400 text-center">{appt.blood_group}</td>
                      <td className="py-3.5 text-slate-400">{new Date(appt.appointment_date).toLocaleDateString()}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleCompleteCheckin(appt.id, appt.donor_name)}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-all"
                        >
                          Complete Donation
                        </button>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-655 font-medium">All check-in queues cleared.</td>
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
