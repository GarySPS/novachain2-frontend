// src/components/TradeModal.js

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./icon";

export default function TradeModal({
  isOpen,
  onClose,
  direction,
  duration,
  setDuration,
  amount,
  setAmount,
  profitMap,
  onSubmit,
  t,
}) {
  const handleConfirm = () => {
    onSubmit();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm m-4 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0f1424] text-white border border-[#1a2343] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top edge colored glow */}
            <div className={`absolute top-0 left-0 w-full h-1 ${direction === "BUY" ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent" : "bg-gradient-to-r from-transparent via-rose-400 to-transparent"}`} />

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Icon name={direction === "BUY" ? "arrow-up" : "arrow-down"} className={`w-6 h-6 ${direction === "BUY" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]"}`} />
                {direction === "BUY" ? t("buy_long_up", "Long (Up)") : t("sell_short_down", "Short (Down)")}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Duration / Period */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                {t("select_period", "Select Period")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { d: 30, p: "+30%" },
                  { d: 60, p: "+50%" },
                  { d: 90, p: "+70%" },
                  { d: 120, p: "+100%" },
                ].map(({ d, p }) => {
                  const active = duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-1 py-3 rounded-xl text-center transition-all duration-200 border ${
                        active
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          : "bg-[#1a2343] border-transparent text-gray-400 hover:bg-[#202b54] hover:text-gray-200"
                      }`}
                    >
                      <span className={`block text-lg font-black ${active ? "text-cyan-400 drop-shadow-md" : ""}`}>{d}s</span>
                      <span className="block text-[10px] font-bold mt-0.5 opacity-80">{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="modal-amount" className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {t("amount") + " (USDT)"}
                </label>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {t("profit", "Profit")}: +${(amount * (profitMap[duration] || 0.3)).toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <input
                  id="modal-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full h-14 px-4 py-2 rounded-xl bg-[#0b1020] border border-[#2c3040] text-white text-xl font-black focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  USDT
                </div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {[25, 50, 100, 250, 500].map((v) => {
                  const active = amount === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`h-9 rounded-lg text-xs font-bold transition border ${
                        active 
                          ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300" 
                          : "bg-[#1a2343] border-transparent text-gray-400 hover:bg-[#202b54] hover:text-white"
                      }`}
                      type="button"
                    >
                      ${v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm Button */}
            <button
              className={`w-full h-14 mt-2 rounded-xl font-black text-lg shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-white ${
                direction === "BUY"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50"
                  : "bg-gradient-to-r from-rose-500 to-rose-400 hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] border border-rose-400/50"
              }`}
              onClick={handleConfirm}
            >
              {t("confirm", "Confirm")} {direction === "BUY" ? t("buy_long_up", "Long") : t("sell_short_down", "Short")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}