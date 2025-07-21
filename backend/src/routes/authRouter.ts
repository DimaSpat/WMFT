import { Hono } from 'hono';
import { googleAuth } from '@hono/oauth-providers/google';
import { redisDB } from "../index";

const authRouter = new Hono();

authRouter.use(
    '/google',
    googleAuth({
        client_id: Bun.env.GOOGLE_ID || 'your-client-id',
        client_secret: Bun.env.GOOGLE_SECRET || 'your-client-secret',
        scope: ['openid', 'email', 'profile'],
        redirect_uri: 'http://localhost:5000/auth/google',
    })
);

authRouter.get('/google', async (c) => {
    const user = c.get('user-google');

    const userInfo = {
        email: user.email,
        password: user.id,
        coins: 0,
        resources: {},
    };
    await redisDB.set(`user:${user.email}`, JSON.stringify(userInfo));

    return c.redirect(
        `http://localhost:5173/?user=${encodeURIComponent(JSON.stringify(user))}`
    );
});

authRouter.post("/register", async (c) => {
    const { email, password } = await c.req.json();
    const exists = await redisDB.get(`user:${email}`);

    if (exists) {
        return c.json({ success: false, message: "User already exists." }, 400);
    }

    const user = {
        email,
        password,
        coins: 0,
        resources: {},
    };

    await redisDB.set(`user:${email}`, JSON.stringify(user));

    return c.json({ success: true, message: "Registered successfully!" });
});

authRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json(
            { success: false, message: "Email and password are required" },
            400
        );
    }

    try {
        // Get all user keys from Redis
        const userKeys = await redisDB.keys('user:*');

        // Find the specific user
        let userFound = null;
        for (const key of userKeys) {
            const userData:any = await redisDB.get(key);
            if (userData) {
                const user = JSON.parse(userData);
                if (user.email === email) {
                    userFound = user;
                    break;
                }
            }
        }
        if (!userFound) {
            return c.json(
                { success: false, message: "User not found" },
                404
            );
        }
        if (userFound.password !== password) {
            return c.json(
                { success: false, message: "Invalid credentials" },
                401
            );
        }

        return c.json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error);
        return c.json(
            { success: false, message: "Login failed" },
            500
        );
    }
});
export { authRouter };