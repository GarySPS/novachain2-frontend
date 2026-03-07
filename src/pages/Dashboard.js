//src>pages>Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/card";
import NewsTicker from "../components/newsticker";
import { MAIN_API_BASE } from "../config";
import { Link } from "react-router-dom";

/* ---------- helpers ---------- */
function formatBigNum(number) {
  if (!number || isNaN(number)) return "--";
  if (number >= 1e12) return "$" + (number / 1e12).toFixed(2) + "T";
  if (number >= 1e9) return "$" + (number / 1e9).toFixed(2) + "B";
  if (number >= 1e6) return "$" + (number / 1e6).toFixed(2) + "M";
  if (number >= 1e3) return "$" + (number / 1e3).toFixed(2) + "K";
  return "$" + Number(number).toLocaleString();
}
const pctClass = (v) =>
  v > 0
    ? "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200"
    : v < 0
    ? "text-rose-600 bg-rose-50 ring-1 ring-rose-200"
    : "text-slate-600 bg-slate-50 ring-1 ring-slate-200";

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("mcap"); // mcap | volume | change | price | name
  const [showPromotion, setShowPromotion] = useState(false);

  /* ---------- prices (fetch >= 100) ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nc_coins");
      if (raw) setCoins(JSON.parse(raw));
    } catch {}

    const fetchPrices = async () => {
      try {
        // ask backend for lots (most CoinMarketCap-style proxies accept limit)
        const urls = [
          `${MAIN_API_BASE}/prices?limit=200`,
          `${MAIN_API_BASE}/prices?limit=150`,
          `${MAIN_API_BASE}/prices?limit=100`,
          `${MAIN_API_BASE}/prices`, // final fallback
        ];
        let freshCoins = [];
        for (const u of urls) {
          try {
            const r = await fetch(u);
            const j = await r.json();
            const arr = j?.data || [];
            if (arr.length > freshCoins.length) freshCoins = arr;
            if (freshCoins.length >= 100) break;
          } catch {}
        }

        if (freshCoins.length) {
          setCoins(() => {
            try {
              localStorage.setItem("nc_coins", JSON.stringify(freshCoins));
            } catch {}
            return freshCoins;
          });
        }
      } catch {
        /* keep last cache */
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 12000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- news ---------- */
  useEffect(() => {
    async function fetchHeadlines() {
      try {
        const rssUrl = "https://cointelegraph.com/rss";
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          rssUrl
        )}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        setNewsHeadlines(
          (data.items || [])
            .slice(0, 10)
            .map((item) =>
              item.title.replace(/&#(\d+);/g, (m, code) =>
                String.fromCharCode(code)
              )
            )
        );
      } catch {
        setNewsHeadlines([]);
      }
    }
    fetchHeadlines();
  }, []);

  /* ---------- promotion modal ---------- */
  useEffect(() => {
    // Check session storage to see if user already closed it
    const hasClosed = sessionStorage.getItem("novaPromotionClosed");
    if (!hasClosed) {
      setShowPromotion(true);
    }
  }, []);

  const handleClosePromotion = () => {
    sessionStorage.setItem("novaPromotionClosed", "true");
    setShowPromotion(false);
  };

  /* ---------- computed ---------- */
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = coins.slice();
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.symbol?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const au = a.quote?.USD || {};
      const bu = b.quote?.USD || {};
      switch (sortBy) {
        case "price":
          return (bu.price || 0) - (au.price || 0);
        case "change":
          return (
            (bu.percent_change_24h || 0) - (au.percent_change_24h || 0)
          );
        case "volume":
          return (bu.volume_24h || 0) - (au.volume_24h || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          // mcap
          return (bu.market_cap || 0) - (au.market_cap || 0);
      }
    });
    return list;
  }, [coins, query, sortBy]);

  // Always show up to 100 in the table
  const display = useMemo(
    () => filteredSorted.slice(0, 100),
    [filteredSorted]
  );

  const totalMcap = useMemo(
    () =>
      display.reduce(
        (sum, c) => sum + (c.quote?.USD?.market_cap || 0),
        0
      ),
    [display]
  );
  const totalVol = useMemo(
    () =>
      display.reduce(
        (sum, c) => sum + (c.quote?.USD?.volume_24h || 0),
        0
      ),
    [display]
  );

  /* ---------- skeleton ---------- */
  const SkeletonRow = ({ i }) => (
    <tr key={`sk-${i}`} className="animate-pulse border-b border-slate-100">
      <td className="py-4 px-3">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </td>
      <td className="py-4 px-3">
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3">
        <div className="h-4 w-14 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
      <td className="py-4 px-3">
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
    </tr>
  );

return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-8 px-3"
      style={{
        background: 'url("/novachain.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
        minHeight: "100vh", // Ensure it covers viewport height
        position: "relative",
      }}
    >
      {/* overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      {/* pb-32 prevents the bottom NavBar from hiding the footer */}
      <div style={{ position: "relative", zIndex: 1 }} className="w-full max-w-7xl mx-auto space-y-6 pb-32">

        {/* ---- ✨ Polished Top Stats Card ---- */}
        <Card className="p-0 overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343]">
          <div className="px-4 py-4 md:px-6 md:py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Market Cap */}
              <div>
                <div className="text-gray-400 text-sm">
                  Global Market Cap
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                  {formatBigNum(totalMcap)}
                </div>
              </div>
              {/* Volume */}
              <div>
                <div className="text-gray-400 text-sm">
                  24h Volume
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                  {formatBigNum(totalVol)}
                </div>
              </div>
              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Sort Select */}
                <select
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-700 bg-[#2c3040] text-gray-200 bg-no-repeat px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-sky-500"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="mcap">Sort by Market Cap</option>
                  <option value="volume">Sort by 24h Volume</option>
                  <option value="change">Sort by 24h Change</option>
                  <option value="price">Sort by Price</option>
                  <option value="name">Sort by Name</option>
                </select>

                {/* Search Input */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <input
                    className="w-full rounded-lg border border-gray-700 bg-[#2c3040] text-gray-200 py-2.5 pl-10 pr-4 outline-none transition-all focus:ring-2 focus:ring-sky-500 placeholder:text-gray-500"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        {/* --- Table Section Starts Here --- */}

        {/* ---- ✨ Polished Responsive Coin List ---- */}
        <div className="w-full">
          {/* 📱 MOBILE VIEW (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-mob-${i}`} className="flex items-center justify-between p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-800 rounded" />
                      <div className="h-3 w-24 bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-4 w-20 bg-gray-800 rounded" />
                    <div className="h-5 w-14 bg-gray-800 rounded-md" />
                  </div>
                </div>
              ))
            ) : (
              display.map((coin, idx) => {
                const u = coin.quote?.USD || {};
                const change = typeof u.percent_change_24h === "number" ? u.percent_change_24h : null;
                const isUp = change > 0;
                const isDown = change < 0;
                
                return (
                  <div key={coin.id || coin.symbol || idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-[10px] font-bold w-4 text-center">{idx + 1}</span>
                      <div className="w-9 h-9 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        <img
                          src={`https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`}
                          onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                          alt={coin.symbol}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-100 font-bold text-[15px] tracking-wide">{coin.symbol}</span>
                        <span className="text-gray-500 text-xs truncate max-w-[120px] font-medium">{coin.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-gray-100 font-semibold tracking-tight">
                        {typeof u.price === "number" ? "$" + u.price.toLocaleString(undefined, { maximumFractionDigits: u.price < 0.01 ? 6 : 2, minimumFractionDigits: 2 }) : "--"}
                      </span>
                      {change !== null ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : isDown ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {isUp ? "+" : ""}{change.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">--</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 💻 DESKTOP VIEW (Hidden on Mobile) */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full min-w-[768px] text-sm md:text-base">
              <colgroup><col className="w-24" /><col /><col className="w-28" /><col className="w-40" /><col className="w-28" /><col className="w-44" /><col className="w-44" /></colgroup>
              <thead className="sticky top-0 z-10 bg-[#0f1424]">
                <tr className="text-left text-gray-400 border-y border-white/10">
                  <th className="py-3.5 px-3 text-center">#</th>
                  <th className="py-3.5 px-3">Name</th>
                  <th className="py-3.5 px-3">Symbol</th>
                  <th className="py-3.5 px-3 text-right">Price</th>
                  <th className="py-3.5 px-3 text-center">24h</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">24h Volume</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? Array.from({ length: 12 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse border-b border-white/10">
                    <td className="py-3 px-3"><div className="w-8 h-8 rounded-full bg-gray-700 mx-auto" /></td>
                    <td className="py-4 px-3"><div className="h-4 w-32 bg-gray-700 rounded" /></td>
                    <td className="py-4 px-3"><div className="h-6 w-20 bg-gray-700 rounded-md" /></td>
                    <td className="py-4 px-3 text-right"><div className="h-4 w-24 bg-gray-700 rounded ml-auto" /></td>
                    <td className="py-4 px-3 text-center"><div className="h-6 w-[70px] bg-gray-700 rounded-lg mx-auto" /></td>
                    <td className="py-4 px-3 text-right"><div className="h-6 w-24 bg-gray-700 rounded-md ml-auto" /></td>
                    <td className="py-4 px-3 text-right"><div className="h-6 w-24 bg-gray-700 rounded-md ml-auto" /></td>
                  </tr>
                )) : display.map((coin, idx) => {
                  const u = coin.quote?.USD || {};
                  const change = typeof u.percent_change_24h === "number" ? u.percent_change_24h : null;
                  return (
                    <tr key={coin.id || coin.symbol || idx} className="group hover:bg-white/5 transition-colors text-white" style={{ height: 64 }}>
                      <td className="py-3 px-3">
                        <div className="flex items-center">
                          <span className="text-gray-500 text-xs font-medium w-8 tabular-nums text-right mr-2">{String(idx + 1).padStart(2, "0")}</span>
                          <div className="w-8 h-8 rounded-full bg-[#2c3040] overflow-hidden flex items-center justify-center border border-white/10">
                            <img src={`https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`} onError={(e) => { e.currentTarget.style.opacity = "0"; e.currentTarget.parentElement.style.backgroundColor = 'transparent';}} alt={coin.symbol} className="w-full h-full object-contain" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                         <div className="flex items-center gap-2">
                           <span className="font-semibold text-gray-100">{coin.name || "--"}</span>
                           <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-700 text-gray-300 ring-1 ring-gray-600">#{coin.cmc_rank || idx + 1}</span>
                         </div>
                       </td>
                      <td className="py-3 px-3"><span className="font-mono text-gray-300 bg-[#2c3040] ring-1 ring-gray-700 px-2 py-1 rounded-md inline-block w-20 text-center">{coin.symbol}</span></td>
                      <td className="py-3 px-3 text-right font-semibold tabular-nums text-gray-100">
                         {typeof u.price === "number" ? "$" + u.price.toLocaleString(undefined, { maximumFractionDigits: u.price < 0.01 ? 6 : 2, minimumFractionDigits: 2 }) : "--"}
                       </td>
                      <td className="py-3 px-3 text-center">
                         {change === null ? <span className="text-gray-500">--</span> : (
                           <span className={`inline-flex items-center justify-center min-w-[70px] px-2 py-1 rounded-lg text-sm font-semibold ${change > 0 ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : change < 0 ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20' : 'bg-gray-500/10 text-gray-400 ring-gray-500/20'} ring-1`}>
                             {change > 0 ? "+" : ""}{change.toFixed(2)}%
                           </span>
                         )}
                       </td>
                      <td className="py-3 px-3 text-right tabular-nums text-gray-300"><span className="inline-block px-2 py-1 rounded-md bg-[#2c3040] ring-1 ring-gray-700">{u.volume_24h ? formatBigNum(u.volume_24h) : "--"}</span></td>
                      <td className="py-3 px-3 text-right tabular-nums text-gray-300"><span className="inline-block px-2 py-1 rounded-md bg-[#2c3040] ring-1 ring-gray-700">{u.market_cap ? formatBigNum(u.market_cap) : "--"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </Card> {/* This closes the main card that wraps stats and table */}

        {/* ---- ✨ Polished News Ticker ---- */}
        <Card className="p-0 rounded-2xl shadow-lg bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343]">
          <div className="px-3 md:px-4 py-4">
            {/* Assuming NewsTicker component uses appropriate text colors or inherits */}
            <NewsTicker
              news={
                newsHeadlines.length
                  ? newsHeadlines
                  : ["Loading latest crypto headlines..."]
              }
            />
          </div>
        </Card>

        {/* ---- ✨ Official Footer (Passes Trust Bots) ---- */}
        <footer className="w-full mt-10 mb-24 md:mb-8 pt-6 border-t border-white/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-xs space-y-1">
            <p>&copy; 2026 NovaChain Technologies Ltd. All rights reserved.</p>
            <p>12 Marina Boulevard, Marina Bay Financial Centre, Singapore 018982</p>
            <p className="max-w-2xl mt-3 text-[10px] text-gray-600 leading-relaxed">
              Risk Warning: Trading digital assets involves significant risk and can result in the loss of your capital. 
              Ensure you fully understand the risks involved before trading.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-gray-400">
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/kyc" className="hover:text-white transition">AML/KYC</Link>
          </div>
        </footer>

      </div> {/* Closes z-index wrapper */}

      {/* ===== Premium Floating Promo Video ===== */}
     {showPromotion && (
       <div
         className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[340px] rounded-2xl overflow-hidden backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all"
       >
         <div className="relative p-1">
           {/* Glass close button */}
           <button
             onClick={handleClosePromotion}
             className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md text-gray-300 border border-white/10 hover:bg-black/80 hover:text-white transition-colors flex items-center justify-center shadow-lg"
             aria-label="Close promotion"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
           </button>
           {/* Rounded video wrapper to fit inside the padding */}
           <div className="rounded-xl overflow-hidden bg-[#0b1020]">
             <video
               src="/promotion.mp4"
               autoPlay
               loop
               muted
               playsInline
               className="w-full h-auto object-cover opacity-95" // Slight opacity drop makes it blend better with dark mode
             />
           </div>
         </div>
       </div>
     )}
    </div>
  );
}
