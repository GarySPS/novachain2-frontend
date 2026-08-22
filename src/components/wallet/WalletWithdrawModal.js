//src>components/wallet/WithdrawModal.js

import React, { useState, useEffect } from "react";
import Modal from "../modal";
import Icon from "../icon";

export default function WalletWithdrawModal({
  visible,
  onClose,
  modalGlassClass,
  t,
  coinSymbols,
  depositNetworks, // Used for withdraw networks too
  selectedWithdrawCoin,
  setSelectedWithdrawCoin,
  withdrawForm,
  setWithdrawForm,
  withdrawBusy,
  withdrawToast,
  handleWithdraw,
  // New optional props for Phase 2 - will fallback safely if undefined
  userBalances = {},
  networkFees = {},
}) {
  const [step, setStep] = useState(1); // 1 = Input, 2 = Confirmation

  // Reset step when modal opens/closes
  useEffect(() => {
    if (!visible) setStep(1);
  }, [visible]);

  // Derived values with safe fallbacks
  const availableBalance = userBalances[selectedWithdrawCoin] || 0;
  const estimatedFee = networkFees[selectedWithdrawCoin] || 0;
  const receiveAmount = Math.max(0, parseFloat(withdrawForm.amount || 0) - estimatedFee);

  const handleReviewClick = (e) => {
    e.preventDefault();
    if (withdrawForm.address && withdrawForm.amount) {
      setStep(2);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    handleWithdraw(e);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWithdrawForm((f) => ({ ...f, address: text }));
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleMax = () => {
    if (availableBalance > 0) {
      setWithdrawForm((f) => ({ ...f, amount: availableBalance.toString() }));
    }
  };

  // Truncate address for the review screen
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      classWrap={modalGlassClass}
      classButtonClose="text-gray-400 hover:text-white z-10"
    >
      <div className="p-1">
        {/* Toast Notification */}
        {withdrawToast && (
          <div className="absolute -top-14 left-1/2 z-[70] w-full max-w-[280px] -translate-x-1/2">
            <div
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white shadow-2xl ring-1 ring-white/20 backdrop-blur ${
                withdrawToast.includes("Failed") ||
                withdrawToast.includes("error")
                  ? "bg-rose-500/90"
                  : "bg-emerald-500/90"
              }`}
            >
              <Icon
                name={
                  withdrawToast.includes("Failed") ||
                  withdrawToast.includes("error")
                    ? "alert-circle"
                    : "check"
                }
                className="h-5 w-5"
              />
              <span>{withdrawToast}</span>
            </div>
          </div>
        )}

        {step === 1 ? (
          /* ================= STEP 1: INPUT FORM ================= */
          <form onSubmit={handleReviewClick} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-black text-white">{t("withdraw")}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Send crypto to an external wallet or exchange.
              </p>
            </div>

            {/* Coin & Network Selection */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-gray-400">
                {t("coin", "Coin")}
              </label>

              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-xl bg-[#0b1020] px-4 font-bold text-white outline-none ring-1 ring-[#2c3040] focus:ring-2 focus:ring-sky-500"
                  value={selectedWithdrawCoin}
                  onChange={(e) => setSelectedWithdrawCoin(e.target.value)}
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
                  {depositNetworks[selectedWithdrawCoin]}
                </span>
              </div>
            </div>

            {/* Custom Address Input with Paste Button */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-gray-400">
                {t("withdraw_to_address", "Recipient Address")}
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-4 text-gray-500">
                  <Icon name="send" className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={t("paste_recipient_address", {
                    coin: selectedWithdrawCoin,
                  })}
                  value={withdrawForm.address}
                  onChange={(e) =>
                    setWithdrawForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-[#2c3040] bg-[#0b1020]/50 pl-11 pr-20 font-bold text-white outline-none transition focus:border-sky-500 focus:bg-[#0b1020]"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/20 active:scale-95 transition"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Custom Amount Input with Max Button */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {t("amount_with_coin", { coin: selectedWithdrawCoin })}
                </label>
                <span className="text-[11px] font-bold text-sky-400">
                  Available: {availableBalance} {selectedWithdrawCoin}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-4 text-gray-500">
                  <Icon name="dollar-sign" className="h-5 w-5" />
                </div>
                <input
                  type="number"
                  min={0.0001}
                  step="any"
                  required
                  placeholder={t("enter_amount_with_coin", {
                    coin: selectedWithdrawCoin,
                  })}
                  value={withdrawForm.amount}
                  onChange={(e) =>
                    setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-[#2c3040] bg-[#0b1020]/50 pl-11 pr-20 font-bold text-white outline-none transition focus:border-sky-500 focus:bg-[#0b1020]"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="absolute right-2 rounded-lg bg-sky-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400 hover:bg-sky-500/30 active:scale-95 transition"
                >
                  MAX
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!withdrawForm.address || !withdrawForm.amount}
              className={`h-12 w-full rounded-xl text-base font-black text-white shadow-lg transition ${
                !withdrawForm.address || !withdrawForm.amount
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                  : "bg-sky-600 hover:bg-sky-500 active:scale-[0.98]"
              }`}
            >
              Review Withdrawal
            </button>
          </form>
        ) : (
          /* ================= STEP 2: CONFIRMATION ================= */
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
              </button>
              <h2 className="text-xl font-black text-white">Security Check</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Please verify the details below.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/55 p-5">
              <div className="mb-6 text-center">
                <div className="text-sm font-bold text-gray-400">You are sending</div>
                <div className="mt-1 text-3xl font-black text-white">
                  {withdrawForm.amount} <span className="text-xl text-sky-400">{selectedWithdrawCoin}</span>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-[#070b16] p-4 ring-1 ring-[#2c3040]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold text-gray-400">To Address</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {truncateAddress(withdrawForm.address)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold text-gray-400">Network</span>
                  <span className="text-sm font-bold text-white">
                    {depositNetworks[selectedWithdrawCoin]}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold text-gray-400">Network Fee</span>
                  <span className="text-sm font-bold text-white">
                    {estimatedFee} {selectedWithdrawCoin}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Total Received
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    ~{receiveAmount > 0 ? receiveAmount.toFixed(6).replace(/\.?0+$/, '') : 0} {selectedWithdrawCoin}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-3 text-center text-xs font-semibold leading-relaxed text-rose-300">
              {t("double_check_withdraw", "Transactions cannot be reversed. Please ensure the address and network are correct.")}
            </div>

            <button
              type="submit"
              disabled={withdrawBusy}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-black text-white shadow-lg transition ${
                withdrawBusy
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-sky-500 active:scale-[0.98]"
              }`}
            >
              {withdrawBusy ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("submitting", "Processing...")}
                </>
              ) : (
                "Confirm & Send"
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
