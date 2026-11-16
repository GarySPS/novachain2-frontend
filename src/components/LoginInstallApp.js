// Login page PWA install action. Browser prompts are only supported where
// the platform provides beforeinstallprompt; all others get manual guidance.
import React, { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

function isStandalone() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function isAppleMobile() {
  const userAgent = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

export default function LoginInstallApp() {
  const { t } = useTranslation();
  const [installed, setInstalled] = useState(isStandalone);
  const [promptEvent, setPromptEvent] = useState(() => window.deferredPrompt || null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const appleMobile = isAppleMobile();
  const android = /Android/i.test(window.navigator.userAgent);

  useEffect(() => {
    const onBeforeInstallPrompt = event => {
      event.preventDefault();
      window.deferredPrompt = event;
      setPromptEvent(event);
    };
    const onInstalled = () => {
      window.deferredPrompt = null;
      setPromptEvent(null);
      setShowInstructions(false);
      setInstalled(true);
    };
    const onDisplayChange = () => setInstalled(isStandalone());
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const media = window.matchMedia?.("(display-mode: standalone)");
    media?.addEventListener?.("change", onDisplayChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      media?.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  async function onInstallClick() {
    const deferred = window.deferredPrompt || promptEvent;
    if (deferred?.prompt) {
      setIsPrompting(true);
      try {
        await deferred.prompt();
        await deferred.userChoice;
      } catch {
        setShowInstructions(true);
      } finally {
        window.deferredPrompt = null;
        setPromptEvent(null);
        setIsPrompting(false);
      }
      return;
    }
    setShowInstructions(true);
  }

  if (installed) return null;

  const instructions = appleMobile
    ? t("login_install_ios_steps", "Open the browser Share menu, choose Add to Home Screen, then tap Add.")
    : android
      ? t("login_install_android_steps", "Open your browser menu (⋮), choose Install app or Add to Home screen, then confirm.")
      : t("login_install_desktop_steps", "Use your browser's Install app option in the address bar or menu.");

  return (
    <>
      <button
        type="button"
        onClick={onInstallClick}
        disabled={isPrompting}
        className="mt-3 flex w-full min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.07] px-3 py-2.5 text-xs font-bold text-sky-200 transition hover:border-sky-400/45 hover:bg-sky-400/[0.13] disabled:opacity-60"
      >
        <Download size={16} aria-hidden="true" />
        {t("login_install_app", "Add NovaChain to Home Screen")}
      </button>
      {showInstructions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowInstructions(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-sky-400/20 bg-[#101827] p-5 text-white shadow-2xl"
            role="dialog" aria-modal="true" aria-labelledby="login-install-title">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <Share2 size={19} aria-hidden="true" />
                </span>
                <h3 id="login-install-title" className="text-base font-black">
                  {t("login_install_guide_title", "Install NovaChain")}
                </h3>
              </div>
              <button type="button" onClick={() => setShowInstructions(false)}
                aria-label={t("login_install_close", "Close")}
                className="rounded-lg border border-white/10 p-1.5 text-slate-300">
                <X size={17} />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{instructions}</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {t("login_install_hint", "Once added, open NovaChain directly from your home screen. You may need to sign in on first launch.")}
            </p>
            <button type="button" onClick={() => setShowInstructions(false)}
              className="mt-5 h-11 w-full rounded-xl bg-sky-600 text-sm font-black text-white hover:bg-sky-500">
              {t("login_install_close", "Got it")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
