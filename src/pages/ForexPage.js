// src/pages/ForexPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NovaChainLogo from "../components/NovaChainLogo.svg";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import Icon from "../components/icon";
import OrderXAU from "../components/OrderXAU"
import { useTranslation } from "react-i18next";

// Import our new components
import TradeModal from "../components/TradeModal";
import TradeResult from "../components/TradeResult";
import ActiveTradeTimer from "../components/ActiveTradeTimer";

/* ---------------- Forex Definition ---------------- */
const FOREX_PAIRS = [
  { symbol: "XAU/USD", name: "Gold", tv: "OANDA:XAUUSD", api: "xau" },
  { symbol: "XAG/USD", name: "Silver", tv: "OANDA:XAGUSD", api: "xag" },
  { symbol: "WTI/USD", name: "WTI Oil", tv: "OANDA:WTICOUSD", api: "wti" },
  { symbol: "GAS/USD", name: "Natural Gas", tv: "OANDA:NATGASUSD", api: "natgas" },
  { symbol: "XCU/USD", name: "Copper", tv: "OANDA:XCUUSD", api: "xcu" },
];
const profitMap = { 30: 0.3, 60: 0.5, 90: 0.7, 120: 1.0 };

// Helper function to format the percentage
const formatPercent = (n) => {
  const num = Number(n || 0);
  const prefix = num > 0 ? "+" : "";
  // Use Tailwind's text color classes
  const colorClass = num >= 0 ? "text-green-500" : "text-red-500";
  return (
    <span className={`font-bold ${colorClass}`}>
      {prefix}{num.toFixed(2)}%
    </span>
  );
};

// Helper function to format large currency numbers for volume
const formatVolume = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) {
    return "$" + (num / 1_000_000_000).toFixed(2) + "B";
  }
  if (num >= 1_000_000) {
    return "$" + (num / 1_000_000).toFixed(2) + "M";
  }
  if (num >= 1_000) {
    return "$" + (num / 1_000).toFixed(2) + "K";
  }
  return "$" + num.toFixed(2);
};

/* ---------------- Local storage helpers (unchanged) ---------------- */
function persistTradeState(tradeState) {
  if (tradeState) localStorage.setItem("activeTrade", JSON.stringify(tradeState));
  else localStorage.removeItem("activeTrade");
}
function loadTradeState() {
  try {
    return JSON.parse(localStorage.getItem("activeTrade") || "null");
  } catch {
    return null;
  }
}
function createTradeState(trade_id, user_id, duration) {
  const endAt = Date.now() + duration * 1000;
  return { trade_id, user_id, duration, endAt };
}

export default function ForexPage() {
  const { t } = useTranslation();

  /* ---------------- State (unchanged) ---------------- */
  const [selectedCommodity, setSelectedCommodity] = useState(FOREX_PAIRS[0]);
  const [coinPrice, setCoinPrice] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [coinStats, setCoinStats] = useState(null);

  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(30);
  const [direction, setDirection] = useState("BUY");

  const [timerActive, setTimerActive] = useState(false);
  const [tradeState, setTradeState] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [waitingResult, setWaitingResult] = useState(false);

  const [tradeResult, setTradeResult] = useState(null);
  const [tradeDetail, setTradeDetail] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- pretty toast ---
  const [toast, setToast] = useState(null); // { text, type, id }
  const showToast = (text, type = "error") => {
    const id = Math.random();
    setToast({ text, type, id });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 2000);
  };

  /* ---------------- Restore active trade (unchanged) ---------------- */
  useEffect(() => {
    const saved = loadTradeState();
    if (saved && saved.endAt > Date.now()) {
      const remaining = Math.ceil((saved.endAt - Date.now()) / 1000);
      const adjustedTradeState = { ...saved, duration: remaining };
      setTradeState(adjustedTradeState);
      setTimerActive(true);
      setTradeDetail(null);
      setTradeResult(null);
      setTimerKey(Math.random());
    }
  }, []);

  /* ---------------- Price polling (unchanged) ---------------- */
  useEffect(() => {
    let interval;
    const fetchPrice = async () => {
      try {
        const res = await axios.get(`${MAIN_API_BASE}/prices/${selectedCommodity.api}`);

        
        // Set price
        setCoinPrice(Number(res.data?.price));
        
        // Set new stats
        setCoinStats({
          high: res.data?.high_24h || 0,
          low: res.data?.low_24h || 0,
          vol: res.data?.volume_24h || 0,
          change: res.data?.percent_change_24h || 0,
        });

        setFetchError(false);
      } catch {
        setCoinPrice(null);
        setCoinStats(null); // Clear stats on error
        setFetchError(true);
      }
    };
    fetchPrice();
    interval = setInterval(fetchPrice, 30000); // Changed from 5s to 30s
    return () => clearInterval(interval);
  }, [selectedCommodity]);

  /* ---------------- TradingView loader (Fixed) ---------------- */
  useEffect(() => {
    setLoadingChart(true);

    // This function creates the widget
    const createWidget = () => {
      // Make sure the container is ready and empty
      const container = document.getElementById("tradingview_chart_container");
      if (!container) {
        console.error("TradingView container not found");
        return;
      }
      container.innerHTML = ""; // Clear container before creating new widget

      // Check if TradingView library is loaded
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: "tradingview_chart_container",
          width: "100%",
          height: 420,
          symbol: selectedCommodity.tv,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0f0f16",
          backgroundColor: "#101726",
          enable_publishing: false,
          allow_symbol_change: false,
          hide_top_toolbar: false,
          hide_legend: false,
          hide_side_toolbar: true,
          withdateranges: true,
          details: false,
          studies: [],
          overrides: {},
          loading_screen: { backgroundColor: "#101726", foregroundColor: "#ffd700" },
        });
        setTimeout(() => setLoadingChart(false), 1400);
      } else {
        console.error("TradingView library not loaded");
      }
    };

    // Check if script is already on the page
    if (document.getElementById("tradingview-widget-script")) {
      // If script is already loaded, just create the widget
      createWidget();
    } else {
      // If script is not loaded, create and load it
      const script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => createWidget(); // Create widget *after* script loads
      document.body.appendChild(script);
    }

    // The new cleanup function
    return () => {
      const container = document.getElementById("tradingview_chart_container");
      if (container) {
        container.innerHTML = ""; // Just empty the container
      }
    };
  }, [selectedCommodity]);

  /* ---------------- Result polling (unchanged) ---------------- */
  async function pollResult(trade_id, user_id) {
    let tries = 0,
      trade = null;
    const token = localStorage.getItem("token");
    while (tries < 6 && (!trade || trade.result === "PENDING")) {
      try {
        const his = await axios.get(`${MAIN_API_BASE}/trade/history/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        trade = his.data.find((t) => t.id === trade_id);
        if (trade && trade.result !== "PENDING") break;
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
      tries++;
    }
    setTimerActive(false);
    setTradeState(null);
    persistTradeState(null);
    if (trade && trade.result !== "PENDING") {
      setTradeResult(trade.result === "WIN" ? trade.profit : -Math.abs(trade.profit));
      setTradeDetail(trade);
    } else {
      setTradeResult(null);
      setTradeDetail(null);
      showToast(t("trade_result_not_ready", "Trade result not ready, please check history!"), "info");
    }
  }

  const onTimerComplete = async () => {
    setWaitingResult(true);
    if (!tradeState) return;
    await pollResult(tradeState.trade_id, tradeState.user_id);
    setTradeState(null);
    setTimerActive(false);
    setWaitingResult(false);
    setTimerKey(Math.random());
    return { shouldRepeat: false, delay: 0 };
  };

  /* ---------------- Execute trade (unchanged) ---------------- */
  const executeTrade = async () => {
    if (!coinPrice || timerActive) return;
    setTimerActive(true);
    setTradeResult(null);
    setTradeDetail(null);

    const token = localStorage.getItem("token");
    if (!token) {
      showToast(t("please_login", "Please log in to trade."), "warning");
      setTimerActive(false);
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

    const endAt = Date.now() + duration * 1000;
    const temp = { trade_id: "temp", user_id, duration, endAt };

    setTradeState(temp);
    setTimerKey(Math.random());

    try {
      const res = await axios.post(
        `${MAIN_API_BASE}/trade`,
        {
          user_id,
          direction: direction.toUpperCase(),
          amount: Number(amount),
          duration: Number(duration),
          symbol: selectedCommodity.api,
          client_price: Number(coinPrice) || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.trade_id) throw new Error("Failed to start trade");
      const { trade_id } = res.data;

      setTradeState((prev) => (prev ? { ...prev, trade_id } : createTradeState(trade_id, user_id, duration)));
      persistTradeState({ trade_id, user_id, duration, endAt });
    } catch (err) {
      setTimerActive(false);
      setTradeResult(null);
      setTradeDetail(null);
      persistTradeState(null);
      showToast(`${t("trade_failed", "Trade failed")}: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const openTradeModal = (dir) => {
    if (timerActive) return;
    setDirection(dir);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-full px-3 pt-5 overflow-x-hidden"
    >
      {/* soft overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }} className="w-full">
        <div className="w-full max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-7 lg:gap-8">
          {/* ---------------- Left: Chart & selectors ---------------- */}
          {/* This outer div should remain */}
          <div className="w-full">
            {/* The coin selector div inside was correctly removed */}

            {/* chart box - THIS is what needs to be here */}
            <div className="relative w-full rounded-2xl shadow-2xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] overflow-hidden">
              <div id="tradingview_chart_container" className="w-full h-[420px]" />
              {loadingChart && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c1323e6] backdrop-blur-sm">
                  <svg className="animate-spin mb-4" width="54" height="54" viewBox="0 0 54 54" fill="none">
                    <circle cx="27" cy="27" r="24" stroke="#2474ff44" strokeWidth="5" />
                    <path d="M51 27a24 24 0 1 1-48 0" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                  <div className="text-lg font-bold text-sky-100">{t("refreshing_price", "Refreshing Price...")}</div>
                </div>
              )}

              {/* floating price pill */}
              <div className="absolute right-[88px] top-[46px] md:right-4 md:top-4 z-10">
                <div className="px-3 py-1.5 rounded-xl bg-[#0f1424]/80 backdrop-blur-md border border-[#1a2343] shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-white flex flex-col items-end">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-0.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                    {selectedCommodity.symbol}
                  </div>
                  <div className="text-base tabular-nums font-black leading-none tracking-tight">
                    {typeof coinPrice === "number" && !isNaN(coinPrice)
                      ? "$" + coinPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })
                      : fetchError
                      ? t("api_error", "API Error")
                      : t("loading", "Loading...")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Right: Trade panel ---------------- */}
          {/* This wrapper div holds the right column content */}
          <div className="w-full">
            <Card className="w-full px-5 py-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              {/* header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t("pair", "Pair")}</span>
                  <span className="font-black text-2xl tracking-wide text-white drop-shadow-md">
                    <span className="text-cyan-400">{selectedCommodity.symbol.split('/')[0]}</span>/{selectedCommodity.symbol.split('/')[1] || "USD"}
                  </span>
                </div>
                <img src={NovaChainLogo} alt="NovaChain" className="h-8 w-auto ml-4 opacity-90 drop-shadow-lg" />
              </div>

              {/* Price Stats & Selector */}
              <div className="mb-6 pb-6 border-b border-white/5 relative z-10">
                
                <div className="flex justify-between items-start mb-5">
                    {/* Left: Price & % Change */}
                    <div className="flex flex-col">
                        <div className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                        {typeof coinPrice === "number" && !isNaN(coinPrice)
                            ? "$" + coinPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : "..."}
                        </div>
                        {coinStats && (
                        <div className="text-sm mt-1.5 bg-white/5 inline-flex w-max px-2.5 py-0.5 rounded border border-white/10 shadow-inner">
                            {formatPercent(coinStats.change)}
                        </div>
                        )}
                    </div>

                    {/* Right: Stats Stack */}
                    <div className="flex flex-col text-right text-xs space-y-1.5 pt-1">
                        <div className="flex justify-end gap-2 items-center">
                            <span className="text-gray-500 font-semibold uppercase tracking-wider">24h High:</span>
                            <span className="font-bold text-gray-200 tabular-nums">{coinStats ? "$" + coinStats.high.toLocaleString() : "..."}</span>
                        </div>
                        <div className="flex justify-end gap-2 items-center">
                            <span className="text-gray-500 font-semibold uppercase tracking-wider">24h Low:</span>
                            <span className="font-bold text-gray-200 tabular-nums">{coinStats ? "$" + coinStats.low.toLocaleString() : "..."}</span>
                        </div>
                        <div className="flex justify-end gap-2 items-center">
                            <span className="text-gray-500 font-semibold uppercase tracking-wider">24h Vol:</span>
                            <span className="font-black text-cyan-400 tabular-nums">{coinStats ? formatVolume(coinStats.vol) : "..."}</span>
                        </div>
                    </div>
                </div>

                {/* Premium Commodity Selector */}
<div className="grid grid-cols-5 gap-2 mt-2">
  {FOREX_PAIRS.map((commodity) => {
    const active = selectedCommodity.symbol === commodity.symbol;

    return (
      <button
        key={commodity.symbol}
        disabled={timerActive}
        onClick={() => setSelectedCommodity(commodity)}
        className={`
          relative h-12 rounded-xl border transition-all duration-200
          flex items-center justify-center text-sm font-bold
          ${
            active
              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              : "bg-[#0b1020] border-[#2c3040] text-gray-400 hover:text-white hover:border-cyan-500/40"
          }
          ${timerActive ? "opacity-40" : ""}
        `}
      >
        {commodity.symbol.split("/")[0]}

        {active && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none
            ring-1 ring-cyan-400/40"
          />
        )}
      </button>
    );
  })}
</div>
              </div>

              {/* Buy/Sell Buttons */}
              <AnimatePresence>
                {!timerActive && !waitingResult && !tradeDetail && (
                  <motion.div
                    key="trade-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="grid grid-cols-2 gap-3 relative z-10"
                  >
                    <button
                      onClick={() => openTradeModal("BUY")}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-lg font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50 transition hover:brightness-110 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Icon name="arrow-up" className="w-5 h-5 drop-shadow-md" />
                      {t("buy_long", "Buy Long")}
                    </button>
                    <button
                      onClick={() => openTradeModal("SELL")}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white text-lg font-black shadow-[0_0_20px_rgba(244,63,94,0.3)] border border-rose-400/50 transition hover:brightness-110 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Icon name="arrow-down" className="w-5 h-5 drop-shadow-md" />
                      {t("sell_short", "Sell Short")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

                 {/* --- Polished Timer/Waiting --- */}
                 <div className="mt-5 text-center"> {/* Add margin top and center alignment */}
                   <AnimatePresence>
                     {/* Keep AnimatePresence */}
                     {(timerActive || waitingResult) && (
                       // Apply styles within the animated div
                       <motion.div
                         key="timer-waiting"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}

                        className="text-3xl font-extrabold text-yellow-300 py-4 tabular-nums tracking-tight" // Changed to bright yellow
                         style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }} // Add subtle shadow for visibility
                       >
                         <ActiveTradeTimer
                           timerActive={timerActive}
                           waitingResult={waitingResult}
                           tradeState={tradeState}
                           timerKey={timerKey}
                           onTimerComplete={onTimerComplete}
                           t={t}
                         />
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
                 {/* --- End Polished Timer/Waiting --- */}

                   {/* --- Polished Result Box with Close Button --- */}
                   <AnimatePresence>
                     {tradeDetail && ( // Only show wrapper if tradeDetail exists
                       <motion.div
                         key="result-card-wrapper"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         className="relative mt-5" // Add margin top
                       >
                         {/* Close Button (Top Right corner of the card) */}
                         <button
                           onClick={() => {
                              setTradeDetail(null); // Clear the result object
                              setTradeResult(null); // Clear the numeric result value too
                           }}
                           className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors flex items-center justify-center backdrop-blur-sm"
                           aria-label="Close Result"
                         >
                           {/* Simple 'X' icon using SVG */}
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                             <line x1="18" y1="6" x2="6" y2="18"></line>
                             <line x1="6" y1="6" x2="18" y2="18"></line>
                           </svg>
                         </button>

                         {/* Render the actual result card */}
                         <TradeResult
                           tradeDetail={tradeDetail}
                           t={t}
                          />
                       </motion.div>
                     )}
                   </AnimatePresence>
                   {/* --- End Polished Result Box --- */}
            </Card>
          </div> {/* This is the closing div for the right column wrapper (around 465) */}

          {/* Orders strip beneath on small screens */}
          <div className="lg:col-span-2 mt-2">
            <div className="w-full flex justify-center">
              <div className="max-w-5xl w-full px-1 md:px-2">
                <OrderXAU />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW Trade Modal (Rendered at root level) */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        direction={direction}
        duration={duration}
        setDuration={setDuration}
        amount={amount}
        setAmount={setAmount}
        profitMap={profitMap}
        onSubmit={executeTrade}
        t={t}
      />

      {/* toast – always global */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
            role="status"
            aria-live="polite"
          >
      <div
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ring-1 ring-white/15 text-white backdrop-blur pointer-events-auto
      ${
        toast.type === "error"
          ? "bg-rose-600/90"
          : toast.type === "warning"
          ? "bg-amber-600/90"
          : "bg-slate-900/90"
      }`}
  >
    <Icon
      name={
        toast.type === "error" ? "alert-circle" : toast.type === "warning" ? "alert-triangle" : "check-circle"
      }
      className="w-6 h-6"
    />
    <span className="text-base font-semibold">{toast.text}</span>
  </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}