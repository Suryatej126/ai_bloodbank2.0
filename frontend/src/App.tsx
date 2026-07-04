import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { api } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Chatbot } from "./components/Chatbot";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { HospitalDashboard } from "./pages/HospitalDashboard";
import { BloodBankDashboard } from "./pages/BloodBankDashboard";
import { DonorDashboard } from "./pages/DonorDashboard";
import { PatientDashboard } from "./pages/PatientDashboard";

// Reusable Premium White-Themed Loading Animation (0.8s loop speed)
const PremiumLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center select-none overflow-hidden relative z-50">
      {/* Glow background */}
      <div 
        className="absolute w-[250px] h-[250px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none" 
        style={{ animation: "glow-pulse 1.6s ease-in-out infinite" }}
      ></div>
      
      {/* Animation viewport */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        
        {/* Floating dust particles */}
        <div className="absolute w-2 h-2 rounded-full bg-red-500/20 particle-left" style={{ top: "25%", left: "40%" }}></div>
        <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500/20 particle-right" style={{ top: "35%", right: "35%" }}></div>
        <div className="absolute w-1 h-1 rounded-full bg-red-500/15 particle-left" style={{ top: "55%", left: "30%" }}></div>
        
        {/* Ripple ring on floor */}
        <div 
          className="absolute w-24 h-6 border border-red-500 rounded-full pointer-events-none"
          style={{ top: "220px", animation: "ripple-expand 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite" }}
        ></div>

        {/* Splash droplets */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-red-600 splash-1" style={{ top: "225px" }}></div>
        <div className="absolute w-1.5 h-1.5 rounded-full bg-red-600 splash-2" style={{ top: "225px" }}></div>
        
        {/* Falling Blood Droplet */}
        <div 
          className="absolute"
          style={{ animation: "drop-fall 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite" }}
        >
          {/* Droplet Body */}
          <div 
            className="w-7 h-7 relative"
            style={{ 
              borderRadius: "0% 100% 100% 100%", 
              background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #dc2626 40%, #991b1b 100%)",
              boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), 2px 4px 6px rgba(153, 27, 27, 0.2)",
              animation: "drop-stretch-wobble 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"
            }}
          >
            {/* Glossy highlight dot */}
            <div className="absolute w-1.5 h-2 bg-white/60 rounded-full" style={{ top: "15%", left: "15%", transform: "rotate(-45deg)" }}></div>
          </div>
        </div>
      </div>

      {/* Connecting Text */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        <p className="text-sm font-bold text-slate-500 tracking-widest uppercase flex items-center">
          Connecting to Blood Network
          <span className="animate-dot"></span>
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

  // Dashboard Wrapper Component
  const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    if (!token || !role) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar role={role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* ===== TOP HEADER BAR ===== */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                LIFE CARE · AI Smart Blood Bank
              </span>
            </div>
            {/* Logo — replace logo.png in /public to update */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-600 font-mono capitalize">{role} panel</span>
              <img
                src="/logo.png"
                alt="LIFE CARE Logo"
                className="h-4 w-auto object-contain"
                style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,0.35))" }}
              />
            </div>
          </header>

          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
        </div>
        {/* Floating Chatbot assistant available everywhere */}
        <Chatbot />
      </div>
    );
  };

  return (
    <Router>
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
    </Router>
  );
};

export default App;
