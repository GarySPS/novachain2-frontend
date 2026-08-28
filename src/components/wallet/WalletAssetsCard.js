//src/components/wallet/WalletAssetsCard.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../card";
import Icon from "../icon";

export default function WalletAssetsCard({
  cardClass,
  balances,
  prices,
  fmtUSD,
  t,
}) {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);

  const getCoinUsdValue = (symbol, balance) => {
    const p = symbol === "USDT" ? 1 : prices[symbol] ?? undefined;
    return p !== undefined ? fmtUSD(Number(balance) * p) : "--";
  };

  const getUnitPrice = (symbol) => {
    const p = symbol === "USDT" ? 1 : prices[symbol] ?? undefined;
    return p !== undefined ? fmtUSD(p) : "--";
  };

  const formatCoinAmount = (symbol, value) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: symbol === "BTC" ? 6 : 2,
      maximumFractionDigits: symbol === "BTC" ? 8 : 6,
    });
  };

  // Triggers the modals via URL params (picked up by WalletPage.js)
  const handleAction = (e, action, symbol) => {
    e.stopPropagation();
    navigate(`?action=${action}&coin=${symbol}`);
  };

  return (
    <Card className={`${cardClass} p-0`}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div>
          <div className="text-sm font-black uppercase tracking-wider text-gray-200">
            {t("my_assets", "My Assets")}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            {t("spot_wallet_holdings")}
          </div>
        </div>

        <div className="rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
          {balances.length} {t("assets", "Assets")}
        </div>
      </div>

      <div className="w-full">
        
        {/* ================= MOBILE VIEW ================= */}
        <div className="flex flex-col md:hidden">
          {balances.map(({ symbol, balance, frozen }) => (
            <div key={symbol} className="flex flex-col border-b border-white/5 last:border-0">
              <div
                className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] active:bg-white/[0.05]"
                onClick={() => setExpandedRow(expandedRow === symbol ? null : symbol)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#1a2035] p-1.5 shadow-inner">
                    <img
                      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`}
                      alt={symbol}
                      className="h-full w-full object-contain drop-shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-base font-black text-gray-100 flex items-center gap-1.5">
                      {symbol}
                      <Icon
                        name="chevron-down"
                        className={`h-3 w-3 text-gray-500 transition-transform duration-300 ${
                          expandedRow === symbol ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <div className="text-[11px] font-medium text-sky-400/80">
                      {getUnitPrice(symbol)}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 text-right">
                  <div className="whitespace-nowrap text-base font-black tracking-tight text-white tabular-nums">
                    {getCoinUsdValue(symbol, balance)}
                  </div>
                  <div className="whitespace-nowrap text-[11px] font-medium text-gray-400">
                    {formatCoinAmount(symbol, balance)} {symbol}
                  </div>
                </div>
              </div>

              {/* Mobile Expandable Actions */}
              {expandedRow === symbol && (
                <div className="flex gap-2 bg-white/[0.01] px-4 pb-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={(e) => handleAction(e, "deposit", symbol)}
                    className="flex-1 rounded-lg bg-sky-500/15 py-2 text-[10px] font-black uppercase tracking-widest text-sky-400 transition hover:bg-sky-500/25 active:scale-95"
                  >
                    {t("deposit")}
                  </button>
                  <button
                    onClick={(e) => handleAction(e, "withdraw", symbol)}
                    className="flex-1 rounded-lg bg-white/5 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10 active:scale-95"
                  >
                    {t("withdraw")}
                  </button>
                  <button
                    onClick={(e) => handleAction(e, "convert", symbol)}
                    className="flex-1 rounded-lg bg-white/5 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10 active:scale-95"
                  >
                    {t("trade")}
                  </button>
                </div>
              )}
            </div>
          ))}

          {balances.length === 0 && (
            <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
              {t("no_assets") || "No assets found"}
            </div>
          )}
        </div>

        {/* ================= DESKTOP VIEW ================= */}
        <div className="hidden w-full overflow-x-auto md:block">
          <table className="w-full min-w-[650px] text-base">
            <thead className="sticky top-0 z-10 bg-[#0f1424]">
              <tr className="border-y border-white/5 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="py-3 pl-6 pr-2">{t("type", "Asset")}</th>
                <th className="px-2 py-3 text-right">{t("amount", "Balance")}</th>
                <th className="px-2 py-3 text-right">{t("frozen", "Frozen")}</th>
                <th className="px-2 py-3 text-right">{t("usd_value", "USD Value")}</th>
                <th className="py-3 pl-2 pr-6 text-right">{t("actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {balances.map(({ symbol, balance, frozen }) => (
                <tr
                  key={symbol}
                  className="group transition-colors hover:bg-white/[0.02]"
                  style={{ height: 72 }}
                >
                  <td className="py-3 pl-6 pr-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-[#1a2035] p-1.5 shadow-inner">
                        <img
                          src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`}
                          alt={symbol}
                          className="h-full w-full object-contain drop-shadow-md"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-100">{symbol}</span>
                        <span className="text-[11px] font-medium text-sky-400/80">{getUnitPrice(symbol)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3 text-right font-semibold tabular-nums text-gray-200">
                    {formatCoinAmount(symbol, balance)}
                  </td>

                  <td className="px-2 py-3 text-right font-medium tabular-nums text-rose-400/80">
                    {formatCoinAmount(symbol, frozen)}
                  </td>

                  <td className="px-2 py-3 text-right font-black tabular-nums text-white">
                    {getCoinUsdValue(symbol, balance)}
                  </td>

                  <td className="py-3 pl-2 pr-6 text-right">
                    {/* Hover Quick Actions */}
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleAction(e, "deposit", symbol)}
                        className="rounded-md bg-sky-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400 transition hover:bg-sky-500 hover:text-white"
                      >
                        {t("deposit")}
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "withdraw", symbol)}
                        className="rounded-md bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                      >
                        {t("withdraw")}
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "convert", symbol)}
                        className="rounded-md bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                      >
                        {t("trade")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {balances.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm font-medium text-slate-500"
                  >
                    {t("no_assets") || "No assets found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}