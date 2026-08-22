//src/components/wallet/WalletDepositModal.js

import React, { useState, useEffect } from "react";
import Modal from "../modal";
import Icon from "../icon";

export default function WalletDepositModal({
  visible,
  onClose,
  modalGlassClass,
  t,
  coinSymbols,
  depositNetworks,
  selectedDepositCoin,
  setSelectedDepositCoin,
  walletQRCodes,
  walletAddresses,
  depositAmount,
  setDepositAmount,
  depositScreenshot,
  setDepositScreenshot,
  fileInputRef,
  fileLocked,
  setFileLocked,
  depositBusy,
  depositToast,
  setDepositToast,
  handleDepositSubmit,
  handleWeb3Deposit,
  web3Busy,
  isConnected,
}) {
  const [activeTab, setActiveTab] = useState("web3");
  // NEW: State controls for our premium UI popups
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQRExpanded, setIsQRExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWeb3Browser =
        !!window.ethereum || !!window.okxwallet || !!window.trustwallet;
      setActiveTab(isWeb3Browser ? "web3" : "manual");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      classWrap={modalGlassClass}
      classButtonClose="text-gray-400 hover:text-white z-20"
    >
      {/* Scrollable, relative container for our custom absolute overlays */}
      <div className="relative max-h-[78vh] overflow-y-auto overscroll-contain px-2 pb-6 pt-2 scrollbar-hide">
        
        {/* ================= OVERLAY: Custom Asset Selector ================= */}
        {isDropdownOpen && (
          <div className="absolute inset-0 z-[60] flex flex-col rounded-xl bg-[#0f1424] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-2 flex items-center justify-between px-2 pt-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Select Asset</h3>
              <button 
                type="button" 
                onClick={() => setIsDropdownOpen(false)} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
              {coinSymbols.map((c) => (
                <div
                  key={c}
                  onClick={() => {
                    setSelectedDepositCoin(c);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition active:scale-95 ${
                    selectedDepositCoin === c ? "bg-sky-500/10 border border-sky-500/20" : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2035] p-1.5 shadow-inner">
                      <img
                        src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${c.toLowerCase()}.svg`}
                        alt={c}
                        className="h-full w-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                    <span className="font-bold text-white">{c}</span>
                  </div>
                  {selectedDepositCoin === c && <Icon name="check" className="h-4 w-4 text-sky-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= OVERLAY: QR Code Enlarger ================= */}
        {isQRExpanded && walletQRCodes[selectedDepositCoin] && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center rounded-xl bg-[#0a0f1d]/95 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button" 
              onClick={() => setIsQRExpanded(false)} 
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 shadow-lg"
            >
              {/* Hardcoded SVG guarantees the X renders correctly */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h3 className="mb-6 text-lg font-black text-white">Scan to Deposit</h3>
            
            <div className="rounded-3xl bg-white p-5 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <img
                src={walletQRCodes[selectedDepositCoin]}
                alt="Enlarged QR"
                className="h-48 w-48 object-contain md:h-64 md:w-64"
              />
            </div>
            
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-sky-400">
                {selectedDepositCoin} Address ({depositNetworks[selectedDepositCoin]})
              </div>
              <p className="w-full max-w-[280px] break-all font-mono text-sm font-bold text-gray-300">
                {walletAddresses[selectedDepositCoin]}
              </p>
              
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(walletAddresses[selectedDepositCoin] || "");
                  setDepositToast(t("copied", "Copied"));
                }}
                className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-500/10 px-6 text-xs font-black text-sky-400 ring-1 ring-sky-500/30 transition hover:bg-sky-500/20 active:scale-95"
              >
                <Icon name="copy" className="h-4 w-4" />
                COPY ADDRESS
              </button>
            </div>
          </div>
        )}

        {/* Sleek Header */}
        <h2 className="mb-4 text-center text-lg font-bold text-white tracking-wide">
          {t("deposit", "Deposit")}
        </h2>

        {/* Ultra-Slim Tab Switcher */}
        <div className="mb-5 flex rounded-lg bg-[#070b16] p-1 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("web3")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition-all ${
              activeTab === "web3"
                ? "bg-[#1a2343] text-sky-400 shadow-sm ring-1 ring-sky-500/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon name="zap" className="h-3.5 w-3.5" />
            Web3 Instant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition-all ${
              activeTab === "manual"
                ? "bg-[#1a2343] text-white shadow-sm ring-1 ring-white/10"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon name="copy" className="h-3.5 w-3.5" />
            Direct / CEX
          </button>
        </div>

        {/* Toast Notification */}
        {depositToast && (
          <div className="absolute left-1/2 top-4 z-[70] w-full max-w-[260px] -translate-x-1/2">
            <div
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-xl backdrop-blur ${
                depositToast.includes("Failed") || depositToast.includes("error") ? "bg-rose-500/90" : "bg-emerald-500/90"
              }`}
            >
              <Icon
                name={
                  depositToast.includes("Failed") || depositToast.includes("error") ? "alert-circle" : "check"
                }
                className="h-4 w-4"
              />
              <span>{depositToast}</span>
            </div>
          </div>
        )}

        {/* Professional Side-by-Side Asset & Network Selector */}
        <div className="mb-4 flex gap-3">
          
          {/* CUSTOM DROPDOWN TRIGGER */}
          <div 
            className="flex-1 cursor-pointer rounded-xl border border-[#2c3040] bg-[#0b1020]/50 p-2.5 transition-colors hover:bg-white/5 active:scale-95"
            onClick={() => setIsDropdownOpen(true)}
          >
            <label className="mb-1 block cursor-pointer text-[9px] font-black uppercase tracking-widest text-gray-500">
              {t("coin", "Asset")}
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${selectedDepositCoin.toLowerCase()}.svg`}
                  alt={selectedDepositCoin}
                  className="h-4 w-4 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span className="text-sm font-bold text-white">{selectedDepositCoin}</span>
              </div>
              <Icon name="chevron-down" className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-[#2c3040] bg-[#0b1020]/50 p-2.5">
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-500">
              {t("network", "Network")}
            </label>
            <div className="text-sm font-bold text-sky-400">
              {depositNetworks[selectedDepositCoin]}
            </div>
          </div>
        </div>

        {/* Compact Amount Input */}
        <div className="mb-5">
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
            {t("deposit_amount", "Deposit Amount")}
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={0}
              step="any"
              required
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#2c3040] bg-[#0b1020]/80 pl-4 pr-16 text-sm font-bold text-white outline-none transition focus:border-sky-500"
            />
            <div className="pointer-events-none absolute right-4 text-xs font-bold text-gray-500">
              {selectedDepositCoin}
            </div>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === "web3" ? (
          <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!["USDC", "ETH", "BNB"].includes(selectedDepositCoin) ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-4 text-center text-xs font-medium leading-relaxed text-rose-300">
                Web3 deposits are currently not supported for{" "}
                <strong className="text-rose-200">{selectedDepositCoin}</strong>. 
                Please use the Direct / CEX tab.
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleWeb3Deposit}
                  disabled={web3Busy || !depositAmount}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition ${
                    web3Busy || !depositAmount
                      ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-500"
                      : "bg-sky-600 shadow-[0_0_15px_rgba(2,132,199,0.3)] hover:bg-sky-500 active:scale-[0.98]"
                  }`}
                >
                  {web3Busy ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("processing_wallet", "Processing...")}
                    </span>
                  ) : !isConnected ? (
                    t("connect_to_pay", "Connect Wallet to Deposit")
                  ) : (
                    "Confirm Deposit via Wallet"
                  )}
                </button>
                <p className="mt-3 text-center text-[10px] text-gray-500">
                  Transaction will be signed securely via your connected wallet. No screenshots needed.
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Side-by-Side QR & Address Card */}
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070b16] p-3">
              
              {/* CLICKABLE THUMBNAIL QR */}
              <div 
                className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white p-1 overflow-hidden transition active:scale-95"
                onClick={() => {
                  if(walletQRCodes[selectedDepositCoin]) setIsQRExpanded(true);
                }}
              >
                {walletQRCodes[selectedDepositCoin] ? (
                  <>
                    <img
                      src={walletQRCodes[selectedDepositCoin]}
                      alt={t("deposit_qr", "QR")}
                      className="h-full w-full object-contain transition duration-300 group-hover:blur-[2px]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition duration-300 group-hover:opacity-100">
                      <Icon name="maximize" className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <Icon name="qr-code" className="h-6 w-6 text-gray-300" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {t("deposit_address", "Deposit Address")}
                </div>
                <div className="truncate text-xs font-mono font-bold text-white">
                  {walletAddresses[selectedDepositCoin] || t("address_not_available", "Unavailable")}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddresses[selectedDepositCoin] || "");
                    setDepositToast(t("copied", "Copied"));
                  }}
                  className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-sky-400 transition hover:text-sky-300 active:scale-95"
                >
                  <Icon name="copy" className="h-3 w-3" />
                  COPY ADDRESS
                </button>
              </div>
            </div>

            {/* Compact Upload Area */}
            <div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  required
                  onChange={(e) => {
                    setDepositScreenshot(e.target.files[0]);
                    setFileLocked(true);
                  }}
                  className="absolute inset-0 z-50 cursor-pointer opacity-0"
                  disabled={fileLocked}
                />
                <div
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs font-bold transition ${
                    fileLocked
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "cursor-pointer border-[#2c3040] bg-[#0b1020]/50 text-gray-400 hover:bg-[#1a2343] hover:text-gray-300"
                  }`}
                >
                  <Icon name={fileLocked ? "check-circle" : "upload-cloud"} className="h-4 w-4" />
                  {fileLocked ? t("screenshot_uploaded", "Screenshot Uploaded") : t("choose_file", "Upload Transfer Proof")}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={depositBusy || !depositAmount || !depositScreenshot}
              className={`h-11 w-full rounded-xl text-sm font-bold text-white transition ${
                depositBusy || !depositScreenshot || !depositAmount
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-500"
                  : "bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:bg-emerald-500 active:scale-[0.98]"
              }`}
            >
              {depositBusy ? (t("submitting") || "Submitting...") : (t("submit") || "Submit Proof")}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}