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

  const getTierLabel = () => {
    if (totalEarnUsd >= 50000) return "$50K+";
    if (totalEarnUsd >= 20000) return "$20K+";
    if (totalEarnUsd >= 3000) return "$3K+";
    return "Starter";
  };

  const nextTierText = () => {
    if (totalEarnUsd <= 0) {
      return t("earn_standby_hint", "Deposit to activate AI Savings.");
    }

    if (totalEarnUsd < 3000) {
      return t("deposit_to_activate", { amount: fmtUSD(3000 - totalEarnUsd) });
    }

    if (totalEarnUsd < 20000) {
      return t("next_tier_push", {
        amount: fmtUSD(20000 - totalEarnUsd),
        rate: "15%",
      });
    }

    if (totalEarnUsd < 50000) {
      return t("next_tier_push", {
        amount: fmtUSD(50000 - totalEarnUsd),
        rate: "20%",
      });
    }

    return t("highest_tier_active", "Highest tier active.");
  };

  return (
    <Card
      id="earn-section"
      className={`${cardClass} relative overflow-hidden border-cyan-500/20 p-0`}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-[80px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative z-10 p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_22px_rgba(34,211,238,0.14)]">
              <span className="font-black italic text-cyan-300">AI</span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black leading-tight text-white sm:text-xl">
                  {t("ai_savings_earn")}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    totalEarnUsd > 0
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-500/20 bg-white/5 text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      totalEarnUsd > 0 ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                  {totalEarnUsd > 0 ? t("trading_active") : t("ai_standby")}
                </span>
              </div>

              <p className="mt-1 hidden max-w-2xl text-xs leading-relaxed text-slate-500 sm:block">
                {t(
                  "ai_earn_summary",
                  "Optional savings wallet. Your normal wallet assets stay above."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-[#0b1020]/60 p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t("deployed_capital")}
            </div>
            <div className="mt-1 whitespace-nowrap text-xl font-black text-white tabular-nums">
              {fmtUSD(totalEarnUsd)}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              {t("current_apy")}
            </div>
            <div className="mt-1 whitespace-nowrap text-xl font-black text-cyan-200 tabular-nums">
              {currentEarnRate}%
              <span className="ml-1 text-xs font-bold text-cyan-400/80">
                {t("per_year")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              {t("estimated_weekly")}
            </div>
            <div className="mt-1 whitespace-nowrap text-xl font-black text-emerald-300 tabular-nums">
              +{fmtUSD(weeklyEstimate)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b1020]/60 p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t("current_tier")}
            </div>
            <div className="mt-1 whitespace-nowrap text-xl font-black text-white">
              {getTierLabel()}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDepositToEarn}
            className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-3 text-sm font-black text-white shadow-[0_0_20px_rgba(34,211,238,0.22)] transition active:scale-[0.98]"
          >
            {t("deposit_to_earn")}
          </button>

          <button
            type="button"
            onClick={onWithdrawEarn}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-bold text-slate-300 transition active:scale-[0.98]"
          >
            {t("withdraw")}
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-400/15 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          <Icon name="alert-circle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{nextTierText()}</span>
        </div>
      </div>
    </Card>
  );
}