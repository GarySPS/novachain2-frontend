// src/components/TradeResult.js

import React from "react";
import { motion } from "framer-motion";
import Card from "./card";
import Icon from "./icon";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatMoney = (value, maxFractionDigits = 2) => {
  const number = toNumber(value);

  if (number === null) return "—";

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits,
  }).format(number);
};

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>

      <span
        className={`text-sm font-semibold text-right tabular-nums break-words ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function TradeResult({ tradeDetail, t }) {
  if (!tradeDetail) return null;

  const isWin = String(tradeDetail.result || "").toUpperCase() === "WIN";

  // Prefer the standard API field, with fallbacks for older records.
  const capital =
    tradeDetail.amount ??
    tradeDetail.invested_amount ??
    tradeDetail.capital;

  const capitalValue = toNumber(capital);
  const profitValue = toNumber(tradeDetail.profit);
  const absoluteProfit =
    profitValue === null ? null : Math.abs(profitValue);

  const returnPercent =
    capitalValue !== null &&
    capitalValue > 0 &&
    absoluteProfit !== null
      ? (absoluteProfit / capitalValue) * 100
      : null;

  const symbol = String(
    tradeDetail.symbol || tradeDetail.asset || ""
  ).toUpperCase();

  const pairLabel = symbol
    ? symbol.includes("/")
      ? symbol
      : `${symbol.replace(/USDT$/, "")}/USDT`
    : "—";

  const direction = String(
    tradeDetail.direction || tradeDetail.side || ""
  ).toUpperCase();

  const duration = toNumber(tradeDetail.duration);

  const resultColor = isWin
    ? "text-emerald-400"
    : "text-rose-400";

  const statusColor = isWin
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
    : "border-rose-500/25 bg-rose-500/10 text-rose-400";

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full"
    >
      <Card
        className="relative mx-auto mt-4 flex w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1220] p-4 text-white shadow-xl sm:mt-5 sm:p-5"
      >
        {/* Restrained exchange-style header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 pb-4">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t("trade_summary", "Trade Summary")}
            </p>

            <h3 className="text-lg font-bold tracking-tight text-white">
              {pairLabel}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {t("completed_trade", "Completed Trade")}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}
          >
            <Icon
              name={isWin ? "check" : "close"}
              className="h-3.5 w-3.5"
            />
            {isWin
              ? t("win", "Profit")
              : t("loss", "Loss")}
          </span>
        </div>

        {/* Net profit / loss */}
        <div className="py-5">
          <p className="mb-2 text-xs font-medium text-slate-400">
            {t("net_profit_loss", "Net Profit / Loss")}
          </p>

          <div
            className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${resultColor}`}
          >
            <span className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {profitValue === null
                ? "—"
                : `${isWin ? "+" : "−"}$${formatMoney(
                    absoluteProfit
                  )}`}
            </span>

            {returnPercent !== null && (
              <span className="text-sm font-semibold tabular-nums">
                ({isWin ? "+" : "−"}
                {returnPercent.toFixed(2)}%)
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {t("realized_trade_pnl", "Realized trade P&L")}
          </p>
        </div>

        {/* Trade details */}
        <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/50 px-3">
          {/* Capital is deliberately shown first */}
          <DetailRow
            label={t("invested_capital", "Invested Capital")}
            value={
              capitalValue === null
                ? "—"
                : `$${formatMoney(capitalValue)} USDT`
            }
            valueClassName="text-white"
          />

          <div className="border-t border-slate-700/50">
            <DetailRow
              label={t("entry", "Entry Price")}
              value={`$${formatMoney(tradeDetail.start_price, 6)}`}
              valueClassName="text-slate-200"
            />
          </div>

          <div className="border-t border-slate-700/50">
            <DetailRow
              label={t("closing_price", "Closing Price")}
              value={`$${formatMoney(tradeDetail.result_price, 6)}`}
              valueClassName={resultColor}
            />
          </div>

          <div className="border-t border-slate-700/50">
            <DetailRow
              label={t("duration", "Duration")}
              value={
                duration === null
                  ? "—"
                  : `${duration} ${t("seconds_short", "sec")}`
              }
              valueClassName="text-slate-200"
            />
          </div>

          {direction && (
            <div className="border-t border-slate-700/50">
              <DetailRow
                label={t("direction", "Direction")}
                value={direction}
                valueClassName={
                  direction.includes("BUY") ||
                  direction.includes("LONG")
                    ? "text-emerald-400"
                    : direction.includes("SELL") ||
                      direction.includes("SHORT")
                    ? "text-rose-400"
                    : "text-slate-200"
                }
              />
            </div>
          )}
        </div>

        {/* Settlement status */}
        <div className="mt-4 flex items-start gap-2">
          <Icon
            name="shield-check"
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
          />

          <p className="text-xs leading-5 text-slate-400">
            {isWin
              ? t(
                  "profit_credited",
                  "Profit credited to wallet"
                )
              : t(
                  "loss_deducted",
                  "Loss deducted from wallet"
                )}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}