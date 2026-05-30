//src>frontend/src/components/wallet/WalletDepositModal.js

import React from "react";
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
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      classWrap={modalGlassClass}
      classButtonClose="text-gray-400 hover:text-white"
    >
      <form onSubmit={handleDepositSubmit} className="space-y-4 p-1">
        <div className="text-center">

          <h2 className="text-xl font-black text-white">{t("deposit")}</h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Select coin, copy address, then submit your proof.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
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
                <div className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl bg-[#070b16] px-3 py-3 font-mono text-xs text-gray-300 ring-1 ring-[#2c3040] scrollbar-hide">
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

        <div className="relative space-y-3 pt-1">
          <button
            type="submit"
            disabled={depositBusy || !depositAmount || !depositScreenshot}
            className={`h-12 w-full rounded-xl text-base font-black text-white shadow-lg transition ${
              depositBusy || !depositScreenshot
                ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                : "bg-gradient-to-r from-emerald-600 to-teal-500 active:scale-[0.98]"
            }`}
          >
            {depositBusy ? t("submitting") || "Submitting..." : t("submit")}
          </button>

          {["USDC", "ETH", "BNB"].includes(selectedDepositCoin) && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px w-full bg-white/10" />
                <span className="text-xs font-bold text-gray-500">OR</span>
                <div className="h-px w-full bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleWeb3Deposit}
                disabled={web3Busy || !depositAmount}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-400/25 text-sm font-black text-white shadow-[0_0_16px_rgba(56,189,248,0.12)] transition ${
                  web3Busy || !depositAmount
                    ? "cursor-not-allowed bg-slate-800 text-gray-400"
                    : "bg-sky-500/10 text-sky-200 active:scale-[0.98]"
                }`}
              >
                <Icon name="zap" className="h-4 w-4" />
                {web3Busy
                  ? t("processing_wallet")
                  : isConnected
                    ? "Deposit with Wallet"
                    : t("connect_to_pay")}
              </button>
            </>
          )}

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
                    depositToast.includes("Failed")
                      ? "alert-circle"
                      : "check"
                  }
                  className="h-5 w-5"
                />
                <span>{depositToast}</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}