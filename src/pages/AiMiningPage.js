//src/pages/AiMiningPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { MAIN_API_BASE } from "../config";
import Icon from "../components/icon";
import Modal from "../components/modal";

const fmtUSD = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The 11 Capital Tiers
const TIERS = [
  { name: "Tier 1", min: 50, max: 499, yield: 2 },
  { name: "Tier 2", min: 500, max: 999, yield: 3 },
  { name: "Tier 3", min: 1000, max: 4999, yield: 5 },
  { name: "Tier 4", min: 5000, max: 9999, yield: 7 },
  { name: "Tier 5", min: 10000, max: 14999, yield: 9 },
  { name: "Tier 6", min: 15000, max: 19999, yield: 12 },
  { name: "Tier 7", min: 20000, max: 49999, yield: 14 },
  { name: "Tier 8", min: 50000, max: 99999, yield: 16 },
  { name: "Tier 9", min: 100000, max: 199999, yield: 18 },
  { name: "Tier 10", min: 200000, max: 499999, yield: 20 },
  { name: "Tier X", min: 500000, max: Infinity, yield: 25 },
];

const getYieldTier = (amount) => {
  if (amount >= 500000) return 25;
  if (amount >= 200000) return 20;
  if (amount >= 100000) return 18;
  if (amount >= 50000) return 16;
  if (amount >= 20000) return 14;
  if (amount >= 15000) return 12;
  if (amount >= 10000) return 9;
  if (amount >= 5000) return 7;
  if (amount >= 1000) return 5;
  if (amount >= 500) return 3;
  if (amount >= 50) return 2;
  return 0;
};

export default function AiMiningPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [miningCapital, setMiningCapital] = useState(0);
  const [prices, setPrices] = useState({});
  const [walletBalances, setWalletBalances] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "" });
  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const amount = parseFloat(withdrawAmount);
    
    if (amount <= 0 || amount > miningCapital) {
      alert(t("invalid_withdraw_amount", "Invalid withdraw amount."));
      setIsProcessing(false);
      return;
    }

    try {
      // Calls your existing withdraw endpoint
      await axios.post(`${MAIN_API_BASE}/earn/withdraw`, { 
        coin: "USDT", 
        amount: amount 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMiningCapital(prev => prev - amount);
      setModal({ open: false, type: "" });
      setWithdrawAmount("");
    } catch (err) {
      alert(err.response?.data?.error || t("withdrawal_failed", "Withdrawal failed."));
    } finally {
      setIsProcessing(false);
    }
  };

  // Time simulation for lockup
  const [timeLeft, setTimeLeft] = useState({ d: 6, h: 14, m: 23, s: 59 });

  const currentYield = getYieldTier(miningCapital);
  const estWeekly = miningCapital * (currentYield / 100);

  // Load Data
  useEffect(() => {
    if (!token) return navigate("/login");
    
    // Fetch Spot Balances
    axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWalletBalances(res.data.assets || []))
      .catch(() => {});

    // Fetch Mining Capital (Reusing old Earn endpoint for now)
    axios.get(`${MAIN_API_BASE}/earn/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const assets = res.data.assets || [];
        const usdt = assets.find(a => a.symbol === "USDT")?.balance || 0;
        setMiningCapital(Number(usdt));
      }).catch(() => {});

    // Fetch Prices for Auto-Convert
    const cachedPrices = localStorage.getItem("nc_prices");
    if (cachedPrices) setPrices(JSON.parse(cachedPrices));
  }, [token, navigate]);

  // Simulated countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { d, h, m, s } = prev;
        if (s > 0) s--;
        else { s = 59; if (m > 0) m--; else { m = 59; if (h > 0) h--; else { h = 23; d--; } } }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const amount = parseFloat(depositAmount);
    let usdtEquivalent = amount;
    
    // Auto-Convert logic simulation
    if (selectedAsset !== "USDT" && prices[selectedAsset]) {
      usdtEquivalent = amount * prices[selectedAsset];
    }

    if (usdtEquivalent < 50) {
      alert(t("min_allocation_50", "Minimum allocation is $50 USDT equivalent."));
      setIsProcessing(false);
      return;
    }

    try {
      // In a real app, this would trigger an auto-convert on the backend first, then allocate.
      await axios.post(`${MAIN_API_BASE}/earn/deposit`, { 
        coin: selectedAsset, 
        amount: amount 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMiningCapital(prev => prev + usdtEquivalent);
      setModal({ open: false, type: "" });
      setDepositAmount("");
    } catch (err) {
      alert(err.response?.data?.error || t("allocation_failed", "Allocation failed."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto pb-24 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#0b1020]/80 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
          <Icon name="arrow-left" className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-black tracking-wide text-emerald-400">{t("eth_ai_mining", "ETH AI Mining")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 p-4">
        
        {/* Main Capital Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#141a2b] to-[#0b1020] p-6 shadow-[0_10px_40px_rgba(16,185,129,0.1)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/70">
              {t("deployed_capital")}
            </div>
            <div className="mt-2 text-[clamp(2.5rem,8vw,3.5rem)] font-black leading-none tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {fmtUSD(miningCapital)}
            </div>

            {/* AI Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
              {t("nodes_online", "Nodes Online & Hashing")}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("current_yield")}</div>
              <div className="mt-1 text-2xl font-black text-white">{currentYield}% <span className="text-sm text-slate-500">{t("weekly", "Weekly")}</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("est_payout", "Est. Payout")}</div>
              <div className="mt-1 text-2xl font-black text-emerald-400">+{fmtUSD(estWeekly)}</div>
            </div>
          </div>
        </div>

        {/* Narrative & Analytics Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-2xl border border-white/5 bg-[#141a2b] p-4">
            <p className="text-xs leading-relaxed text-slate-400">
              <strong className="text-emerald-400">{t("ai_engine_active", "AI Engine Active.")}</strong> {t("ai_engine_desc", "Dynamically allocating capital across top Ethereum Layer-2 nodes. ETH block rewards are automatically liquidated and secured in USDT to protect against market volatility.")}
            </p>
          </div>

          {/* Uptime Block */}
          <div className="rounded-2xl border border-white/5 bg-[#141a2b] p-4">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{t("node_uptime", "Node Uptime")}</div>
            <div className="text-xl font-black text-white">99.98%</div>
            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
              <div className="h-full w-full rounded-full bg-emerald-500"></div>
            </div>
          </div>

          {/* Countdown Block */}
          <div className="rounded-2xl border border-white/5 bg-[#141a2b] p-4 text-right">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{t("next_payout", "Next Payout")}</div>
            <div className="text-lg font-black text-white tabular-nums">
              {timeLeft.d}d {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-bold text-rose-400">{t("7_day_lock", "7-Day Lock Active")}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setModal({ open: true, type: "deposit" })}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-sm font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition active:scale-[0.98]"
          >
            <Icon name="zap" className="h-4 w-4" /> {t("deploy_capital", "Deploy Capital")}
          </button>
          
          <button
            onClick={() => setModal({ open: true, type: "withdraw" })}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-bold text-rose-400 transition hover:bg-rose-500/20 active:scale-[0.98]"
          >
            <Icon name="log-out" className="h-4 w-4" /> {t("withdraw")}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-[#141a2b] p-4">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">{t("yield_tiers", "Yield Tiers")}</h3>
          <div className="space-y-2">
            {TIERS.map((tier, idx) => {
              const isActive = currentYield === tier.yield;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                    isActive ? "border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-black/20"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold ${isActive ? "text-emerald-400" : "text-white"}`}>{tier.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {tier.max === Infinity ? `${fmtUSD(tier.min)}+` : `${fmtUSD(tier.min)} - ${fmtUSD(tier.max)}`}
                    </span>
                  </div>
                  <div className={`font-black ${isActive ? "text-emerald-400" : "text-slate-300"}`}>
                    {tier.yield}% <span className="text-[10px] font-normal text-slate-500">{t("per_wk", "/wk")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Auto-Convert Deposit Modal */}
      {/* Dynamic Action Modal */}
      <Modal visible={modal.open} onClose={() => setModal({ open: false, type: "" })} classWrap="bg-[#0f1424] border border-[#1a2343]">
        
        {/* --- DEPOSIT UI --- */}
        {modal.type === "deposit" && (
          <div className="p-2">
            <h2 className="mb-2 text-center text-xl font-black text-white">{t("allocate_capital", "Allocate Capital")}</h2>
            <p className="mb-6 text-center text-xs text-slate-400">{t("deposit_any_asset", "Deposit any asset. It will be auto-converted to USDT to secure your mining contract.")}</p>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400">{t("select_asset", "Select Asset")}</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 font-bold text-white outline-none focus:border-emerald-500"
                >
                  {walletBalances.map(b => (
                    <option key={b.symbol} value={b.symbol}>{b.symbol} ({t("avail", "Avail:")} {Number(b.balance).toFixed(4)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400">{t("amount", "Amount")}</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-bold text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                  placeholder={t("min_50", "Min $50")}
                />
                {depositAmount && selectedAsset !== "USDT" && prices[selectedAsset] && (
                  <div className="mt-2 text-right text-xs font-bold text-emerald-400">
                    {t("auto_converts_to", "Auto-Converts to ≈")} {fmtUSD(parseFloat(depositAmount) * prices[selectedAsset])}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-4 w-full rounded-xl bg-emerald-500 py-4 text-sm font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {isProcessing ? t("allocating_power", "Allocating Node Power...") : t("confirm_allocation", "Confirm Allocation")}
              </button>
            </form>
          </div>
        )}

        {/* --- WITHDRAW UI (PENALTY WARNING) --- */}
        {modal.type === "withdraw" && (
          <div className="p-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
              <Icon name="alert-triangle" className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-center text-xl font-black text-white">{t("early_withdrawal", "Early Withdrawal")}</h2>
            
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <p className="mb-3 text-center font-bold text-rose-400">{t("warning_breaking_cycle", "Warning: Breaking the 7-day cycle")}</p>
              <ul className="list-inside list-disc space-y-2 text-xs text-rose-300">
                <li>{t("withdraw_warn_1", "Your primary capital will be instantly returned to your Spot Wallet.")}</li>
                <li><strong className="text-white">{t("withdraw_warn_2", "All accumulated mining profits for this current cycle will be forfeited.")}</strong></li>
                <li>{t("withdraw_warn_3", "When you redeposit, the 7-day timer will restart entirely from Day 1.")}</li>
              </ul>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold">
                  <span className="text-slate-400">{t("withdraw_amount_usdt", "Withdraw Amount (USDT)")}</span>
                  <span className="text-emerald-400">{t("available", "Available:")} {fmtUSD(miningCapital)}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    max={miningCapital}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-bold text-white placeholder-slate-600 outline-none focus:border-rose-500"
                    placeholder={t("enter_amount", "Enter amount...")}
                  />
                  <button 
                    type="button"
                    onClick={() => setWithdrawAmount(miningCapital)}
                    className="absolute right-2 top-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    {t("max", "MAX")}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !withdrawAmount}
                className="mt-4 w-full rounded-xl bg-rose-600 py-4 text-sm font-black text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] transition hover:bg-rose-500 disabled:opacity-50"
              >
                {isProcessing ? t("processing", "Processing...") : t("acknowledge_withdraw", "Acknowledge & Withdraw")}
              </button>
            </form>
          </div>
        )}

      </Modal>
    </div>
  );
}
