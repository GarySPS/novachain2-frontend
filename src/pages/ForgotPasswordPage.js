//src>pages>ForgotPasswordPage.js

import React, { useState } from "react";
import { MAIN_API_BASE } from '../config';
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp+password, 3: done
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async e => {
    e.preventDefault();
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setStep(2);
        setMsg("OTP sent to your email.");
      } else {
        setErr(data.error || "Failed to send OTP.");
      }
    } catch {
      setLoading(false);
      setErr("Network error.");
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPw = async e => {
    e.preventDefault();
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPw })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setStep(3);
        setMsg("Password changed! You can now log in.");
      } else {
        setErr(data.error || "Failed to reset password.");
      }
    } catch {
      setLoading(false);
      setErr("Network error.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg("OTP resent to your email.");
      } else {
        setErr(data.error || "Failed to resend OTP.");
      }
    } catch {
      setLoading(false);
      setErr("Network error.");
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center px-4 py-10 md:py-14"
      style={{
        backgroundImage: 'url("/novachain.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 w-full">
        {/* Responsive card - matching Login/Signup */}
        <div className="mx-auto w-full max-w-[400px] md:max-w-[480px] rounded-[2rem] bg-[#0a0a0a]/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 px-5 py-6 md:px-10 md:py-10">
          
          {/* Video Header */}
          <div className="w-full h-28 md:h-40 rounded-2xl overflow-hidden shadow-inner border border-white/10">
            <video
              src="/login.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title - Dynamic based on step */}
          <h2 className="mt-5 md:mt-8 text-center text-xl md:text-3xl font-extrabold text-white tracking-tight">
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter Verification"}
            {step === 3 && "Password Changed"}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 text-center mt-2 mb-6 font-medium">
            {step === 1 && "Enter your email to receive an OTP."}
            {step === 2 && "Check your email for the reset code."}
            {step === 3 && "Your account is secure."}
          </p>

          {/* --- Step 1: Email --- */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 md:space-y-5">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full h-12 md:h-14 rounded-xl px-4 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                autoFocus
              />

              {err && (
                <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs md:text-sm text-center text-red-400">
                  {err}
                </div>
              )}
              {msg && (
                <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs md:text-sm text-center text-emerald-400">
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-2 w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* --- Step 2: OTP + new password --- */}
          {step === 2 && (
            <form onSubmit={handleResetPw} className="space-y-4 md:space-y-5">
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP code"
                className="w-full h-12 md:h-14 rounded-xl px-4 text-center tracking-widest bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner font-mono"
                autoFocus
                maxLength={8}
              />
              
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  placeholder="New password"
                  className="w-full h-12 md:h-14 rounded-xl px-4 pr-16 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all shadow-sm"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors tracking-wide uppercase disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              {(err || msg) && (
                <div className={`w-full rounded-lg border ${err ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'} px-3 py-2 text-xs md:text-sm text-center`}>
                  {err || msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otp || !newPw}
                className="mt-2 w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* --- Step 3: Done --- */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center shadow-inner">
                <p className="text-emerald-400 font-black text-lg">{msg}</p>
              </div>
              
              <button
                onClick={() => navigate("/login")}
                className="w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Back to Login Link (except on step 3) */}
          {step !== 3 && (
            <div className="mt-6 flex justify-center">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors tracking-wide uppercase"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}