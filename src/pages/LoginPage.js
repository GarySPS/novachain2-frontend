//src>pages>LoginPage.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useTranslation } from "react-i18next";
import i18n from "i18next";

import DatabaseErrorCard from "../components/DatabaseErrorCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  // Language options
  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "es", label: "Español", flag: "🇪🇸" }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLangMenu(false);
  };

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

  useEffect(() => {
  // Check for impersonation login from admin
  const urlParams = new URLSearchParams(window.location.search);
  const impersonateToken = urlParams.get('token');  // Get token from URL
  
  if (urlParams.get('impersonate') === 'true' && impersonateToken) {
    // Clean the URL by removing the token (so it doesn't stay in browser history)
    window.history.replaceState({}, document.title, window.location.pathname);
    
    fetch(`${MAIN_API_BASE}/auth/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userToken: impersonateToken })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/wallet');
      } else {
        setError(data.error || 'Impersonation failed');
      }
    })
    .catch(() => setError('Impersonation error. Please try again.'));
  }
}, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 403 && data.error && data.error.toLowerCase().includes("verify your email")) {
        navigate("/verify-otp", { state: { email } });
        return;
      }
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/wallet");
    } catch {
      setError("Platform is under scheduled maintenance. Please try again soon.");
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

      {/* Language Selector Button - Bottom Right Corner */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
          >
            <span className="text-lg md:text-xl">{currentLanguage.flag}</span>
            <span className="text-xs md:text-sm font-semibold text-gray-200 group-hover:text-white hidden sm:inline">
              {currentLanguage.label}
            </span>
            <svg 
              className={`w-3 h-3 md:w-4 md:h-4 text-gray-400 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu - Popping Upward */}
          {showLangMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowLangMenu(false)}
              />
              <div className="absolute right-0 bottom-full mb-2 w-40 md:w-48 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-40 animate-in fade-in duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 text-left transition-all duration-200 ${
                      i18n.language === lang.code
                        ? "bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-white border-l-2 border-sky-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-lg md:text-xl">{lang.flag}</span>
                    <span className="text-xs md:text-sm font-medium">{lang.label}</span>
                    {i18n.language === lang.code && (
                      <svg className="w-3 h-3 md:w-4 md:h-4 ml-auto text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-[400px] md:max-w-[480px] rounded-[2rem] bg-[#0a0a0a]/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 px-5 py-6 md:px-10 md:py-10">
          
          {/* Video Header - smaller on mobile */}
          <div className="w-full h-28 md:h-40 rounded-2xl overflow-hidden shadow-inner border border-sky-400/20">
            <video
              src="/login.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title - slightly smaller on mobile */}
          <h2 className="mt-4 md:mt-6 text-center text-xl md:text-3xl font-extrabold tracking-tight text-slate-100">
            {t('login_title') || 'Login'}
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
            {t('connect_web3_wallet') || 'Connect Web3 Wallet'}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">{t('or') || 'or'}</span>
            <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-white/10" />
          </div>
          
          {/* Compact Form Without Labels */}
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder={t('username_email') || "Username, Email"}
              className="w-full h-12 md:h-14 rounded-xl px-4 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
            />

            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder={t('password') || "Password"}
                className="w-full h-12 md:h-14 rounded-xl px-4 pr-20 bg-white/[0.04] text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-sm md:text-base shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all shadow-sm"
              >
                {showPwd ? (t('hide') || "Hide") : (t('show') || "Show")}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <Link
                to="/forgot"
                className="group flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors tracking-wide uppercase"
              >
                {t('forgot_password') || "Forgot password?"}
                <span className="text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all">→</span>
              </Link>
            </div>

            {error &&
              (error.toLowerCase().includes("maintain") || error.toLowerCase().includes("database") ? (
                <DatabaseErrorCard />
              ) : (
                <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs md:text-sm text-red-400 text-center">
                  {error}
                </div>
              ))}

            <button
              type="submit"
              className="mt-4 w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base tracking-[0.1em] uppercase transition-all active:scale-[.99] bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {t('login_button') || "Login"}
            </button>
          </form>

          <div className="mt-5 md:mt-6 flex justify-center">
            <Link
              to="/signup"
              className="text-sm md:text-base font-bold text-gray-400 hover:text-white transition-colors"
            >
              {t('create_account') || "New here? Create an account"}
            </Link>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes logoGlow {
            0% { filter: drop-shadow(0 0 12px rgba(0,234,255,.55)); }
            50% { filter: drop-shadow(0 0 36px rgba(0,234,255,.35)); }
            100% { filter: drop-shadow(0 0 12px rgba(0,234,255,.55)); }
          }
          img[alt="NovaChain Logo"] { animation: logoGlow 3s ease-in-out infinite; }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
}