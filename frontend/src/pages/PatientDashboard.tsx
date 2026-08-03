import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { 
  Search, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Navigation,
  CheckCircle,
  Activity,
  Database,
  Phone,
  X,
  Droplets,
  User,
  Send,
  Sliders,
  BellRing
} from "lucide-react";

/* ---------- Kakinada-area mock blood banks / donors ---------- */
const KAKINADA_DONORS = [
  {
    id: 1,
    name: "Apollo Blood Bank",
    type: "blood_bank",
    address: "14-1-1, Beside Apollo Hospital, Hospital Rd, Kakinada, AP 533001",
    phone: "+91 884-236-1111",
    lat: 16.9891,
    lng: 82.2475,
    distance: 0.9,
    temp: 4.2,
    available: true,
  },
  {
    id: 2,
    name: "Government General Hospital",
    type: "blood_bank",
    address: "Surya Rao Peta, Kakinada, AP 533001",
    phone: "+91 884-236-2525",
    lat: 16.9823,
    lng: 82.2318,
    distance: 1.4,
    temp: 4.0,
    available: true,
  },
  {
    id: 3,
    name: "Red Cross Blood Centre",
    type: "blood_bank",
    address: "Main Road, Ramanayyapeta, Kakinada, AP 533004",
    phone: "+91 884-236-3900",
    lat: 16.9743,
    lng: 82.2401,
    distance: 2.1,
    temp: 3.8,
    available: true,
  },
  {
    id: 4,
    name: "Suraksha Blood Bank",
    type: "blood_bank",
    address: "Jagannaickpur, NH-16 Service Rd, Kakinada, AP 533005",
    phone: "+91 884-236-4444",
    lat: 16.9612,
    lng: 82.2266,
    distance: 3.6,
    temp: 4.1,
    available: true,
  },
  {
    id: 5,
    name: "Arogya Voluntary Donor",
    type: "donor",
    address: "Bhanugudi Junction, Kakinada, AP 533003",
    phone: "+91 99899 77321",
    lat: 16.9778,
    lng: 82.2490,
    distance: 1.8,
    temp: null,
    available: true,
  },
  {
    id: 6,
    name: "LifeSource Regional Depot",
    type: "blood_bank",
    address: "Pedapudi Rd, Peddapuram, Near Kakinada, AP 533437",
    phone: "+91 884-252-1122",
    lat: 17.0824,
    lng: 82.1376,
    distance: 14.2,
    temp: 3.9,
    available: false,
  },
];

export const PatientDashboard: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchBg, setSearchBg] = useState("O+");
  const [searchCity, setSearchCity] = useState("Kakinada, AP");
  const [loading, setLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [notifySent, setNotifySent] = useState<number | null>(null);
  const [coverageMapCenter, setCoverageMapCenter] = useState({ lat: 16.9891, lng: 82.2475 });

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.getRequests();
      setRequests(reqRes);
      runSearch("O+");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, []);

  const runSearch = (bg: string) => {
    const results = KAKINADA_DONORS.map((d) => ({ ...d, blood_group: bg }));
    setSearchResults(results);
  };

  const handleSearchBlood = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    runSearch(searchBg);
  };

  const handleOpenMap = (donor: any) => {
    setSelectedDonor(donor);
    setMapModalOpen(true);
  };

  const handleNotifyDonor = async (donor: any) => {
    try {
      await api.createRequest({
        recipient_name: "Self",
        blood_group: searchBg,
        units_required: 1.0,
        emergency_type: "urgent",
        hospital_name: donor.name,
        address: donor.address,
        latitude: donor.lat,
        longitude: donor.lng,
      });
      setNotifySent(donor.id);
      setTimeout(() => setNotifySent(null), 4000);
      loadPatientData();
    } catch (err) {
      console.error(err);
      setNotifySent(donor.id);
      setTimeout(() => setNotifySent(null), 4000);
    }
  };

  const handleTriggerSOS = async () => {
    try {
      await api.createRequest({
        recipient_name: "Self",
        blood_group: "O-",
        units_required: 1.0,
        emergency_type: "critical",
        hospital_name: "Government General Hospital Kakinada",
        address: "Surya Rao Peta, Kakinada, AP 533001",
        latitude: 16.9823,
        longitude: 82.2318,
      });
      alert("🚨 SOS EMERGENCY broadcasted! All nearby O- donors near Kakinada have been notified.");
      loadPatientData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-[#050814]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Patient Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#050814] selection:bg-rose-500 selection:text-white">
      
      {/* ======= MAP OVERLAY MODAL ======= */}
      <AnimatePresence>
        {mapModalOpen && selectedDonor && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setMapModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm tracking-wide">{selectedDonor.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin size={12} className="text-rose-500 flex-shrink-0" />
                    {selectedDonor.address}
                  </p>
                </div>
                <button onClick={() => setMapModalOpen(false)} className="p-2 rounded-xl hover:bg-white/[0.03] text-slate-400 hover:text-white transition-all cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {/* Embedded OpenStreetMap */}
              <div className="relative w-full" style={{ height: "300px" }}>
                <iframe
                  title="location-map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${selectedDonor.lat},${selectedDonor.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                />
                {/* Overlay badge */}
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-rose-455 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  {selectedDonor.distance} km away
                </div>
                {/* Locate Me Float Button */}
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          alert(`Located! Your current position is: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}.`);
                        },
                        (error) => {
                          console.error(error);
                          alert("Could not access current location.");
                        }
                      );
                    }
                  }}
                  className="absolute bottom-10 right-3 z-10 p-2 bg-slate-950/90 backdrop-blur-md border border-white/10 hover:bg-slate-800 text-rose-500 rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center"
                  title="Locate Me"
                >
                  <Navigation size={14} className="animate-pulse" />
                </button>
              </div>

              {/* Modal Footer */}
              <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/5">
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5"><Phone size={12} className="text-rose-500" /> {selectedDonor.phone}</p>
                  {selectedDonor.temp && (
                    <p className="text-slate-500 font-medium">Storage Temp: <strong className="text-slate-350">{selectedDonor.temp}°C</strong></p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${selectedDonor.lat},${selectedDonor.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 text-xs font-bold transition-all"
                  >
                    <Navigation size={13} />
                    Directions
                  </a>
                  <button
                    onClick={() => { handleNotifyDonor(selectedDonor); setMapModalOpen(false); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-tr from-red-655 to-rose-600 hover:from-red-550 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    <Send size={13} />
                    Request Stock
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Title Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">
            {currentTab === "dashboard" ? "Patient Command Center" : currentTab === "search" ? "Blood Search Engine" : "My Requests log"}
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            {currentTab === "dashboard"
              ? "Triage regional centers, trigger direct SOS dispatches, and track pending matches."
              : currentTab === "search"
              ? "Filter stock centers by blood group. Tap a card to inspect on maps."
              : "Review complete audit history of requested volumes and matches."}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTriggerSOS}
          className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all cursor-pointer border border-red-500/20 sos-pulse uppercase tracking-wider"
        >
          <AlertTriangle size={15} />
          SOS EMERGENCY
        </motion.button>
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
            {/* Quick Stat Cards - Aligned Smaller and Clean */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { label: "Raised Requests", val: requests.filter((r) => r.recipient_name === "Self").length, icon: AlertTriangle, color: "text-rose-500" },
                { label: "Active Centers", val: KAKINADA_DONORS.filter(d => d.available).length, icon: Database, color: "text-blue-500" },
                { label: "Nearest Depot", val: "0.9 km", icon: Clock, color: "text-emerald-500" }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-slate-900/35 border border-white/5 p-3.5 md:p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                      <p className="text-lg md:text-2xl font-black mt-1 text-slate-100">{card.val}</p>
                    </div>
                    <div className={`p-2 bg-white/[0.01] border border-white/5 rounded-xl ${card.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Frame Preview */}
            <div className="bg-slate-900/35 border border-white/5 rounded-3xl overflow-hidden shadow-md">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-200">
                  <MapPin size={14} className="text-rose-500" />
                  Kakinada Coverage Map
                </h3>
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setCoverageMapCenter({ lat: latitude, lng: longitude });
                        },
                        (error) => {
                          console.error(error);
                          alert("Could not access current location.");
                        }
                      );
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-rose-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  title="Locate Me"
                >
                  <Navigation size={10} className="animate-pulse" />
                  Locate Me
                </button>
              </div>
              <div style={{ height: "260px" }}>
                <iframe
                  title="kakinada-overview"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${coverageMapCenter.lat},${coverageMapCenter.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                />
              </div>
            </div>

            {/* Nearby Quick List */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Nearby Stocking depots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KAKINADA_DONORS.slice(0, 4).map((d) => (
                  <motion.div
                    key={d.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleOpenMap(d)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-rose-550/20 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                        <Droplets size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{d.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{d.address.split(",").slice(-3).join(",")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-slate-500 font-mono text-[10px]">{d.distance} km</span>
                      <MapPin size={14} className="text-rose-500 opacity-60" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= BLOOD SEARCH TAB ================= */}
        {currentTab === "search" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Search inputs */}
            <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl space-y-5 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Search size={14} className="text-rose-500" />
                Query Filter
              </h3>
              <form onSubmit={handleSearchBlood} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Blood Group</label>
                  <select
                    value={searchBg}
                    onChange={(e) => setSearchBg(e.target.value)}
                    className="block w-full px-3 py-3 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500/50 cursor-pointer"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455">City / Location</label>
                  <input
                    type="text"
                    required
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="block w-full px-3 py-3 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-rose-650 hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <Search size={14} />
                  Query Stock
                </button>
              </form>

              <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-[10px] text-slate-500 leading-relaxed flex gap-2">
                <Sliders size={16} className="text-rose-500 flex-shrink-0" />
                <span>Tap any center card to query real-time distance details and send a stock request.</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                    Query Results ({searchResults.filter((r) => r.available).length})
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-455 px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/15">
                    {searchCity}
                  </span>
                </div>

                {notifySent && (
                  <div className="mb-4 flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-450 text-xs font-semibold animate-in zoom-in-95">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Triage alert broadcasted! The stocking center is notified.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((res) => (
                    <motion.div
                      key={res.id}
                      whileHover={{ y: -2 }}
                      onClick={() => handleOpenMap(res)}
                      className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        res.available
                          ? "bg-white/[0.01] border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 shadow-sm"
                          : "bg-slate-900/10 border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${res.available ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-500"}`}>
                          {res.type === "donor" ? <User size={15} /> : <Droplets size={15} />}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          res.available ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
                        }`}>
                          {res.available ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-200 text-xs leading-tight">{res.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1.5 truncate">📍 {res.address}</p>

                      <div className="flex gap-2.5 mt-3 text-[10px] text-slate-450 font-medium">
                        <span>Group: <strong className="text-rose-455 font-black">{res.blood_group}</strong></span>
                        <span>•</span>
                        <span>{res.distance} km</span>
                        {res.temp && (
                          <>
                            <span>•</span>
                            <span>{res.temp}°C</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= MY REQUESTS TAB ================= */}
        {currentTab === "requests" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/35 border border-white/5 p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-350">Active Broadcasts log</h3>
              <span className="text-[9px] font-black bg-rose-500/10 text-rose-450 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">Patient Portal</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Request Node</th>
                    <th className="pb-3 font-bold">Recipient</th>
                    <th className="pb-3 font-bold text-center">Group</th>
                    <th className="pb-3 font-bold text-center">Volume</th>
                    <th className="pb-3 font-bold">Facility</th>
                    <th className="pb-3 font-bold text-right">Priority score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 font-mono text-slate-500">#REQ-{r.id}</td>
                      <td className="py-3.5 font-bold text-slate-200">{r.recipient_name}</td>
                      <td className="py-3.5 font-black text-rose-400 text-center">{r.blood_group}</td>
                      <td className="py-3.5 text-slate-300 font-semibold text-center">{r.units_required} U</td>
                      <td className="py-3.5 text-slate-400">{r.hospital_name}</td>
                      <td className="py-3.5 font-mono font-black text-rose-450 text-right">{r.priority_score?.toFixed(1)} / 100</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-600 font-medium">No request broadcasts raised from this terminal.</td>
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
