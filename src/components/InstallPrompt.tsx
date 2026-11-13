"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("phr-install-dismissed");
    if (dismissed === "1") return;

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone));

    if (standalone) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const timer = window.setTimeout(() => {
      setIsIos(ios);
      if (ios) setVisible(true);
    }, ios ? 1800 : 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    setVisible(false);
    window.localStorage.setItem("phr-install-dismissed", "1");
  }

  return (
    <div className="install-banner fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl bg-forest-deep p-4 text-paper shadow-[var(--shadow-lift)] outline outline-1 outline-white/10 sm:inset-x-auto sm:right-4 sm:left-auto">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-10 place-items-center rounded-full bg-action text-paper">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl">Install Peace Home</p>
          <p className="mt-1 text-sm text-paper/75">
            {isIos
              ? "On iPhone: tap Share, then Add to Home Screen."
              : "Add the rental app to your home screen for quick search and apply."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {deferred ? (
              <button
                type="button"
                onClick={install}
                className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-forest"
              >
                Install app
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md px-3 py-2 text-sm text-paper/80 hover:text-paper"
            >
              Not now
            </button>
          </div>
        </div>
        <button type="button" aria-label="Dismiss" onClick={dismiss} className="text-paper/70 hover:text-paper">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
