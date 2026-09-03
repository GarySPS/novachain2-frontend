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
  { label: "contact_us", to: "/contact" },
  { label: "privacy", to: "/privacy" },
  { label: "kyc", to: "/kyc" },
];

export default function NavBar() {
  const location = useLocation();
  const { t } = useTranslation();

  // --- HIDE TOP NAVBAR ON AGENT PORTAL ---
  if (location.pathname.startsWith('/agent')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-cyan-400/10 bg-[#05070d]/75 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16 md:px-5">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 active:scale-[0.99]"
          aria-label="Novachain dashboard"
        >
          <NovaChainLogo className="h-9 w-auto drop-shadow-[0_0_18px_rgba(56,189,248,0.18)] sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap " +
                  (active
                    ? "bg-cyan-400/10 text-white shadow-[0_0_18px_rgba(34,211,238,0.10)]"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200")
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