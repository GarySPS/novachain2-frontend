//src>pages>SignUpPage.js

import { useAppKit } from '@reown/appkit/react';
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
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
          setSuccess("Account exists but is pending Admin approval.");
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
    setSuccess("Phone registered. Please enter the 5-digit code from admin.");
    setCodeStage(true);
  } else {
    setSuccess("Code submitted. Waiting for admin approval.");
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
        backgroundImage: 'url("/login.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay has been removed */}

      <div className="relative z-10 w-full">
        {/* UPDATED: Card styling to match login page */}
        <div className="mx-auto w-full max-w-[480px] rounded-3xl bg-[#10162F]/80 backdrop-blur-xl shadow-2xl border border-sky-500/30 px-6 py-8 md:px-10 md:py-10">
          
          {/* Logo has been removed */}

          {/* ADDED: Inner video to match login page */}
          <div className="w-full h-36 md:h-40 rounded-2xl overflow-hidden shadow-inner border border-sky-400/20">
              <video
                  src="/login.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
              />
          </div>

          {/* UPDATED: Title styling for dark theme */}
          <h2 className="mt-6 text-center text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
            Create Account
          </h2>

          {/* 1. Web3 Option Moved to Top */}
          <button
            type="button"
            onClick={() => open()}
            className="mt-6 w-full h-12 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-3 transition shadow"
          >
            <img 
              src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg" 
              alt="WalletConnect" 
              className="w-5 h-5" 
            />
            Connect Web3 Wallet
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px w-full bg-slate-700" />
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">or</span>
            <div className="h-px w-full bg-slate-700" />
          </div>

          {/* 2. Compact Form */}
          <form onSubmit={handleSignUp} className="space-y-4 md:space-y-5">
            
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="w-full h-12 rounded-xl px-4 bg-slate-800/60 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-400/20 focus:border-sky-400 transition"
            />

            {/* Email / Phone Toggle Tab */}
            <div className="space-y-3">
              <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setSignupMethod("email")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${signupMethod === "email" ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod("phone")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${signupMethod === "phone" ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Phone
                </button>
              </div>

              {/* Dynamic Input */}
              {signupMethod === "email" ? (
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-12 rounded-xl px-4 bg-slate-800/60 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-400/20 focus:border-sky-400 transition"
                />
              ) : (
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number (e.g. +1234567890)"
                  className="w-full h-12 rounded-xl px-4 bg-slate-800/60 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-400/20 focus:border-sky-400 transition"
                />
                
              )}
            </div>

            {signupMethod === "phone" && codeStage && (
  <div className="mt-3">

    <p className="text-xs text-slate-400 mb-2">
      Enter 5-digit member code from customer service
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
          className="w-full h-12 text-center text-xl rounded-xl bg-slate-800/60 text-white border border-slate-700 focus:ring-2 focus:ring-sky-400"
        />
      ))}
    </div>

  </div>
)}

            {/* Passwords (Grouped on desktop, stacked on mobile) */}
            <div className="flex flex-col md:flex-row gap-4">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full h-12 rounded-xl px-4 bg-slate-800/60 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-400/20 focus:border-sky-400 transition"
              />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm Password"
                className="w-full h-12 rounded-xl px-4 bg-slate-800/60 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-400/20 focus:border-sky-400 transition"
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="w-full rounded-lg border border-red-400/50 bg-red-500/20 px-3 py-2 text-sm md:text-base text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3 py-2 text-sm md:text-base text-emerald-200">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full h-12 rounded-xl font-extrabold text-base md:text-lg tracking-wide shadow-lg border-0 outline-none transition active:scale-[.99]"
              style={{
                background: "linear-gradient(90deg,#00eaff 0%,#1f2fff 55%,#ffd700 100%)",
                color: "white",
                letterSpacing: "0.02em",
                boxShadow: "0 10px 24px rgba(0, 234, 255, 0.15)",
              }}
            >
              Register
            </button>
          </form>

          {/* Terms */}
          <p className="mt-7 text-center text-[11px] md:text-xs text-slate-400 font-medium leading-relaxed">
            By signing up, you agree to our{" "}
            <Link className="text-sky-400 hover:underline" to="/terms" target="_blank">
              Terms of Use
            </Link>
            ,{" "}
            <Link className="text-sky-400 hover:underline" to="/privacy" target="_blank">
              Privacy Notice
            </Link>{" "}
            and{" "}
            <Link className="text-sky-400 hover:underline" to="/kyc" target="_blank">
              AML/KYC Policy
            </Link>
            .
          </p>

          {/* Login Link */}
          <div className="mt-4 flex justify-center">
            <Link
              to="/login"
              className="text-sm md:text-base font-bold text-sky-400 hover:text-sky-300 hover:underline"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
