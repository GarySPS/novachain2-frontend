//src/components/wallet/WalletEarnSummaryCard.js

import React from "react";
import Card from "../card";
import Icon from "../icon";

export default function WalletEarnSummaryCard({
  cardClass,
  totalEarnUsd,
  currentEarnRate,
  fmtUSD,
  t,
  onDepositToEarn,
  onWithdrawEarn,
}) {
  const weeklyEstimate = totalEarnUsd * (currentEarnRate / 100 / 52);

  // Calculate Progress to next tier
  let progress = 0;
  let nextRate = 0;
  let neededAmount = 0;
  let isMaxTier = false;

  if (totalEarnUsd < 3000) {
    nextRate = 10;
    neededAmount = 3000 - totalEarnUsd;
    progress = (totalEarnUsd / 3000) * 100;
  } else if (totalEarnUsd < 20000) {
    nextRate = 15;
    neededAmount = 20000 - totalEarnUsd;
    // Calculate progress between 3k and 20k
    progress = ((totalEarnUsd - 3000) / (20000 - 3000)) * 100;
  } else if (totalEarnUsd < 50000) {
    nextRate = 20;
    neededAmount = 50000 - totalEarnUsd;
    // Calculate progress between 20k and 50k
    progress = ((totalEarnUsd - 20000) / (50000 - 20000)) * 100;
  } else {
    isMaxTier = true;
    progress = 100;
  }

  return (
    <Card
      id="earn-section"
      className={`${cardClass} relative overflow-hidden border-cyan-500/20 p-0`}
    >
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-[80px]" />

      <div className="relative z-10 p-5 sm:p-6 md:p-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <span className="font-black italic text-cyan-300">AI</span>
            </div>
            <h2 className="text-lg font-black text-white sm:text-xl">
              {t("ai_savings", "AI Savings")}
            </h2>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
              totalEarnUsd > 0
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-slate-500/30 bg-white/5 text-slate-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                totalEarnUsd > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            {totalEarnUsd > 0 ? t("active", "Active") : t("standby", "Standby")}
          </span>
        </div>

        {/* Hero Balance Section */}
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            {t("deployed_capital", "Deployed Capital")}
          </div>
          <div className="text-[clamp(2.5rem,8vw,3.5rem)] font-black leading-none tracking-tight text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {fmtUSD(totalEarnUsd)}
          </div>
        </div>

        {/* Earning Highlight Banner */}
        <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-1">
                {t("current_yield", "Current Yield")}
              </div>
              <div className="flex items-end gap-2 text-emerald-300">
                <span className="text-2xl font-black tabular-nums leading-none">
                  {currentEarnRate}%
                </span>
                <span className="text-sm font-bold mb-0.5 text-emerald-400/80">{t("apy", "APY")}</span>
              </div>
            </div>
            
            <div className="h-10 w-[1px] bg-emerald-500/20"></div>
            
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-1">
                {t("est_weekly", "Est. Weekly")}
              </div>
              <div className="text-xl font-black text-emerald-300 tabular-nums leading-none">
                +{fmtUSD(weeklyEstimate)}
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Progress Bar Upsell */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {isMaxTier ? t("max_tier", "Max Tier Reached") : t("next_tier", "Next Tier")}
              </div>
              {!isMaxTier && (
                <div className="text-sm font-bold text-cyan-300 mt-0.5">
                  {nextRate}% {t("apy", "APY")}
                </div>
              )}
            </div>
            
            {!isMaxTier && (
              <div className="text-right">
                <div className="text-xs font-bold text-white tabular-nums">
                  {fmtUSD(neededAmount)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  {t("needed_to_unlock", "Needed to unlock")}
                </div>
              </div>
            )}
          </div>
          
          {/* The Progress Track */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#13192f] border border-white/5">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(progress, 2)}%` }} // Minimum 2% so the user always sees a tiny sliver of progress
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDepositToEarn}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition active:scale-[0.98]"
          >
            <Icon name="download" className="h-4 w-4" />
            {t("deposit", "Deposit")}
          </button>

          <button
            type="button"
            onClick={onWithdrawEarn}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <Icon name="upload" className="h-4 w-4" />
            {t("withdraw", "Withdraw")}
          </button>
        </div>
      </div>
    </Card>
  );
}