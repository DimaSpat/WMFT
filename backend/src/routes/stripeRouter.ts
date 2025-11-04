import {Hono} from "hono";
import Stripe from "stripe";

const stripeRouter = new Hono();

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY!);

stripeRouter.post('/api/payment/create-checkout-session', async (c) => {
    try {
        const { amount, currency, name, description } = await c.req.json();
    
        // Get the origin from the request header or use a default
        const origin = c.req.header('origin') || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: currency || 'cad',
                        product_data: {
                            name: name,
                            description: description,
                        },
                        unit_amount: amount, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/?success=true`,
            cancel_url: `${origin}/?canceled=true`,
        });

        return c.json({
            url: session.url
        });

    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return c.json({ error: error.message }, 500);
    }
});

stripeRouter.get('/api/payment/session-status', async (c) => {
    const sessionId = c.req.query('session_id');

    if (!sessionId) {
        return c.json({ error: 'session_id is required' }, 400);
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return c.json({
            status: session.status,
            customer_email: session.customer_details?.email,
            payment_status: session.payment_status,
        });
    } catch (error) {
        console.error('Error retrieving session:', error);
        return c.json({ error: 'Failed to retrieve session' }, 500);
    }
});

export { stripeRouter };