"use client";

import { useEffect, useState } from "react";

export type ActivityView = {
  id: string;
  kind: string;
  title: string;
  detail: string | null;
  actorRole: string;
  createdAt: string;
};

export function ActivityFeed({
  endpoint,
  emptyLabel = "No activity yet.",
}: {
  endpoint: string;
  emptyLabel?: string;
}) {
  const [items, setItems] = useState<ActivityView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(endpoint, { credentials: "same-origin" });
        const data = (await res.json()) as { activities?: ActivityView[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not load activity");
        if (!cancelled) setItems(data.activities ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load activity");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (error) {
    return <p className="text-sm text-clay-deep">{error}</p>;
  }
  if (!items) {
    return <p className="text-sm text-ink-muted">Loading activity…</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="border-b border-line pb-4 last:border-0">
          <p className="font-medium text-ink">{item.title}</p>
          {item.detail ? <p className="mt-1 text-sm text-ink-muted">{item.detail}</p> : null}
          <p className="mt-1 text-xs tracking-wide text-ink-muted uppercase">
            {item.actorRole} · {new Date(item.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}
