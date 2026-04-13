//src>pages>SignUpPage.js

import { useAppKit } from '@reown/appkit/react';
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import { useTranslation } from "react-i18next";
import { useAccount } from 'wagmi';

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signupMethod, setSignupMethod] = useState("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [codeStage, setCodeStage] = useState(false);
  const [memberCode, setMemberCode] = useState(["", "", "", "", ""]);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const { t } = useTranslation();

  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  // Listen for successful Web3 connection
  useEffect(() => {
    const handleWeb3Login = async () => {
      if (isConnected && address) {
        try {
          const res = await fetch(`${MAIN_API_BASE}/auth/web3-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: address }),
          });
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Web3 Login failed");
            return;
          }

          if (data.token) localStorage.setItem("token", data.token);
          if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/wallet");
        } catch {
          setError("Web3 Login error. Please try again.");
        }
      }
    };

    handleWeb3Login();
  }, [isConnected, address, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const finalEmail = signupMethod === "email" ? email : "";
    const finalPhone = signupMethod === "phone" ? phoneNumber : "";

    if (signupMethod === "phone" && codeStage && memberCode.join("").length !== 5) {
      setError("Please enter your 5-digit member code.");
      return;
    }

    if (!finalEmail && !finalPhone) {
      setError("Please provide your contact information.");
      return;
    }
    
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email: finalEmail,
          phoneNumber: finalPhone,
          memberCode: codeStage ? memberCode.join("") : null
        }),
      });
      const data = await res.json();

      if (res.status === 409 && data.unverified) {
        if (email) {
          setSuccess("Unverified email. New OTP sent.");
          setTimeout(() => navigate("/verify-otp", { state: { email } }), 1200);
        } else {
          setSuccess("Account creating pending.");
        }
        return;
      }
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      if (email) {
        setSuccess("OTP code sent to your email.");
        setTimeout(() => navigate("/verify-otp", { state: { email } }), 1200);
      } else {
        if (signupMethod === "phone" && !codeStage) {
          setSuccess("Phone registered. Please enter Telegram verification code.");
          setCodeStage(true);
        } else {
          setSuccess("Code submitted. Waiting for verification.");
        }
      }
    } catch {
      setError("Signup failed. Please try again.");
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...memberCode];
    newCode[index] = value;
    setMemberCode(newCode);

    if (value && index < 4) {
      document.getElementById(`code-${index + 1}`)?.focus();
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
      {/* Dark overlay to make the glass card pop against the background */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 w-full">
        {/* Responsive card - matching Login */}
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

          {/* Title */}
          <h2 className="mt-4 md:mt-6 text-center text-xl md:text-3xl font-extrabold tracking-tight text-slate-100">
            {t("create_account_title")}
          </h2>

          {/* Web3 Button */}
          <button
            type="button"
            onClick={() => open()}
            className="mt-4 md:mt-6 w-full h-11 md:h-12 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3 transition-all shadow-sm text-sm md:text-base"
          >
            <img 
              src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg" 
              alt="WalletConnect" 
              className="w-4 h-4 md:w-5 md:h-5 drop-shadow-md" 
            />
            {t("connect_web3_wallet")}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">{t("or")}</span>
            <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Compact Form */}
          <form onSubmit={handleSignUp} className="space-y-4 md:space-y-5">
            
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t("username")}
              className="w-full h-12 md:h-14 rounded-xl px-4 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
            />

            {/* Email / Phone Toggle Tab - Premium UI Update */}
            <div className="space-y-4">
              <div className="flex bg-white/[0.04] p-1.5 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSignupMethod("email")}
                  className={`flex-1 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                    signupMethod === "email" 
                      ? "bg-white text-black shadow-md" 
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t("email")}
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod("phone")}
                  className={`flex-1 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                    signupMethod === "phone" 
                      ? "bg-white text-black shadow-md" 
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t("telegram")}
                </button>
              </div>

              {/* Dynamic Input */}
              {signupMethod === "email" ? (
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_address")}
                  className="w-full h-12 md:h-14 rounded-xl px-4 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
              ) : (
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("phone_number")}
                  className="w-full h-12 md:h-14 rounded-xl px-4 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
              )}
            </div>

            {signupMethod === "phone" && codeStage && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  <p className="...">{t("enter_telegram_code")}</p>
                </p>
                <div className="flex gap-2 justify-between">
                  {[0,1,2,3,4].map((i) => (
                    <input
                      key={i}
                      id={`code-${i}`}
                      type="text"
                      maxLength="1"
                      value={memberCode[i]}
                      onChange={(e)=>handleCodeChange(i,e.target.value)}
                      className="w-full h-12 md:h-14 text-center text-xl font-black rounded-xl bg-white/[0.04] text-white border border-white/10 focus:border-white/40 focus:bg-white/[0.08] focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Password fields with show/hide toggles */}
            <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t("password")}
                  className="w-full h-12 md:h-14 rounded-xl px-4 pr-16 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all shadow-sm"
                >
                  {showPwd ? t("hide") : t("show")}
                </button>
              </div>

              <div className="relative w-full">
                <input
                  id="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t("confirm_password")}
                  className="w-full h-12 md:h-14 rounded-xl px-4 pr-16 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all shadow-sm"
                >
                  {showConfirmPwd ? t("hide") : t("show")}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs md:text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs md:text-sm text-emerald-400 text-center">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {t("register")}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 md:mt-8 text-center text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">
            {t("signup_terms_agreement")}{" "}
            <Link className="text-white hover:underline transition-colors font-bold" to="/terms" target="_blank">
              {t("terms_of_use")}
            </Link>
            ,{" "}
            <Link className="text-white hover:underline transition-colors font-bold" to="/privacy" target="_blank">
              {t("privacy_notice")}
            </Link>{" "}
            and{" "}
            <Link className="text-white hover:underline transition-colors font-bold" to="/kyc" target="_blank">
              {t("aml_kyc_policy")}
            </Link>
            .
          </p>

          {/* Login Link */}
          <div className="mt-5 md:mt-6 flex justify-center">
            <Link
              to="/login"
              className="text-sm md:text-base font-bold text-gray-400 hover:text-white transition-colors"
            >
              {t("already_have_account")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}