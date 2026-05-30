//src>components/wallet/WalletEarnSummaryCard.js

import React from "react";
import Modal from "../modal";
import Field from "../field";
import Icon from "../icon";

export default function WalletWithdrawModal({
  visible,
  onClose,
  modalGlassClass,
  t,
  coinSymbols,
  depositNetworks,
  selectedWithdrawCoin,
  setSelectedWithdrawCoin,
  withdrawForm,
  setWithdrawForm,
  withdrawBusy,
  withdrawToast,
  handleWithdraw,
}) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      classWrap={modalGlassClass}
      classButtonClose="text-gray-400 hover:text-white"
    >
      <form onSubmit={handleWithdraw} className="space-y-4 p-1">
        <div className="text-center">

          <h2 className="text-xl font-black text-white">
            {t("withdraw")}
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Enter recipient address carefully before submitting.
          </p>
        </div>

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

        <Field
          label={t("withdraw_to_address")}
          type="text"
          required
          placeholder={t("paste_recipient_address", {
            coin: selectedWithdrawCoin,
          })}
          value={withdrawForm.address}
          onChange={(e) =>
            setWithdrawForm((f) => ({ ...f, address: e.target.value }))
          }
          icon="send"
          classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
        />

        <Field
          label={t("amount_with_coin", { coin: selectedWithdrawCoin })}
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
          icon="dollar-sign"
          classInput="!bg-[#0b1020]/50 !border-[#2c3040] !text-white !font-bold"
        />

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-center text-xs font-semibold leading-relaxed text-rose-300/85">
          {t("double_check_withdraw")}
        </div>

        <div className="relative pt-1">
          <button
            type="submit"
            disabled={
              withdrawBusy || !withdrawForm.address || !withdrawForm.amount
            }
            className={`h-12 w-full rounded-xl text-base font-black text-white shadow-lg transition ${
              withdrawBusy || !withdrawForm.address || !withdrawForm.amount
                ? "cursor-not-allowed border border-white/5 bg-slate-800 text-gray-400"
                : "bg-gradient-to-r from-blue-600 to-sky-500 active:scale-[0.98]"
            }`}
          >
            {withdrawBusy
              ? t("submitting") || "Submitting..."
              : t("submit_withdraw")}
          </button>

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
        </div>
      </form>
    </Modal>
  );
}