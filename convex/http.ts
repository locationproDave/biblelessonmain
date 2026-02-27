import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Stripe Checkout - Redirect Flow
 * Opens Stripe's hosted checkout page in a new tab
 * 
 * Usage: <a href={`${import.meta.env.VITE_CONVEX_SITE_URL}/stripe/checkout?priceId=price_xxx`} target="_blank">
 */
http.route({
  path: "/stripe/checkout",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const priceId = url.searchParams.get("priceId");
    // Get the app origin from query param (passed by frontend) or use referer
    const appOrigin = url.searchParams.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";

    if (!priceId) {
      return new Response("Missing priceId parameter", { status: 400 });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appOrigin}/pricing`,
      });

      // Redirect to Stripe's hosted checkout page
      return Response.redirect(session.url!, 303);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe error";
      console.error("Checkout error:", message);
      return new Response(`Checkout failed: ${message}`, { status: 500 });
    }
  }),
});

/**
 * Stripe Webhook Handler
 * Receives events from Stripe (payment completed, subscription updated, etc.)
 * 
 * To enable: Add webhook URL in Stripe Dashboard -> Developers -> Webhooks
 * URL: https://your-convex-deployment.convex.site/stripe/webhook
 * 
 * Required events to subscribe to:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated  
 * - customer.subscription.deleted
 * - invoice.payment_failed
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // Webhook secret not configured - just log and accept
      console.log("STRIPE_WEBHOOK_SECRET not configured, skipping verification");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${message}`);
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);
        
        // Save payment to database
        await ctx.runMutation(internal.stripeWebhook.savePayment, {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string | undefined,
          stripePaymentIntentId: session.payment_intent as string | undefined,
          stripeSubscriptionId: session.subscription as string | undefined,
          userEmail: session.customer_details?.email || undefined,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "completed",
          paymentType: session.mode === "subscription" ? "subscription" : "one_time",
          paidAt: Date.now(),
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📦 Subscription updated:", subscription.id, subscription.status);
        
        // Update subscription in database
        await ctx.runMutation(internal.stripeWebhook.upsertSubscription, {
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || "",
          status: subscription.status as "active" | "cancelled" | "past_due" | "unpaid" | "trialing",
          currentPeriodStart: (subscription as any).current_period_start ? (subscription as any).current_period_start * 1000 : Date.now(),
          currentPeriodEnd: (subscription as any).current_period_end ? (subscription as any).current_period_end * 1000 : Date.now(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription cancelled:", subscription.id);
        
        // Mark subscription as cancelled
        await ctx.runMutation(internal.stripeWebhook.cancelSubscription, {
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed for invoice:", invoice.id);
        // Could add notification logic here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
