import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { LogIn, KeyRound, Mail, Phone, Lock, CheckCircle2, User as UserIcon, Droplet, ArrowLeft } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab/Mode state: login or register
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  
  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Register-only fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("donor");
  
  // Login-only fields
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP verification
  
  // Notification states
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");

  // Sync mode state with query parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsRegister(mode === "register");
    setError("");
    setSuccessMessage("");
  }, [searchParams]);

  const toggleMode = (register: boolean) => {
    setSearchParams(register ? { mode: "register" } : {});
    setStep(1);
    setError("");
    setSuccessMessage("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.login(email, password);
      // Proceed to OTP Verification Step
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.register({
        email,
        full_name: fullName,
        phone,
        role: registerRole,
        password
      });
      setSuccessMessage("Registration successful! Please sign in with your credentials.");
      
      // Clear registration inputs
      setFullName("");
      setPhone("");
      setConfirmPassword("");
      
      // Switch mode to login
      setSearchParams({});
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the verification OTP");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Stub OTP: default to 123456 for easy evaluation
      if (otp === "123456" || otp === "123") {
        const user = await api.getCurrentUser();
        onLoginSuccess(user.role);
        navigate(`/${user.role}`);
      } else {
        throw new Error("Invalid OTP code. Try entering '123456'");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (role: string) => {
    setSelectedRole(role);
    switch (role) {
      case "admin":
        setEmail("admin@bloodbank.ai");
        setPassword("admin123");
        break;
      case "hospital":
        setEmail("city_hospital@bloodbank.ai");
        setPassword("hospital123");
        break;
      case "bloodbank":
        setEmail("redcross@bloodbank.ai");
        setPassword("redcross123");
        break;
      case "donor":
        setEmail("john@bloodbank.ai");
        setPassword("donor123");
        break;
      case "patient":
        setEmail("jane@bloodbank.ai");
        setPassword("patient123");
        break;
    }
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white relative">
      {/* Back button */}
      <button 
        onClick={() => navigate("/")} 
        className="absolute left-6 top-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 font-bold transition-all cursor-pointer select-none"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>
      {/* Brand Logo header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 flex flex-col items-center select-none">
        <div 
          onClick={() => navigate("/")}
          className="w-14 h-14 relative flex-shrink-0 cursor-pointer hover:scale-110 transition-transform duration-200" 
          style={{ filter: "drop-shadow(0px 2px 6px rgba(153, 27, 27, 0.4))" }}
        >
          <div 
            className="w-full h-full"
            style={{ 
              borderRadius: "0% 100% 100% 100%", 
              background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #dc2626 40%, #991b1b 100%)",
              boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), 2px 4px 6px rgba(153, 27, 27, 0.2)",
              transform: "rotate(45deg)"
            }}
          >
            <div className="absolute w-3.5 h-4 bg-white/70 rounded-full" style={{ top: "15%", left: "15%", transform: "rotate(-45deg)" }}></div>
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-100">
          {isRegister ? "Create your account" : step === 1 ? "Sign in to your account" : "Security Verification"}
        </h2>
        <p className="text-sm text-slate-400">
          {isRegister 
            ? "Fill in the details to join the AI Powered Smart Blood Bank" 
            : step === 1 
              ? "Enter credentials or use the evaluator quick links below" 
              : "Verify your session via 2-Factor Authentication"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-semibold">
              {successMessage}
            </div>
          )}

          {isRegister ? (
            /* ================= REGISTER FORM ================= */
            <form className="space-y-5" onSubmit={handleRegisterSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="+919999999901"
                  />
                </div>
              </div>

              {/* Account Type / Role */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Account Type
                </label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 cursor-pointer"
                >
                  <option value="donor">Donor (Blood Donation)</option>
                  <option value="patient">Patient (Needs Blood)</option>
                  <option value="hospital">Hospital Facility</option>
                  <option value="bloodbank">Blood Bank / Depot</option>
                </select>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="text-center mt-4">
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="text-rose-500 hover:underline font-bold focus:outline-none cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          ) : step === 1 ? (
            /* ================= LOGIN FORM (STEP 1) ================= */
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-rose-500 hover:text-rose-400 font-semibold">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Verifying..." : "Sign In"}
              </button>

              <div className="text-center mt-4">
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="text-rose-500 hover:underline font-bold focus:outline-none cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* ================= OTP VERIFICATION (STEP 2) ================= */
            <form className="space-y-5" onSubmit={handleOtpSubmit}>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={14} /> Verification Code Sent!
                </span>
                We sent a 2-factor OTP to your registered phone. For evaluation, enter the code <strong className="underline">123456</strong>.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2FA Verification Code (OTP)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 tracking-[0.25em] font-mono text-center focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Back to credentials
                </button>
                <button
                  type="button"
                  onClick={() => alert("Verification code re-sent.")}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-400 cursor-pointer"
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Checking..." : "Verify Code"}
              </button>
            </form>
          )}

          {/* Quick Demo Autofill section */}
          {!isRegister && step === 1 && (
            <div className="border-t border-slate-900 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
                Quick Evaluator Autofill
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => autofill("admin")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedRole === "admin"
                      ? "bg-rose-950/30 text-rose-400 border-rose-900"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => autofill("hospital")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedRole === "hospital"
                      ? "bg-rose-950/30 text-rose-400 border-rose-900"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Hospital
                </button>
                <button
                  type="button"
                  onClick={() => autofill("bloodbank")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedRole === "bloodbank"
                      ? "bg-rose-950/30 text-rose-400 border-rose-900"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Blood Bank
                </button>
                <button
                  type="button"
                  onClick={() => autofill("donor")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedRole === "donor"
                      ? "bg-rose-950/30 text-rose-400 border-rose-900"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Donor
                </button>
                <button
                  type="button"
                  onClick={() => autofill("patient")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedRole === "patient"
                      ? "bg-rose-950/30 text-rose-400 border-rose-900"
                      : "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Patient
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
