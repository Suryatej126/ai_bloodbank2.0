import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, HeartHandshake, Brain, Clock, MapPin, ChevronRight, Award, Play, Droplet } from "lucide-react";

let hasPlayedSessionIntro = false;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>("O-");
  const [showIntro, setShowIntro] = useState(!hasPlayedSessionIntro);
  const [isMuted, setIsMuted] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const handleSkipIntro = () => {
    setFadeClass("opacity-0 transition-opacity duration-1000");
    hasPlayedSessionIntro = true;
    setTimeout(() => {
      setShowIntro(false);
    }, 1000);
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

  if (showIntro) {
    return (
      <div className={`fixed inset-0 z-50 bg-slate-950 select-none overflow-hidden ${fadeClass}`}>
        {/* Full-Screen Video (stretches to fill viewport) */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleSkipIntro}
        >
          <source src="/intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay controls inside the video container at the bottom */}
        <div className="absolute inset-x-0 bottom-10 px-8 md:px-16 flex items-center justify-between z-10">
          {/* Glassy Mute/Unmute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <>
                <span className="text-sm">🔇</span> Unmute Sound
              </>
            ) : (
              <>
                <span className="text-sm">🔊</span> Mute Sound
              </>
            )}
          </button>

          {/* Glassy Skip Intro button */}
          <button
            onClick={handleSkipIntro}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl backdrop-blur-md bg-rose-600/40 hover:bg-rose-600/60 border border-rose-500/30 text-xs font-black text-white shadow-xl shadow-rose-600/10 hover:shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Skip Onboarding
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 relative flex-shrink-0 animate-pulse" style={{ filter: "drop-shadow(0px 2px 4px rgba(153, 27, 27, 0.3))" }}>
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
            <h1 className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 leading-none">
              LIFE CARE
            </h1>
            <p className="text-[10px] text-rose-500 uppercase tracking-widest font-semibold mt-1">
              ai smart blood bank
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/login?mode=register")}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <Brain size={14} />
            AI-Driven Medical Innovation
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            The Digital Blood Bank, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-orange-400">
              Powered by AI.
            </span>
          </h2>
          
          <p className="text-slate-400 text-base max-w-lg leading-relaxed">
            Eliminating shortages, prioritizing critical emergencies, and mapping compatible donors in real-time. Join the smart network saving lives through intelligent automation.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
            >
              Access Dashboard
              <ChevronRight size={18} />
            </button>
            <a 
              href="#compatibility"
              className="px-6 py-3.5 border border-slate-800 bg-slate-900/40 hover:bg-slate-900 rounded-2xl font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Explore Compatibility
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900">
            <div>
              <p className="text-2xl font-black text-rose-400">99.4%</p>
              <p className="text-xs text-slate-500 font-medium">Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">&lt; 4 Min</p>
              <p className="text-xs text-slate-500 font-medium">SOS Dispatch Time</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">8,500+</p>
              <p className="text-xs text-slate-500 font-medium">Lives Reached</p>
            </div>
          </div>
        </div>

        {/* Interactive Compatibility Chart Widget */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-right-5 duration-300" id="compatibility">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl group-hover:bg-rose-600/20 transition-all duration-300"></div>
          
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2.5">
              <Activity size={20} className="text-rose-500 animate-pulse" />
              Smart Compatibility Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a donor blood type to see all compatible recipients it can support in real-time.
            </p>
          </div>

          {/* Grid of donor keys */}
          <div className="grid grid-cols-4 gap-2.5">
            {Object.keys(compatibilities).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`py-3 font-extrabold text-sm rounded-xl transition-all cursor-pointer ${
                  selectedGroup === group 
                    ? "bg-rose-600 text-white scale-105 shadow-md shadow-rose-600/20 border border-rose-500" 
                    : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Compatibility output visual */}
          {selectedGroup && (
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Donor Group <span className="underline">{selectedGroup}</span> can give to:
              </p>
              <div className="flex flex-wrap gap-2">
                {compatibilities[selectedGroup].map((recipient) => (
                  <span 
                    key={recipient} 
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-in zoom-in-95 duration-100"
                  >
                    {recipient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility note */}
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Note: Blood bank matching engines check compatibility and geographical transit times to maximize the success of emergency operations.
          </p>
        </div>
      </main>
      {/* Feature section */}
      <section className="bg-slate-950/80 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Brain size={20} />
            </div>
            <h4 className="font-bold text-sm">Smart Recommendation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">AI ranks donors by distance, safety eligibility parameters, and compatibility scores.</p>
          </div>
          
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-sm">Shortage Regressor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Time-series forecasting models train on seasonality logs to predict stock deficits.</p>
          </div>
          
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <MapPin size={20} />
            </div>
            <h4 className="font-bold text-sm">Live Routing Maps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Integrates real-time tracking, heatmap density, and traffic-adjusted travel ranges.</p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit">
              <Award size={20} />
            </div>
            <h4 className="font-bold text-sm">Gamification Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Donor profiles unlock digital achievement badges, levels, and certificates.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 bg-slate-950/40">
        &copy; {new Date().getFullYear()} AI Powered Digital Blood Bank. Designed for Final Year B.Tech Academic Showcase.
      </footer>
    </div>
  );
};
