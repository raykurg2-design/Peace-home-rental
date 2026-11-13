"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

export type ThreadView = {
  id: string;
  subject: string;
  listingTitle?: string | null;
  customerName?: string;
  customerEmail?: string;
  lastMessageAt: string;
  preview?: string | null;
};

export type MessageView = {
  id: string;
  senderRole: "customer" | "owner";
  senderName: string;
  body: string;
  createdAt: string;
};

export function MessageInbox({
  mode,
  initialThreadId,
}: {
  mode: "customer" | "owner";
  initialThreadId?: string | null;
}) {
  const listUrl = mode === "owner" ? "/api/owner/messages" : "/api/customer/messages";
  const [threads, setThreads] = useState<ThreadView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialThreadId ?? null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [activeSubject, setActiveSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [newSubject, setNewSubject] = useState("Question for the office");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    const res = await fetch(listUrl, { credentials: "same-origin" });
    const data = (await res.json()) as { threads?: ThreadView[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Could not load threads");
    setThreads(data.threads ?? []);
  }, [listUrl]);

  const loadThread = useCallback(
    async (threadId: string) => {
      const res = await fetch(`${listUrl}?threadId=${encodeURIComponent(threadId)}`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        thread?: ThreadView;
        messages?: MessageView[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load thread");
      setActiveId(threadId);
      setActiveSubject(data.thread?.subject ?? "");
      setMessages(data.messages ?? []);
    },
    [listUrl],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadThreads();
        if (initialThreadId) await loadThread(initialThreadId);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialThreadId, loadThread, loadThreads]);

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(listUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: activeId, message: draft.trim() }),
      });
      const data = (await res.json()) as { error?: string; message?: MessageView };
      if (!res.ok) {
        setError(data.error ?? "Send failed");
        return;
      }
      if (data.message) setMessages((prev) => [...prev, data.message!]);
      setDraft("");
      await loadThreads();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function startThread(e: FormEvent) {
    e.preventDefault();
    if (mode !== "customer" || !draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(listUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newSubject.trim(), message: draft.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        thread?: ThreadView;
        message?: MessageView;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not start conversation");
        return;
      }
      setDraft("");
      await loadThreads();
      if (data.thread) {
        setActiveId(data.thread.id);
        setActiveSubject(data.thread.subject);
        setMessages(data.message ? [data.message] : []);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <p className="text-sm text-ink-muted">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
      <div className="space-y-3">
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => loadThread(t.id).catch((e) => setError(e.message))}
            className={`w-full rounded-xl px-4 py-3 text-left outline outline-1 transition ${
              activeId === t.id
                ? "bg-forest text-paper outline-forest"
                : "bg-surface text-ink outline-line hover:bg-paper"
            }`}
          >
            <p className="font-medium">{t.subject}</p>
            {mode === "owner" && t.customerName ? (
              <p className={`mt-1 text-xs ${activeId === t.id ? "text-paper/70" : "text-ink-muted"}`}>
                {t.customerName}
              </p>
            ) : null}
            <p className={`mt-1 line-clamp-2 text-sm ${activeId === t.id ? "text-paper/80" : "text-ink-muted"}`}>
              {t.preview}
            </p>
          </button>
        ))}
        {threads.length === 0 ? (
          <div className="rounded-xl bg-surface p-5 outline outline-1 outline-line">
            <p className="text-sm text-ink-muted">No conversations yet.</p>
          </div>
        ) : null}

        {mode === "customer" && !activeId ? (
          <form onSubmit={startThread} className="space-y-3 rounded-xl bg-surface p-5 outline outline-1 outline-line">
            <h3 className="font-display text-2xl text-ink">Message the office</h3>
            <label className="block">
              <span className="text-sm font-medium">Subject</span>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Message</span>
              <textarea
                required
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
              />
            </label>
            {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
            >
              Send message
            </button>
          </form>
        ) : null}
      </div>

      <div className="rounded-2xl bg-surface p-5 outline outline-1 outline-line">
        {activeId ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="font-display text-3xl text-ink">{activeSubject}</h2>
                <p className="mt-1 text-xs text-ink-muted">Conversation with the office</p>
              </div>
              {mode === "customer" ? (
                <Link href="/account" className="text-sm font-medium text-forest hover:underline">
                  Account
                </Link>
              ) : null}
            </div>
            <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
              {messages.map((m) => {
                const mine =
                  (mode === "customer" && m.senderRole === "customer") ||
                  (mode === "owner" && m.senderRole === "owner");
                return (
                  <div
                    key={m.id}
                    className={`rounded-lg px-3 py-2.5 text-sm ${
                      mine ? "ml-8 bg-forest text-paper" : "mr-8 bg-paper outline outline-1 outline-line"
                    }`}
                  >
                    <p className={`text-xs ${mine ? "text-paper/70" : "text-ink-muted"}`}>
                      {m.senderName} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                  </div>
                );
              })}
            </div>
            <form onSubmit={sendReply} className="mt-4 space-y-3 border-t border-line pt-4">
              <textarea
                required
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a reply…"
                className="w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
              />
              {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
              >
                Send reply
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-ink-muted">
            {mode === "customer"
              ? "Select a conversation or start a new message to the office."
              : "Select a conversation to reply."}
          </p>
        )}
      </div>
    </div>
  );
}
