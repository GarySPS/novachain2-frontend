//src>pages>WalletPage.js

import { MAIN_API_BASE } from '../config';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import WalletOverviewCard from "../components/wallet/WalletOverviewCard";
import WalletAssetsCard from "../components/wallet/WalletAssetsCard";
import WalletEarnSummaryCard from "../components/wallet/WalletEarnSummaryCard";
import WalletConvertCard from "../components/wallet/WalletConvertCard";
import WalletRecentActivityCard from "../components/wallet/WalletRecentActivityCard";
import WalletDepositModal from "../components/wallet/WalletDepositModal";
import WalletWithdrawModal from "../components/wallet/WalletWithdrawModal";
import Modal from "../components/modal";
import Icon from "../components/icon";
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
const visibleWalletSymbols = ["USDT", "USDC", "BTC", "ETH", "BNB"];
const depositNetworks = {
  USDT: "TRC20",
  USDC: "BEP20",
  BTC: "BTC",
  ETH: "ERC20",
  BNB: "BEP20",
};
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

  const visibleBalances = balances.filter(({ symbol }) =>
  visibleWalletSymbols.includes(symbol)
);

  // ===== MODIFIED: This now calculates total for *main* wallet only =====
  useEffect(() => {
    if (!balances.length) { setTotalUsd(0); return; }
    // We don't need to check prices.length, the logic will handle it
let sum = 0;
balances
  .filter(({ symbol }) => visibleWalletSymbols.includes(symbol))
  .forEach(({ symbol, balance }) => {
    const coinPrice = symbol === "USDT" ? 1 : prices[symbol] || 0;
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

const openDepositForCoin = (symbol = "USDT") => {
  setSelectedDepositCoin(symbol);
  openModal("deposit", symbol);
};

const openWithdrawForCoin = (symbol = "USDT") => {
  setSelectedWithdrawCoin(symbol);
  openModal("withdraw", symbol);
};

const scrollToConvert = () => {
  const el = document.getElementById("convert-section");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const openBuyCrypto = () => {
  window.open(
    "https://buy.moonpay.com?currencyCode=usdt_bsc&walletAddress=0xa7f2473b7e55baec7365bf7568d600eee1c47aa4",
    "_blank"
  );
};

return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-6 pb-32"
      style={{
        background: 'url("/novachain.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div className="fixed inset-0 bg-[linear-gradient(120deg,#0b1020f0_0%,#0d1220d8_60%,#0a101dd1_100%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl space-y-5 md:space-y-6">
        
        {/* ===== Top row: balance + assets ===== */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,380px),1fr] gap-5 md:gap-6 lg:items-start">
          
          <WalletOverviewCard
            cardClass={cardClass}
            totalUsd={totalUsd}
            fmtUSD={fmtUSD}
            t={t}
            onDeposit={() => openDepositForCoin("USDT")}
            onWithdraw={() => openWithdrawForCoin("USDT")}
            onConvert={scrollToConvert}
            onBuyCrypto={openBuyCrypto}
          />
          
<WalletAssetsCard
  cardClass={cardClass}
  balances={visibleBalances}
  prices={prices}
  fmtUSD={fmtUSD}
  t={t}
/>
        </div>

        <WalletEarnSummaryCard
          cardClass={cardClass}
          totalEarnUsd={totalEarnUsd}
          currentEarnRate={currentEarnRate}
          fmtUSD={fmtUSD}
          t={t}
          onDepositToEarn={() => openEarnModal("save")}
          onWithdrawEarn={() => openEarnModal("redeem")}
        />

        <WalletConvertCard
          cardClass={cardClass}
          coinSymbols={coinSymbols}
          fromCoin={fromCoin}
          toCoin={toCoin}
          amount={amount}
          result={result}
          successMsg={successMsg}
          convertBusy={convertBusy}
          t={t}
          onSubmit={handleConvert}
          onSwap={swap}
          onFromCoinChange={(value) => {
            setFromCoin(value);
            if (value === "USDT") setToCoin("BTC");
            else setToCoin("USDT");
          }}
          onToCoinChange={setToCoin}
          onAmountChange={setAmount}
        />

        <WalletRecentActivityCard
          cardClass={cardClass}
          allHistory={allHistory}
          t={t}
        />
      </div>

      {/* ===== Modals ===== */}
      <WalletDepositModal
        visible={modal.open && modal.type === "deposit"}
        onClose={closeModal}
        modalGlassClass={modalGlassClass}
        t={t}
        coinSymbols={coinSymbols}
        depositNetworks={depositNetworks}
        selectedDepositCoin={selectedDepositCoin}
        setSelectedDepositCoin={setSelectedDepositCoin}
        walletQRCodes={walletQRCodes}
        walletAddresses={walletAddresses}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        depositScreenshot={depositScreenshot}
        setDepositScreenshot={setDepositScreenshot}
        fileInputRef={fileInputRef}
        fileLocked={fileLocked}
        setFileLocked={setFileLocked}
        depositBusy={depositBusy}
        depositToast={depositToast}
        setDepositToast={setDepositToast}
        handleDepositSubmit={handleDepositSubmit}
        handleWeb3Deposit={handleWeb3Deposit}
        web3Busy={web3Busy}
        isConnected={isConnected}
      />

            <WalletWithdrawModal
        visible={modal.open && modal.type === "withdraw"}
        onClose={closeModal}
        modalGlassClass={modalGlassClass}
        t={t}
        coinSymbols={coinSymbols}
        depositNetworks={depositNetworks}
        selectedWithdrawCoin={selectedWithdrawCoin}
        setSelectedWithdrawCoin={setSelectedWithdrawCoin}
        withdrawForm={withdrawForm}
        setWithdrawForm={setWithdrawForm}
        withdrawBusy={withdrawBusy}
        withdrawToast={withdrawToast}
        handleWithdraw={handleWithdraw}
      />

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
