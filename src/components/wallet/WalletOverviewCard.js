//src/components/wallet/WalletOverviewCard.js

import React from "react";
import Card from "../card";
import Icon from "../icon";

export default function WalletOverviewCard({
  cardClass,
  totalUsd,
  fmtUSD,
  t,
  onDeposit,
  onWithdraw,
  onConvert,
  onMining, // Changed from onEarn
  onBuyCrypto,
}) {
  return (
    <Card className={`${cardClass} p-0 relative overflow-hidden`}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative z-10 flex min-h-[250px] flex-col px-5 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              {t("total_balance")}
            </div>

            <div className="mt-2 text-xs font-medium text-slate-500">
              Spot wallet balance
            </div>
          </div>

          <div className="rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
            Wallet
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="max-w-full whitespace-nowrap text-[clamp(2.05rem,9.2vw,3.25rem)] font-black leading-none tracking-tight text-white tabular-nums drop-shadow-[0_0_18px_rgba(56,189,248,0.28)]">
            {fmtUSD(totalUsd)}
          </div>
       </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDeposit}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-sm font-black text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] transition active:scale-[0.98]"
          >
            <Icon name="download" className="h-4 w-4" />
            {t("deposit")}
          </button>

          <button
            type="button"
            onClick={onWithdraw}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] text-sm font-bold text-slate-200 transition active:scale-[0.98]"
          >
            <Icon name="upload" className="h-4 w-4" />
            {t("withdraw")}
          </button>

          <button
            type="button"
            onClick={onConvert}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sm font-bold text-sky-300 transition active:scale-[0.98]"
          >
            <Icon name="swap" className="h-4 w-4" />
            {t("convert")}
          </button>

          <button
            type="button"
            onClick={onBuyCrypto}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-bold text-indigo-200 transition active:scale-[0.98]"
          >
            <Icon name="credit-card" className="h-4 w-4" />
            {t("buy_crypto")}
          </button>

          {/* Upgraded AI Mining Button */}
          <button
            type="button"
            onClick={onMining}
            className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition hover:bg-emerald-500/20 active:scale-[0.98]"
          >
            <Icon name="cpu" className="h-4 w-4" />
            ETH AI Mining
          </button>
        </div>
      </div>
    </Card>
  );
}
