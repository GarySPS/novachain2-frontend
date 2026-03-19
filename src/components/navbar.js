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
        background: "rgba(5, 5, 5, 0.65)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)"
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
                  "px-4 py-2 font-medium transition-colors text-[15px] whitespace-nowrap " +
                  (active
                    ? "text-white"
                    : "text-[#666666] hover:text-[#cccccc]")
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