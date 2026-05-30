//src/components/wallet/WalletRecentActivityCard.js

import React from "react";
import Card from "../card";
import Icon from "../icon";

export default function WalletRecentActivityCard({
  cardClass,
  allHistory,
  t,
}) {
  const rows = Array.isArray(allHistory) ? allHistory : [];
  const previewRows = rows.slice(0, 6);

  const formatDateMobile = (row) => {
    if (row.created_at) return new Date(row.created_at).toLocaleDateString();
    return row.date || "--";
  };

  const formatDateDesktop = (row) => {
    if (row.created_at) return new Date(row.created_at).toLocaleString();
    return row.date || "--";
  };

  const getKey = (row, idx) => {
    if (row.type === "Deposit") return `deposit-${row.id || idx}`;
    if (row.type === "Withdraw") return `withdraw-${row.id || idx}`;
    return `wallet-history-${idx}`;
  };

  const isDeposit = (row) => row.type === "Deposit";

  return (
    <Card className={`${cardClass} p-0`}>
      <div className="border-b border-white/5 bg-[#0f1424] px-4 py-4 sm:px-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-black text-white sm:text-xl md:text-2xl">
              <Icon
                name="clock"
                className="h-6 w-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
              />
              {t("recent_activity", "Recent Activity")}
            </div>

            <div className="mt-1 text-xs font-medium text-slate-500">
              Latest wallet deposits and withdrawals.
            </div>
          </div>

          <div className="rounded-full border border-indigo-400/15 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
            {rows.length} {t("records", "Records")}
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Mobile */}
        <div className="flex flex-col divide-y divide-white/5 md:hidden">
          {previewRows.map((row, idx) => (
            <div
              key={getKey(row, idx)}
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isDeposit(row)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <Icon
                    name={isDeposit(row) ? "download" : "upload"}
                    className="h-4.5 w-4.5"
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-gray-100">
                    {t(row.type.toLowerCase())} {row.coin}
                  </div>

                  <div className="text-[11px] font-medium text-gray-500">
                    {formatDateMobile(row)}
                  </div>
                </div>
              </div>

              <div
                className={`shrink-0 text-right text-sm font-black tabular-nums ${
                  isDeposit(row) ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isDeposit(row) ? "+" : "-"}
                {row.amount}
              </div>
            </div>
          ))}

          {rows.length > previewRows.length && (
            <div className="px-4 py-3 text-center text-xs font-bold text-slate-500">
              +{rows.length - previewRows.length} more records
            </div>
          )}

          {rows.length === 0 && (
            <div className="px-5 py-10 text-center text-sm font-medium text-gray-500">
              {t("no_history")}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden w-full overflow-x-auto md:block">
          <table className="w-full text-base">
            <thead className="sticky top-0 bg-[#0f1424]">
              <tr className="border-y border-white/5 text-left text-sm uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6 pr-4 font-semibold">{t("type")}</th>
                <th className="px-4 py-4 text-right font-semibold">
                  {t("amount")}
                </th>
                <th className="px-4 py-4 font-semibold">{t("coin")}</th>
                <th className="py-4 pl-4 pr-6 text-right font-semibold">
                  {t("date")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => (
                <tr
                  key={getKey(row, idx)}
                  className="group transition-colors hover:bg-white/[0.02]"
                  style={{ height: 56 }}
                >
                  <td className="py-3 pl-6 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ring-1 ${
                        isDeposit(row)
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                      }`}
                    >
                      <Icon
                        name={isDeposit(row) ? "download" : "upload"}
                        className="h-4 w-4"
                      />
                      {t(row.type.toLowerCase())}
                    </span>
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-bold tabular-nums ${
                      isDeposit(row) ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {isDeposit(row) ? "+" : "-"}
                    {row.amount}
                  </td>

                  <td className="px-4 py-3 font-bold text-gray-200">
                    <span className="inline-flex items-center gap-2">
                      <Icon
                        name={row.coin?.toLowerCase() || "coin"}
                        className="h-5 w-5"
                      />
                      {row.coin}
                    </span>
                  </td>

                  <td className="py-3 pl-4 pr-6 text-right text-sm font-medium text-gray-500">
                    {formatDateDesktop(row)}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center font-medium text-gray-500"
                  >
                    {t("no_history")}
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