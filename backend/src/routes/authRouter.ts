import { Hono } from 'hono';
import { googleAuth } from '@hono/oauth-providers/google';
import { redisDB } from "../index";

const authRouter = new Hono();

async function findUserByEmail(email: string): Promise<{ user:any | null; exists: boolean}> {
    try {
        const userData:string|Buffer = await redisDB.get(`user:${email}`);

        if (!userData) {
            return {
                user:null,
                exists: false
            };
        }

        return {
            user: JSON.parse((typeof userData === 'string' ? userData : userData.toString())),
            exists: true
        }
    } catch (error) {
        console.error(`Error finding user by email ${email}:`, error);
        throw new Error(`Error finding user by email ${email}: ${error}`);
    }
}



authRouter.use(
    '/google',
    googleAuth({
        client_id: Bun.env.GOOGLE_ID || 'your-client-id',
        client_secret: Bun.env.GOOGLE_SECRET || 'your-client-secret',
        scope: ['openid', 'email', 'profile'],
        redirect_uri: 'http://localhost:5000/api/auth/google',
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
    const { exists } = await findUserByEmail(email);

    if (exists) {
        return c.json({
            success: false,
            message: "User already exists",
        });
    }

    const newUser = {
        email,
        password,
        coins: 0,
        resources: {},
    };

    await redisDB.set(`user:${email}`, JSON.stringify(newUser));

    return c.json({
        success: true,
        message: "Registered successfully!"
    }, 201);
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
        const { user } = await findUserByEmail(email);
        if (!user) {
            return c.json(
                { success: false, message: "User not found" },
                404
            );
        }

        if (user.password !== password) {
            return c.json(
                { success: false, message: "Invalid credentials" },
                401
            );
        }

        return c.json({
            success: true,
            message: "Login successful",
        }, 200);

    } catch (error) {
        console.error("Login error:", error);
        return c.json({
            success: false,
            message: "Login failed"
        },500);
    }
});
export { authRouter };