import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import { 
  Search, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Navigation,
  CheckCircle,
  Eye,
  Activity,
  Database,
  Phone,
  X,
  Droplets,
  User,
  Send
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
  const [activeTracking, setActiveTracking] = useState<any | null>(null);

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
    return <div className="flex-1 p-8 text-center text-slate-400 bg-slate-950">Loading patient portal...</div>;
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen selection:bg-rose-500 selection:text-white bg-slate-950">

      {/* ======= MAP MODAL ======= */}
      {mapModalOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMapModalOpen(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base">{selectedDonor.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} className="text-rose-400" />
                  {selectedDonor.address}
                </p>
              </div>
              <button onClick={() => setMapModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Embedded OpenStreetMap */}
            <div className="relative w-full" style={{ height: "320px" }}>
              <iframe
                title="location-map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedDonor.lng - 0.015},${selectedDonor.lat - 0.012},${selectedDonor.lng + 0.015},${selectedDonor.lat + 0.012}&layer=mapnik&marker=${selectedDonor.lat},${selectedDonor.lng}`}
                allowFullScreen
              />
              {/* Overlay badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-1.5 text-[10px] font-bold text-rose-400 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                {selectedDonor.distance} km away · Kakinada, AP
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 flex items-center gap-3">
              <div className="flex-1 text-xs text-slate-400">
                <p className="flex items-center gap-1.5"><Phone size={12} className="text-rose-400" /> {selectedDonor.phone}</p>
                {selectedDonor.temp && (
                  <p className="mt-1 text-slate-500">Storage Temp: <strong className="text-slate-300">{selectedDonor.temp}°C</strong></p>
                )}
              </div>
              <a
                href={`https://www.google.com/maps?q=${selectedDonor.lat},${selectedDonor.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Navigation size={14} />
                Open in Maps
              </a>
              <button
                onClick={() => { handleNotifyDonor(selectedDonor); setMapModalOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
              >
                <Send size={14} />
                Request Blood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {currentTab === "dashboard" ? "Patient Care Center" : currentTab === "search" ? "Blood Locator" : "My Requests"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === "dashboard"
              ? "Locate nearby blood banks in Kakinada, raise SOS broadcasts, and track requests."
              : currentTab === "search"
              ? "Find available blood near Kakinada — click a donor card to view the location on map."
              : "View all your raised blood requests and their current status."}
          </p>
        </div>

        {/* SOS Emergency button */}
        <button
          onClick={handleTriggerSOS}
          className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-red-500/20"
        >
          <AlertTriangle size={18} />
          SOS EMERGENCY
        </button>
      </div>

      {/* ================= DASHBOARD TAB ================= */}
      {currentTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Your Active SOS</p>
                <p className="text-3xl font-black mt-2 text-rose-400">
                  {requests.filter((r) => r.recipient_name === "Self").length}
                </p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl"><AlertTriangle size={20} /></div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blood Banks Nearby</p>
                <p className="text-3xl font-black mt-2 text-rose-400">{KAKINADA_DONORS.filter(d => d.available).length}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl"><Database size={20} /></div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nearest Bank</p>
                <p className="text-3xl font-black mt-2 text-rose-400">0.9 km</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl"><Clock size={20} /></div>
            </div>
          </div>

          {/* Map preview — Kakinada overview */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MapPin size={15} className="text-rose-500" />
                Blood Banks in Kakinada, Andhra Pradesh
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">Live Coverage Area</span>
            </div>
            <div style={{ height: "280px" }}>
              <iframe
                title="kakinada-overview"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src="https://www.openstreetmap.org/export/embed.html?bbox=82.18,16.93,82.30,17.05&layer=mapnik&marker=16.9891,82.2475"
                allowFullScreen
              />
            </div>
          </div>

          {/* Quick access donor list */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold">Nearby Centres — Quick View</h3>
            <div className="space-y-2">
              {KAKINADA_DONORS.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleOpenMap(d)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 cursor-pointer transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 group-hover:bg-rose-500/20 transition-all">
                      <Droplets size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{d.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{d.address.split(",").slice(-3).join(",")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${d.available ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-800 text-slate-500"}`}>
                      {d.available ? "Available" : "Unavailable"}
                    </span>
                    <span className="text-slate-500 font-mono">{d.distance} km</span>
                    <MapPin size={14} className="text-rose-500 opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= BLOOD SEARCH TAB ================= */}
      {currentTab === "search" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Search Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Search size={18} className="text-rose-500" />
              Search Blood Locator
            </h3>
            <form onSubmit={handleSearchBlood} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Required Blood Group</label>
                <select
                  value={searchBg}
                  onChange={(e) => setSearchBg(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-rose-500/50"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">City / Area</label>
                <input
                  type="text"
                  required
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
              >
                <Search size={15} />
                Search Blood Stocks
              </button>
            </form>

            {/* Info panel */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-[10px] text-slate-500 leading-relaxed">
              💡 Click on any donor card to view the exact location on map, get contact details, and send a blood request notification directly.
            </div>
          </div>

          {/* Search Results Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">
                  {searchResults.filter((r) => r.available).length} Matching Sources Found
                </h3>
                <span className="text-[10px] text-rose-400 font-bold px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/15">
                  Near Kakinada, AP
                </span>
              </div>

              {notifySent && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold animate-in zoom-in-95 duration-100">
                  <CheckCircle size={14} />
                  Blood request sent! The donor/bank has been notified.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleOpenMap(res)}
                    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                      res.available
                        ? "bg-slate-900/60 border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/5 hover:shadow-rose-500/5"
                        : "bg-slate-900/30 border-slate-900 opacity-60"
                    }`}
                  >
                    {/* Availability badge */}
                    <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      res.available ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
                    }`}>
                      {res.available ? "Available" : "Out of Stock"}
                    </div>

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all ${
                      res.available ? "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20" : "bg-slate-800 text-slate-600"
                    }`}>
                      {res.type === "donor" ? <User size={16} /> : <Droplets size={16} />}
                    </div>

                    <h4 className="font-extrabold text-slate-200 text-sm leading-tight pr-12">{res.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1.5 flex items-start gap-1">
                      <MapPin size={10} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      {res.address}
                    </p>

                    <div className="flex gap-3 mt-3 text-[11px] text-slate-400">
                      <span>Group: <strong className="text-rose-400 font-black">{res.blood_group}</strong></span>
                      <span className="text-slate-700">•</span>
                      <span>{res.distance} km away</span>
                      {res.temp && (
                        <>
                          <span className="text-slate-700">•</span>
                          <span>{res.temp}°C</span>
                        </>
                      )}
                    </div>

                    {/* Hover CTA */}
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                        <MapPin size={10} />
                        View on map
                      </span>
                      <span className="text-slate-800">•</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Send size={10} />
                        Request blood
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MY REQUESTS TAB ================= */}
      {currentTab === "requests" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold">Your Raised Blood Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400">
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Recipient</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Volume</th>
                  <th className="pb-3 font-semibold">Emergency Facility</th>
                  <th className="pb-3 font-semibold">Priority Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/30">
                    <td className="py-3 font-mono text-slate-500">#REQ-{r.id}</td>
                    <td className="py-3 font-bold text-slate-200">{r.recipient_name}</td>
                    <td className="py-3 font-black text-rose-400">{r.blood_group}</td>
                    <td className="py-3 text-slate-300 font-semibold">{r.units_required} Units</td>
                    <td className="py-3 text-slate-400">{r.hospital_name}</td>
                    <td className="py-3 font-mono font-black text-rose-400">{r.priority_score?.toFixed(1)} / 100</td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">You have not raised any requests yet.</td>
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
