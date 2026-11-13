"use client";

import { useEffect, useState } from "react";
import type { CustomerPublic } from "@/lib/customer-client";

type AuthConfig = {
  apple: { enabled: boolean; clientId: string | null; sampleMode: boolean };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}

export function AppleSignInButton({
  onSuccess,
  onError,
  label = "Continue with Apple",
}: {
  onSuccess: (customer: CustomerPublic) => void;
  onError: (message: string) => void;
  label?: string;
}) {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/customer/auth-config")
      .then((r) => r.json())
      .then((data: AuthConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig({ apple: { enabled: false, clientId: null, sampleMode: true } });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config?.apple.enabled || !config.apple.clientId) return;
    if (document.getElementById("apple-signin-sdk")) return;
    const script = document.createElement("script");
    script.id = "apple-signin-sdk";
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: config.apple.clientId,
        scope: "name email",
        redirectURI: `${window.location.origin}/login`,
        usePopup: true,
      });
    };
    document.head.appendChild(script);
  }, [config]);

  async function finish(identityToken: string, fullName?: string, sample = false) {
    setBusy(true);
    try {
      const res = await fetch("/api/customer/apple", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken,
          fullName,
          sample,
          sampleEmail: sample ? "apple.renter@example.com" : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; customer?: CustomerPublic };
      if (!res.ok || !data.customer) {
        onError(data.error ?? "Apple Sign In failed.");
        return;
      }
      onSuccess(data.customer);
    } catch {
      onError("Network error during Apple Sign In.");
    } finally {
      setBusy(false);
    }
  }

  async function onClick() {
    onError("");
    if (!config) return;

    if (config.apple.sampleMode || !config.apple.enabled) {
      await finish("sample", "Apple Renter", true);
      return;
    }

    try {
      if (!window.AppleID) {
        onError("Apple Sign In is still loading. Try again in a moment.");
        return;
      }
      const result = await window.AppleID.auth.signIn();
      const first = result.user?.name?.firstName ?? "";
      const last = result.user?.name?.lastName ?? "";
      const fullName = `${first} ${last}`.trim();
      await finish(result.authorization.id_token, fullName || undefined, false);
    } catch {
      onError("Apple Sign In was cancelled or failed.");
    }
  }

  return (
    <button
      type="button"
      disabled={busy || !config}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-night px-5 py-3 text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
        <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3.3zm-2-6.2c.6-.7 1-1.7.9-2.7-1 .1-2.1.7-2.7 1.4-.6.7-1.1 1.7-.9 2.6 1 .1 2-.5 2.7-1.3z" />
      </svg>
      {busy ? "Continuing…" : label}
      {config?.apple.sampleMode ? " (sample)" : ""}
    </button>
  );
}
