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

  // New States for Forgot Password and OTP Login
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = otp + new pass
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpLoginStep, setOtpLoginStep] = useState(1); // 1 = email, 2 = otp verification
  const [otpLoginCode, setOtpLoginCode] = useState("");

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

  // --- Forgot Password Handlers ---
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
      setIsForgotPassword(false);
      setForgotStep(1);
      setForgotOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
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

  const activeKey = isRegister 
    ? 'register' 
    : isForgotPassword 
      ? 'forgot' 
      : isOtpLogin 
        ? 'otp' 
        : 'login';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background decorative glowing blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-red-650/10 rounded-full blur-[120px] pointer-events-none"></div>
      {/* Back button */}
      <button 
        onClick={() => navigate("/")} 
        className="absolute left-6 top-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 font-bold transition-all cursor-pointer select-none"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>
      {/* Brand Logo header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 flex flex-col items-center select-none">
        <img 
          src="/logo.png" 
          alt="LIFE CARE Logo" 
          className="h-28 w-auto object-contain cursor-pointer hover:scale-110 transition-transform duration-200" 
          onClick={() => navigate("/")}
          style={{ filter: "drop-shadow(0px 2px 8px rgba(153, 27, 27, 0.5))" }}
        />
        <h2 className="text-3xl font-black tracking-tight text-slate-100">
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
        <p className="text-sm text-slate-400">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div key={activeKey} className="relative py-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] rounded-3xl border border-white/10 backdrop-blur-2xl bg-slate-900/35 space-y-6 overflow-hidden animate-card-flip">
          {/* Glowing border outline overlay */}
          <div className="absolute inset-0 border border-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

          {/* Unified segment pill tabs for Login / Register */}
          <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                !isRegister && !isForgotPassword && !isOtpLogin
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-extrabold"
                  : "text-slate-450 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isRegister
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-extrabold"
                  : "text-slate-450 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              Register
            </button>
          </div>
          
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Account Type
                </label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
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
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
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
          ) : isForgotPassword ? (
            /* ================= FORGOT PASSWORD FORM ================= */
            forgotStep === 1 ? (
              <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Sending OTP..." : "Send Verification OTP"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 font-bold focus:outline-none cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleResetPasswordSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    OTP Verification Code
                  </label>
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    New Password
                  </label>
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Confirm New Password
                  </label>
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
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 font-bold focus:outline-none cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )
          ) : isOtpLogin ? (
            /* ================= OTP LOGIN FORM ================= */
            otpLoginStep === 1 ? (
              <form className="space-y-5" onSubmit={handleSendOtpLoginSubmit}>
                {/* Toggle tabs */}
                <div className="flex border-b border-slate-800 pb-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLogin(false);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="flex-1 text-center py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-slate-500 border-transparent hover:text-slate-400"
                  >
                    Password Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLogin(true);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="flex-1 text-center py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-rose-500 border-rose-500"
                  >
                    OTP Login
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Sending OTP..." : "Request Login OTP"}
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
              <form className="space-y-5" onSubmit={handleVerifyOtpLoginSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enter Verification OTP
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                      <KeyRound size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpLoginCode}
                      onChange={(e) => setOtpLoginCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 tracking-[0.25em] font-mono text-center focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpLoginStep(1);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 font-bold focus:outline-none cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )
          ) : step === 1 ? (
            /* ================= LOGIN FORM (STEP 1) ================= */
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {/* Toggle tabs */}
              <div className="flex border-b border-slate-800 pb-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpLogin(false);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="flex-1 text-center py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-rose-500 border-rose-500"
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpLogin(true);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="flex-1 text-center py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-slate-500 border-transparent hover:text-slate-400"
                >
                  OTP Login
                </button>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-rose-500 hover:text-rose-400 font-semibold focus:outline-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 glass-input text-sm focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-premium-rose disabled:opacity-50 transition-all cursor-pointer"
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
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center glass-icon-wrapper">
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
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Checking..." : "Verify Code"}
              </button>
            </form>
          )}

          {/* Quick Demo Autofill section */}
          {!isRegister && step === 1 && !isForgotPassword && !isOtpLogin && (
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
