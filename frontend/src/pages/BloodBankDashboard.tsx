import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  Bell
} from "lucide-react";

export const BloodBankDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ stock: {}, batches: {}, expiring_soon: [] });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
      
      // Seed some pending donation appointments
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
      loadBloodBankData(); // Reload
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
      loadBloodBankData(); // Reload inventory
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

  // IoT Temperature alert logic check
  const systemTemp = parseFloat(temperature);
  const isTempCritical = systemTemp < 2.0 || systemTemp > 6.0;

  if (loading) {
    return <div className="flex-1 p-8 text-center text-slate-400 bg-slate-950">Loading storage panel...</div>;
  }

  const totalStock = Object.values(summary.stock).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen selection:bg-rose-500 selection:text-white bg-slate-950">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {currentTab === "dashboard" ? "Depot & Storage Control" : `${currentTab} Console`}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === "dashboard" 
              ? "IoT telemetry temperature monitoring, unit check-ins, and inventory management."
              : `Storage facility operations for inventory ${currentTab}.`}
          </p>
        </div>
      </div>

      {/* ================= DASHBOARD TAB ================= */}
      {currentTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Depot Stock</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{totalStock} Units</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Database size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Storage Temperature</p>
                <p className={`text-3xl font-black mt-2 ${isTempCritical ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                  {temperature}°C
                </p>
              </div>
              <div className={`p-3.5 rounded-xl ${isTempCritical ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                <Thermometer size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Appointments Scheduled</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{appointments.length}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <CalendarCheck size={20} />
              </div>
            </div>
          </div>

          {/* IoT Controller Sim slider */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={16} className="text-rose-500" />
                  IoT Storage Chamber Controller (Simulated telemetry)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Slide to adjust refrigeration levels. Warning alerts trigger if levels exceed 2°C - 6°C threshold.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="font-mono text-sm text-slate-300 font-bold">{temperature}°C</span>
            </div>
            {isTempCritical && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold animate-pulse flex items-center gap-2">
                <AlertCircle size={14} /> CRITICAL STORAGE TEMPERATURE DISCREPANCY DETECTED! ADJUST REFRIGERATION.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MANAGE INVENTORY TAB ================= */}
      {currentTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Stock Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
              <PlusCircle size={18} />
              Check-in Blood Unit
            </h3>
            <form onSubmit={handleAddStock} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-rose-600"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Quantity (Units)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                Register & Stock
              </button>
            </form>
          </div>

           {/* Active Inventory Table / Cards */}
          {(() => {
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
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Database size={18} className="text-rose-500" />
                    Active Inventory Batches
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Grouped by blood type. Sorted in First-In-First-Out (FIFO) sequence (earliest expiry first). Click a card to expand details.
                  </p>
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
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                              <span className="text-base font-black text-rose-500">{bg}</span>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Available</p>
                              <p className="text-sm font-black text-slate-200">{totalQty} Unit{totalQty > 1 ? "s" : ""} <span className="text-[10px] font-normal text-slate-400">({batches.length} unit{batches.length > 1 ? "s" : ""})</span></p>
                            </div>
                          </div>

                          {/* Earliest Expiry Info */}
                          <div className="flex items-center gap-4">
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Earliest Expiry</p>
                              <p className={`text-xs font-black ${earliestStatusColor}`}>
                                {earliestDaysLeft <= 0 ? "Expired" : `${earliestDaysLeft} days left`}
                              </p>
                              <div className="w-20 h-1 bg-slate-950 border border-slate-900 rounded-full overflow-hidden mt-1 ml-0 sm:ml-auto">
                                <div 
                                  className={`h-full ${earliestDaysLeft < 5 ? "bg-red-500" : earliestDaysLeft < 15 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${earliestPct}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Batches Detail Table */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-900/60 bg-slate-950/20 animate-in slide-in-from-top-2 duration-150">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                                    <th className="pb-2 font-bold text-[9px]">Unit ID</th>
                                    <th className="pb-2 font-bold text-[9px]">Volume</th>
                                    <th className="pb-2 font-bold text-[9px]">Donation Date</th>
                                    <th className="pb-2 font-bold text-[9px]">Expiry Date</th>
                                    <th className="pb-2 font-bold text-[9px]">Temp</th>
                                    <th className="pb-2 font-bold text-[9px]">Status</th>
                                    <th className="pb-2 font-bold text-[9px] text-right">Actions</th>
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
                                        <td className="py-2.5 font-mono text-slate-400 font-bold">#INV-{item.displayId}</td>
                                        <td className="py-2.5 text-slate-300 font-extrabold">{item.quantity} Unit</td>
                                        <td className="py-2.5 text-slate-400">{donationDate}</td>
                                        <td className="py-2.5 text-slate-400">
                                          <div>{new Date(item.expiry_date).toLocaleDateString()}</div>
                                          <div className="mt-1 space-y-1">
                                            <div className="w-20 h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                                              <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <div className={`text-[8px] font-bold ${textColor}`}>
                                              {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-2.5 font-mono text-slate-400">
                                          {typeof item.storage_temp === "number" ? item.storage_temp.toFixed(1) : item.storage_temp}°C
                                        </td>
                                        <td className="py-2.5">
                                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {item.status}
                                          </span>
                                        </td>
                                        <td className="py-2.5 text-right">
                                          <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                            title="Discard unit"
                                          >
                                            <Trash2 size={13} />
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
                      No active inventory registered.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= COLLECTION CENTER TAB ================= */}
      {currentTab === "collection" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CalendarCheck size={18} className="text-rose-500" />
            Incoming Donation Appointments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Appointment ID</th>
                  <th className="pb-3 font-semibold">Donor Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-900/30">
                    <td className="py-3 font-mono text-slate-500">#APP-{appt.id}</td>
                    <td className="py-3 font-bold text-slate-200">{appt.donor_name}</td>
                    <td className="py-3 text-slate-400">{appt.email}</td>
                    <td className="py-3 font-black text-rose-400">{appt.blood_group}</td>
                    <td className="py-3 text-slate-400">{new Date(appt.appointment_date).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleCompleteCheckin(appt.id, appt.donor_name)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Check-in & Checkout
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">No scheduled donation appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= PATIENT REQUESTS TAB ================= */}
      {currentTab === "requests" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bell size={18} className="text-rose-500 animate-pulse" />
            Patient Blood Requests (Sent to us)
          </h3>
          <p className="text-xs text-slate-400">
            Below are blood requests sent specifically to your blood bank facility by patients.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
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
                        {r.priority_score?.toFixed(1) ?? "50.0"} / 100
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
                    <td colSpan={8} className="py-6 text-center text-slate-500">No incoming blood requests from patients at this time.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
