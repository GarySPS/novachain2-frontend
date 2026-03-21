// src/pages/TradePage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NovaChainLogo from "../components/NovaChainLogo.svg";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import Icon from "../components/icon";
import OrderBTC from "../components/orderbtc";
import { useTranslation } from "react-i18next";

// Import our new components
import TradeModal from "../components/TradeModal";
import TradeResult from "../components/TradeResult";
import ActiveTradeTimer from "../components/ActiveTradeTimer";

/* ---------------- Coins (unchanged logics) ---------------- */
const COINS = [
  { symbol: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT", api: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT", api: "ethereum" },
  { symbol: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT", api: "solana" },
  { symbol: "XRP", name: "Ripple", tv: "BINANCE:XRPUSDT", api: "ripple" },
  { symbol: "TON", name: "Toncoin", tv: "BINANCE:TONUSDT", api: "toncoin" },
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

export default function TradePage() {
  const { t } = useTranslation();

  /* ---------------- State (unchanged) ---------------- */
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
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
        const res = await axios.get(`${MAIN_API_BASE}/prices/${selectedCoin.api}`);
        
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
    interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedCoin]);

  /* ---------------- TradingView loader (Fixed Cleanly) ---------------- */
  useEffect(() => {
    setLoadingChart(true);
    let tvWidget = null; // Store the widget instance so we can cleanly destroy it

    const createWidget = () => {
      const container = document.getElementById("tradingview_chart_container");
      if (!container) return;
      container.innerHTML = ""; // Clear container before creating new widget

      if (window.TradingView) {
        tvWidget = new window.TradingView.widget({
          container_id: "tradingview_chart_container",
          width: "100%",
          height: 420,
          symbol: selectedCoin.tv,
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
      }
    };

    if (document.getElementById("tradingview-widget-script")) {
      createWidget();
    } else {
      const script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => createWidget(); 
      document.body.appendChild(script);
    }

    return () => {
      // The graceful shutdown: Tell TradingView to properly close its WebSockets
      if (tvWidget && typeof tvWidget.remove === 'function') {
        try {
          tvWidget.remove();
        } catch (e) {}
      }
      const container = document.getElementById("tradingview_chart_container");
      if (container) {
        container.innerHTML = ""; 
      }
    };
  }, [selectedCoin]);

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
          symbol: selectedCoin.symbol,
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

             {/* MOBILE PRICE STATS CARD - Only visible on mobile */}
            <div className="lg:hidden mb-4 relative z-10">
              {/* Changed <Card> to <div> to remove conflicting hidden styles */}
              <div 
                className="w-full px-4 py-4 rounded-2xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] relative overflow-hidden group"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(34,211,238,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
                }}
              >
                {/* Animated top gradient glow */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Corner glows */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Asset Selection at the TOP - Centered */}
                  <div className="flex overflow-x-auto pb-3 mb-3 border-b border-white/5 no-scrollbar">
                    <div className="flex gap-2 mx-auto">
                      {COINS.map((coin) => (
                        <button
                          key={coin.symbol}
                          disabled={timerActive}
                          onClick={() => setSelectedCoin(coin)}
                          className={`
                            px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
                            ${selectedCoin.symbol === coin.symbol
                              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                              : "bg-[#0b1020] text-gray-400 border border-[#2c3040] hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)]"}
                            ${timerActive ? "opacity-40" : ""}
                          `}
                        >
                          {coin.symbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price and Change Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                        {selectedCoin.symbol}/USDT
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                          {typeof coinPrice === "number" && !isNaN(coinPrice)
                            ? "$" + coinPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : fetchError ? "Error" : "..."}
                        </span>
                        {coinStats && (
                          <div className="text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10 shadow-inner">
                            {formatPercent(coinStats.change)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Small indicator for selected asset */}
                    <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                      #{selectedCoin.symbol}
                    </div>
                  </div>

                  {/* Stats row - 24h High/Low/Vol */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">24h High</span>
                      <span className="text-xs font-bold text-gray-200 tabular-nums">
                        {coinStats ? "$" + coinStats.high.toLocaleString() : "..."}
                      </span>
                    </div>
                    <div className="flex flex-col text-center border-x border-white/5">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">24h Low</span>
                      <span className="text-xs font-bold text-gray-200 tabular-nums">
                        {coinStats ? "$" + coinStats.low.toLocaleString() : "..."}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Volume</span>
                      <span className="text-xs font-black text-cyan-400 tabular-nums drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                        {coinStats ? formatVolume(coinStats.vol) : "..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* chart box - enhanced premium glow effect */}
<div 
  className="relative w-full rounded-2xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] overflow-hidden group"
  style={{ 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(34,211,238,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
  }}
>
  {/* Animated top gradient glow */}
  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
  
  {/* Corner glows */}
  <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/5 blur-3xl rounded-full" />
  <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-500/5 blur-3xl rounded-full" />
  
  <div id="tradingview_chart_container" className="w-full h-[420px] relative z-10" />
  {loadingChart && (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0c1323e6] backdrop-blur-sm">
      <svg className="animate-spin mb-4" width="54" height="54" viewBox="0 0 54 54" fill="none">
        <circle cx="27" cy="27" r="24" stroke="#2474ff44" strokeWidth="5" />
        <path d="M51 27a24 24 0 1 1-48 0" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="text-lg font-bold text-sky-100">{t("refreshing_price", "Refreshing Price...")}</div>
    </div>
  )}

  {/* floating price pill - enhanced */}
  <div className="hidden md:block absolute right-4 top-4 z-20">
    <div className="px-4 py-2 rounded-xl bg-[#0f1424]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-white flex flex-col items-end hover:border-cyan-400/50 transition-all duration-300">
      <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
        {selectedCoin.symbol}/USDT
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
            {/* 🔥 MOBILE INLINE BUY/SELL (under chart) */}
{!timerActive && !waitingResult && !tradeDetail && (
  <div className="lg:hidden mt-3 grid grid-cols-2 gap-3">
    <button
      onClick={() => openTradeModal("BUY")}
      className="h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-lg font-black shadow-lg"
    >
      Buy
    </button>

    <button
      onClick={() => openTradeModal("SELL")}
      className="h-14 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white text-lg font-black shadow-lg"
    >
      Sell
    </button>
  </div>
)}

{(timerActive || waitingResult) && (
  <div className="lg:hidden mt-4 flex justify-center">
    <ActiveTradeTimer
      timerActive={timerActive}
      waitingResult={waitingResult}
      tradeState={tradeState}
      timerKey={timerKey}
      onTimerComplete={onTimerComplete}
      t={t}
    />
  </div>
)}
{/* ADD THIS FOR MOBILE RESULT DISPLAY */}
{tradeDetail && (
  <div className="lg:hidden mt-4 relative">
    {/* Close Button for mobile */}
    <button
      onClick={() => {
        setTradeDetail(null);
        setTradeResult(null);
      }}
      className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors flex items-center justify-center backdrop-blur-sm"
      aria-label="Close Result"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <TradeResult
      tradeDetail={tradeDetail}
      t={t}
    />
  </div>
)}
          </div>

          {/* ---------------- Right: Trade panel (Desktop only) ---------------- */}
<div className="hidden lg:block w-full">
  <Card 
    className="w-full px-5 py-6 rounded-3xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] relative overflow-hidden group"
    style={{ 
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(34,211,238,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
    }}
  >
    {/* Enhanced top glow */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Corner glows */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

    {/* header */}
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t("pair", "Pair")}</span>
        <span className="font-black text-2xl tracking-wide text-white drop-shadow-md">
          <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{selectedCoin.symbol}</span>/USDT
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
                  <span className="font-black text-cyan-400 tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{coinStats ? formatVolume(coinStats.vol) : "..."}</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-2">
        {COINS.map((coin) => {
          const active = selectedCoin.symbol === coin.symbol;

          return (
            <button
              key={coin.symbol}
              disabled={timerActive}
              onClick={() => setSelectedCoin(coin)}
              className={`
                relative h-12 rounded-xl border transition-all duration-200
                flex items-center justify-center text-sm font-bold
                ${active
                  ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                  : "bg-[#0b1020] border-[#2c3040] text-gray-400 hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"}
                ${timerActive ? "opacity-40" : ""}
              `}
            >
              {coin.symbol}

              {active && (
                <div className="absolute inset-0 rounded-xl pointer-events-none
                ring-2 ring-cyan-400/50 ring-offset-0" />
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
            className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-lg font-black shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-emerald-400/50 transition hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
          >
            <Icon name="arrow-up" className="w-5 h-5 drop-shadow-md" />
            {t("buy_long", "Buy Long")}
          </button>
          <button
            onClick={() => openTradeModal("SELL")}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white text-lg font-black shadow-[0_0_25px_rgba(244,63,94,0.4)] border border-rose-400/50 transition hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2"
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
                         // WITH THIS (around line 534):
                        className="text-3xl font-extrabold text-yellow-300 py-4 tabular-nums tracking-tight"
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
                      // Pass the onClose function if TradeResult needs it internally (optional)
                      // onClose={() => { setTradeDetail(null); setTradeResult(null); }}
                     />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* --- End Polished Result Box --- */}
            </Card>
          </div>

          {/* Orders strip beneath on small screens */}
          <div className="lg:col-span-2 mt-2">
            <div className="w-full flex justify-center">
              <div className="max-w-5xl w-full px-1 md:px-2">
                <OrderBTC />
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