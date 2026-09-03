// src/pages/AgentDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Users, TrendingUp, ShieldCheck, ChevronRight, Activity, LogOut } from "lucide-react";
import { MAIN_API_BASE } from "../config";

// ==========================================
// 🛠️ EASY EDIT VARIABLES
// ==========================================
const COMMISSION_SHARE = "15%";
const COMMISSION_CURRENCY = "USDT";
const visibleWalletSymbols = ["USDT", "USDC", "BTC", "ETH", "BNB"]; // Used for balance calculation
// ==========================================

export default function AgentDashboard() {
  const [networkUsers, setNetworkUsers] = useState([]);
  const [totalBalance, setTotalBalance] = useState("0.00"); // ⬅️ NEW: State for real balance
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ⬅️ NEW: Fetch both Agent Network and Wallet Balance at the same time
        const [resNetwork, resBalance] = await Promise.all([
          fetch(`${MAIN_API_BASE}/agent/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // 1. Handle Network Users
        if (resNetwork.ok) {
          const dataNetwork = await resNetwork.json();
          setNetworkUsers(dataNetwork.users || []);
          localStorage.setItem("isAgent", "true"); 
        }

        // 2. Handle Real Total Balance (Same logic as WalletPage)
        if (resBalance.ok) {
          const dataBalance = await resBalance.json();
          const assets = dataBalance.assets || [];

          // Get cached prices from WalletPage
          let savedPrices = {};
          try {
            const raw = localStorage.getItem("nc_prices");
            if (raw) savedPrices = JSON.parse(raw);
          } catch {}

          let sum = 0;
          assets
            .filter(({ symbol }) => visibleWalletSymbols.includes(symbol))
            .forEach(({ symbol, balance }) => {
              const coinPrice = symbol === "USDT" ? 1 : (savedPrices[symbol] || 0);
              sum += Number(balance) * coinPrice;
            });

          // Format to 2 decimal places
          setTotalBalance(sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAgent");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-cyan-50 relative overflow-hidden font-sans pb-20 selection:bg-cyan-500/30">
      
      {/* Sci-Fi Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />

      {/* Premium Neon Ambient Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 px-5 pt-12 pb-6 max-w-md mx-auto">
        
        {/* Header with Logout Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" size={26} />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Agent Portal
              </span>
            </h1>
            <p className="text-xs font-mono text-cyan-500/70 mt-1 uppercase tracking-[0.15em]">
              Exclusive Partner Node
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl transition-all active:scale-95 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Crypto Graph Commission Card */}
        <div className="relative rounded-2xl bg-gray-900/60 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-6 overflow-hidden group">
          {/* SVG Sparkline Graph Background */}
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-40 transition-opacity group-hover:opacity-60" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,100 L0,50 L50,60 L100,20 L150,40 L200,10 L250,50 L300,30 L350,70 L400,20 L400,100 Z" fill="url(#grad)" />
            <polyline points="0,50 50,60 100,20 150,40 200,10 250,50 300,30 350,70 400,20" fill="none" stroke="#22d3ee" strokeWidth="2" className="drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
          </svg>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-cyan-400" size={14} />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-500/80">Total Yield</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm">
                {/* ⬅️ NEW: Dynamically rendered real balance */}
                {loading ? "..." : totalBalance}
              </span>
              <span className="text-sm font-black text-cyan-400 tracking-wider">{COMMISSION_CURRENCY}</span>
            </div>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {/* Share Card */}
          <div className="relative rounded-2xl bg-gray-900/40 border border-white/5 p-5 backdrop-blur-md flex flex-col justify-center items-center text-center overflow-hidden hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <TrendingUp className="text-purple-400" size={20} />
            </div>
            <span className="text-2xl font-black font-mono text-white">{COMMISSION_SHARE}</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mt-1">Your Share</span>
          </div>

          {/* Network Card */}
          <div className="relative rounded-2xl bg-gray-900/40 border border-white/5 p-5 backdrop-blur-md flex flex-col justify-center items-center text-center overflow-hidden hover:border-cyan-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-2xl" />
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Users className="text-cyan-400" size={20} />
            </div>
            <span className="text-2xl font-black font-mono text-white">
              {loading ? "-" : networkUsers.length}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mt-1">Active Network</span>
          </div>
        </div>

        {/* Network List HUD */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-500">Network Nodes</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-900/20 rounded-2xl border border-white/5 backdrop-blur-sm">
              <Loader2 className="animate-spin text-cyan-500 mb-3" size={28} />
              <p className="text-xs font-mono text-cyan-500/50 uppercase tracking-widest">Syncing Data...</p>
            </div>
          ) : networkUsers.length === 0 ? (
            <div className="text-center py-10 bg-gray-900/40 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-sm font-mono text-gray-500 uppercase tracking-wider">No nodes connected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {networkUsers.map((user) => (
                <div key={user.id} className="group flex items-center justify-between bg-gray-900/40 border border-white/5 rounded-xl p-4 backdrop-blur-sm transition-all active:scale-[0.98] hover:bg-gray-800/60 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <div className="flex items-center gap-4">
                    {/* Sci-Fi Avatar */}
                    <div className="relative h-10 w-10 rounded-lg bg-gray-950 border border-cyan-500/30 flex items-center justify-center shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
                      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-400 rounded-tl-sm" />
                      <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-400 rounded-br-sm" />
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        #{String(user.id).padStart(3, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-100 group-hover:text-cyan-50 transition-colors">
                        {user.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                        Linked {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}