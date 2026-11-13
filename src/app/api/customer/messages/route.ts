import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { sendNewMessageEmail } from "@/lib/email";
import {
  addMessage,
  createThreadWithMessage,
  findThread,
  listCustomerThreads,
  listMessages,
  toMessagePublic,
  toThreadPublic,
} from "@/lib/messages";
import { originFrom } from "@/lib/request-origin";
import { ownerNotifyEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const threadId = new URL(request.url).searchParams.get("threadId");
    if (threadId) {
      const thread = await findThread(threadId);
      if (!thread || thread.customer_id !== customer.id) {
        return NextResponse.json({ error: "Thread not found." }, { status: 404 });
      }
      const messages = await listMessages(threadId);
      return NextResponse.json({
        thread: toThreadPublic(thread),
        messages: messages.map(toMessagePublic),
      });
    }

    const threads = await listCustomerThreads(customer.id);
    return NextResponse.json({ threads: threads.map(toThreadPublic) });
  } catch (error) {
    console.error("list messages failed", error);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    if (!customer.email_verified_at) {
      return NextResponse.json({ error: "Verify your email before messaging." }, { status: 403 });
    }

    const body = (await request.json()) as {
      threadId?: string;
      subject?: string;
      listingSlug?: string;
      listingTitle?: string;
      message?: string;
    };
    const text = body.message?.trim() ?? "";
    if (text.length < 2) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const origin = originFrom(request);

    if (body.threadId) {
      const thread = await findThread(body.threadId);
      if (!thread || thread.customer_id !== customer.id) {
        return NextResponse.json({ error: "Thread not found." }, { status: 404 });
      }
      const message = await addMessage({
        threadId: thread.id,
        senderRole: "customer",
        senderName: customer.name,
        body: text,
      });
      await recordActivity({
        customerId: customer.id,
        actorRole: "customer",
        kind: "message_sent",
        title: "Message sent to office",
        detail: thread.subject,
      });
      await Promise.allSettled([
        sendNewMessageEmail({
          to: ownerNotifyEmail(),
          recipientName: "Peace Home Rental",
          senderName: customer.name,
          subject: thread.subject,
          body: text,
          threadUrl: `${origin}/owner/messages?thread=${thread.id}`,
          idempotencyKey: `message-owner/${message.id}`,
        }),
      ]);
      return NextResponse.json({ thread: toThreadPublic(thread), message: toMessagePublic(message) });
    }

    const subject = body.subject?.trim() || body.listingTitle?.trim() || "Message to office";
    const { thread, message } = await createThreadWithMessage({
      customerId: customer.id,
      listingSlug: body.listingSlug ?? null,
      listingTitle: body.listingTitle ?? null,
      subject,
      senderRole: "customer",
      senderName: customer.name,
      body: text,
    });
    await recordActivity({
      customerId: customer.id,
      actorRole: "customer",
      kind: "message_started",
      title: "Started a conversation with the office",
      detail: subject,
    });
    await Promise.allSettled([
      sendNewMessageEmail({
        to: ownerNotifyEmail(),
        recipientName: "Peace Home Rental",
        senderName: customer.name,
        subject,
        body: text,
        threadUrl: `${origin}/owner/messages?thread=${thread.id}`,
        idempotencyKey: `message-owner/${message.id}`,
      }),
    ]);
    return NextResponse.json({
      thread: toThreadPublic(thread),
      message: toMessagePublic(message),
    });
  } catch (error) {
    console.error("send message failed", error);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
