import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import {
  LogIn,
  KeyRound,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  User as UserIcon,
  ArrowLeft,
  Eye,
  EyeOff,
  Brain,
  Activity,
  ShieldCheck
} from "lucide-react";

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

  // New States for Forgot Password and OTP Login
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = otp + new pass
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpLoginStep, setOtpLoginStep] = useState(1); // 1 = email, 2 = otp verification
  const [otpLoginCode, setOtpLoginCode] = useState("");

  // UI state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync mode state with query parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsRegister(mode === "register");
    setIsForgotPassword(false);
    setIsOtpLogin(false);
    setForgotStep(1);
    setOtpLoginStep(1);
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
        name: fullName,
        email,
        phone,
        password,
        role: registerRole
      });
      setSuccessMessage("Account created successfully! Switching to login...");
      setTimeout(() => {
        toggleMode(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.forgotPassword(email);
      setSuccessMessage("OTP verification code has been sent to your registered contact! (Use 123456 for evaluation)");
      setForgotStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.resetPassword(email, forgotOtp, newPassword);
      setSuccessMessage("Your password has been reset successfully! Please sign in with your new password.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotStep(1);
        setForgotOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Login Handlers ---
  const handleSendOtpLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.sendOtpLogin(email);
      setSuccessMessage("OTP login code sent! (Use 123456 for evaluation)");
      setOtpLoginStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpLoginCode) {
      setError("Please enter the verification OTP");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await api.verifyOtpLogin(email, otpLoginCode);
      const user = await api.getCurrentUser();
      onLoginSuccess(user.role);
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
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

  const [visibleMode, setVisibleMode] = useState("login");

  const targetMode = isRegister
    ? 'register'
    : isForgotPassword
      ? 'forgot'
      : isOtpLogin
        ? 'otp'
        : 'login';

  const isFlipped = targetMode !== 'login';

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleMode(targetMode);
    }, 250);
    return () => clearTimeout(timer);
  }, [targetMode]);

  return (
    <div className="min-h-screen bg-[#050814] flex selection:bg-rose-500 selection:text-white relative overflow-hidden">

      {/* Decorative moving blur backgrounds */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 font-bold transition-all cursor-pointer select-none z-50"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* ================= SPLIT LAYOUT ================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 h-screen max-h-screen overflow-y-auto">

        {/* Left Side: Medical Illustration & Brand Highlights */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#030610] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden select-none">
          <div className="space-y-6 z-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img
                src="/logo.png"
                alt="LIFE CARE Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-extrabold text-xl text-slate-100 uppercase tracking-wider">LIFE CARE</span>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Operations Terminal</span>
              <h2 className="text-3xl font-black tracking-tight leading-tight text-slate-200">
                Securing Blood Stocks <br />
                With AI Forecasting.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Access your personalized node dashboard to schedule voluntary blood typing appointments, broadcast emergency SOS orders, or monitor regional inventory levels.
              </p>
            </div>
          </div>

          <div className="space-y-4 z-10">
            {[
              { title: "Universal Donor Matrix", desc: "Prioritizes group matches and routes dispatches.", icon: Brain },
              { title: "Geolocated Route Maps", desc: "Calculates live transit delay parameters.", icon: Activity },
              { title: "Cryptographic Authorization", desc: "Secures donor profile credentials.", icon: ShieldCheck }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                  <div className="p-2 bg-rose-550/10 text-rose-500 rounded-xl h-fit">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-none">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-slate-600 font-medium z-10 border-t border-white/5 pt-4">
            &copy; {new Date().getFullYear()} LIFE CARE AI Infrastructure. Designed for Final Year B.Tech Academic Showcase.
          </p>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">

          {/* Brand Logo header for mobile */}
          <div className="lg:hidden text-center space-y-4 flex flex-col items-center select-none mb-6">
            <img
              src="/logo.png"
              alt="LIFE CARE Logo"
              className="h-20 w-auto object-contain"
              style={{ filter: "drop-shadow(0px 2px 8px rgba(153, 27, 27, 0.5))" }}
            />
          </div>

          {/* Form Headings */}
          <div className="text-center space-y-2 select-none w-full max-w-md mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
              {isRegister
                ? "Create your account"
                : isForgotPassword
                  ? "Reset your password"
                  : isOtpLogin
                    ? "OTP Sign In"
                    : step === 1
                      ? "Sign in to your account"
                      : "Security Verification"}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isRegister
                ? "Fill in the details to join the AI Powered Smart Blood Bank"
                : isForgotPassword
                  ? "Enter your email to verify and reset your credentials"
                  : isOtpLogin
                    ? "Enter your registered email to receive a login OTP"
                    : step === 1
                      ? "Enter credentials or use the evaluator quick links below"
                      : "Verify your session via 2-Factor Authentication"}
            </p>
          </div>

          {/* Form Card Container */}
          <div className="w-full max-w-md px-4 sm:px-0">
            <div className={`relative py-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] rounded-3xl border border-white/10 backdrop-blur-2xl bg-slate-900/35 overflow-hidden flip-card-container ${isFlipped ? 'flip-card-flipped' : ''}`}>
              {/* Glowing border outline overlay */}
              <div className="absolute inset-0 border border-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

              {/* Unified Content Wrapper rotating back to unmirror text */}
              <div className={`space-y-6 ${isFlipped ? 'flip-card-back' : ''}`}>

                {/* Unified segment pill tabs for Login / Register */}
                <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${!isRegister && !isForgotPassword && !isOtpLogin
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-extrabold"
                        : "text-slate-450 hover:text-slate-200 hover:bg-white/[0.02]"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${isRegister
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-extrabold"
                        : "text-slate-450 hover:text-slate-200 hover:bg-white/[0.02]"
                      }`}
                  >
                    Register
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs font-semibold animate-shake">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-3.5 rounded-2xl text-xs font-semibold">
                    {successMessage}
                  </div>
                )}

                {visibleMode === "register" ? (
                  /* ================= REGISTER FORM ================= */
                  <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <UserIcon size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Phone Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                          placeholder="+919999999901"
                        />
                      </div>
                    </div>

                    {/* Account Type / Role */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Account Type</label>
                      <select
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        className="block w-full px-3.5 py-3 glass-input glass-select text-sm cursor-pointer focus:outline-none"
                      >
                        <option value="donor">Donor (Blood Donation)</option>
                        <option value="patient">Patient (Needs Blood)</option>
                        <option value="hospital">Hospital Facility</option>
                        <option value="bloodbank">Blood Bank / Depot</option>
                      </select>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-3 glass-input text-sm focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Confirm Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-3 glass-input text-sm focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Register Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>
                ) : visibleMode === "forgot" ? (
                  /* ================= FORGOT PASSWORD FORM ================= */
                  forgotStep === 1 ? (
                    <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <Mail size={16} />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="name@company.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(false)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Back to credentials
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {loading ? "Sending OTP..." : "Send Verification OTP"}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleResetPasswordSubmit}>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">OTP Code</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <KeyRound size={16} />
                          </span>
                          <input
                            type="text"
                            required
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="123456"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">New Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <Lock size={16} />
                          </span>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Confirm New Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <Lock size={16} />
                          </span>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {loading ? "Resetting Password..." : "Reset Password"}
                      </button>
                    </form>
                  )
                ) : visibleMode === "otp" ? (
                  /* ================= OTP LOGIN FORM ================= */
                  otpLoginStep === 1 ? (
                    <form className="space-y-5" onSubmit={handleSendOtpLoginSubmit}>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <Mail size={16} />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="name@company.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsOtpLogin(false)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Back to Password Login
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {loading ? "Sending OTP..." : "Request Login OTP"}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleVerifyOtpLoginSubmit}>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Enter Verification OTP</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                            <KeyRound size={16} />
                          </span>
                          <input
                            type="text"
                            required
                            value={otpLoginCode}
                            onChange={(e) => setOtpLoginCode(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                            placeholder="123456"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </button>
                    </form>
                  )
                ) : step === 1 ? (
                  /* ================= LOGIN FORM (STEP 1) ================= */
                  <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    {/* Toggle tabs (Password vs OTP) */}
                    <div className="flex bg-white/[0.02] p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => { setIsOtpLogin(false); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${!isOtpLogin
                            ? "bg-rose-600/20 text-rose-450 border border-rose-500/20"
                            : "text-slate-500 hover:text-slate-400 border border-transparent"
                          }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsOtpLogin(true); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${isOtpLogin
                            ? "bg-rose-600/20 text-rose-455 border border-rose-500/20"
                            : "text-slate-500 hover:text-slate-400 border border-transparent"
                          }`}
                      >
                        OTP Login
                      </button>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setError("");
                            setSuccessMessage("");
                          }}
                          className="text-xs text-rose-500 hover:text-rose-400 font-semibold focus:outline-none cursor-pointer"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-3 glass-input text-sm focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me checkbox */}
                    <div className="flex items-center justify-between py-1 select-none">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/10 text-rose-600 bg-slate-950 focus:ring-rose-500 cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400 cursor-pointer">
                          Remember me
                        </label>
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer animate-in fade-in"
                    >
                      {loading ? "Verifying..." : "Sign In"}
                    </button>
                  </form>
                ) : (
                  /* ================= OTP VERIFICATION (STEP 2) ================= */
                  <form className="space-y-5" onSubmit={handleOtpSubmit}>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-3.5 rounded-2xl text-xs leading-relaxed">
                      <span className="font-bold flex items-center gap-1.5 mb-1 text-emerald-400">
                        <CheckCircle2 size={14} /> Verification Code Sent!
                      </span>
                      We sent a 2-factor OTP to your phone. For evaluation, enter <strong className="underline">123456</strong>.
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        2FA Verification Code (OTP)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                          <KeyRound size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 glass-input text-sm text-center font-mono tracking-[0.25em] focus:outline-none"
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
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Checking..." : "Verify Code"}
                    </button>
                  </form>
                )}

                {/* Quick Demo Autofill section */}
                {!isRegister && step === 1 && !isForgotPassword && !isOtpLogin && (
                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3.5 text-center">
                      Quick Evaluator Autofill
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: "admin", label: "Admin" },
                        { id: "hospital", label: "Hosp" },
                        { id: "bloodbank", label: "Bank" },
                        { id: "donor", label: "Donor" },
                        { id: "patient", label: "Pat" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => autofill(item.id)}
                          className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${selectedRole === item.id
                              ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20"
                              : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
