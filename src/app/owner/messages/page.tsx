import { Suspense } from "react";
import { MessagesClient } from "@/components/MessagesClient";

export default function OwnerMessagesPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Messages</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Conversations with verified renters. Replies notify the customer by email when delivery is configured.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
          <MessagesClient mode="owner" />
        </Suspense>
      </div>
    </div>
  );
}
