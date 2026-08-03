import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { api } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Chatbot } from "./components/Chatbot";
import { 
  Menu, 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  LogOut,
  ShieldCheck,
  Database,
  Sliders,
  FileSpreadsheet,
  Bell,
  User,
  Calendar,
  HeartHandshake
} from "lucide-react";
// Safe dynamic import loader wrapper to handle deployment updates/chunk load failures
const safeLazy = (importFn: () => Promise<any>) => {
  return React.lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Failed to load dynamic chunk, forcing page reload...", error);
      const lastReload = sessionStorage.getItem("spa_chunk_reload");
      const now = Date.now();
      // Only reload if we haven't reloaded in the last 10 seconds to prevent loops
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem("spa_chunk_reload", now.toString());
        window.location.reload();
      }
      throw error;
    }
  });
};

const LandingPage = safeLazy(() => import("./pages/LandingPage").then(module => ({ default: module.LandingPage })));
const Login = safeLazy(() => import("./pages/Login").then(module => ({ default: module.Login })));
const AdminDashboard = safeLazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const HospitalDashboard = safeLazy(() => import("./pages/HospitalDashboard").then(module => ({ default: module.HospitalDashboard })));
const BloodBankDashboard = safeLazy(() => import("./pages/BloodBankDashboard").then(module => ({ default: module.BloodBankDashboard })));
const DonorDashboard = safeLazy(() => import("./pages/DonorDashboard").then(module => ({ default: module.DonorDashboard })));
const PatientDashboard = safeLazy(() => import("./pages/PatientDashboard").then(module => ({ default: module.PatientDashboard })));

// Reusable Premium Loader placeholder (You can replace this with your custom loader component)
const PremiumLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center select-none overflow-hidden relative z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("user_role"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setRole(user.role);
        } catch (e) {
          console.error("Token initialization failed: ", e);
          handleLogout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const handleLoginSuccess = (userRole: string) => {
    setToken(localStorage.getItem("access_token"));
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    setToken(null);
    setRole(null);
  };

  if (loading) {
    return <PremiumLoader />;
  }

  // Navigation items definition helper for mobile tab bar
  const getNavItems = (role: string) => {
    switch (role) {
      case "admin":
        return [
          { label: "Overview", icon: LayoutDashboard, path: "/admin" },
          { label: "Approvals", icon: ShieldCheck, path: "/admin/users" },
          { label: "Stock", icon: Database, path: "/admin/stock" },
          { label: "AI Forecast", icon: Sliders, path: "/admin/ai" },
          { label: "Logs", icon: FileSpreadsheet, path: "/admin/logs" },
        ];
      case "hospital":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/hospital" },
          { label: "SOS Center", icon: AlertTriangle, path: "/hospital/sos" },
          { label: "Requests", icon: Bell, path: "/hospital/requests" },
          { label: "Inventory", icon: Database, path: "/hospital/inventory" },
          { label: "Patients", icon: User, path: "/hospital/patients" },
        ];
      case "bloodbank":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/bloodbank" },
          { label: "Requests", icon: Bell, path: "/bloodbank/requests" },
          { label: "Inventory", icon: Database, path: "/bloodbank/inventory" },
          { label: "Collection", icon: Calendar, path: "/bloodbank/collection" },
        ];
      case "donor":
        return [
          { label: "Profile", icon: User, path: "/donor" },
          { label: "Appts", icon: Calendar, path: "/donor/appointments" },
          { label: "Eligibility", icon: HeartHandshake, path: "/donor/eligibility" },
          { label: "Blood Test", icon: Activity, path: "/donor/bloodtest" },
          { label: "Requests", icon: AlertTriangle, path: "/donor/requests" },
        ];
      case "patient":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/patient" },
          { label: "Search", icon: Activity, path: "/patient/search" },
          { label: "Requests", icon: AlertTriangle, path: "/patient/requests" },
        ];
      default:
        return [];
    }
  };

  // Dashboard Wrapper Component
  const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    if (!token || !role) {
      return <Navigate to="/login" replace />;
    }

    const navItems = getNavItems(role);

    return (
      <div className="flex bg-slate-950 min-h-screen relative overflow-x-hidden">
        {/* Backdrop for desktop-triggered drawer on mobile if sidebar is ever open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs md:hidden cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar: Only active and triggered on desktop screen resolutions */}
        <Sidebar 
          role={role} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* ===== TOP HEADER BAR ===== */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold hidden sm:inline">
                LIFE CARE · AI Smart Blood Bank
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold sm:hidden">
                LIFE CARE
              </span>
            </div>
            
            {/* Top Right Actions */}
            <div className="flex items-center gap-4">
              {/* Show logout option only in top-right header on mobile for all roles */}
              <button
                onClick={handleLogout}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold transition-all cursor-pointer animate-in fade-in duration-200"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-650 font-mono capitalize">{role} panel</span>
                <img
                  src="/logo.png"
                  alt="LIFE CARE Logo"
                  className="h-4 w-auto object-contain"
                  style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,0.35))" }}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
        </div>

        {/* Bottom Tab Navigation Bar for all users on Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070b19]/95 backdrop-blur-md border-t border-slate-800/80 flex justify-around items-center py-2.5 px-2 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Precise active layout matching
            const isActive = location.pathname === item.path || (item.path !== `/${role}` && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive ? "text-rose-500 scale-105" : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                <span className="truncate max-w-[70px]">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Floating Chatbot assistant available everywhere */}
        <Chatbot />
      </div>
    );
  };

  return (
    <Router>
      <React.Suspense fallback={<PremiumLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={token ? <Navigate to={`/${role}`} replace /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={token ? <Navigate to={`/${role}`} replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />

          {/* Dashboard Role-Based Routes */}
          <Route 
            path="/admin/*" 
            element={<DashboardLayout><AdminDashboard /></DashboardLayout>} 
          />
          <Route 
            path="/hospital/*" 
            element={<DashboardLayout><HospitalDashboard /></DashboardLayout>} 
          />
          <Route 
            path="/bloodbank/*" 
            element={<DashboardLayout><BloodBankDashboard /></DashboardLayout>} 
          />
          <Route 
            path="/donor/*" 
            element={<DashboardLayout><DonorDashboard /></DashboardLayout>} 
          />
          <Route 
            path="/patient/*" 
            element={<DashboardLayout><PatientDashboard /></DashboardLayout>} 
          />

          {/* Fallback */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default App;
