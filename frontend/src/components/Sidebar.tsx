import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Droplet,
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
    <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto h-screen w-64 glass-panel border-r border-slate-800 p-5 flex flex-col justify-between select-none transition-transform duration-300 ${
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    }`}>
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { navigate("/"); if (onClose) onClose(); }}>
            <div className="w-9 h-9 relative flex-shrink-0 animate-pulse" style={{ filter: "drop-shadow(0px 2px 4px rgba(153, 27, 27, 0.3))" }}>
              <div 
                className="w-full h-full"
                style={{ 
                  borderRadius: "0% 100% 100% 100%", 
                  background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #dc2626 40%, #991b1b 100%)",
                  boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), 2px 4px 6px rgba(153, 27, 27, 0.2)",
                  transform: "rotate(45deg)"
                }}
              >
                <div className="absolute w-2.5 h-3 bg-white/70 rounded-full" style={{ top: "15%", left: "15%", transform: "rotate(-45deg)" }}></div>
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 leading-none">
                LIFE CARE
              </h1>
              <p className="text-[10px] text-rose-500 uppercase tracking-widest font-semibold mt-1">
                ai smart blood bank
              </p>
            </div>
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

        {/* User context info */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <p className="text-xs text-slate-400">Logged in as:</p>
          <p className="text-sm font-semibold capitalize text-rose-400 mt-0.5">{role}</p>
        </div>

        {/* Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};
