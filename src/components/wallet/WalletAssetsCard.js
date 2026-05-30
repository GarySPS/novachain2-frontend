//src/components/wallet/WalletAssetsCard.js

import React from "react";
import Card from "../card";

export default function WalletAssetsCard({
  cardClass,
  balances,
  prices,
  fmtUSD,
  t,
}) {
  const getCoinUsdValue = (symbol, balance) => {
    const p = symbol === "USDT" ? 1 : prices[symbol] ?? undefined;
    return p !== undefined ? fmtUSD(Number(balance) * p) : "--";
  };

  const formatCoinAmount = (symbol, value) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: symbol === "BTC" ? 6 : 2,
      maximumFractionDigits: symbol === "BTC" ? 8 : 6,
    });
  };

  return (
    <Card className={`${cardClass} p-0`}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div>
          <div className="text-sm font-black uppercase tracking-wider text-gray-200">
            {t("my_assets")}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            Spot wallet holdings
          </div>
        </div>

        <div className="rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
          {balances.length} {t("assets", "Assets")}
        </div>
      </div>

      <div className="w-full">
        {/* Mobile */}
        <div className="flex flex-col divide-y divide-white/5 md:hidden">
          {balances.map(({ symbol, balance, frozen }) => (
            <div
              key={symbol}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
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
                  <div className="text-base font-black text-gray-100">
                    {symbol}
                  </div>
                  <div className="text-[11px] font-medium text-gray-500">
                    {t("frozen", "Frozen")}:{" "}
                    {Number(frozen || 0).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                  </div>
                </div>
              </div>

              <div className="min-w-0 text-right">
                <div className="whitespace-nowrap text-base font-black tracking-tight text-white tabular-nums">
                  {getCoinUsdValue(symbol, balance)}
                </div>
                <div className="whitespace-nowrap text-[11px] font-medium text-gray-400">
                  {Number(balance || 0).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{" "}
                  {symbol}
                </div>
              </div>
            </div>
          ))}

          {balances.length === 0 && (
            <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
              {t("no_assets") || "No assets found"}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden w-full overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-base">
            <thead className="sticky top-0 z-10 bg-[#0f1424]">
              <tr className="border-y border-white/5 text-left text-sm uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6 pr-2 font-semibold">{t("type")}</th>
                <th className="px-2 py-4 text-right font-semibold">
                  {t("amount")}
                </th>
                <th className="px-2 py-4 text-right font-semibold">
                  {t("frozen", "Frozen")}
                </th>
                <th className="py-4 pl-2 pr-6 text-right font-semibold">
                  {t("usd_value", "USD Value")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {balances.map(({ symbol, balance, frozen }) => (
                <tr
                  key={symbol}
                  className="group transition-colors hover:bg-white/[0.02]"
                  style={{ height: 68 }}
                >
                  <td className="py-3 pl-6 pr-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-[#1a2035] p-1.5 shadow-inner">
                        <img
                          src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`}
                          alt={symbol}
                          className="h-full w-full object-contain drop-shadow-md"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-100">{symbol}</span>
                    </div>
                  </td>

                  <td className="px-2 py-3 text-right font-semibold tabular-nums text-gray-300">
                    {formatCoinAmount(symbol, balance)}
                  </td>

                  <td className="px-2 py-3 text-right font-medium tabular-nums text-rose-400/80">
                    {formatCoinAmount(symbol, frozen)}
                  </td>

                  <td className="py-3 pl-2 pr-6 text-right font-bold tabular-nums text-white">
                    {getCoinUsdValue(symbol, balance)}
                  </td>
                </tr>
              ))}

              {balances.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
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