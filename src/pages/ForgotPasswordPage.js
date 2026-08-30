//src>pages>ForgotPasswordPage.js

import React, { useState } from "react";
import { MAIN_API_BASE } from '../config';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
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
        setMsg(t("otp_sent_to_email") || "OTP sent to your email.");
      } else {
        setErr(data.error || t("failed_to_send_otp") || "Failed to send OTP.");
      }
    } catch {
      setLoading(false);
      setErr(t("network_error") || "Network error.");
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
        setMsg(t("password_changed_success") || "Password changed! You can now log in.");
      } else {
        setErr(data.error || t("failed_to_reset_password") || "Failed to reset password.");
      }
    } catch {
      setLoading(false);
      setErr(t("network_error") || "Network error.");
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
        setMsg(t("otp_resent_email") || "OTP resent to your email.");
      } else {
        setErr(data.error || t("failed_to_resend_otp") || "Failed to resend OTP.");
      }
    } catch {
      setLoading(false);
      setErr(t("network_error") || "Network error.");
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
            {step === 1 && (t("reset_password_title") || "Reset Password")}
            {step === 2 && (t("enter_verification_title") || "Enter Verification")}
            {step === 3 && (t("password_changed_title") || "Password Changed")}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 text-center mt-2 mb-6 font-medium">
            {step === 1 && (t("enter_email_for_otp") || "Enter your email to receive an OTP.")}
            {step === 2 && (t("check_email_for_code") || "Check your email for the reset code.")}
            {step === 3 && (t("account_secure") || "Your account is secure.")}
          </p>

          {/* --- Step 1: Email --- */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 md:space-y-5">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={t("enter_email_address") || "Enter your email address"}
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
                {loading ? (t("sending") || "Sending...") : (t("send_reset_code") || "Send Reset Code")}
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
                placeholder={t("enter_6_digit_otp") || "Enter 6-digit OTP code"}
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
                  placeholder={t("new_password_placeholder") || "New password"}
                  className="w-full h-12 md:h-14 rounded-xl px-4 pr-16 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all shadow-sm"
                >
                  {showPwd ? (t("hide") || "Hide") : (t("show") || "Show")}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors tracking-wide uppercase disabled:opacity-50"
                >
                  {t("resend_otp_btn") || "Resend OTP"}
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
                {loading ? (t("updating") || "Updating...") : (t("reset_password_btn") || "Reset Password")}
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
                {t("go_to_login") || "Go to Login"}
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
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> {t("back_to_login") || "Back to login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}