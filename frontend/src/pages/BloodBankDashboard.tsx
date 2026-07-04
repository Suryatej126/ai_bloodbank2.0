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
  Activity
} from "lucide-react";

export const BloodBankDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

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
      await api.addInventory({
        blood_group: bloodGroup,
        quantity: parseFloat(quantity),
        expiry_date: expiry,
        storage_temp: parseFloat(temperature),
        status: "available"
      });
      
      alert("Blood unit registered and stocked successfully!");
      loadBloodBankData(); // Reload
      setQuantity("1");
    } catch (err) {
      console.error(err);
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

          {/* Active Inventory Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold">Active Inventory Batches</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400">
                    <th className="pb-3 font-semibold">Batch ID</th>
                    <th className="pb-3 font-semibold">Blood Group</th>
                    <th className="pb-3 font-semibold">Volume</th>
                    <th className="pb-3 font-semibold">Expiry Date</th>
                    <th className="pb-3 font-semibold">Temp Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-mono text-slate-500">#INV-{item.id}</td>
                      <td className="py-3 font-bold text-rose-400">{item.blood_group}</td>
                      <td className="py-3 text-slate-300 font-semibold">{item.quantity} Units</td>
                      <td className="py-3 text-slate-400">{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-slate-400">{item.storage_temp}°C</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Discard batch"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">No active inventory registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
};
