//src>pages>WalletPage.js
import { MAIN_API_BASE } from '../config';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Card from "../components/card";
import Field from "../components/field";
import Modal from "../components/modal";
import Icon from "../components/icon";
import AIPerformance from '../components/AIPerformance';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createClient } from '@supabase/supabase-js';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useSendTransaction, useWriteContract, useChainId } from 'wagmi';
import { parseEther, parseUnits } from 'viem';

const SUPABASE_URL = "https://obrfnkggcfgfspyqgtws.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmZua2dnY2ZnZnNweXFndHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzkyNTAsImV4cCI6MjA3ODgxNTI1MH0.fMvyyXxfQn3dTzkiCA1phf1-qRnMN-BvtbMIaTwGD0I";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- helpers (UI only) ---------------- */
const coinSymbols = ["USDT", "USDC", "BTC", "ETH", "BNB"];
const depositNetworks = { USDT: "ERC20 / BEP20", USDC: "ERC20 / BEP20", BTC: "BTC", ETH: "ERC20", BNB: "BEP20" };
const fmtUSD = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------------- uploads ---------------- */
async function uploadDepositScreenshot(file, userId) {
  if (!file) return null;
  const filePath = `${userId}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('deposit').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return filePath;
}

export default function WalletPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [userId, setUserId] = useState(null);
  const [prices, setPrices] = useState({});
  // preload last known prices so page never starts at $0
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nc_prices");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setPrices(parsed);
      }
    } catch {}
  }, []);

  const [balances, setBalances] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", coin: "" });
  const [toast, setToast] = useState("");
  const [selectedDepositCoin, setSelectedDepositCoin] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const fileInputRef = useRef();
  const [selectedWithdrawCoin, setSelectedWithdrawCoin] = useState("USDT");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "" });
  const [fromCoin, setFromCoin] = useState("USDT");
  const [toCoin, setToCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [walletAddresses, setWalletAddresses] = useState({});
  const [walletQRCodes, setWalletQRCodes] = useState({});
  const [fileLocked, setFileLocked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [totalUsd, setTotalUsd] = useState(0);
  const [convertBusy, setConvertBusy] = useState(false);
  // lock + inline toasts
const [depositBusy, setDepositBusy] = useState(false);
const [withdrawBusy, setWithdrawBusy] = useState(false);
const [depositToast, setDepositToast] = useState("");
const [withdrawToast, setWithdrawToast] = useState("");

// ===== NEW: State for Earn Wallet =====
const [earnBalances, setEarnBalances] = useState([]); // { symbol, balance }
const [totalEarnUsd, setTotalEarnUsd] = useState(0);
const [currentEarnRate, setCurrentEarnRate] = useState(0);
const [earnModal, setEarnModal] = useState({ open: false, type: "save", coin: "USDT", amount: "" });
const [earnBusy, setEarnBusy] = useState(false);
const [earnToast, setEarnToast] = useState(null);
// ======================================
// ===== Web3 Hooks =====
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const [web3Busy, setWeb3Busy] = useState(false);

  /* ---------------- history merge (unchanged logic) ---------------- */
  const userDepositHistory = depositHistory.filter(d => userId && Number(d.user_id) === Number(userId));
  const userWithdrawHistory = withdrawHistory.filter(w => userId && Number(w.user_id) === Number(userId));
  const allHistory = [
    ...userDepositHistory.map(d => ({ ...d, type: "Deposit" })),
    ...userWithdrawHistory.map(w => ({ ...w, type: "Withdraw" })),
  ].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

  // ===== MODIFIED: This now calculates total for *main* wallet only =====
  useEffect(() => {
    if (!balances.length) { setTotalUsd(0); return; }
    // We don't need to check prices.length, the logic will handle it
    let sum = 0;
    balances.forEach(({ symbol, balance }) => {
      // --- THIS IS THE FIX ---
      // Always use 1 for USDT, otherwise use the live price (or 0 if not found)
      const coinPrice = (symbol === "USDT") ? 1 : (prices[symbol] || 0);
      sum += Number(balance) * coinPrice;
    });
    setTotalUsd(sum);
  }, [balances, prices]);

  // ===== NEW: Calculate total USD in Earn Wallet =====
  useEffect(() => {
    if (!earnBalances.length || !Object.keys(prices).length) {
      setTotalEarnUsd(0);
      return;
    }
    let sum = 0;
    earnBalances.forEach(({ symbol, balance }) => {
      const coinPrice = prices[symbol] || (symbol === "USDT" ? 1 : 0);
      sum += Number(balance) * coinPrice;
    });
    setTotalEarnUsd(sum);
  }, [earnBalances, prices]);

  // ===== NEW: Calculate current earn rate based on total Earn USD =====
useEffect(() => {
  if (totalEarnUsd >= 50000) {
    setCurrentEarnRate(20); // 20% APY for $50,000+
  } else if (totalEarnUsd >= 20000) {
    setCurrentEarnRate(15); // 15% APY for $20,000+
  } else if (totalEarnUsd >= 3000) {
    setCurrentEarnRate(10); // 10% APY for $3,000+
  } else {
    setCurrentEarnRate(0); // 0% for below $3,000
  }
}, [totalEarnUsd]);
  // ===============================================================

  /* ---------------- auth / redirects (unchanged) ---------------- */
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch {
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
    setAuthChecked(true);
  }, [token]);

  useEffect(() => {
    if (!authChecked) return;
    if (!token || token === "undefined" || !userId || userId === "undefined") {
      setIsGuest(true);
    }
  }, [authChecked, token, userId]);

  useEffect(() => {
    if (!authChecked) return;
    if (isGuest) {
      navigate("/login", { replace: true });
    }
  }, [authChecked, isGuest, navigate]);

  /* ---------------- live prices (unchanged) ---------------- */
  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const res = await axios.get(`${MAIN_API_BASE}/prices`);
        if (stopped) return;
        let map = res.data?.prices;
        if (!map || !Object.keys(map).length) {
          map = {};
          (res.data?.data || []).forEach(c => {
            if (c?.symbol) map[c.symbol] = c?.quote?.USD?.price;
          });
        }
        if (map && Object.keys(map).length) {
          setPrices(prev => {
            const next = { ...prev, ...map };
            try { localStorage.setItem("nc_prices", JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 10_000);
    return () => { stopped = true; clearInterval(id); };
  }, []);

  useEffect(() => {
    let canceled = false;
    const refreshPair = async () => {
      try {
        const [a, b] = await Promise.all([
          axios.get(`${MAIN_API_BASE}/prices/${fromCoin}`),
          axios.get(`${MAIN_API_BASE}/prices/${toCoin}`)
        ]);
        if (canceled) return;
        const pa = Number(a.data?.price);
        const pb = Number(b.data?.price);
        setPrices(prev => {
          const next = { ...prev };
          if (Number.isFinite(pa) && pa > 0) next[fromCoin] = pa;
          if (Number.isFinite(pb) && pb > 0) next[toCoin] = pb;
          try { localStorage.setItem("nc_prices", JSON.stringify(next)); } catch {}
          return next;
        });
      } catch {}
    };
    refreshPair();
    const id = setInterval(refreshPair, 10_000);
    return () => { canceled = true; clearInterval(id); };
  }, [fromCoin, toCoin]);

/* ---------------- wallet & histories (unchanged) ---------------- */
useEffect(() => {
  console.log("🔄 Fetching deposit addresses from:", `${MAIN_API_BASE}/public/deposit-addresses`);
  
  axios.get(`${MAIN_API_BASE}/public/deposit-addresses`)
    .then(res => {
      console.log("✅ Deposit addresses response:", res.data);
      
      const addresses = {};
      const qrcodes = {};

      res.data.forEach(row => {
        console.log("Processing coin:", row.coin, "address:", row.address);
        addresses[row.coin] = row.address;

        if (row.qr_url && row.qr_url.startsWith("https://")) {
          qrcodes[row.coin] = row.qr_url;
        } else {
          qrcodes[row.coin] = null;
        }
      });
      
      console.log("Final addresses object:", addresses);
      console.log("Final qrcodes object:", qrcodes);
      
      setWalletAddresses(addresses);
      setWalletQRCodes(qrcodes);
    })
    .catch(error => {
      console.error("❌ Error fetching deposit addresses:", error);
      console.error("Error details:", error.response?.data);
      setWalletAddresses({});
      setWalletQRCodes({});
    });
}, []);

  // ===== MODIFIED: Added fetchEarnBalances() =====
  useEffect(() => {
    if (!token || !userId) return;
    fetchBalances();
    fetchEarnBalances(); // <-- NEW
    axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDepositHistory(res.data)).catch(() => setDepositHistory([]));
    axios.get(`${MAIN_API_BASE}/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWithdrawHistory(res.data)).catch(() => setWithdrawHistory([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);
  // ===============================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const coin = params.get("coin");
    if (action === "deposit" && coin) { setSelectedDepositCoin(coin); openModal("deposit", coin); }
    if (action === "withdraw" && coin) openModal("withdraw", coin);
    if (action === "convert") {
      const el = document.getElementById("convert-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(""), 1200); return () => clearTimeout(t); }
  }, [toast]);

  useEffect(() => {
    if (!amount || isNaN(amount)) { setResult(""); return; }
    if (fromCoin === toCoin) { setResult(""); return; }
    if (!prices[fromCoin] || !prices[toCoin]) { setResult(""); return; }
    const usdValue = parseFloat(amount) * prices[fromCoin];
    const receive = usdValue / prices[toCoin];
    setResult(receive.toFixed(toCoin === "BTC" ? 6 : toCoin === "ETH" ? 4 : 3));
  }, [fromCoin, toCoin, amount, prices]);

  function fetchBalances() {
    if (!token || !userId) return;
    // This endpoint should return the *main* wallet (e.g., "spot" wallet)
    axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBalances(res.data.assets || []))
      .catch(() => setBalances([]));
  }

  // ===== NEW: Function to fetch Earn Wallet balances =====
  function fetchEarnBalances() {
  if (!token || !userId) return;
  console.log("Fetching earn balances from:", `${MAIN_API_BASE}/earn/balance`);
  
  axios.get(`${MAIN_API_BASE}/earn/balance`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      console.log("Earn balances response:", res.data);
      setEarnBalances(res.data.assets || []);
    })
    .catch(err => {
      console.error("Error fetching earn balances:", err.response?.data || err.message);
      setEarnBalances([]);
    });
}
  // =====================================================

  const openModal = (type, coin) => setModal({ open: true, type, coin });
  const closeModal = () => setModal({ open: false, type: "", coin: "" });

  // ===== NEW: Handlers for Earn Modal =====
  const openEarnModal = (type) => setEarnModal({ open: true, type, coin: "USDT", amount: "" });
  const closeEarnModal = () => setEarnModal({ open: false, type: "save", coin: "USDT", amount: "" });

  const handleEarnSubmit = async (e) => {
  e.preventDefault();
  if (earnBusy) return;
  
  const { type, coin, amount } = earnModal;
  const parsedAmount = parseFloat(amount);
  
  // Calculate USD value for validation
  let usdValue = parsedAmount;
  if (coin !== "USDT" && prices[coin]) {
    usdValue = parsedAmount * prices[coin];
  }
  
  // Minimum validation for deposits
  if (type === 'save' && usdValue < 3000) {
    setEarnToast({
      type: "error",
      message: t("min_deposit_3000_error", { amount: fmtUSD(3000 - usdValue) })
    });
    setTimeout(() => setEarnToast(null), 3000);
    return;
  }
  
  setEarnBusy(true);
  setEarnToast(null);

  const endpoint = type === 'save' ? '/earn/deposit' : '/earn/withdraw';
  const payload = { coin, amount: parsedAmount };
  
  let wasSuccess = false;

  try {
    const res = await axios.post(`${MAIN_API_BASE}${endpoint}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data && res.data.success) {
      wasSuccess = true;
      setEarnToast({
        type: "success",
        message: type === 'save' 
          ? t("save_success", { amount: parsedAmount, coin, usd: fmtUSD(usdValue) })
          : t("withdraw_success", { amount: parsedAmount, coin })
      });
      fetchBalances(); // Refresh main wallet
      fetchEarnBalances(); // Refresh earn wallet
    } else {
      setEarnToast({
        type: "error",
        message: res.data.error || t("Operation Failed")
      });
    }
  } catch (err) {
    setEarnToast({
      type: "error",
      message: err.response?.data?.error || t("Operation Failed")
    });
  } finally {
    setTimeout(() => {
      setEarnToast(null);
      if (wasSuccess) {
        closeEarnModal();
        setEarnModal({ open: false, type: "save", coin: "USDT", amount: "" });
      }
    }, 2000); 
    setEarnBusy(false);
  }
};
  // ============================================

 const handleWeb3Deposit = async () => {
  if (!isConnected) {
    open(); 
    return;
  }
  if (!depositAmount || parseFloat(depositAmount) <= 0) {
    setDepositToast("Please enter a valid amount first");
    setTimeout(() => setDepositToast(""), 1500);
    return;
  }
  const depositAddress = walletAddresses[selectedDepositCoin];
  if (!depositAddress) return setDepositToast("Address not found");

  try {
    setWeb3Busy(true);
    let txHash;

    if (selectedDepositCoin === "ETH" || selectedDepositCoin === "BNB") {
      txHash = await sendTransactionAsync({
        to: depositAddress,
        value: parseEther(depositAmount.toString()),
      });
    } else if (selectedDepositCoin === "USDT" || selectedDepositCoin === "USDC") {
      const isEthereum = chainId === 1;
      let tokenContract, decimals;

      if (selectedDepositCoin === "USDT") {
        tokenContract = isEthereum ? "0xdAC17F958D2ee523a2206206994597C13D831ec7" : "0x55d398326f99059fF775485246999027B3197955";
        decimals = isEthereum ? 6 : 18;
      } else { // USDC
        tokenContract = isEthereum ? "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" : "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
        decimals = isEthereum ? 6 : 18;
      }

      txHash = await writeContractAsync({
        address: tokenContract,
        abi: [{"constant": false,"inputs": [{"name": "_to","type": "address"},{"name": "_value","type": "uint256"}],"name": "transfer","outputs": [{"name": "","type": "bool"}],"type": "function"}],
        functionName: 'transfer',
        args: [depositAddress, parseUnits(depositAmount.toString(), decimals)],
      });
    }

    await axios.post(`${MAIN_API_BASE}/deposit`, { 
      coin: selectedDepositCoin,
      amount: depositAmount,
      address: depositAddress,
      screenshot: `web3-tx-${txHash}`, 
    }, { headers: { Authorization: `Bearer ${token}` } });

    setDepositToast("Web3 Deposit Successful!");
    fetchBalances();
    setTimeout(() => { closeModal(); setDepositAmount(""); }, 1500);
  } catch (err) {
    console.error(err);
    setDepositToast("Transaction Failed or Cancelled");
    setTimeout(() => setDepositToast(""), 1500);
  } finally {
    setWeb3Busy(false);
  }
};

const handleDepositSubmit = async (e) => {
  e.preventDefault();
  if (depositBusy) return;
  setDepositBusy(true);

  // --- Get and check the address ---
  const depositAddress = walletAddresses[selectedDepositCoin];
  
  // --- DEBUG: Check what's being sent ---
  console.log("🔄 Submitting deposit with:", {
    coin: selectedDepositCoin,
    amount: depositAmount,
    address: depositAddress,
    addressExists: !!depositAddress,
    screenshot: !!depositScreenshot
  });
  // --- End debug ---

  if (!depositAddress) {
    setDepositToast(t("Address not found, please try again.") || "Address not found, please try again.");
    console.error("Deposit address is missing for coin:", selectedDepositCoin, "Available addresses:", walletAddresses);
    setTimeout(() => setDepositToast(""), 1400);
    setDepositBusy(false);
    return; // Stop the function here
  }

  try {
    let screenshotUrl = null;
    if (depositScreenshot) {
      screenshotUrl = await uploadDepositScreenshot(depositScreenshot, userId);
    }

    await axios.post(`${MAIN_API_BASE}/deposit`, { 
      coin: selectedDepositCoin,
      amount: depositAmount,
      address: depositAddress,
      screenshot: screenshotUrl,
    }, { headers: { Authorization: `Bearer ${token}` } });

    setDepositToast(t("Deposit Submitted") || "Deposit Submitted");
    setDepositAmount("");
    setDepositScreenshot(null);
    setFileLocked(false);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input

    // refresh list
    axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDepositHistory(res.data));

    // close after short delay
    setTimeout(() => { setDepositToast(""); closeModal(); }, 1400);
  } catch (err) {
    // Use the detailed error from the backend if it exists
    const errorMsg = err.response?.data?.detail || err.response?.data?.error || t("deposit_failed");
    setDepositToast(errorMsg);
    console.error(err);
    setTimeout(() => setDepositToast(""), 1400);
  } finally {
    setDepositBusy(false);
  }
};
  
const handleWithdraw = async (e) => {
  e.preventDefault();
  if (withdrawBusy) return;
  setWithdrawBusy(true);
  try {
    const res = await axios.post(`${MAIN_API_BASE}/withdraw`, {
      user_id: userId,
      coin: selectedWithdrawCoin,
      amount: withdrawForm.amount,
      address: withdrawForm.address,
    }, { headers: { Authorization: `Bearer ${token}` } });

    if (res.data && res.data.success) {
      setWithdrawToast(t("Withdraw Submitted") || "Withdraw Submitted");
      axios.get(`${MAIN_API_BASE}/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setWithdrawHistory(r.data));
      fetchBalances();
    } else {
      setWithdrawToast(t("withdraw_failed"));
    }
  } catch (err) {
    setWithdrawToast(err.response?.data?.error || t("withdraw_failed"));
    console.error(err);
  } finally {
    setTimeout(() => { setWithdrawForm({ address: "", amount: "" }); setWithdrawToast(""); closeModal(); }, 1400);
    setWithdrawBusy(false);
  }
};

  const swap = () => { setFromCoin(toCoin); setToCoin(fromCoin); setAmount(""); setResult(""); };

const handleConvert = async e => {
  e.preventDefault();
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || fromCoin === toCoin || convertBusy) return;
  
  setConvertBusy(true);
  try {
    const res = await axios.post(`${MAIN_API_BASE}/convert`, {
      from_coin: fromCoin, to_coin: toCoin, amount: parseFloat(amount)
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    if (res.data && res.data.success) {
      setSuccessMsg(t("Convert Successful", {
        amount: amount, fromCoin,
        received: Number(res.data.received).toLocaleString(undefined, { maximumFractionDigits: 6 }),
        toCoin,
      }));
      fetchBalances();
      setAmount("");
      setResult("");
    } else {
      setSuccessMsg(t("Convert Failed"));
    }
  } catch (err) {
    setSuccessMsg(err.response?.data?.error || t("convert_failed"));
  } finally {
    setTimeout(() => {
      setSuccessMsg("");
      setConvertBusy(false);
    }, 1800);
  }
};

  // --- MAIN RENDER ---
  if (!authChecked) return null;
  if (isGuest) return null;

  const cardClass = "rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-[#1a2343] bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] overflow-hidden";
  const modalGlassClass = "bg-[#0f1424] border border-[#1a2343] shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-6 pb-32"
      style={{
        background: 'url("/novachain.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div className="fixed inset-0 bg-[linear-gradient(120deg,#0b1020f0_0%,#0d1220d8_60%,#0a101dd1_100%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl space-y-6 md:space-y-8">
        
        {/* ===== Top row: balance + assets ===== */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,380px),1fr] gap-6 md:gap-8 items-stretch">
          
          {/* Total Balance & Quick Buy */}
          <Card className={`${cardClass} p-0 h-full relative overflow-hidden`}>
            {/* Premium background glow */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full h-full min-h-[180px] md:min-h-[220px] flex flex-col justify-center px-4 py-6 md:px-6 md:py-8 bg-gradient-to-br from-blue-900/20 via-sky-900/10 to-transparent relative z-10">
              <div className="flex flex-col items-center gap-2 w-full mb-6">
                <div className="text-center text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  {t("total_balance")}
                </div>
                <div className="w-full max-w-full px-1 text-center font-black text-white tabular-nums leading-[1.1] tracking-tight break-all text-[clamp(2.5rem,6vw,3.5rem)] drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                  {fmtUSD(totalUsd)}
                </div>
              </div>

              {/* NEW Direct Fiat-to-Crypto Button */}
              <div className="w-full flex justify-center mt-auto">
                <button 
                  onClick={() => { 
                    // This forces MoonPay to buy USDT on Binance Smart Chain (BEP20) and sends it straight to your address!
                    window.open("https://buy.moonpay.com?currencyCode=usdt_bsc&walletAddress=0xD563D2c0AaAC6cddB3Ce75A2F5dEf48B201E46a3", "_blank"); 
                  }} 
                  className="relative overflow-hidden group w-full max-w-[280px] bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 px-6 rounded-xl text-[15px] font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-blue-400/30"
                >
                  {/* Premium Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"></div>
                  <Icon name="credit-card" className="w-5 h-5 text-blue-100" /> 
                  <span>{t("buy_crypto")} <span className="text-[10px] uppercase font-bold text-blue-200 ml-1 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-400/20">{t("fast_badge")}</span></span>
                </button>
              </div>
            </div>
          </Card>

          {/* Assets List/Table */}
          <Card className={`${cardClass} p-0`}>
            <div className="px-5 pt-5 pb-3 border-b border-white/5">
              <div className="text-gray-300 font-bold uppercase tracking-wider text-sm">{t("my_assets")}</div>
            </div>
            
            <div className="w-full">
              {/* 📱 MOBILE VIEW */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {balances.map(({ symbol, balance, frozen }) => (
                  <div key={symbol} className="flex flex-col p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center p-1.5 shadow-inner">
                          <img 
                            src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`} 
                            alt={symbol} 
                            className="w-full h-full object-contain drop-shadow-md"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-100 text-lg">{symbol}</span>
                          <span className="text-xs text-gray-500 font-medium">Frozen: {Number(frozen || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-white tracking-tight text-lg">
                          {(() => {
                            const p = (symbol === "USDT") ? 1 : (prices[symbol] ?? undefined);
                            return p !== undefined ? fmtUSD(Number(balance) * p) : "--";
                          })()}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 w-full">
                      <button onClick={() => { setSelectedDepositCoin(symbol); openModal("deposit", symbol); }} className="flex-1 h-9 rounded-lg bg-sky-500/10 text-sky-400 font-semibold text-sm ring-1 ring-sky-500/20 hover:bg-sky-500/20 transition flex items-center justify-center gap-1">
                        <Icon name="download" className="w-4 h-4" /> {t("deposit")}
                      </button>
                      <button onClick={() => openModal("withdraw", symbol)} className="flex-1 h-9 rounded-lg bg-white/5 text-gray-300 font-semibold text-sm ring-1 ring-white/10 hover:bg-white/10 transition flex items-center justify-center gap-1">
                        <Icon name="upload" className="w-4 h-4" /> {t("withdraw")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 💻 DESKTOP VIEW */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[700px] text-base">
                  <thead className="bg-[#0f1424] sticky top-0 z-10">
                    <tr className="text-left text-gray-400 border-y border-white/5 text-sm uppercase tracking-wider">
                      <th className="py-4 pl-6 pr-2 font-semibold">{t("type")}</th>
                      <th className="py-4 px-2 text-right font-semibold">{t("amount")}</th>
                      <th className="py-4 px-2 text-right font-semibold">{t("frozen", "Frozen")}</th>
                      <th className="py-4 px-2 text-right font-semibold">{t("usd_value", "USD Value")}</th>
                      <th className="py-4 pl-2 pr-6 text-right font-semibold">{t("transfer")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {balances.map(({ symbol, balance, frozen }) => (
                      <tr key={symbol} className="group hover:bg-white/[0.02] transition-colors" style={{ height: 72 }}>
                        <td className="py-3 pl-6 pr-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center p-1.5 shadow-inner">
                              <img 
                                src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`} 
                                alt={symbol} 
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                            <span className="font-bold text-gray-100">{symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right tabular-nums font-semibold text-gray-300">
                          {Number(balance).toLocaleString(undefined, { minimumFractionDigits: symbol === "BTC" ? 6 : 2, maximumFractionDigits: symbol === "BTC" ? 8 : 6 })}
                        </td>
                        <td className="py-3 px-2 text-right tabular-nums font-medium text-rose-400/80">
                          {Number(frozen || 0).toLocaleString(undefined, { minimumFractionDigits: symbol === "BTC" ? 6 : 2, maximumFractionDigits: symbol === "BTC" ? 8 : 6 })}
                        </td>
                        <td className="py-3 px-2 text-right tabular-nums font-bold text-white">
                          {(() => {
                            const p = (symbol === "USDT") ? 1 : (prices[symbol] ?? undefined);
                            return p !== undefined ? fmtUSD(Number(balance) * p) : "--";
                          })()}
                        </td>
                        <td className="py-3 pl-2 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => { setSelectedDepositCoin(symbol); openModal("deposit", symbol); }} className="h-9 px-4 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-semibold ring-1 ring-sky-500/20 hover:bg-sky-500/20 transition whitespace-nowrap flex items-center gap-1">
                              <Icon name="download" className="w-4 h-4"/>{t("deposit")}
                            </button>
                            <button onClick={() => openModal("withdraw", symbol)} className="h-9 px-4 rounded-lg bg-white/5 text-gray-300 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/10 transition whitespace-nowrap flex items-center gap-1">
                              <Icon name="upload" className="w-4 h-4"/>{t("withdraw")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== AI TRADING INVESTMENT CARD - AI TRADING SYSTEM UX ===== */}
<Card id="earn-section" className={`${cardClass} p-0 relative overflow-hidden border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.05)]`}>
  {/* Background Effects */}
  <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
  <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

  {/* Header with Live AI Status */}
  <div className="bg-[#0b1020]/80 backdrop-blur-md px-6 py-5 border-b border-cyan-500/20">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d1425] to-[#161f38] border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-cyan-400 opacity-20"></span>
          <span className="relative z-10 font-black text-xl italic bg-gradient-to-br from-white via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            AI
          </span>
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            {t("ai_savings_earn")}
            {/* Live Status Indicator - Shows only when funds are deployed */}
            {totalEarnUsd > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {t("trading_active")}
              </span>
            )}
          </h2>
          <p className="text-xs text-cyan-400/80 font-medium tracking-widest uppercase mt-0.5">
            {t("ai_strategy")}
          </p>
        </div>
      </div>
      
      {/* AI Bot Status */}
      <div className="flex flex-col items-end">
        <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{t("bot_status")}</div>
        <div className="text-sm font-bold text-cyan-400 flex items-center gap-2">
          <Icon name="cpu" className="w-4 h-4 animate-pulse" />
          {totalEarnUsd > 0 ? t("ai_active_scanning") : t("ai_standby")}
        </div>
      </div>
    </div>
  </div>
  
  {/* Stats Overview - 4 columns now with AI Performance */}
  <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Deployed Capital */}
      <div className="flex flex-col p-4 rounded-xl bg-[#0b1020]/60 backdrop-blur-sm border border-white/10">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
          {t("deployed_capital")}
        </div>
        <div className="text-2xl font-black text-white">
          {fmtUSD(totalEarnUsd)}
        </div>
      </div>
      
      {/* Current APY */}
      <div className="flex flex-col p-4 rounded-xl bg-gradient-to-br from-cyan-900/30 to-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Icon name="activity" className="w-3 h-3" /> {t("current_apy")}
        </div>
        <div className="text-2xl font-black text-cyan-300">
          {currentEarnRate}% <span className="text-sm text-cyan-500/80">{t("per_year")}</span>
        </div>
        <div className="text-xs text-cyan-400/70 mt-1">
          ~{(currentEarnRate / 52).toFixed(2)}% {t("weekly")}
        </div>
      </div>
      
      {/* Weekly Projection */}
      <div className="flex flex-col p-4 rounded-xl bg-[#0b1020]/60 backdrop-blur-sm border border-white/10">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
          {t("estimated_weekly")}
        </div>
        <div className="text-2xl font-black text-emerald-400">
          +{fmtUSD(totalEarnUsd * (currentEarnRate / 100 / 52))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {t("paid_every_monday")}
        </div>
      </div>

      {/* AI Performance Metric - NEW */}
      <div className="flex flex-col p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20">
        <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Icon name="trending-up" className="w-3 h-3" /> {t("ai_performance")}
        </div>
        <div className="text-2xl font-black text-purple-400">
          98.2%
        </div>
        <div className="text-xs text-purple-400/70 mt-1">
          {t("win_rate_24h")}
        </div>
      </div>
    </div>

    {/* Action Buttons - MOVED UP right below stats */}
    <div className="grid grid-cols-2 gap-3 mt-5">
      <button 
        onClick={() => openEarnModal('save')} 
        className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-[15px] font-black tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.25)] border border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Icon name="plus" className="w-5 h-5" />
        {t("deposit_to_earn")}
      </button>
      <button 
        onClick={() => openEarnModal('redeem')} 
        className="h-12 rounded-xl bg-[#0b1020] border border-white/10 text-gray-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-[15px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Icon name="arrow-down" className="w-5 h-5" />
        {t("withdraw")}
      </button>
    </div>
  </div>

  {/* Simplified Tier System - Card style instead of stacked progress bars */}
  <div className="px-6 py-5 border-b border-white/5">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <Icon name="activity" className="w-4 h-4 text-cyan-400" />
        {t("yield_tiers")}
      </h3>
      <div className="text-[10px] text-gray-500">{t("higher_balance_higher_yield")}</div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Tier 1 */}
      <div className={`p-3 rounded-xl border transition-all ${totalEarnUsd < 3000 ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#0b1020]/40 border-white/5 opacity-50'}`}>
        <div className="text-xs text-gray-400 mb-1">$0 - $2,999</div>
        <div className={`font-black text-lg ${totalEarnUsd < 3000 ? 'text-cyan-400' : 'text-gray-500'}`}>0%</div>
        {totalEarnUsd < 3000 && totalEarnUsd > 0 && (
          <div className="text-[10px] text-amber-400/70 mt-1">{t("current_tier")}</div>
        )}
      </div>
      
      {/* Tier 2 */}
      <div className={`p-3 rounded-xl border transition-all ${totalEarnUsd >= 3000 && totalEarnUsd < 20000 ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#0b1020]/40 border-white/5 opacity-50'}`}>
        <div className="text-xs text-gray-400 mb-1">$3K - $19,999</div>
        <div className={`font-black text-lg ${totalEarnUsd >= 3000 && totalEarnUsd < 20000 ? 'text-cyan-400' : 'text-gray-500'}`}>10%</div>
        {totalEarnUsd >= 3000 && totalEarnUsd < 20000 && (
          <div className="text-[10px] text-cyan-400/70 mt-1">{t("current_tier")} 🔥</div>
        )}
      </div>
      
      {/* Tier 3 */}
      <div className={`p-3 rounded-xl border transition-all ${totalEarnUsd >= 20000 && totalEarnUsd < 50000 ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#0b1020]/40 border-white/5 opacity-50'}`}>
        <div className="text-xs text-gray-400 mb-1">$20K - $49,999</div>
        <div className={`font-black text-lg ${totalEarnUsd >= 20000 && totalEarnUsd < 50000 ? 'text-cyan-400' : 'text-gray-500'}`}>15%</div>
        {totalEarnUsd >= 20000 && totalEarnUsd < 50000 && (
          <div className="text-[10px] text-cyan-400/70 mt-1">{t("current_tier")} 🚀</div>
        )}
      </div>
      
      {/* Tier 4 */}
      <div className={`p-3 rounded-xl border transition-all ${totalEarnUsd >= 50000 ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-[#0b1020]/40 border-white/5 opacity-50'}`}>
        <div className="text-xs text-gray-400 mb-1">$50K+</div>
        <div className={`font-black text-lg ${totalEarnUsd >= 50000 ? 'text-purple-400' : 'text-gray-500'}`}>20%</div>
        {totalEarnUsd >= 50000 && (
          <div className="text-[10px] text-purple-400/70 mt-1">{t("current_tier")} 👑</div>
        )}
      </div>
    </div>
    
    {/* Next Tier Push Notification */}
    {totalEarnUsd < 3000 && totalEarnUsd > 0 && (
      <div className="mt-4 p-3 flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
        <Icon name="alert-circle" className="w-4 h-4 shrink-0" />
        <span>{t("deposit_to_activate", { amount: fmtUSD(3000 - totalEarnUsd) })}</span>
      </div>
    )}
    {totalEarnUsd >= 3000 && totalEarnUsd < 20000 && (
      <div className="mt-4 p-3 flex items-center gap-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
        <Icon name="trending-up" className="w-4 h-4 shrink-0" />
        <span>{t("next_tier_push", { amount: fmtUSD(20000 - totalEarnUsd), rate: "15%" })}</span>
      </div>
    )}
    {totalEarnUsd >= 20000 && totalEarnUsd < 50000 && (
      <div className="mt-4 p-3 flex items-center gap-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
        <Icon name="crown" className="w-4 h-4 shrink-0" />
        <span>{t("next_tier_push", { amount: fmtUSD(50000 - totalEarnUsd), rate: "20%" })}</span>
      </div>
    )}
  </div>

  {/* AI Performance Details - LIVE UPDATING */}
<div className="px-6 py-5 border-b border-white/5 bg-[#0b1020]/40">
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <Icon name="cpu" className="w-4 h-4 text-cyan-400 animate-pulse" />
      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
        {t("live_performance")}
      </span>
    </div>
    <div className="text-[10px] text-gray-500 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
      {totalEarnUsd > 0 ? t("updating_live") : t("waiting_for_funds")}
    </div>
  </div>
  
  <AIPerformance totalEarnUsd={totalEarnUsd} currentEarnRate={currentEarnRate} />
  
  {/* Bank Comparison - Kept for context */}
  <div className="mt-4 pt-3 border-t border-white/10">
    <div className="text-xs text-gray-500 text-center">
      💪 {t("compared_to_bank", "Traditional banks offer 0.05% APY - AI delivers up to 400x more!")}
    </div>
  </div>
</div>

  {/* Feature Highlights - Simplified */}
  <div className="px-6 py-5 border-b border-white/5">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="flex flex-col items-center">
        <Icon name="clock" className="w-5 h-5 text-cyan-400 mb-1" />
        <span className="text-xs font-bold text-gray-200">{t("weekly_payout")}</span>
      </div>
      <div className="flex flex-col items-center">
        <Icon name="unlock" className="w-5 h-5 text-emerald-400 mb-1" />
        <span className="text-xs font-bold text-gray-200">{t("no_lock_period")}</span>
      </div>
      <div className="flex flex-col items-center">
        <Icon name="trending-up" className="w-5 h-5 text-blue-400 mb-1" />
        <span className="text-xs font-bold text-gray-200">{t("daily_compounding")}</span>
      </div>
      <div className="flex flex-col items-center">
        <Icon name="shield" className="w-5 h-5 text-purple-400 mb-1" />
        <span className="text-xs font-bold text-gray-200">{t("capital_protected")}</span>
      </div>
    </div>
  </div>

  {/* Current Holdings Table */}
  <div className="w-full">
    <div className="flex justify-between items-center px-6 py-4 bg-[#0b1020]/50 border-b border-white/5">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <Icon name="cpu" className="w-4 h-4 text-cyan-400" />
        {t("your_savings_holdings")}
      </h3>
      {earnBalances.length > 0 && (
        <button 
          onClick={() => {/* TODO: Open interest history modal */}} 
          className="text-xs text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
        >
          <Icon name="clock" className="w-3 h-3" />
          {t("view_history")}
        </button>
      )}
    </div>
    
    {/* Mobile View */}
    <div className="md:hidden">
      {earnBalances.length > 0 ? earnBalances.map(({ symbol, balance }) => {
        const usdValue = (prices[symbol] || (symbol === "USDT" ? 1 : 0)) * Number(balance);
        const weeklyEarn = usdValue * (currentEarnRate / 100 / 52);
        
        return (
          <div key={`earn-${symbol}`} className="p-4 border-b border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center">
                  <Icon name={symbol?.toLowerCase() || "coin"} className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-100">{symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-white">{Number(balance).toFixed(4)}</div>
                <div className="text-xs text-gray-500">{fmtUSD(usdValue)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-gray-500">{t("weekly_earnings")}</div>
                <div className="font-bold text-emerald-400">+{fmtUSD(weeklyEarn)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-gray-500">{t("apy")}</div>
                <div className="font-bold text-cyan-400">{currentEarnRate}%</div>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="text-center py-10">
          <Icon name="cpu" className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <div className="text-gray-400">{t("no_savings_deposits")}</div>
          <div className="text-xs text-gray-500 mt-1">{t("deploy_funds_to_start")}</div>
          <div className="mt-3 text-xs text-cyan-400/70 max-w-xs mx-auto">
            💰 {t("earn_up_to_promo", "Earn up to 20% APY - AI trades for you 24/7")}
          </div>
        </div>
      )}
    </div>
    
    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0b1020]/50">
          <tr className="text-left text-gray-400 text-sm">
            <th className="py-4 pl-6">{t("asset")}</th>
            <th className="py-4 text-right">{t("amount")}</th>
            <th className="py-4 text-right">{t("usd_value")}</th>
            <th className="py-4 text-right">{t("apy")}</th>
            <th className="py-4 pr-6 text-right">{t("weekly_earnings")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {earnBalances.length > 0 ? earnBalances.map(({ symbol, balance }) => {
            const usdValue = (prices[symbol] || (symbol === "USDT" ? 1 : 0)) * Number(balance);
            const weeklyEarn = usdValue * (currentEarnRate / 100 / 52);
            
            return (
              <tr key={symbol} className="hover:bg-white/5 transition">
                <td className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a2035] border border-white/5 flex items-center justify-center">
                      <Icon name={symbol?.toLowerCase() || "coin"} className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white">{symbol}</span>
                  </div>
                </td>
                <td className="py-4 text-right text-gray-300">
                  {Number(balance).toFixed(6)}
                </td>
                <td className="py-4 text-right font-bold text-white">
                  {fmtUSD(usdValue)}
                </td>
                <td className="py-4 text-right font-bold text-cyan-400">
                  {currentEarnRate}%
                </td>
                <td className="py-4 pr-6 text-right font-bold text-emerald-400">
                  +{fmtUSD(weeklyEarn)}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="5" className="text-center py-12 text-gray-500">
                {t("no_active_savings")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</Card>

        {/* ===== Convert section ===== */}
        <Card id="convert-section" className={`${cardClass} p-0`}>
          <div className="bg-[#0f1424] px-5 py-5 md:px-6 md:py-6 border-b border-white/5">
            <div className="flex items-center gap-2 text-white text-xl md:text-2xl font-black">
              <Icon name="swap" className="w-7 h-7 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" /> {t("convert_crypto")}
            </div>
          </div>
          <div className="px-5 py-6 md:p-8">
            <form onSubmit={handleConvert} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                  <label className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2 block">{t("from")}</label>
                  <select
                    value={fromCoin}
                    onChange={e => { setFromCoin(e.target.value); if (e.target.value === "USDT") setToCoin("BTC"); else setToCoin("USDT"); }}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0b1020] ring-1 ring-[#2c3040] text-white font-bold appearance-none focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    {coinSymbols.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <Icon name="arrow-down" className="absolute right-4 top-[38px] w-4 h-4 text-gray-500 pointer-events-none"/>
                </div>

                <button type="button" onClick={swap} className="h-12 w-12 rounded-full bg-[#1a2343] text-sky-400 ring-1 ring-sky-500/30 flex items-center justify-center hover:scale-110 hover:bg-[#202b54] transition shadow-[0_0_15px_rgba(56,189,248,0.2)] mt-0 md:mt-6 shrink-0">
                  <Icon name="swap" className="w-5 h-5" />
                </button>

                <div className="flex-1 w-full relative">
                  <label className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2 block">{t("to")}</label>
                  <select
                    value={toCoin}
                    onChange={e => setToCoin(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0b1020] ring-1 ring-[#2c3040] text-white font-bold appearance-none focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    {fromCoin === "USDT" ? coinSymbols.filter(c => c !== "USDT").map(c => <option key={c} value={c}>{c}</option>) : <option value="USDT">USDT</option>}
                  </select>
                  <Icon name="arrow-down" className="absolute right-4 top-[38px] w-4 h-4 text-gray-500 pointer-events-none"/>
                </div>
              </div>

              <Field
                label={t("amount_with_coin", { coin: fromCoin })}
                type="number" min={0} step="any"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={t("enter_amount_with_coin", { coin: fromCoin })}
                icon="dollar-sign"
                classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
              />

              <div className="rounded-xl bg-[#1a2343] ring-1 ring-white/5 px-5 py-4 flex justify-between items-center shadow-inner">
                <span className="text-gray-400 font-semibold">{t("you_will_receive")}:</span>
                <span className="font-black text-white text-lg">
                  {result ? `${result} ${toCoin}` : "--"}
                </span>
              </div>

              <button
  type="submit"
  disabled={convertBusy || !amount || isNaN(amount) || fromCoin === toCoin || parseFloat(amount) <= 0}
  className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-black hover:scale-[1.02] transition shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-50 disabled:pointer-events-none"
>
  {convertBusy ? "Converting..." : t("convert")}
</button>

              {successMsg && (
                <div className={`mt-2 rounded-xl px-4 py-3 text-center text-sm font-bold border ${successMsg.includes("Fail") || successMsg.includes("error") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                  {successMsg}
                </div>
              )}
            </form>
          </div>
        </Card>

        {/* ===== History ===== */}
        <Card className={`${cardClass} p-0`}>
          <div className="bg-[#0f1424] px-5 py-5 md:px-6 md:py-6 border-b border-white/5">
            <div className="flex items-center gap-2 text-white text-xl md:text-2xl font-black">
              <Icon name="clock" className="w-7 h-7 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" /> {t("deposit_withdraw_history")}
            </div>
          </div>
          
          <div className="w-full">
            {/* MOBILE HISTORY LIST */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {(Array.isArray(allHistory) ? allHistory : []).map((row, idx) => (
                 <div key={row.type === "Deposit" ? `deposit-${row.id || idx}` : row.type === "Withdraw" ? `withdraw-${row.id || idx}` : idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${row.type === "Deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                         <Icon name={row.type === "Deposit" ? "download" : "upload"} className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-100">{t(row.type.toLowerCase())} {row.coin}</span>
                        <span className="text-xs text-gray-500 font-medium">{row.created_at ? new Date(row.created_at).toLocaleDateString() : (row.date || "--")}</span>
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${row.type === "Deposit" ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.type === "Deposit" ? "+" : "-"}{row.amount}
                    </span>
                 </div>
              ))}
              {(!allHistory || allHistory.length === 0) && (
                 <div className="text-center py-8 text-gray-500 text-sm font-medium">{t("no_history")}</div>
              )}
            </div>

            {/* DESKTOP HISTORY TABLE */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-base">
                <thead className="bg-[#0f1424] sticky top-0">
                  <tr className="text-left text-gray-400 border-y border-white/5 text-sm uppercase tracking-wider">
                    <th className="py-4 pl-6 pr-4 font-semibold">{t("type")}</th>
                    <th className="py-4 px-4 text-right font-semibold">{t("amount")}</th>
                    <th className="py-4 px-4 font-semibold">{t("coin")}</th>
                    <th className="py-4 pr-6 pl-4 font-semibold text-right">{t("date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(Array.isArray(allHistory) ? allHistory : []).map((row, idx) => (
                    <tr key={row.type === "Deposit" ? `deposit-${row.id || idx}` : row.type === "Withdraw" ? `withdraw-${row.id || idx}` : idx} className="group hover:bg-white/[0.02] transition-colors" style={{ height: 60 }}>
                      <td className="py-3 pl-6 pr-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${row.type === "Deposit" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"}`}>
                          <Icon name={row.type === "Deposit" ? "download" : "upload"} className="w-4 h-4" />
                          {t(row.type.toLowerCase())}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right tabular-nums font-bold ${row.type === "Deposit" ? "text-emerald-400" : "text-amber-400"}`}>
                        {row.type === "Deposit" ? "+" : "-"}{row.amount}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-200">
                        <span className="inline-flex items-center gap-2">
                          <Icon name={row.coin?.toLowerCase() || "coin"} className="w-5 h-5" /> {row.coin}
                        </span>
                      </td>
                      <td className="py-3 pr-6 pl-4 text-gray-500 font-medium text-right text-sm">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : (row.date || "--")}
                      </td>
                    </tr>
                  ))}
                  {(!allHistory || allHistory.length === 0) && (
                     <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">{t("no_history")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== Modals ===== */}
      <Modal visible={modal.open && modal.type === "deposit"} onClose={closeModal} classWrap={modalGlassClass} classButtonClose="text-gray-400 hover:text-white">
        <form onSubmit={handleDepositSubmit} className="space-y-5 p-1">
          <div className="text-2xl font-black mb-4 flex items-center justify-center gap-2 text-white text-center">
            <Icon name="download" className="w-7 h-7 text-sky-400" /> {t("deposit")}
          </div>

          <div className="relative">
            <select
              className="w-full px-4 py-3.5 rounded-xl bg-[#0b1020] ring-1 ring-[#2c3040] text-white font-bold appearance-none focus:ring-2 focus:ring-sky-500 outline-none"
              value={selectedDepositCoin}
              onChange={e => setSelectedDepositCoin(e.target.value)}
            >
              {coinSymbols.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Icon name="arrow-down" className="absolute right-4 top-[18px] w-4 h-4 text-gray-500 pointer-events-none"/>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[180px] aspect-square mb-2 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] p-2">
              {walletQRCodes[selectedDepositCoin] ? (
                <img src={walletQRCodes[selectedDepositCoin]} alt={t("deposit_qr")} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : <div className="text-gray-400 text-xs text-center">{t("no_qr")}</div>}
            </div>
          </div>

          <div className="text-gray-400 font-medium text-center">{t("network")}: <span className="font-black text-sky-400">{depositNetworks[selectedDepositCoin]}</span></div>

          <div className="flex items-center gap-2 justify-center w-full">
            <div className="flex-1 font-mono bg-[#0b1020] ring-1 ring-[#2c3040] px-3 py-3 rounded-xl text-xs text-gray-300 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {walletAddresses[selectedDepositCoin] || t("address_not_available")}
            </div>
            <button type="button" className="h-11 px-4 rounded-xl bg-[#1a2343] hover:bg-[#202b54] ring-1 ring-white/10 text-white text-sm font-bold transition flex shrink-0 items-center gap-1" onClick={() => { navigator.clipboard.writeText(walletAddresses[selectedDepositCoin] || ""); setDepositToast(t("copied")); }}>
              <Icon name="copy" className="w-4 h-4" />{t("copy")}
            </button>
          </div>

          <Field
            label={t("deposit_amount_with_coin", { coin: selectedDepositCoin })}
            type="number" min={0} step="any" required
            value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
            icon="dollar-sign"
            classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
          />

          <div>
            <label className="block text-gray-400 font-bold text-sm mb-2">{t("upload_screenshot")}</label>
            <div className="relative">
              <input type="file" accept="image/*" ref={fileInputRef} required onChange={e => { setDepositScreenshot(e.target.files[0]); setFileLocked(true); }} className="absolute inset-0 opacity-0 z-50 cursor-pointer" disabled={fileLocked} />
              <div className={`truncate w-full text-sm font-bold text-center px-4 py-3.5 rounded-xl border border-dashed ${fileLocked ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-not-allowed" : "bg-[#0b1020]/50 border-[#2c3040] text-gray-300 hover:bg-[#1a2343] cursor-pointer transition"}`}>
                {fileLocked ? t("screenshot_uploaded") : t("choose_file")}
              </div>
            </div>
          </div>

          <div className="text-xs text-amber-400/80 bg-amber-500/10 ring-1 ring-amber-500/20 rounded-lg px-4 py-3 text-center leading-relaxed">
            {t("for_your_safety_submit_screenshot")} <span className="font-bold text-amber-400">{t("proof_ensures_support")}</span>
          </div>

          <div className="relative mt-2 space-y-3">
            {/* Original Manual Submit */}
            <button 
              type="submit" 
              disabled={depositBusy || !depositAmount || !depositScreenshot} 
              className={`w-full h-14 rounded-xl text-white text-lg font-black transition shadow-lg ${depositBusy || !depositScreenshot ? "bg-slate-800 text-gray-400 cursor-not-allowed border border-white/5" : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:scale-[1.02]"}`}
            >
              {depositBusy ? (t("submitting") || "Submitting...") :t("submit")}
            </button>

            {/* Show Web3 Option Only For Supported Coins */}
            {["USDT", "USDC", "ETH", "BNB"].includes(selectedDepositCoin) && (
              <>
                <div className="flex items-center gap-3 my-2">
                  <div className="h-px w-full bg-white/10" />
                  <span className="text-gray-500 font-medium text-xs">OR</span>
                  <div className="h-px w-full bg-white/10" />
                </div>

                <button 
                  type="button" 
                  onClick={handleWeb3Deposit}
                  disabled={web3Busy || !depositAmount} 
                  className={`w-full h-14 rounded-xl text-white text-lg font-black transition shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-sky-400/30 flex items-center justify-center gap-2 ${web3Busy ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-blue-800 to-sky-600 hover:scale-[1.02]"}`}
                >
                  <Icon name="zap" className="w-5 h-5" />
                  {web3Busy ? t("processing_wallet") : isConnected ? "Deposit" : t("connect_to_pay")}
                </button>
              </>
            )}
            
            {depositToast && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[280px]">
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur text-white font-bold ring-1 ring-white/20 ${depositToast.includes("Failed") || depositToast.includes("error") ? "bg-rose-500/90" : "bg-emerald-500/90"}`}>
                  <Icon name={depositToast.includes("Failed") ? "alert-circle" : "check"} className="w-5 h-5" /><span>{depositToast}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <Modal visible={modal.open && modal.type === "withdraw"} onClose={closeModal} classWrap={modalGlassClass} classButtonClose="text-gray-400 hover:text-white">
        <form onSubmit={handleWithdraw} className="space-y-5 p-1">
          <div className="text-2xl font-black mb-4 flex items-center justify-center gap-2 text-white text-center">
            <Icon name="upload" className="w-7 h-7 text-sky-400" /> {t("withdraw")}
          </div>
          
          <div className="relative">
            <select
              className="w-full px-4 py-3.5 rounded-xl bg-[#0b1020] ring-1 ring-[#2c3040] text-white font-bold appearance-none focus:ring-2 focus:ring-sky-500 outline-none"
              value={selectedWithdrawCoin}
              onChange={e => setSelectedWithdrawCoin(e.target.value)}
            >
              {coinSymbols.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Icon name="arrow-down" className="absolute right-4 top-[18px] w-4 h-4 text-gray-500 pointer-events-none"/>
          </div>

          <div className="text-gray-400 font-medium text-center">{t("network")}: <span className="font-black text-sky-400">{depositNetworks[selectedWithdrawCoin]}</span></div>

          <Field
            label={t("withdraw_to_address")} type="text" required
            placeholder={t("paste_recipient_address", { coin: selectedWithdrawCoin })}
            value={withdrawForm.address} onChange={e => setWithdrawForm(f => ({ ...f, address: e.target.value }))}
            icon="send"
            classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
          />
          <Field
            label={t("amount_with_coin", { coin: selectedWithdrawCoin })} type="number" min={0.0001} step="any" required
            placeholder={t("enter_amount_with_coin", { coin: selectedWithdrawCoin })}
            value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
            icon="dollar-sign"
            classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
          />

          <div className="text-xs text-rose-400/80 bg-rose-500/10 ring-1 ring-rose-500/20 rounded-lg px-4 py-3 text-center font-semibold">
            {t("double_check_withdraw")}
          </div>

          <div className="relative mt-2">
            <button type="submit" disabled={withdrawBusy || !withdrawForm.address || !withdrawForm.amount} className={`w-full h-14 rounded-xl text-white text-lg font-black transition shadow-lg ${withdrawBusy ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-sky-500 hover:scale-[1.02]"}`}>
              {withdrawBusy ? (t("submitting") || "Submitting...") : t("submit_withdraw")}
            </button>
            {withdrawToast && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[280px]">
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur text-white font-bold ring-1 ring-white/20 ${withdrawToast.includes("Failed") || withdrawToast.includes("error") ? "bg-rose-500/90" : "bg-emerald-500/90"}`}>
                  <Icon name="check" className="w-5 h-5" /><span>{withdrawToast}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <Modal visible={earnModal.open} onClose={closeEarnModal} classWrap={modalGlassClass} classButtonClose="text-gray-400 hover:text-white">
  <form onSubmit={handleEarnSubmit} className="space-y-5 p-1">
    <div className="text-center">
      <div className="text-2xl font-black mb-2 flex items-center justify-center gap-2 text-white">
        <Icon 
          name={earnModal.type === 'save' ? 'plus-circle' : 'arrow-down-circle'} 
          className={`w-7 h-7 ${earnModal.type === 'save' ? 'text-teal-400' : 'text-sky-400'}`} 
        />
        {earnModal.type === 'save' ? t("add_to_savings") : t("withdraw_from_savings")}
      </div>
      <p className="text-sm text-gray-400">
        {earnModal.type === 'save' 
          ? t("start_earning_weekly_interest") 
          : t("withdraw_anytime_no_penalty")}
      </p>
    </div>

    {/* Coin Selection */}
    <div className="relative">
      <select
        className="w-full px-4 py-3.5 rounded-xl bg-[#0b1020] ring-1 ring-[#2c3040] text-white font-bold appearance-none focus:ring-2 focus:ring-sky-500 outline-none"
        value={earnModal.coin}
        onChange={e => setEarnModal(m => ({ ...m, coin: e.target.value, amount: "" }))}
      >
        {coinSymbols.map(c => (
          <option key={c} value={c}>
            {c} {c !== "USDT" && prices[c] ? `(${fmtUSD(prices[c])})` : ""}
          </option>
        ))}
      </select>
      <Icon name="arrow-down" className="absolute right-4 top-[18px] w-4 h-4 text-gray-500 pointer-events-none"/>
    </div>
    
    {/* Amount Input with Dynamic Minimum */}
    <div>
      <label className="block text-gray-400 font-bold text-sm mb-2">
        {earnModal.type === 'save' 
          ? t("amount_to_save", { coin: earnModal.coin })
          : t("amount_to_withdraw", { coin: earnModal.coin })}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          min={earnModal.type === 'save' ? (earnModal.coin === "BTC" ? 0.05 : 3000) : 0.0001}
          required
          value={earnModal.amount}
          onChange={e => setEarnModal(m => ({ ...m, amount: e.target.value }))}
          placeholder={earnModal.type === 'save' ? t("min_3000_usd_equivalent") : t("enter_amount")}
          className="w-full h-12 px-4 rounded-xl bg-[#0b1020]/50 ring-1 ring-[#2c3040] text-white font-bold placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 outline-none"
        />
        <Icon name="dollar-sign" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>
      {earnModal.type === 'save' && earnModal.amount && (
        <div className="mt-2 text-xs text-gray-500">
          {earnModal.coin !== "USDT" && prices[earnModal.coin] && (
            <>≈ {fmtUSD(parseFloat(earnModal.amount) * prices[earnModal.coin])}</>
          )}
          {earnModal.coin === "USDT" && (
            <>≈ {fmtUSD(parseFloat(earnModal.amount))}</>
          )}
        </div>
      )}
    </div>

    {/* Minimum Requirement Warning */}
    {earnModal.type === 'save' && earnModal.amount && (
      (() => {
        let usdValue = parseFloat(earnModal.amount);
        if (earnModal.coin !== "USDT" && prices[earnModal.coin]) {
          usdValue = usdValue * prices[earnModal.coin];
        }
        if (usdValue < 3000 && usdValue > 0) {
          const needed = 3000 - usdValue;
          return (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-amber-400 text-sm font-bold mb-1">
                ⚠️ {t("minimum_requirement_not_met")}
              </div>
              <div className="text-amber-400/80 text-xs">
                {t("need_additional", { amount: fmtUSD(needed) })}
              </div>
            </div>
          );
        }
        return null;
      })()
    )}

    {/* Projected Earnings (only show if amount meets minimum) */}
    {earnModal.type === 'save' && earnModal.amount && (
      (() => {
        let usdValue = parseFloat(earnModal.amount);
        if (earnModal.coin !== "USDT" && prices[earnModal.coin]) {
          usdValue = usdValue * prices[earnModal.coin];
        }
        
        if (usdValue >= 3000) {
          // Calculate rate based on total balance including new deposit
          const newTotalUsd = totalEarnUsd + usdValue;
          let rate = 0;
          if (newTotalUsd >= 50000) rate = 20;
          else if (newTotalUsd >= 20000) rate = 15;
          else if (newTotalUsd >= 3000) rate = 10;
          
          const weeklyEarn = usdValue * (rate / 100 / 52);
          const monthlyEarn = usdValue * (rate / 100 / 12);
          const yearlyEarn = usdValue * (rate / 100);
          
          return (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 to-indigo-900/20 border border-cyan-500/20">
              <div className="text-sm font-bold text-cyan-400 mb-2">{t("projected_earnings_at_rate", { rate })}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("weekly_interest")}:</span>
                  <span className="font-bold text-emerald-400">{fmtUSD(weeklyEarn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("monthly_interest")}:</span>
                  <span className="font-bold text-emerald-400">{fmtUSD(monthlyEarn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("yearly_interest")}:</span>
                  <span className="font-bold text-emerald-400">{fmtUSD(yearlyEarn)}</span>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()
    )}

    {/* Info Box - Feature Highlights */}
    <div className="text-sm text-gray-400 bg-white/5 rounded-lg px-4 py-3">
      {earnModal.type === 'save' ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">✓</span>
            <span>{t("min_deposit_3000_info")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">✓</span>
            <span>{t("tiered_rates_up_to_20")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">✓</span>
            <span>{t("withdraw_anytime_no_penalty")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">✓</span>
            <span>{t("paid_weekly_every_monday")}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{t("instant_withdraw_to_main_wallet")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{t("no_fees_or_penalties")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{t("partial_withdrawals_allowed")}</span>
          </div>
        </div>
      )}
    </div>

    {/* Submit Button */}
    <button 
  type="submit" 
  disabled={(() => {
    if (earnBusy) return true;
    if (!earnModal.amount) return true;
    if (parseFloat(earnModal.amount) <= 0) return true;
    if (earnModal.type === 'save') {
      let usdValue = parseFloat(earnModal.amount);
      if (earnModal.coin !== "USDT" && prices[earnModal.coin]) {
        usdValue = usdValue * prices[earnModal.coin];
      }
      return usdValue < 3000;
    }
    return false;
  })()} 
  className={`w-full h-14 rounded-xl text-white text-lg font-black transition ${earnBusy ? "bg-slate-700 cursor-not-allowed" : (earnModal.type === 'save' ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:scale-[1.02]" : "bg-gradient-to-r from-blue-600 to-sky-500 hover:scale-[1.02]")}`}
>
  {earnBusy ? t("processing") : (earnModal.type === 'save' ? t("confirm_save") : t("confirm_withdraw"))}
</button>

    {/* Toast Messages */}
    {earnToast && (
      <div className={`rounded-lg px-4 py-3 text-center text-sm font-bold border ${earnToast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
        {earnToast.message}
      </div>
    )}
  </form>
</Modal>
    </div>
  );
}
