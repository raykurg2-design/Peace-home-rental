import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import { isAppleConfigured, verifyAppleIdentityToken } from "@/lib/apple-auth";
import {
  createAppleCustomer,
  createSession,
  findCustomerByAppleSub,
  findCustomerByEmail,
  linkAppleSub,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublic,
} from "@/lib/customer-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isAppleConfigured()) {
      return NextResponse.json(
        { error: "Apple Sign In is not configured for this app." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      identityToken?: string;
      fullName?: string;
    };

    const identityToken = body.identityToken?.trim() ?? "";
    if (!identityToken) {
      return NextResponse.json({ error: "Apple identity token is required." }, { status: 400 });
    }

    const identity = await verifyAppleIdentityToken(identityToken);

    if (!identity.email) {
      return NextResponse.json(
        { error: "Apple did not share an email. Use email signup or allow email with Apple." },
        { status: 400 },
      );
    }

    let customer = await findCustomerByAppleSub(identity.appleSub);
    let created = false;

    if (!customer) {
      const byEmail = await findCustomerByEmail(identity.email);
      if (byEmail) {
        customer = await linkAppleSub(byEmail.id, identity.appleSub);
      } else {
        const name =
          body.fullName?.trim() ||
          identity.email.split("@")[0]?.replace(/[._+]/g, " ") ||
          "Apple customer";
        customer = await createAppleCustomer({
          email: identity.email,
          name,
          appleSub: identity.appleSub,
        });
        created = true;
      }
    }

    if (!customer) {
      return NextResponse.json({ error: "Could not create Apple account." }, { status: 500 });
    }

    if (created) {
      await recordActivity({
        customerId: customer.id,
        actorRole: "customer",
        kind: "account_created",
        title: "Account created with Apple",
        detail: customer.email,
      });
      const origin = originFrom(request);
      await Promise.allSettled([
        sendWelcomeEmail({
          to: customer.email,
          name: customer.name,
          accountUrl: `${origin}/account`,
        }),
        recordActivity({
          customerId: customer.id,
          actorRole: "system",
          kind: "welcome_email",
          title: "Welcome email sent",
          detail: "Welcome to Peace Home Rental",
        }),
        recordActivity({
          customerId: customer.id,
          actorRole: "system",
          kind: "email_verified",
          title: "Email verified via Apple",
          detail: customer.email,
        }),
      ]);
    } else {
      await recordActivity({
        customerId: customer.id,
        actorRole: "customer",
        kind: "login_success",
        title: "Signed in with Apple",
        detail: customer.email,
      });
    }

    const sessionId = await createSession(customer.id);
    const res = NextResponse.json({ customer: toPublic(customer), created });
    res.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
    return res;
  } catch (error) {
    console.error("apple auth failed", error);
    return NextResponse.json({ error: "Apple Sign In failed." }, { status: 400 });
  }
}
