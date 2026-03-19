//src>pages>VerifyOTPPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import ReactCodesInput from "react-codes-input";

/* ---------- Inline Terms modal (updated) ---------- */
function TermsModal({ open, onAgree }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl text-gray-300 border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-6 border-b border-white/5 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Terms &amp; Conditions
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">Last updated: 18 Aug 2025</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-sm leading-relaxed custom-scrollbar">
          <p className="text-gray-400">
            By tapping <b className="text-white">Agree</b>, you confirm that you have read and accept NovaChain’s
            Terms &amp; Conditions. Key points:
          </p>

          <ol className="list-decimal pl-5 space-y-4 text-gray-400 marker:text-gray-600 marker:font-bold">
            <li>
              <b className="text-gray-200">Terms &amp; Conditions</b> — New user startup requires <b className="text-white">100 USDT</b>.
            </li>
            <li>
              <b className="text-gray-200">Account Security</b>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-500 marker:text-gray-700">
                <li>Do not disclose your password; platform is not responsible for losses caused by disclosure.</li>
                <li>Avoid using birthday, ID number, or phone number as withdrawal/login passwords.</li>
                <li>If you forget your password(s), contact online support to reset.</li>
                <li>Confidentiality agreement applies between user and company.</li>
              </ul>
            </li>
            <li>
              <b className="text-gray-200">Funds</b>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-500 marker:text-gray-700">
                <li>All funds are processed by the system (no manual operations) to avoid losses.</li>
                <li>Accidental loss due to <b className="text-white">NovaChain’s own mistake</b>: the platform takes full responsibility.</li>
              </ul>
            </li>
            <li>
              <b className="text-gray-200">Deposit</b>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-500 marker:text-gray-700">
                <li>Top-up amount is chosen by the user.</li>
                <li>Get and confirm the deposit address from your own trading account before depositing.</li>
                <li>Platform is not responsible for losses caused by an incorrect wallet address entered by the user.</li>
              </ul>
            </li>
            <li>
              <b className="text-gray-200">Withdrawal</b>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-500 marker:text-gray-700">
                <li>First withdrawal for new users: <b className="text-white">$100</b>.</li>
                <li>As you trade more and become an old user: daily limit <b className="text-white">$2,000</b>.</li>
                <li>Withdrawals &gt; <b className="text-white">$10,000</b> require opening a large-channel account for fund safety.</li>
              </ul>
            </li>
            <li>
              <b className="text-gray-200">Hours of Operation</b>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-500 marker:text-gray-700">
                <li>Platform opening hours: <b className="text-white">24/7</b>.</li>
                <li>Online customer service: <b className="text-white">10:00–22:00</b>.</li>
                <li>Withdrawal time: <b className="text-white">09:00–22:00</b> (UTC-4).</li>
                <li>Final interpretation right belongs to <b className="text-white">Novachain LTD</b>.</li>
              </ul>
            </li>
          </ol>

          <p className="text-xs text-gray-500 pt-2 border-t border-white/5">
            Read the full version any time at{" "}
            <a href="/terms" className="text-white font-bold hover:underline transition-all">
              Terms &amp; Conditions
            </a>.
          </p>
        </div>

        <div className="px-6 py-5 border-t border-white/5 shrink-0 flex justify-end bg-black/20">
          <button
            onClick={onAgree}
            className="h-12 px-8 rounded-xl font-black text-sm uppercase tracking-[0.1em] transition-all bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[.98]"
          >
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const pinWrapperRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setResendSuccess("");
    if (!email || otp.length < 6) {
      setError("Enter your email and the 6-digit code.");
      return;
    }
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect OTP. Please try again.");
        setOtp("");
        return;
      }
      setSuccess(data.message || "Email verified!");
      // Instead of navigating to login, open Terms modal immediately
      setShowTerms(true);
    } catch (err) {
      setError("Verification failed. Try again.");
      setOtp("");
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess("");
    setResendLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      } else {
        setResendSuccess("OTP code resent! Check your email.");
        setResendTimer(60);
      }
    } catch (err) {
      setError("Failed to resend code. Try again.");
    }
    setResendLoading(false);
  };

 const onAgree = () => {
   navigate("/", { replace: true }); // go home; nothing stored
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
        {/* Responsive card */}
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

          <h2 className="mt-5 md:mt-8 text-center text-xl md:text-3xl font-extrabold text-white tracking-tight">
            Verify Email
          </h2>
          <p className="text-xs md:text-sm text-gray-400 text-center mt-2 mb-6 md:mb-8 font-medium px-2">
            Enter the 6-digit code sent to <br/><span className="text-white font-bold">{email}</span>
          </p>

          <form onSubmit={handleVerify}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
              className="hidden"
            />

            {/* Premium OTP Input Boxes */}
            <div className="flex justify-center mb-6">
              <ReactCodesInput
                classNameWrapper="flex justify-center gap-2 md:gap-3"
                classNameCodeWrapper="w-11 h-12 md:w-14 md:h-16 flex-none"
                classNameCode="border border-white/10 bg-white/[0.04] rounded-xl text-center text-xl md:text-2xl font-black text-white focus:bg-white/[0.08] focus:border-white/40 focus:outline-none transition-all shadow-inner"
                classNameCodeWrapperFocus="shadow-none"
                initialFocus={true}
                wrapperRef={pinWrapperRef}
                id="pin"
                codeLength={6}
                type="text"
                value={otp}
                onChange={setOtp}
                inputMode="numeric"
                autoFocus
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="w-full mx-auto mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs md:text-sm text-center text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full mx-auto mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs md:text-sm text-center text-emerald-400">
                {success}
              </div>
            )}
            {resendSuccess && (
              <div className="w-full mx-auto mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs md:text-sm text-center text-cyan-400">
                {resendSuccess}
              </div>
            )}

            {/* Submit button */}
            <button
              className="mt-2 w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              type="submit"
              disabled={otp.length < 6 || !email}
            >
              Verify Code
            </button>
          </form>

          {/* Links */}
          <div className="text-center mt-6 space-y-4">
            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resendLoading || resendTimer > 0}
            >
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : resendLoading
                ? "Sending..."
                : "Didn't receive code? Resend"}
            </button>
            <div className="pt-2">
              <Link to="/login" className="group flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors tracking-wide uppercase">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Terms modal */}
      <TermsModal open={showTerms} onAgree={onAgree} />
    </div>
  );
}