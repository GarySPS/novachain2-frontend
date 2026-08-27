//src>AppShell.js

import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TradePage from './pages/TradePage';
import ForexPage from './pages/ForexPage';
import Dashboard from './pages/Dashboard';
import TradeHistory from './pages/TradeHistory';
import ProfilePage from './pages/ProfilePage';
import WalletPage from "./pages/WalletPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import AboutUs from "./pages/AboutUs";
import NavBar from './components/navbar';
import BottomNavBar from './components/BottomNavBar';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NewsPage from "./components/Newspage";
import GuidePage from './pages/GuidePage'; 
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";
import KYCPolicy from "./pages/KYCPolicy";
import AiMiningPage from "./pages/AiMiningPage";
import './i18n';

function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const hideHeader = ["/login", "/signup", "/verify-otp", "/forgot"].some((p) =>
    location.pathname.startsWith(p)
  );

  const [showIOSModal, setShowIOSModal] = useState(false);

  const modalStyles = {
    background: isDarkMode() ? "#191c24" : "white",
    color: isDarkMode() ? "#fff" : "#222",
    padding: 24,
    borderRadius: 16,
    maxWidth: 340,
    width: "90vw",
    textAlign: "center",
    boxShadow: "0 6px 24px 0 rgba(0,0,0,.13)",
    transition: "opacity 0.3s",
    position: "relative"
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0b1020] text-white">
      
      {/* 1. GLOBAL HARDWARE-ACCELERATED BACKGROUND */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 0,
          backgroundImage: 'url("/novachain.jpg")',
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          transform: "translateZ(0)", /* Forces GPU rendering, killing scroll lag! */
          willChange: "transform"
        }}
      />
      
      {/* 2. GLOBAL GRADIENT OVERLAY */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {!hideHeader && <NavBar />}

        <main
          className={`flex-1 w-full ${
            hideHeader
              ? ""
              : "pb-[calc(112px+env(safe-area-inset-bottom))] md:pb-0"
          }`}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/forex" element={<ForexPage />} />
            <Route path="/trade-history" element={<TradeHistory />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/mining" element={<AiMiningPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/kyc" element={<KYCPolicy />} />
          </Routes>
        </main>
        
        {!hideHeader && <BottomNavBar />}
      </div>

      {showIOSModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
            animation: "fadein .3s"
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={modalStyles}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{t('installOnIOS')}</h2>
            <ol style={{ textAlign: "left", margin: "16px 0", fontSize: 15, lineHeight: "1.6" }}>
              <li>{t('step1')} <span role="img" aria-label="Share">🔗</span></li>
              <li>{t('step2')}</li>
              <li>{t('step3')}</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                background: "#2563eb", color: "white", padding: "8px 16px",
                borderRadius: 8, border: "none", marginTop: 10, fontWeight: 500,
                fontSize: 15, boxShadow: "0 2px 10px 0 rgba(37,99,235,0.08)",
                transition: "background 0.2s"
              }}
              className="hover:bg-blue-600"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;