import { Hono } from "hono";
import Stripe from "stripe";
import { redisDB } from "../index";

const paymentRouter = new Hono();

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY!);

paymentRouter.post("/coinsPayment", async (c) => {
  try {
    const { userId, price, resourceType, resourceAmount } = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const userData = await redisDB.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = JSON.parse(userData.toString());

    if (user.coins < price) {
      return c.json({ error: "Insufficient coins" }, 400);
    }

    user.coins = user.coins - price;

    user.resources = user.resources || {};
    user.resources[resourceType] =
      (user.resources[resourceType] || 0) + resourceAmount;

    await redisDB.set(`user:${userId}`, JSON.stringify(user));

    console.log(
      `Successfully processed coins payment for user ${userId}: deducted ${price} coins, added ${resourceAmount} ${resourceType}`,
    );

    return c.json({
      success: true,
      message: "Payment successful",
      coins: user.coins,
      resources: user.resources,
    });
  } catch (e) {
    console.log("Error processing coins payment:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

paymentRouter.post("/webhook", async (c) => {
  try {
    const rawBody = await c.req.text();
    const sig = c.req.header("stripe-signature");

    console.log("Received webhook with signature:", sig);

    if (!sig) {
      console.log(sig);
    }

    const endpointSecret = Bun.env.STRIPE_WEBHOOK_SECRET;
    console.log(endpointSecret);
    if (!endpointSecret) {
      return c.json({ error: "Webhook secret not configured" }, 500);
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        sig,
        endpointSecret,
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err);
      return c.json({ error: `Webhook Error: ${err.message}` }, 400);
    }

    console.log(1);
    if (event.type === "checkout.session.completed") {
      console.log(2);
      const session = event.data.object;

      const userId = session.metadata?.userId;
      const resourceType = session.metadata?.resourceType || "coins";
      const resourceAmount = parseInt(session.metadata?.resourceAmount || "0");

      console.log("Processing completed checkout for user:", userId);

      if (userId) {
        await addResourcesToUser(userId, resourceType, resourceAmount);
        console.log(
          `Added ${resourceAmount} ${resourceType} to user ${userId}`,
        );
      } else {
        console.error("No user ID found in session metadata");
      }
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return c.json({ error: error.message }, 500);
  }
});

async function addResourcesToUser(
  userId: string,
  resourceType: string,
  amount: number,
) {
  try {
    // Get user data from Redis
    const userData = await redisDB.get(`user:${userId}`);
    if (!userData) {
      console.error(`User ${userId} not found`);
      return;
    }

    const user = JSON.parse(userData.toString());

    if (resourceType === "coins") {
      user.coins = (user.coins || 0) + amount;
    } else {
      user.resources = user.resources || {};
      user.resources[resourceType] =
        (user.resources[resourceType] || 0) + amount;
    }

    await redisDB.set(`user:${userId}`, JSON.stringify(user));
    console.log(
      `Successfully updated user ${userId}: added ${amount} ${resourceType}`,
    );
  } catch (error) {
    console.error("Error updating user resources:", error);
    throw error;
  }
}

paymentRouter.post("/create-checkout-session", async (c) => {
  try {
    const {
      amount,
      currency,
      name,
      description,
      userId,
      resourceType,
      resourceAmount,
    } = await c.req.json();

    const origin = c.req.header("origin") || "https://wmft.vercel.io";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency || "cad",
            product_data: {
              name: name,
              description: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/profile/`,
      cancel_url: `${origin}/?canceled=true`,
      // Add metadata to identify the user and what they're purchasing
      metadata: {
        userId: userId,
        resourceType: resourceType || "coins",
        resourceAmount: resourceAmount || amount / 100, // Convert cents to dollars/coins
      },
    });

    return c.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return c.json({ error: error.message }, 500);
  }
});

paymentRouter.get("/session-status", async (c) => {
  const sessionId = c.req.query("session_id");

  if (!sessionId) {
    return c.json({ error: "session_id is required" }, 400);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return c.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return c.json({ error: "Failed to retrieve session" }, 500);
  }
});

export { paymentRouter };
