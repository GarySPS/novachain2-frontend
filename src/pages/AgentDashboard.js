//src>pages>AgentDashboard.js

import React, { useState, useEffect } from "react";
import { Loader2, Users, TrendingUp, ShieldCheck, ChevronRight } from "lucide-react";
import { MAIN_API_BASE } from "../config";

// ==========================================
// 🛠️ EASY EDIT VARIABLES
// ==========================================
const COMMISSION_SHARE = "15%";
const TOTAL_COMMISSION_EARNED = "1,250.00";
const COMMISSION_CURRENCY = "USDT";
// ==========================================

export default function AgentDashboard() {
  const [networkUsers, setNetworkUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${MAIN_API_BASE}/agent/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setNetworkUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to load network", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-white relative overflow-hidden font-sans pb-20">
      {/* Premium Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 px-5 pt-12 pb-6 max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={24} />
              Agent Portal
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Exclusive Partner Network</p>
          </div>
        </div>

        {/* Highlight Commission Card (Glassmorphism) */}
        <div className="relative rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl mb-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Commission</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter text-white">
              {TOTAL_COMMISSION_EARNED}
            </span>
            <span className="text-sm font-bold text-blue-400">{COMMISSION_CURRENCY}</span>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-3xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-md flex flex-col justify-center items-center text-center">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <span className="text-2xl font-black text-white">{COMMISSION_SHARE}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Your Share</span>
          </div>

          <div className="rounded-3xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-md flex flex-col justify-center items-center text-center">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <Users className="text-blue-400" size={20} />
            </div>
            <span className="text-2xl font-black text-white">
              {loading ? "-" : networkUsers.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Active Network</span>
          </div>
        </div>

        {/* Network List */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 px-1">Network Members</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : networkUsers.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
              <p className="text-sm text-gray-400">No users in your network yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {networkUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 transition-active active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/[0.1] flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">
                        {String(user.id).padStart(3, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">
                        {user.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}