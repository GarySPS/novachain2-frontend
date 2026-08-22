//src/components/wallet/WalletDepositModal.js

import React, { useState, useEffect } from "react";
import Modal from "../modal";
import Field from "../field";
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
  // State for the tab switcher
  const [activeTab, setActiveTab] = useState("web3");

  // Auto-detect if user is in an in-app Web3 browser (OKX, MetaMask, Trust)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWeb3Browser =
        !!window.ethereum || !!window.okxwallet || !!window.trustwallet;
      setActiveTab(isWeb3Browser ? "web3" : "manual");
    }
  }, [visible]); // Re-run check when modal opens

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      classWrap={modalGlassClass}
      classButtonClose="text-gray-400 hover:text-white"
    >
      <div className="p-1">
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-black text-white">{t("deposit")}</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {activeTab === "web3"
              ? "Instant 1-click on-chain deposit."
              : "Copy address and submit your proof."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-5 flex rounded-xl bg-[#0b1020] p-1 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("web3")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black transition-all ${
              activeTab === "web3"
                ? "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30"
                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
            }`}
          >
            <Icon name="zap" className="h-4 w-4" />
            Web3 Instant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black transition-all ${
              activeTab === "manual"
                ? "bg-white/10 text-white ring-1 ring-white/20"
                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
            }`}
          >
            <Icon name="copy" className="h-4 w-4" />
            Direct / CEX
          </button>
        </div>

        {/* Toast Notification */}
        {depositToast && (
          <div className="absolute -top-14 left-1/2 z-[70] w-full max-w-[280px] -translate-x-1/2">
            <div
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white shadow-2xl ring-1 ring-white/20 backdrop-blur ${
                depositToast.includes("Failed") ||
                depositToast.includes("error")
                  ? "bg-rose-500/90"
                  : "bg-emerald-500/90"
              }`}
            >
              <Icon
                name={
                  depositToast.includes("Failed") ? "alert-circle" : "check"
                }
                className="h-5 w-5"
              />
              <span>{depositToast}</span>
            </div>
          </div>
        )}

        {/* Shared Inputs (Coin & Amount) - Kept outside tabs to persist data when switching */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-gray-400">
            {t("coin", "Coin")}
          </label>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-xl bg-[#0b1020] px-4 font-bold text-white outline-none ring-1 ring-[#2c3040] focus:ring-2 focus:ring-sky-500"
              value={selectedDepositCoin}
              onChange={(e) => setSelectedDepositCoin(e.target.value)}
            >
              {coinSymbols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Icon
              name="arrow-down"
              className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-gray-500"
            />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-sky-400/15 bg-sky-400/10 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("network")}
            </span>
            <span className="text-sm font-black text-sky-300">
              {depositNetworks[selectedDepositCoin]}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <Field
            label={t("deposit_amount_with_coin", {
              coin: selectedDepositCoin,
            })}
            type="number"
            min={0}
            step="any"
            required
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            icon="dollar-sign"
            classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
          />
        </div>

        {/* Tab Content Area */}
        {activeTab === "web3" ? (
          <div className="space-y-4">
            {!["USDC", "ETH", "BNB"].includes(selectedDepositCoin) ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-4 text-center text-xs font-medium text-rose-300">
                Web3 deposits are currently not supported for{" "}
                {selectedDepositCoin}. Please use the Direct / CEX tab.
              </div>
            ) : (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50">
                    <Icon name="zap" className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-black text-white">
                  Instant On-Chain Deposit
                </h3>
                <p className="mb-6 text-xs text-gray-400">
                  Securely sign the transaction with your connected wallet. No
                  screenshots needed.
                </p>
                <button
                  type="button"
                  onClick={handleWeb3Deposit}
                  disabled={web3Busy || !depositAmount}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-black text-white shadow-lg transition ${
                    web3Busy || !depositAmount
                      ? "cursor-not-allowed bg-slate-800 text-gray-500 ring-1 ring-white/5"
                      : "bg-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-sky-400/50 hover:bg-sky-400 active:scale-[0.98]"
                  }`}
                >
                  {web3Busy ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("processing_wallet", "Processing...")}
                    </span>
                  ) : !isConnected ? (
                    t("connect_to_pay", "Connect Wallet to Deposit")
                  ) : (
                    "Confirm Deposit via Wallet"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/55 p-4">
              <div className="flex flex-col items-center">
                <div className="relative mb-3 flex aspect-square w-full max-w-[150px] items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                  {walletQRCodes[selectedDepositCoin] ? (
                    <img
                      src={walletQRCodes[selectedDepositCoin]}
                      alt={t("deposit_qr")}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-center text-xs text-gray-400">
                      {t("no_qr")}
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <div className="mb-2 text-center text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("deposit_address", "Deposit Address")}
                  </div>

                  <div className="flex w-full items-center gap-2">
                    <div className="scrollbar-hide flex-1 overflow-x-auto whitespace-nowrap rounded-xl bg-[#070b16] px-3 py-3 font-mono text-xs text-gray-300 ring-1 ring-[#2c3040]">
                      {walletAddresses[selectedDepositCoin] ||
                        t("address_not_available")}
                    </div>

                    <button
                      type="button"
                      className="flex h-11 shrink-0 items-center gap-1 rounded-xl bg-[#1a2343] px-3 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-[#202b54] active:scale-[0.98]"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          walletAddresses[selectedDepositCoin] || ""
                        );
                        setDepositToast(t("copied"));
                      }}
                    >
                      <Icon name="copy" className="h-4 w-4" />
                      {t("copy")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-400">
                {t("upload_screenshot")}
              </label>

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
                  className={`w-full truncate rounded-xl border border-dashed px-4 py-3.5 text-center text-sm font-black ${
                    fileLocked
                      ? "cursor-not-allowed border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "cursor-pointer border-[#2c3040] bg-[#0b1020]/50 text-gray-300 transition hover:bg-[#1a2343]"
                  }`}
                >
                  {fileLocked ? t("screenshot_uploaded") : t("choose_file")}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-amber-300/85">
              {t("for_your_safety_submit_screenshot")}{" "}
              <span className="font-black text-amber-300">
                {t("proof_ensures_support")}
              </span>
            </div>

            <button
              type="submit"
              disabled={depositBusy || !depositAmount || !depositScreenshot}
              className={`h-12 w-full rounded-xl text-base font-black text-white shadow-lg transition ${
                depositBusy || !depositScreenshot || !depositAmount
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                  : "bg-gradient-to-r from-emerald-600 to-teal-500 active:scale-[0.98]"
              }`}
            >
              {depositBusy ? t("submitting") || "Submitting..." : t("submit")}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}