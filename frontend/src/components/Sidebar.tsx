import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Calendar, 
  User, 
  LogOut, 
  HeartHandshake, 
  FileSpreadsheet, 
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Bell,
  X
} from "lucide-react";

interface SidebarProps {
  role: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getNavItems = () => {
    switch (role) {
      case "admin":
        return [
          { label: "Overview", icon: LayoutDashboard, path: "/admin" },
          { label: "Users & Approvals", icon: ShieldCheck, path: "/admin/users" },
          { label: "System Stock", icon: Database, path: "/admin/stock" },
          { label: "AI Forecast Console", icon: Sliders, path: "/admin/ai" },
          { label: "System Logs", icon: FileSpreadsheet, path: "/admin/logs" },
        ];
      case "hospital":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/hospital" },
          { label: "SOS Request Center", icon: AlertTriangle, path: "/hospital/sos" },
          { label: "Patient Requests", icon: Bell, path: "/hospital/requests" },
          { label: "Blood Inventory", icon: Database, path: "/hospital/inventory" },
          { label: "Patients", icon: User, path: "/hospital/patients" },
        ];
      case "bloodbank":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/bloodbank" },
          { label: "Patient Requests", icon: Bell, path: "/bloodbank/requests" },
          { label: "Manage Inventory", icon: Database, path: "/bloodbank/inventory" },
          { label: "Collection Center", icon: Calendar, path: "/bloodbank/collection" },
        ];
      case "donor":
        return [
          { label: "My Profile", icon: User, path: "/donor" },
          { label: "Appointments", icon: Calendar, path: "/donor/appointments" },
          { label: "Eligibility Checker", icon: HeartHandshake, path: "/donor/eligibility" },
          { label: "Blood Typing Test", icon: Activity, path: "/donor/bloodtest" },
          { label: "Requests", icon: AlertTriangle, path: "/donor/requests" },
        ];
      case "patient":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/patient" },
          { label: "Blood Search", icon: Activity, path: "/patient/search" },
          { label: "My Requests", icon: AlertTriangle, path: "/patient/requests" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile drawer overlay backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden cursor-pointer"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto h-screen w-64 backdrop-blur-2xl bg-slate-950/45 border-r border-white/5 p-5 flex flex-col justify-between select-none transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            <div className="flex flex-col select-none cursor-pointer" onClick={() => { navigate("/"); if (onClose) onClose(); }}>
              {/* Row: Logo + Title centered together */}
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="LIFE CARE Logo" 
                  className="h-8 w-auto object-contain hover:scale-105 transition-transform"
                  style={{ filter: "drop-shadow(0 0 4px rgba(220,38,38,0.35))" }}
                />
                <h1 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 leading-none py-1">
                  LIFE CARE
                </h1>
              </div>
              {/* Subtitle placed below */}
              <p className="text-[9px] text-rose-500 uppercase tracking-widest font-black pl-[40px] leading-none">
                ai smart blood bank
              </p>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* User context info / Avatar badge */}
          <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 p-3 rounded-2xl shadow-inner flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600/20 to-rose-600/20 border border-rose-500/25 flex items-center justify-center text-rose-500 font-extrabold text-xs uppercase flex-shrink-0">
              {role.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black leading-none">Logged In As</p>
              <p className="text-xs font-bold capitalize text-slate-200 mt-1 truncate">{role}</p>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500/20" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 bg-white/[0.01] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer shadow-sm"
        >
          <LogOut size={16} />
          <span>Logout Portal</span>
        </motion.button>
      </aside>
    </>
  );
};
