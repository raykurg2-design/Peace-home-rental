import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import { findCustomerById } from "@/lib/customer-auth";
import { sendNewMessageEmail } from "@/lib/email";
import {
  addMessage,
  findThread,
  listAllThreads,
  listMessages,
  toMessagePublic,
  toThreadPublic,
} from "@/lib/messages";
import { getOwnerAccess } from "@/lib/owner-auth";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const access = await getOwnerAccess();
    if (!access.ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const threadId = new URL(request.url).searchParams.get("threadId");
    if (threadId) {
      const thread = await findThread(threadId);
      if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });
      const messages = await listMessages(threadId);
      return NextResponse.json({
        thread: toThreadPublic(thread),
        messages: messages.map(toMessagePublic),
      });
    }

    const threads = await listAllThreads();
    return NextResponse.json({ threads: threads.map(toThreadPublic) });
  } catch (error) {
    console.error("owner list messages failed", error);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await getOwnerAccess();
    if (!access.ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = (await request.json()) as { threadId?: string; message?: string };
    const threadId = body.threadId?.trim() ?? "";
    const text = body.message?.trim() ?? "";
    if (!threadId || text.length < 1) {
      return NextResponse.json({ error: "threadId and message are required." }, { status: 400 });
    }

    const thread = await findThread(threadId);
    if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

    const ownerName = access.identity.name || "Peace Home Rental";
    const message = await addMessage({
      threadId,
      senderRole: "owner",
      senderName: ownerName,
      body: text,
    });

    await recordActivity({
      customerId: thread.customer_id,
      actorRole: "owner",
      kind: "message_reply",
      title: "Office replied to your message",
      detail: thread.subject,
    });

    const customer = await findCustomerById(thread.customer_id);
    if (customer) {
      const origin = originFrom(request);
      await Promise.allSettled([
        sendNewMessageEmail({
          to: customer.email,
          recipientName: customer.name,
          senderName: ownerName,
          subject: thread.subject,
          body: text,
          threadUrl: `${origin}/messages?thread=${thread.id}`,
          idempotencyKey: `message-customer/${message.id}`,
        }),
      ]);
    }

    return NextResponse.json({
      thread: toThreadPublic(thread),
      message: toMessagePublic(message),
    });
  } catch (error) {
    console.error("owner reply failed", error);
    return NextResponse.json({ error: "Could not send reply." }, { status: 500 });
  }
}
