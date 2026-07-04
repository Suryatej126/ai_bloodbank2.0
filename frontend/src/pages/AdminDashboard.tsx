import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import { 
  Users, 
  Building2, 
  Database, 
  Activity, 
  Settings, 
  RefreshCw, 
  UserCheck, 
  Trash2,
  FileText
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "overview";

  const [users, setUsers] = useState<any[]>([]);
  const [stockSummary, setStockSummary] = useState<any>({ stock: {}, batches: {} });
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Mock Users Seed
      setUsers([
        { id: 1, full_name: "Super Admin", email: "admin@bloodbank.ai", role: "admin", is_verified: true, phone: "+91 99999 99901" },
        { id: 2, full_name: "City General Hospital", email: "city_hospital@bloodbank.ai", role: "hospital", is_verified: true, phone: "+91 99999 99902" },
        { id: 3, full_name: "Red Cross Blood Bank", email: "redcross@bloodbank.ai", role: "bloodbank", is_verified: false, phone: "+91 99999 99904" },
        { id: 4, full_name: "John Doe", email: "john@bloodbank.ai", role: "donor", is_verified: true, phone: "+91 99999 99906" },
        { id: 5, full_name: "Jane Patient", email: "jane@bloodbank.ai", role: "patient", is_verified: true, phone: "+91 99999 99911" }
      ]);
      
      const stockRes = await api.getInventorySummary();
      setStockSummary(stockRes);
      
      const forecastRes = await api.getShortagePredictions();
      setForecasts(forecastRes.predictions || []);
      
      setLogs([
        { id: 101, action: "Register", details: "User john@bloodbank.ai registered as role donor", created_at: "2026-07-04T12:05:00Z" },
        { id: 102, action: "Raise Request", details: "Raised critical request for 3.0 units of AB-", created_at: "2026-07-04T14:12:00Z" },
        { id: 103, action: "System Seeding", details: "Initial database seed and account setup completed successfully.", created_at: "2026-07-04T10:00:00Z" }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleVerifyUser = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: !u.is_verified } : u));
  };

  const deleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 bg-slate-950">
        <RefreshCw className="animate-spin text-rose-500 mr-2" />
        Loading administrative console...
      </div>
    );
  }

  // Count metrics
  const totalUsers = users.length;
  const verifiedHospitals = users.filter(u => u.role === "hospital" && u.is_verified).length;
  const pendingApprovals = users.filter(u => !u.is_verified).length;
  const totalStock = Object.values(stockSummary.stock).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen selection:bg-rose-500 selection:text-white bg-slate-950">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {currentTab === "overview" || currentTab === "admin" ? "Overview Console" : `${currentTab} Management`}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === "overview" || currentTab === "admin" 
              ? "System logs, user registries, hospital verifications, and AI model telemetry."
              : `Admin console interface for managing system ${currentTab} configurations.`}
          </p>
        </div>
        <button 
          onClick={loadAdminData}
          className="flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
        >
          <RefreshCw size={14} />
          Reload System Metrics
        </button>
      </div>

      {/* Render Overview Content */}
      {(currentTab === "overview" || currentTab === "admin") && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registers</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{totalUsers}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Users size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Hospitals</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{verifiedHospitals}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Building2 size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available Stock</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{totalStock} Units</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <Database size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Approvals</p>
                <p className="text-3xl font-black mt-2 text-amber-500">{pendingApprovals}</p>
              </div>
              <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Activity size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User registries summary */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold">User Registries Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {users.slice(0, 3).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/30">
                        <td className="py-3">
                          <p className="font-bold text-slate-200">{u.full_name}</p>
                          <p className="text-slate-500 text-[10px]">{u.email}</p>
                        </td>
                        <td className="py-3 capitalize text-slate-400 font-medium">{u.role}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.is_verified 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {u.is_verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI shortage summary */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={18} className="text-rose-500" />
                AI Shortage Alerts
              </h3>
              <div className="space-y-3">
                {forecasts.filter(f => f.shortage_risk === "High").slice(0, 2).map((f, i) => (
                  <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs font-bold text-red-400">Deficit expected for {f.blood_group}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Available: {f.available_units} units | Demand: {f.predicted_demand}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users & Approvals Tab */}
      {currentTab === "users" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold">User Registries & Active verifications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/30">
                    <td className="py-3">
                      <p className="font-bold text-slate-200">{u.full_name}</p>
                      <p className="text-slate-500 text-[10px]">{u.email}</p>
                    </td>
                    <td className="py-3 capitalize text-slate-400 font-medium">{u.role}</td>
                    <td className="py-3 text-slate-400 font-mono">{u.phone}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        u.is_verified 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {u.is_verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => toggleVerifyUser(u.id)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        title={u.is_verified ? "Revoke verification" : "Approve user"}
                      >
                        <UserCheck size={14} />
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Stock Tab */}
      {currentTab === "stock" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Database size={18} className="text-rose-500" />
            System Blood Inventory Levels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stockSummary.stock).map(([bg, qty]: any) => (
              <div key={bg} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-rose-400 text-lg">{bg}</span>
                  <span className="text-xs text-slate-400">{qty} Unit{qty !== 1 && "s"} Available</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (qty / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(stockSummary.stock).length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center col-span-2">No active inventory registered.</p>
            )}
          </div>
        </div>
      )}

      {/* AI Forecast Tab */}
      {currentTab === "ai" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity size={18} className="text-rose-500" />
            AI Demand & Shortage Telemetry Console
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Forecast Date</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold text-center">Available Units</th>
                  <th className="pb-3 font-semibold text-center">Predicted Demand</th>
                  <th className="pb-3 font-semibold text-right">Shortage Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {forecasts.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-900/30">
                    <td className="py-3 font-mono text-slate-300">{f.date}</td>
                    <td className="py-3 font-bold text-rose-400">{f.blood_group}</td>
                    <td className="py-3 text-center text-slate-400">{f.available_units}</td>
                    <td className="py-3 text-center text-slate-400">{f.predicted_demand}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        f.shortage_risk === "High" 
                          ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {f.shortage_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {currentTab === "logs" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText size={18} className="text-rose-500" />
            System Activity logs
          </h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900/30 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 text-[10px] uppercase">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
