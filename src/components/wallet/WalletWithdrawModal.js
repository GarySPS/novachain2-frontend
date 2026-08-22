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
      classButtonClose="text-gray-400 hover:text-white z-20"
    >
      {/* Scrollable container to fix mobile keyboard overlap */}
      <div className="max-h-[78vh] overflow-y-auto overscroll-contain px-2 pb-6 pt-2 scrollbar-hide">
        
        {/* Toast Notification */}
        {withdrawToast && (
          <div className="absolute left-1/2 top-4 z-[70] w-full max-w-[260px] -translate-x-1/2">
            <div
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-xl backdrop-blur ${
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
                className="h-4 w-4"
              />
              <span>{withdrawToast}</span>
            </div>
          </div>
        )}

        {step === 1 ? (
          /* ================= STEP 1: INPUT FORM ================= */
          <form onSubmit={handleReviewClick} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold text-white tracking-wide">{t("withdraw", "Withdraw")}</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Send crypto to an external wallet or exchange.
              </p>
            </div>

            {/* Professional Side-by-Side Asset & Network Selector */}
            <div className="mb-4 flex gap-3">
              <div className="flex-1 rounded-xl border border-[#2c3040] bg-[#0b1020]/50 p-2.5 transition-colors focus-within:border-sky-500/50">
                <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {t("coin", "Asset")}
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-transparent text-sm font-bold text-white outline-none"
                    value={selectedWithdrawCoin}
                    onChange={(e) => setSelectedWithdrawCoin(e.target.value)}
                  >
                    {coinSymbols.map((c) => (
                      <option key={c} value={c} className="bg-[#0b1020]">
                        {c}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="arrow-down"
                    className="pointer-events-none absolute right-0 top-0.5 h-3.5 w-3.5 text-gray-500"
                  />
                </div>
              </div>

              <div className="flex-1 rounded-xl border border-[#2c3040] bg-[#0b1020]/50 p-2.5">
                <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {t("network", "Network")}
                </label>
                <div className="text-sm font-bold text-sky-400">
                  {depositNetworks[selectedWithdrawCoin]}
                </div>
              </div>
            </div>

            {/* Compact Address Input with Paste Button */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                {t("withdraw_to_address", "Recipient Address")}
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3 text-gray-500">
                  <Icon name="send" className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={t("paste_recipient_address", { coin: selectedWithdrawCoin })}
                  value={withdrawForm.address}
                  onChange={(e) => setWithdrawForm((f) => ({ ...f, address: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#2c3040] bg-[#0b1020]/80 pl-9 pr-16 text-sm font-bold text-white outline-none transition focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 rounded-lg bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white transition hover:bg-white/20 active:scale-95"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Compact Amount Input with Max Button */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t("amount_with_coin", { coin: selectedWithdrawCoin })}
                </label>
                <span className="text-[10px] font-bold text-sky-400">
                  Available: {availableBalance} {selectedWithdrawCoin}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3 text-gray-500">
                  <Icon name="dollar-sign" className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  min={0.0001}
                  step="any"
                  required
                  placeholder="0.00"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm((f) => ({ ...f, amount: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#2c3040] bg-[#0b1020]/80 pl-9 pr-16 text-sm font-bold text-white outline-none transition focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="absolute right-2 rounded-lg bg-sky-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-sky-400 transition hover:bg-sky-500/30 active:scale-95"
                >
                  MAX
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!withdrawForm.address || !withdrawForm.amount}
              className={`h-11 w-full rounded-xl text-sm font-bold text-white transition ${
                !withdrawForm.address || !withdrawForm.amount
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-500"
                  : "bg-sky-600 shadow-[0_0_15px_rgba(2,132,199,0.3)] hover:bg-sky-500 active:scale-[0.98]"
              }`}
            >
              Review Withdrawal
            </button>
          </form>
        ) : (
          /* ================= STEP 2: CONFIRMATION ================= */
          <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            
            <div className="relative mb-4 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="arrow-left" className="h-3.5 w-3.5" />
              </button>
              <h2 className="text-lg font-bold text-white tracking-wide">Security Check</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Please verify the details below.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0b1020]/55 p-4 shadow-inner">
              <div className="mb-5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">You are sending</div>
                <div className="mt-1 text-2xl font-black text-white">
                  {withdrawForm.amount} <span className="text-base text-sky-400">{selectedWithdrawCoin}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-[#070b16] p-3 ring-1 ring-[#2c3040]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-bold text-gray-500">To Address</span>
                  <span className="font-mono text-[11px] font-bold text-white">
                    {truncateAddress(withdrawForm.address)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-bold text-gray-500">Network</span>
                  <span className="text-[11px] font-bold text-white">
                    {depositNetworks[selectedWithdrawCoin]}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-bold text-gray-500">Network Fee</span>
                  <span className="text-[11px] font-bold text-white">
                    {estimatedFee} {selectedWithdrawCoin}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Total Received
                  </span>
                  <span className="text-sm font-black text-emerald-400">
                    ~{receiveAmount > 0 ? receiveAmount.toFixed(6).replace(/\.?0+$/, '') : 0} {selectedWithdrawCoin}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-3 text-center text-[10px] font-semibold leading-relaxed text-rose-300">
              {t("double_check_withdraw", "Transactions cannot be reversed. Please ensure the address and network are correct.")}
            </div>

            <button
              type="submit"
              disabled={withdrawBusy}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition ${
                withdrawBusy
                  ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                  : "bg-sky-600 shadow-[0_0_15px_rgba(2,132,199,0.3)] hover:bg-sky-500 active:scale-[0.98]"
              }`}
            >
              {withdrawBusy ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
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
