// src/components/TradeModal.js

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  usdtBalance = 0,
}) {
  const navigate = useNavigate();
  const isInsufficient = Number(amount) > Number(usdtBalance);
  const handleConfirm = () => {
  onSubmit();
  setTimeout(() => {
    onClose();
  }, 100);
};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] flex items-end justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            
animate={{ y: 0 }}
exit={{ y: "100%" }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="
              w-full
              max-w-md
              h-[85dvh]
              px-6 pt-6 pb-32
              rounded-t-[2.5rem]
              bg-[#050505]/85
              backdrop-blur-2xl
              border-t border-l border-r border-white/10
              shadow-[0_-20px_60px_rgba(0,0,0,0.9)]
              overflow-y-auto
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
<div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4" />

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
                      className={`px-1 py-3 rounded-xl text-center transition-all duration-300 border backdrop-blur-md ${
                        active
                          ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                          : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-white"
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
                <label htmlFor="modal-amount" className="block text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  {t("amount") + " (USDT)"}
                  <span className={`px-2 py-0.5 rounded text-[10px] ${isInsufficient ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {t("available", "Available")}: ${Number(usdtBalance).toFixed(2)}
                  </span>
                </label>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {t("profit", "Profit")}: +${(amount * (profitMap[duration] || 0.3)).toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <input
                  id="modal-amount"
                  type="text" /* Changed from "number" to remove native browser arrows */
                  inputMode="decimal"
                  pattern="[0-9]*"
                  min={1}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setAmount(val === "" ? "" : Number(val));
                  }}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  required
                  className="w-full h-14 pl-4 pr-14 py-2 rounded-xl bg-[#070b16] border border-[#2c3040] text-white text-xl font-black outline-none transition-colors focus:border-sky-500"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
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
                      className={`h-9 rounded-lg text-xs font-bold transition-all border backdrop-blur-md ${
                        active 
                          ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-300" 
                          : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-white"
                      }`}
                      type="button"
                    >
                      ${v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Confirm / Convert Button */}
            {isInsufficient ? (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold justify-center mb-1">
                  <Icon name="alert-circle" className="w-3.5 h-3.5" />
                  {t("insufficient_usdt_action", "Not enough USDT. Choose an option:")}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/wallet?action=deposit&coin=USDT'); 
                    }}
                    className="flex-1 h-12 rounded-xl font-bold text-sm transition-all text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Icon name="arrow-down" className="w-4 h-4 text-gray-400" />
                    {t("deposit", "Deposit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/wallet?action=convert'); 
                    }}
                    className="flex-1 h-12 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:brightness-110 border border-sky-400/50 flex items-center justify-center gap-2"
                  >
                    <Icon name="refresh-cw" className="w-4 h-4" />
                    {t("convert", "Convert")}
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
