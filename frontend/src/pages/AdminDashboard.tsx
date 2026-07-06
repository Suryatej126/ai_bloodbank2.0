import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import { 
  Users, 
  Building2, 
  Database, 
  Activity, 
  RefreshCw, 
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<string>("hospital");


  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Mock Users Seed
      setUsers([
        { 
          id: 1, 
          full_name: "Super Admin", 
          email: "admin@bloodbank.ai", 
          role: "admin", 
          is_verified: true, 
          phone: "+91 99999 99901",
          profile: {
            city: "Mumbai",
            state: "Maharashtra",
            address: "Central HQ, Fort"
          }
        },
        { 
          id: 2, 
          full_name: "City General Hospital", 
          email: "city_hospital@bloodbank.ai", 
          role: "hospital", 
          is_verified: true, 
          phone: "+91 99999 99902",
          profile: {
            national_id: "HOSP-90812-IN",
            city: "Mumbai",
            state: "Maharashtra",
            address: "102 Dr. Annie Besant Rd, Worli",
            availability_status: "active"
          }
        },
        { 
          id: 6, 
          full_name: "St. Jude Research Clinic", 
          email: "stjude@hospital.ai", 
          role: "hospital", 
          is_verified: false, 
          phone: "+91 88888 77701",
          profile: {
            national_id: "HOSP-44512-IN",
            city: "Pune",
            state: "Maharashtra",
            address: "Sector 4, Kalyani Nagar",
            availability_status: "pending_review"
          }
        },
        { 
          id: 3, 
          full_name: "Red Cross Blood Bank", 
          email: "redcross@bloodbank.ai", 
          role: "bloodbank", 
          is_verified: false, 
          phone: "+91 99999 99904",
          profile: {
            national_id: "LIC-BB-88902",
            city: "Delhi",
            state: "Delhi",
            address: "Red Cross Building, 1 Red Cross Road",
            availability_status: "pending_review"
          }
        },
        { 
          id: 7, 
          full_name: "LifeSource Regional Depot", 
          email: "lifesource@bloodbank.ai", 
          role: "bloodbank", 
          is_verified: true, 
          phone: "+91 99999 99905",
          profile: {
            national_id: "LIC-BB-55410",
            city: "Bangalore",
            state: "Karnataka",
            address: "4th Block, Koramangala",
            availability_status: "active"
          }
        },
        { 
          id: 4, 
          full_name: "John Doe", 
          email: "john@bloodbank.ai", 
          role: "donor", 
          is_verified: true, 
          phone: "+91 99999 99906",
          profile: {
            national_id: "UID-8890-1234",
            blood_group: "O+",
            date_of_birth: "1995-04-12",
            weight: 78.5,
            hemoglobin: 14.8,
            last_donation_date: "2026-03-01",
            health_conditions: "None",
            travel_history: "None",
            vaccination_status: "Fully Vaccinated",
            is_eligible: true,
            city: "Mumbai",
            state: "Maharashtra",
            address: "Flat 4B, Silver Oak Apts, Bandra"
          }
        },
        { 
          id: 8, 
          full_name: "Sarah Connor", 
          email: "sarah@bloodbank.ai", 
          role: "donor", 
          is_verified: false, 
          phone: "+91 99999 99907",
          profile: {
            national_id: "UID-4450-8912",
            blood_group: "A-",
            date_of_birth: "1988-11-23",
            weight: 62.0,
            hemoglobin: 12.5,
            last_donation_date: "2026-01-15",
            health_conditions: "None",
            travel_history: "None",
            vaccination_status: "Fully Vaccinated",
            is_eligible: true,
            city: "Delhi",
            state: "Delhi",
            address: "12 Civil Lines"
          }
        },
        { 
          id: 5, 
          full_name: "Jane Patient", 
          email: "jane@bloodbank.ai", 
          role: "patient", 
          is_verified: true, 
          phone: "+91 99999 99911",
          profile: {
            national_id: "UID-1122-3344",
            blood_group: "A+",
            date_of_birth: "1990-08-15",
            weight: 55.0,
            hemoglobin: 11.2,
            health_conditions: "Anemia history",
            city: "Pune",
            state: "Maharashtra",
            address: "Bld 5, Landmark Res, Hinjewadi"
          }
        },
        { 
          id: 9, 
          full_name: "Bobby Patient", 
          email: "bobby@bloodbank.ai", 
          role: "patient", 
          is_verified: false, 
          phone: "+91 99999 99912",
          profile: {
            national_id: "UID-7788-9900",
            blood_group: "AB-",
            date_of_birth: "2000-02-14",
            weight: 68.0,
            hemoglobin: 13.1,
            health_conditions: "None",
            city: "Bangalore",
            state: "Karnataka",
            address: "Sector 7, HSR Layout"
          }
        }
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
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tabs Selector */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
            {[
              { id: "hospital", label: "Hospitals", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { id: "bloodbank", label: "Blood Banks", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
              { id: "donor", label: "Donors", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { id: "patient", label: "Patients", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
            ].map(tab => {
              const pendingCount = users.filter(u => u.role === tab.id && !u.is_verified).length;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center gap-2 ${
                    isActive 
                      ? "bg-slate-800 text-white border-slate-700 shadow-md shadow-slate-950" 
                      : "bg-slate-900/30 text-slate-400 border-slate-900 hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 animate-pulse">
                      {pendingCount} Pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-section Content */}
          <div className="grid grid-cols-1 gap-6">
            {(() => {
              const filteredUsers = users.filter(u => u.role === activeSubTab);
              const pendingUsers = filteredUsers.filter(u => !u.is_verified);
              const verifiedUsers = filteredUsers.filter(u => u.is_verified);

              return (
                <div className="space-y-6">
                  {/* Pending Approvals Table */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        Pending Approvals ({pendingUsers.length})
                      </h4>
                    </div>
                    {pendingUsers.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No pending approvals for this category.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-400">
                              <th className="pb-3 font-semibold">Name / Email</th>
                              <th className="pb-3 font-semibold">Phone</th>
                              {activeSubTab === "donor" || activeSubTab === "patient" ? (
                                <th className="pb-3 font-semibold">Blood Group</th>
                              ) : null}
                              <th className="pb-3 font-semibold">Location</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {pendingUsers.map(u => (
                              <tr key={u.id} className="hover:bg-slate-900/30 transition-colors group">
                                <td className="py-3">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="font-bold text-rose-400 hover:text-rose-300 hover:underline text-left cursor-pointer transition-colors"
                                    title="View Profile Details"
                                  >
                                    {u.full_name}
                                  </button>
                                  <p className="text-slate-500 text-[10px]">{u.email}</p>
                                </td>
                                <td className="py-3 text-slate-400 font-mono">{u.phone}</td>
                                {activeSubTab === "donor" || activeSubTab === "patient" ? (
                                  <td className="py-3 font-extrabold text-slate-300">{u.profile?.blood_group || "N/A"}</td>
                                ) : null}
                                <td className="py-3 text-slate-400">{u.profile?.city ? `${u.profile.city}, ${u.profile.state}` : "N/A"}</td>
                                <td className="py-3 text-right space-x-2">
                                  <button
                                    onClick={() => toggleVerifyUser(u.id)}
                                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-lg text-[10px] transition-all duration-200 cursor-pointer"
                                    title="Approve User"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer inline-flex align-middle"
                                    title="Delete User"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Active / Verified Registry Table */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
                      Verified Registry ({verifiedUsers.length})
                    </h4>
                    {verifiedUsers.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No verified accounts in this category yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-400">
                              <th className="pb-3 font-semibold">Name / Email</th>
                              <th className="pb-3 font-semibold">Phone</th>
                              {activeSubTab === "donor" || activeSubTab === "patient" ? (
                                <th className="pb-3 font-semibold">Blood Group</th>
                              ) : null}
                              <th className="pb-3 font-semibold">Location</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {verifiedUsers.map(u => (
                              <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="py-3">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="font-bold text-rose-400 hover:text-rose-300 hover:underline text-left cursor-pointer transition-colors"
                                    title="View Profile Details"
                                  >
                                    {u.full_name}
                                  </button>
                                  <p className="text-slate-500 text-[10px]">{u.email}</p>
                                </td>
                                <td className="py-3 text-slate-400 font-mono">{u.phone}</td>
                                {activeSubTab === "donor" || activeSubTab === "patient" ? (
                                  <td className="py-3 font-extrabold text-slate-300">{u.profile?.blood_group || "N/A"}</td>
                                ) : null}
                                <td className="py-3 text-slate-400">{u.profile?.city ? `${u.profile.city}, ${u.profile.state}` : "N/A"}</td>
                                <td className="py-3 text-right space-x-2">
                                  <button
                                    onClick={() => toggleVerifyUser(u.id)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 rounded-lg text-[10px] transition-all duration-200 cursor-pointer"
                                    title="Revoke Verification"
                                  >
                                    Revoke
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer inline-flex align-middle"
                                    title="Delete User"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
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

      {/* Profile Detail Card Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden shadow-rose-950/10 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                  selectedUser.role === "hospital" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  selectedUser.role === "bloodbank" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  selectedUser.role === "donor" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-purple-500/10 text-purple-400 border-purple-500/20"
                }`}>
                  {selectedUser.role} Account
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedUser.full_name}</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Essential Contact Card */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Email Address</p>
                  <p className="text-slate-200 mt-0.5 break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Phone Number</p>
                  <p className="text-slate-200 mt-0.5 font-mono">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Verification Status</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedUser.is_verified 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.is_verified ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                    {selectedUser.is_verified ? "Verified / Approved" : "Pending Verification"}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Member Since</p>
                  <p className="text-slate-200 mt-0.5">July 2026</p>
                </div>
              </div>

              {/* Profile Details Section */}
              {selectedUser.profile ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-rose-500 tracking-widest border-b border-slate-800 pb-1">
                    Profile Information
                  </h4>

                  {/* General Profile fields for all */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {selectedUser.profile.national_id && (
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">National ID / License No</p>
                        <p className="text-slate-200 mt-0.5 font-mono">{selectedUser.profile.national_id}</p>
                      </div>
                    )}
                    {selectedUser.profile.availability_status && (
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Status Code</p>
                        <p className="text-slate-200 mt-0.5 capitalize">{selectedUser.profile.availability_status.replace("_", " ")}</p>
                      </div>
                    )}
                    {selectedUser.profile.blood_group && (
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Blood Group</p>
                        <p className="text-xl font-black text-rose-500 mt-0.5 drop-shadow-[0_2px_8px_rgba(239,68,68,0.2)]">
                          {selectedUser.profile.blood_group}
                        </p>
                      </div>
                    )}
                    {selectedUser.profile.date_of_birth && (
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Date of Birth</p>
                        <p className="text-slate-200 mt-0.5">{selectedUser.profile.date_of_birth}</p>
                      </div>
                    )}
                  </div>

                  {/* Specific fields for Donors/Patients */}
                  {(selectedUser.role === "donor" || selectedUser.role === "patient") && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {selectedUser.profile.weight !== undefined && (
                        <div>
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Body Weight</p>
                          <p className="text-slate-200 mt-0.5">{selectedUser.profile.weight} kg</p>
                        </div>
                      )}
                      {selectedUser.profile.hemoglobin !== undefined && (
                        <div>
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Hemoglobin Level</p>
                          <p className="text-slate-200 mt-0.5">{selectedUser.profile.hemoglobin} g/dL</p>
                        </div>
                      )}
                      {selectedUser.profile.last_donation_date && (
                        <div>
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Last Donation Date</p>
                          <p className="text-slate-200 mt-0.5">{selectedUser.profile.last_donation_date}</p>
                        </div>
                      )}
                      {selectedUser.profile.vaccination_status && (
                        <div>
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Vaccination Status</p>
                          <p className="text-slate-200 mt-0.5">{selectedUser.profile.vaccination_status}</p>
                        </div>
                      )}
                      {selectedUser.profile.is_eligible !== undefined && (
                        <div className="col-span-2">
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">AI-Assessed Eligibility</p>
                          <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded font-black text-[9px] uppercase border ${
                            selectedUser.profile.is_eligible 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}>
                            {selectedUser.profile.is_eligible ? "Eligible to Donate" : "Ineligible / Deferred"}
                          </span>
                        </div>
                      )}
                      {selectedUser.profile.health_conditions && (
                        <div className="col-span-2">
                          <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Health Conditions / History</p>
                          <p className="text-slate-300 mt-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 italic">
                            "{selectedUser.profile.health_conditions}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address Section */}
                  {(selectedUser.profile.city || selectedUser.profile.address) && (
                    <div className="text-xs space-y-2">
                      <p className="text-slate-500 font-bold uppercase tracking-wide text-[9px] border-t border-slate-800 pt-3">
                        Registered Address
                      </p>
                      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                        {selectedUser.profile.address && <p className="text-slate-200">{selectedUser.profile.address}</p>}
                        <p className="text-slate-400 text-[10px]">
                          {[selectedUser.profile.city, selectedUser.profile.district, selectedUser.profile.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No additional profile information registered for this account.
                </div>
              )}

            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center gap-4">
              <button
                onClick={() => {
                  deleteUser(selectedUser.id);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-red-950/30 hover:border-red-900 hover:text-red-400 text-slate-400 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer"
              >
                Delete Account
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toggleVerifyUser(selectedUser.id);
                    setSelectedUser((prev: any) => ({ ...prev, is_verified: !prev.is_verified }));
                  }}
                  className={`px-4 py-2 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                    selectedUser.is_verified
                      ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  }`}
                >
                  {selectedUser.is_verified ? "Revoke Verification" : "Approve & Verify"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

