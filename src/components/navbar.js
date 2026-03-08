// src/components/navbar.js

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as NovaChainLogo } from './NovaChainLogo.svg';
import { useTranslation } from "react-i18next";

const navItems = [
  { label: "dashboard", to: "/" },
  { label: "trade", to: "/trade" }, // Crypto
  { label: "Forex", to: "/forex" },
  { label: "history", to: "/trade-history" },
  { label: "wallet", to: "/wallet" },
  { label: "profile", to: "/profile" },
  { label: "news", to: "/news" },
  { label: "about_us", to: "/about" },
  // --- New Trust Links ---
  { label: "Contact Us", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
  { label: "KYC", to: "/kyc" },
];

export default function NavBar() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    // This header is now ALWAYS visible
    <header
      className="sticky top-0 z-30 border-b border-theme-stroke shadow-md w-full"
      style={{
  background: "rgba(15, 23, 42, 0.85)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)"
}}
    >
      <div className="w-full flex items-center justify-between h-16 px-4 md:max-w-7xl md:mx-auto md:px-4">
        <Link to="/" className="flex items-center gap-4">
          <NovaChainLogo className="h-10 w-auto drop-shadow-lg" />
        </Link>
        
        {/* These nav links are now HIDDEN on mobile (hidden md:flex) */}
        <nav className="hidden md:flex gap-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "px-4 py-2 rounded-full font-semibold transition-all text-base-1s whitespace-nowrap " +
                  (active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white")
                }
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}