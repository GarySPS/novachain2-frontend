// src/components/TradeResult.js

import React from "react";
import { motion } from "framer-motion";
import Card from "./card";
import Icon from "./icon";

export default function TradeResult({ tradeDetail, t }) {
  if (!tradeDetail) return null;

  const isWin = tradeDetail.result === "WIN";

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{
  opacity: 1,
  y: 0,
  scale: isWin ? [0.95, 1.05, 1] : 1
}}
      exit={{ opacity: 0, y: 32, scale: 0.97 }}
      transition={{ duration: 0.36, type: "spring" }}
    >
      <Card
        className={`mt-6 px-8 py-8 rounded-[2rem] shadow-2xl border transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-2xl relative overflow-hidden ${
          isWin 
            ? "bg-[#050505]/80 border-emerald-500/20 shadow-[0_10px_50px_rgba(16,185,129,0.15)]" 
            : "bg-[#050505]/80 border-rose-500/20 shadow-[0_10px_50px_rgba(244,63,94,0.15)]"
        }`}
        style={{ minWidth: "300px", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}
      >
        {isWin && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent animate-pulse pointer-events-none" />
        )}
        
        {/* Sleek Top Edge Glow */}
        <div className={`absolute top-0 w-full h-[2px] ${isWin ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.8)]'}`} />

        {/* Win / Loss Badge */}
        <div className="flex items-center justify-center gap-2 mb-4 w-full relative z-10">
          <span className={`rounded-full px-5 py-1.5 text-xs uppercase tracking-[0.2em] font-black border flex items-center gap-2 ${
            isWin 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              : "bg-rose-500/10 text-rose-400 border-rose-500/20 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
          }`}>
            {isWin ? t("win", "WIN") : t("loss", "LOSS")} 
            <Icon name={isWin ? "check" : "close"} className="w-4 h-4" />
          </span>
        </div>

        {/* Massive Glowing Profit/Loss Number */}
        <div
          className={`mt-2 mb-6 text-5xl font-black text-center tabular-nums tracking-tighter ${
            isWin 
              ? "text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" 
              : "text-white drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]"
          }`}
        >
          <span className={isWin ? "text-emerald-400" : "text-rose-400"}>
            {isWin ? "+$" : "-$"}
          </span>
          {Math.abs(tradeDetail.profit).toFixed(2)}
        </div>

        {/* Inner Details Data Box (Nested Glass) */}
        <div className="w-full flex flex-col space-y-3 bg-[#0a0a0a]/60 rounded-2xl p-5 border border-white/5 shadow-inner">
          <div className="flex justify-between w-full text-[13px]">
            <span className="text-gray-500 font-medium uppercase tracking-wider">{t("entry", "Entry")}</span>
            <span className="font-bold text-gray-200 tabular-nums">
              {!isNaN(Number(tradeDetail.start_price))
                ? `$${Number(tradeDetail.start_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between w-full text-[13px]">
            <span className="text-gray-500 font-medium uppercase tracking-wider">{t("result", "Result")}</span>
            <span className={`font-bold tabular-nums ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {!isNaN(Number(tradeDetail.result_price))
                ? `$${Number(tradeDetail.result_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between w-full text-[13px] pt-3 border-t border-white/5">
            <span className="text-gray-500 font-medium uppercase tracking-wider">{t("duration")}</span>
            <span className="font-bold text-white">{tradeDetail.duration}{t("seconds_short", "s")}</span>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] text-center">
          {isWin
            ? t("profit_credited", "Profit credited to wallet")
            : t("loss_deducted", "Loss deducted from wallet")}
        </div>
      </Card>
    </motion.div>
  );
}