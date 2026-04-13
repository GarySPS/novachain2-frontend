//src>pages>TradeHistory.js

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import Tooltip from "../components/tooltip";
import Icon from "../components/icon";
import { useTranslation } from "react-i18next";

/* ---------- helpers (UI only) ---------- */
const fmtUSD = (n, max = 2) =>
  typeof n === "number" && !isNaN(n)
    ? "$" + n.toLocaleString(undefined, { maximumFractionDigits: max })
    : "--";

const chipClass = (ok) =>
  ok === "WIN"
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
    : ok === "LOSE"
    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
    : "bg-white/5 text-gray-400 border border-white/10";

export default function TradeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // UI controls (client-side only; does not change your logic)
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL | WIN | LOSE
  const [sortBy, setSortBy] = useState("time"); // time | profit | amount | duration
  const [sortDir, setSortDir] = useState("desc"); // desc | asc
  const [q, setQ] = useState(""); // simple search across id/direction/result
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* ---------- fetch unchanged ---------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      setLoading(false);
      return;
    }
    function parseJwt(token) {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return {};
      }
    }
    const payload = parseJwt(token);
    const user_id = payload.id;
    if (!user_id) {
      setHistory([]);
      setLoading(false);
      return;
    }
    axios
      .get(`${MAIN_API_BASE}/trade/history/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHistory(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, []);

  // Reset to page 1 whenever a filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [resultFilter, sortBy, sortDir, q]);

  /* ---------- derive UI list ---------- */
  const rows = useMemo(() => {
    let list = Array.isArray(history) ? [...history] : [];

    // filter by WIN/LOSE
    if (resultFilter !== "ALL") {
      list = list.filter((t) => (t.result || "").toUpperCase() === resultFilter);
    }

    // simple search (id, direction, result, symbol)
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((t) => {
        const id = String(t.id || "").toLowerCase();
        const dir = String(t.direction || "").toLowerCase();
        const res = String(t.result || "").toLowerCase();
        const sym = String(t.symbol || "").toLowerCase();
        return id.includes(query) || dir.includes(query) || res.includes(query) || sym.includes(query);
      });
    }

    // sort
    list.sort((a, b) => {
      const av =
        sortBy === "profit"
          ? Number(a.profit) || 0
          : sortBy === "amount"
          ? Number(a.amount) || 0
          : sortBy === "duration"
          ? Number(a.duration) || 0
          : new Date(a.timestamp || 0).getTime();
      const bv =
        sortBy === "profit"
          ? Number(b.profit) || 0
          : sortBy === "amount"
          ? Number(b.amount) || 0
          : sortBy === "duration"
          ? Number(b.duration) || 0
          : new Date(b.timestamp || 0).getTime();

      return sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [history, resultFilter, sortBy, sortDir, q]);

  // Derived Pagination Data
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const currentRows = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ---------- UI skeleton ---------- */
  const SkeletonRow = ({ i }) => (
    <tr key={`sk-${i}`} className="animate-pulse border-b border-white/5">
      {Array.from({ length: 9 }).map((_, idx) => (
        <td key={idx} className="py-4 px-3">
          <div className="h-4 w-20 bg-gray-800 rounded mx-auto" />
        </td>
      ))}
    </tr>
  );

  const cardClass = "p-0 overflow-hidden rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#1a2343] bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020]";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-8 px-3"
      style={{
        background: 'url("/novachain.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div className="fixed inset-0 bg-[linear-gradient(120deg,#0b1020f0_0%,#0d1220d8_60%,#0a101dd1_100%)] pointer-events-none" />
      
      {/* pb-32 prevents mobile navbar overlap */}
      <div style={{ position: "relative", zIndex: 1 }} className="w-full max-w-7xl pb-48 md:pb-32">
        
        {/* ----- Header + Controls ----- */}
        <Card className={`${cardClass} mb-6`}>
          <div className="px-5 py-5 md:px-6 md:py-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            
            <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-6 relative z-10">
              <div className="flex-1">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t("trade_ledger")}</div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {rows.length.toLocaleString()} <span className="text-xl text-gray-500 font-bold">{rows.length !== 1 ? t("records") : t("record")}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 w-full lg:w-auto">
                {/* Win/Lose Toggle */}
                <div className="flex bg-[#0b1020] rounded-xl ring-1 ring-[#2c3040] p-1 shadow-inner">
                  {["ALL", "WIN", "LOSE"].map((k) => (
                    <button
                      key={k}
                      onClick={() => setResultFilter(k)}
                      className={`flex-1 h-10 rounded-lg text-xs font-black tracking-wider transition-all
                        ${resultFilter === k
                            ? k === "WIN" ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30"
                            : k === "LOSE" ? "bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] border border-rose-500/30"
                            : "bg-[#1a2343] text-white border border-white/10 shadow-md"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                          {k === "ALL" ? t("all") : k === "WIN" ? t("win") : t("lose")}
                    </button>
                  ))}
                </div>
                
                {/* Sort */}
                <div className="relative">
                  <select
                    className="w-full h-12 rounded-xl border border-[#2c3040] bg-[#0b1020] text-white font-bold px-4 appearance-none outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner text-sm"
                    value={`${sortBy}:${sortDir}`}
                    onChange={(e) => {
                      const [by, dir] = e.target.value.split(":");
                      setSortBy(by);
                      setSortDir(dir);
                    }}
                  >
                    <option value="time:desc">{t("newest_first")}</option>
<option value="time:asc">{t("oldest_first")}</option>
<option value="profit:desc">{t("profit_high_to_low")}</option>
<option value="profit:asc">{t("profit_low_to_high")}</option>
<option value="amount:desc">{t("amount_high_to_low")}</option>
<option value="amount:asc">{t("amount_low_to_high")}</option>
                  </select>
                  <Icon name="arrow-down" className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none"/>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    className="w-full h-12 rounded-xl border border-[#2c3040] bg-[#0b1020] text-white font-bold px-4 pr-10 outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner placeholder:text-gray-600 text-sm"
                    placeholder={t("search_pair_id")}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Icon name="search" className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ----- Data View ----- */}
        {loading ? (
          <Card className={`${cardClass} p-0`}>
            <div className="w-full overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead className="bg-[#0f1424]">
                  <tr className="text-left text-gray-500 border-b border-white/5 text-xs uppercase"><th className="py-4">...</th></tr>
                </thead>
                <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} i={i} />)}</tbody>
              </table>
            </div>
            {/* Mobile Skeleton */}
            <div className="md:hidden flex flex-col p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-800 animate-pulse rounded-xl" />)}
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <Card className={`${cardClass} py-16 text-center flex flex-col items-center justify-center`}>
            <Icon name="clock" className="w-12 h-12 text-gray-600 mb-3" />
            <div className="text-white text-xl font-black mb-1">{t("no_trade_history")}</div>
<div className="text-gray-500 text-sm font-medium">{t("completed_trades_recorded")}</div>
          </Card>
        ) : (
          <Card className={`${cardClass} p-0 flex flex-col`}>
            <div className="w-full flex-1">
              
              {/* 📱 MOBILE CARD VIEW */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {currentRows.map((trade, idx) => {
                  const isBuy = String(t.direction).toUpperCase() === "BUY";
                  const res = String(t.result || "").toUpperCase();
                  const baseCoin = (t.symbol || "btc").split(/[/_-]/)[0].toLowerCase();
                  
                  return (
                    <div key={`trade-mob-${t.id || idx}`} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-3">
                      {/* Top row: Direction, Symbol, Result */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                            <span className="absolute text-xs font-black text-gray-500 tracking-widest">{baseCoin.substring(0,2).toUpperCase()}</span>
                            <img 
                              src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${baseCoin}.svg`} 
                              alt={t.symbol} 
                              className="w-7 h-7 object-contain drop-shadow-md relative z-10"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-lg tracking-wide">{(t.symbol || "N/A").toUpperCase()}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest ${isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {isBuy ? 'BUY' : 'SELL'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.id}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${chipClass(res)}`}>
                          {res || "--"}
                        </span>
                      </div>
                      
                      {/* Bottom row: Details Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0b1020] rounded-xl p-3 ring-1 ring-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{t("amount")}</span>
                          <span className="font-bold text-gray-200">{fmtUSD(Number(t.amount))}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{t("profit")}</span>
                          <span className={`font-black ${Number(t.profit) > 0 ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]" : Number(t.profit) < 0 ? "text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]" : "text-gray-400"}`}>
                            {(Number(t.profit) > 0 ? "+" : "") + fmtUSD(Number(t.profit))}
                          </span>
                        </div>
                        <div className="flex flex-col mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{t("entry_result")}</span>
                          <span className="font-semibold text-gray-300 text-xs tabular-nums">
                            {fmtUSD(Number(t.start_price), 4)} → {fmtUSD(Number(t.result_price), 4)}
                          </span>
                        </div>
                        <div className="flex flex-col mt-2 pt-2 border-t border-white/5 text-right">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{t("time_with_seconds", { seconds: t.duration })}</span>
                          <span className="font-medium text-gray-400 text-xs tabular-nums">
                            {t.timestamp ? new Date(t.timestamp).toLocaleString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 💻 DESKTOP TABLE VIEW */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-[#0b1020] sticky top-0 z-10">
                    <tr className="text-left text-gray-400 border-b border-white/10 text-xs uppercase tracking-widest font-bold">
                      <th className="py-4 pl-6 pr-3">{t("id_hash")}</th>
<th className="py-4 px-3 text-center">{t("direction")}</th>
<th className="py-4 px-3 text-left">{t("symbol")}</th>
<th className="py-4 px-3 text-right">{t("amount")}</th>
<th className="py-4 px-3 text-right">{t("entry")}</th>
<th className="py-4 px-3 text-center">{t("result")}</th>
<th className="py-4 px-3 text-right">{t("result_price")}</th>
<th className="py-4 px-3 text-right">{t("profit")}</th>
<th className="py-4 pr-6 pl-3 text-right">{t("time")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentRows.map((trade, idx) => {
                      const isBuy = String(t.direction).toUpperCase() === "BUY";
                      const res = String(t.result || "").toUpperCase();
                      const baseCoin = (t.symbol || "btc").split(/[/_-]/)[0].toLowerCase();

                      return (
                        <tr key={`trade-${t.id || idx}`} className="group hover:bg-white/[0.02] transition-colors" style={{ height: 72 }}>
                          <td className="py-3 pl-6 pr-3 font-mono text-gray-500 text-xs">{t.id}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center gap-1.5 w-20 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${isBuy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                              <Icon name={isBuy ? "arrow-up" : "arrow-down"} className="w-3 h-3" />
                              {isBuy ? t("buy_uppercase") : t("sell_uppercase")}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-left font-black text-white tracking-wide">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                                <span className="absolute text-[9px] font-black text-gray-500">{baseCoin.substring(0,1).toUpperCase()}</span>
                                <img 
                                  src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${baseCoin}.svg`} 
                                  alt={t.symbol} 
                                  className="w-4 h-4 object-contain relative z-10"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                              <span>{(t.symbol || "N/A").toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-gray-200 tabular-nums">
                            {fmtUSD(Number(t.amount))}
                          </td>
                          <td className="py-3 px-3 text-right font-medium tabular-nums text-gray-400">
                            {t.start_price != null && !isNaN(Number(t.start_price)) ? fmtUSD(Number(t.start_price), 6) : "--"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${chipClass(res)}`}>
                              {res || "--"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-medium tabular-nums text-gray-400">
                            {t.result_price != null && !isNaN(Number(t.result_price)) ? fmtUSD(Number(t.result_price), 6) : "--"}
                          </td>
                          <td className={`py-3 px-3 text-right tabular-nums font-black text-lg ${Number(t.profit) > 0 ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" : Number(t.profit) < 0 ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-gray-500"}`}>
                            {(Number(t.profit) > 0 ? "+" : "") + fmtUSD(Number(t.profit))}
                          </td>
                          <td className="py-3 pr-6 pl-3 text-right font-medium text-gray-500 text-xs">
                            <div className="flex flex-col items-end">
                                <span>{t.timestamp ? new Date(t.timestamp).toLocaleDateString() : ""}</span>
                                <span>{t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ----- Pagination Footer ----- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 bg-[#0b1020]/90 border-t border-cyan-500/10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-4 rounded-xl bg-[#1a2343] text-white font-bold text-sm ring-1 ring-white/10 hover:bg-[#202b54] hover:ring-cyan-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                   <Icon name="arrow-left" className="w-4 h-4" /> {t("prev")}
                </button>
                
                <div className="text-gray-400 text-sm font-medium">
                  {t("page_of", { current: currentPage, total: totalPages })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 rounded-xl bg-[#1a2343] text-white font-bold text-sm ring-1 ring-white/10 hover:bg-[#202b54] hover:ring-cyan-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {t("next")} <Icon name="arrow-right" className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}