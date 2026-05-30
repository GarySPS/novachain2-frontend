//src/components/wallet/WalletConvertCard.js

import React from "react";
import Card from "../card";
import Field from "../field";
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
    <Card id="convert-section" className={`${cardClass} p-0`}>
      <div className="border-b border-white/5 bg-[#0f1424] px-4 py-4 sm:px-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-black text-white sm:text-xl md:text-2xl">
              <Icon
                name="swap"
                className="h-6 w-6 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
              />
              {t("convert_crypto")}
            </div>

            <div className="mt-1 text-xs font-medium text-slate-500">
              Convert between your wallet assets.
            </div>
          </div>

          <div className="rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
            Spot
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-5 md:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div className="relative w-full">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-gray-400">
                {t("from")}
              </label>

              <select
                value={fromCoin}
                onChange={(e) => onFromCoinChange(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl bg-[#0b1020] px-4 font-bold text-white outline-none ring-1 ring-[#2c3040] focus:ring-2 focus:ring-sky-500"
              >
                {coinSymbols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <Icon
                name="arrow-down"
                className="pointer-events-none absolute right-4 top-[39px] h-4 w-4 text-gray-500"
              />
            </div>

            <div className="flex justify-center md:pb-1">
              <button
                type="button"
                onClick={onSwap}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a2343] text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] ring-1 ring-sky-500/30 transition hover:bg-[#202b54] active:scale-[0.96]"
                aria-label="Swap coins"
              >
                <Icon name="swap" className="h-4 w-4" />
              </button>
            </div>

            <div className="relative w-full">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-gray-400">
                {t("to")}
              </label>

              <select
                value={toCoin}
                onChange={(e) => onToCoinChange(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl bg-[#0b1020] px-4 font-bold text-white outline-none ring-1 ring-[#2c3040] focus:ring-2 focus:ring-sky-500"
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
                className="pointer-events-none absolute right-4 top-[39px] h-4 w-4 text-gray-500"
              />
            </div>
          </div>

          <Field
            label={t("amount_with_coin", { coin: fromCoin })}
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={t("enter_amount_with_coin", { coin: fromCoin })}
            icon="dollar-sign"
            classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
          />

          <div className="rounded-2xl bg-[#1a2343] px-4 py-3 shadow-inner ring-1 ring-white/5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("you_will_receive")}
              </span>

              <span className="text-right text-lg font-black text-white tabular-nums">
                {result ? `${result} ${toCoin}` : "--"}
              </span>
            </div>

            <div className="mt-1 text-[11px] text-slate-500">
              Live price may update before confirmation.
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-base font-black text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
          >
            {convertBusy ? "Converting..." : t("convert")}
          </button>

          {successMsg && (
            <div
              className={`rounded-xl border px-4 py-3 text-center text-sm font-bold ${
                successMsg.includes("Fail") || successMsg.includes("error")
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {successMsg}
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}