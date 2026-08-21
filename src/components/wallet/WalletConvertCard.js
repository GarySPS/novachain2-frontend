//src/components/wallet/WalletConvertCard.js

import React from "react";
import Card from "../card";
import Icon from "../icon";

export default function WalletConvertCard({
  cardClass,
  coinSymbols,
  fromCoin,
  toCoin,
  amount,
  result,
  successMsg,
  convertBusy,
  t,
  onSubmit,
  onSwap,
  onFromCoinChange,
  onToCoinChange,
  onAmountChange,
}) {
  const isDisabled =
    convertBusy ||
    !amount ||
    isNaN(amount) ||
    fromCoin === toCoin ||
    parseFloat(amount) <= 0;

  return (
    <Card className={`${cardClass} p-0`}>
      <form onSubmit={onSubmit} className="flex flex-col space-y-4 p-2 sm:p-4">
        
        {/* Sleek Modal Header */}
        <div className="mb-2 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-2 text-2xl font-black text-white">
            <Icon
              name="swap"
              className="h-6 w-6 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            />
            {t("convert_crypto", "Convert Crypto")}
          </div>
          <p className="text-sm font-medium text-slate-400">
            {t("zero_fees_instant", "Zero fees. Instant settlement.")}
          </p>
        </div>

        {/* Swap Interface Wrapper */}
        <div className="relative flex flex-col gap-1.5">
          
          {/* FROM BLOCK (You Pay) */}
          <div className="relative z-0 rounded-3xl bg-[#0b1020] p-4 transition-all focus-within:ring-2 focus-within:ring-sky-500/50 sm:p-5">
            <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-slate-500">
              {t("you_pay", "You Pay")}
            </label>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-3xl font-black tabular-nums text-white outline-none placeholder:text-slate-700 sm:text-4xl"
              />
              <div className="relative shrink-0">
                <select
                  value={fromCoin}
                  onChange={(e) => onFromCoinChange(e.target.value)}
                  className="appearance-none rounded-2xl bg-[#1a2343] py-2.5 pl-4 pr-10 font-black text-white shadow-lg outline-none ring-1 ring-white/10 transition-colors hover:bg-[#202b54] cursor-pointer"
                >
                  {coinSymbols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Icon
                  name="arrow-down"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* FLOATING SWAP BUTTON */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={onSwap}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border-[4px] border-[#0f1424] bg-[#1a2343] text-sky-400 transition-all hover:bg-sky-500 hover:text-white active:scale-90 shadow-xl"
              aria-label="Swap coins"
            >
              <Icon name="swap" className="h-5 w-5" />
            </button>
          </div>

          {/* TO BLOCK (You Receive) */}
          <div className="relative z-0 rounded-3xl bg-[#0b1020] p-4 sm:p-5">
            <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-slate-500">
              {t("you_receive", "You Receive")}
            </label>
            <div className="flex items-center justify-between gap-4">
              <div
                className={`w-full truncate text-3xl font-black tabular-nums sm:text-4xl ${
                  result ? "text-white" : "text-slate-700"
                }`}
              >
                {result || "0.00"}
              </div>
              <div className="relative shrink-0">
                <select
                  value={toCoin}
                  onChange={(e) => onToCoinChange(e.target.value)}
                  className="appearance-none rounded-2xl bg-[#1a2343] py-2.5 pl-4 pr-10 font-black text-white shadow-lg outline-none ring-1 ring-white/10 transition-colors hover:bg-[#202b54] cursor-pointer"
                >
                  {fromCoin === "USDT" ? (
                    coinSymbols
                      .filter((c) => c !== "USDT")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                  ) : (
                    <option value="USDT">USDT</option>
                  )}
                </select>
                <Icon
                  name="arrow-down"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="py-2 text-center text-[11px] font-bold text-slate-500">
          <div className="flex items-center justify-center gap-1.5">
            <Icon name="info" className="h-3.5 w-3.5" />
            {t("live_price_update", "Live price updates automatically.")}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isDisabled}
          className="mt-2 h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-lg font-black text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-40"
        >
          {convertBusy ? t("processing", "Processing...") : t("convert", "Convert Now")}
        </button>

        {/* Success/Error Message */}
        {successMsg && (
          <div
            className={`mt-2 rounded-xl border px-4 py-3 text-center text-sm font-bold ${
              successMsg.includes("Fail") || successMsg.includes("error")
                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {successMsg}
          </div>
        )}
      </form>
    </Card>
  );
}