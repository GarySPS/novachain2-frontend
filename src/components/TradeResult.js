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
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 32, scale: 0.97 }}
      transition={{ duration: 0.36, type: "spring" }}
    >
      <Card
        className={`mt-6 px-8 py-7 rounded-3xl shadow-2xl border transition-all duration-300 flex flex-col items-center justify-center bg-[#0f1424] relative overflow-hidden ${
          isWin ? "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)]"
        }`}
        style={{ minWidth: "290px", maxWidth: "370px", marginLeft: "auto", marginRight: "auto" }}
      >
        {/* Subtle background glow */}
        <div className={`absolute top-0 w-full h-1 ${isWin ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'}`} />

        <div className="flex items-center justify-center gap-2 mb-3 w-full relative z-10">
          {isWin ? (
            <span className="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 rounded-full px-6 py-1.5 text-sm uppercase tracking-widest font-black shadow-[0_0_15px_rgba(16,185,129,0.2)] text-center flex items-center gap-2">
              {t("win", "WIN")} <Icon name="check" className="w-5 h-5" />
            </span>
          ) : (
            <span className="bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 rounded-full px-6 py-1.5 text-sm uppercase tracking-widest font-black shadow-[0_0_15px_rgba(244,63,94,0.2)] text-center flex items-center gap-2">
              {t("loss", "LOSS")} <Icon name="close" className="w-5 h-5" />
            </span>
          )}
        </div>

        <div className={`mt-1 text-4xl font-black text-center drop-shadow-md tabular-nums tracking-tight ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
          {isWin
            ? `+ $${Math.abs(tradeDetail.profit).toFixed(2)}`
            : `- $${Math.abs(tradeDetail.profit).toFixed(2)}`}
        </div>

        <div className="mt-5 w-full flex flex-col items-center justify-center space-y-2 bg-[#0b1020] rounded-xl p-4 ring-1 ring-white/5">
          <div className="flex justify-between w-full text-sm font-medium">
            <span className="text-gray-500">{t("entry", "Entry")}:</span>
            <span className="font-bold text-white tabular-nums">
              {!isNaN(Number(tradeDetail.start_price))
                ? `$${Number(tradeDetail.start_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between w-full text-sm font-medium">
            <span className="text-gray-500">{t("result", "Result")}:</span>
            <span className={`font-bold tabular-nums ${isWin ? 'text-emerald-300' : 'text-rose-300'}`}>
              {!isNaN(Number(tradeDetail.result_price))
                ? `$${Number(tradeDetail.result_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between w-full text-sm font-medium pt-2 border-t border-white/5">
            <span className="text-gray-500">{t("duration")}:</span>
            <span className="font-bold text-gray-300">{tradeDetail.duration}{t("seconds_short", "s")}</span>
          </div>
        </div>

        <div className="mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
          {isWin
            ? t("profit_credited", "Profit credited to wallet")
            : t("loss_deducted", "Loss deducted from wallet")}
        </div>
      </Card>
    </motion.div>
  );
}