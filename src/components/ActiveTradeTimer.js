// src/components/ActiveTradeTimer.js

import React from "react";
import { motion } from "framer-motion";
import TimerBar from "./TimerBar";

export default function ActiveTradeTimer({
  timerActive,
  waitingResult,
  tradeState,
  timerKey,
  onTimerComplete,
  t,
}) {
  if (timerActive && tradeState && !waitingResult) {
    return (
      <motion.div
        key="timer"
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 24 }}
        transition={{ duration: 0.32, type: "spring" }}
        className="flex flex-col items-center mt-6 w-full"
      >
        <TimerBar key={timerKey} endAt={tradeState.endAt} onComplete={onTimerComplete} />
      </motion.div>
    );
  }

  if (waitingResult) {
    return (
      <motion.div
        key="waiting"
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 24 }}
        transition={{ duration: 0.32, type: "spring" }}
        className="flex flex-col items-center mt-7 w-full"
      >
        <div className="flex flex-col items-center justify-center min-h-[130px] p-6 rounded-2xl bg-[#0f1424] border border-[#1a2343] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <svg className="animate-spin mb-4" width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20" stroke="#1a2343" strokeWidth="4" />
            <path d="M42 22a20 20 0 1 1-40 0" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </svg>
          <div className="text-lg font-black text-white text-center drop-shadow-md tracking-wide">
            {t("processing_trade", "Processing your trade...")}
          </div>
          <div className="text-cyan-400 mt-1.5 text-xs font-bold uppercase tracking-wider text-center animate-pulse">
            {t("please_wait", "Awaiting settlement")}
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}