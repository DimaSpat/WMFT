import { Hono } from 'hono';
import { googleAuth } from '@hono/oauth-providers/google';
import { redisDB } from "../index";
import {sign, verify} from 'hono/jwt';
import {getCookie, setCookie} from "hono/cookie";

const authRouter = new Hono();

async function findUserByEmail(email: string | unknown): Promise<{ user:any | null; exists: boolean}> {
    try {
        // @ts-ignore
        const userData:string|Buffer = await redisDB.get(`user:${email.toLowerCase()}`);

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

const sanitizeUser = (user: any) => {
    const { password, ...safeUser } = user;
    return safeUser;
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
    const userGoogle = c.get('user-google');
    const { user, exists } = await findUserByEmail(userGoogle.email);
    const userInfo = {
        email: userGoogle.email.toLowerCase(),
        password: userGoogle.id,
        coins: user ? user.coins : 0,
        resources: user ? user.resources : {},
    };

    if (!exists) {
        await redisDB.set(`user:${userGoogle.email}`, JSON.stringify(userInfo));
    }

    const payload = {
        email: userInfo.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
    };

    const token:string = await sign(payload, Bun.env.JWT_SECRET || '');
    setCookie(c, 'token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    });

    return c.redirect(`http://localhost:5173/`);
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
        email: email.toLowerCase(),
        password,
        coins: 0,
        resources: {},
    };

    await redisDB.set(`user:${newUser.email}`, JSON.stringify(newUser));

    return c.json({
        success: true,
        message: "Registered successfully!",
        user: sanitizeUser(newUser)
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

        const payload = {
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
        }

        const token:string = await sign(payload, Bun.env.JWT_SECRET || '');
        setCookie(c, 'token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return c.json({
            success: true,
            message: "Login successful",
            user: sanitizeUser(user),
            payload: payload,
            token: token,
        }, 200);

    } catch (error) {
        console.error("Login error:", error);
        return c.json({
            success: false,
            message: "Login failed"
        },500);
    }
});

authRouter.post("/logout", async (c) => {
    setCookie(c, 'token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    return c.json({
        success: true,
        message: "Logged out successfully"
    });
});


authRouter.get("/me", async (c) => {
    try {
        const token = getCookie(c, 'token');
        if (!token) {
            return c.json({ success: false, message: "Unauthorized" }, 401);
        }

        const payload = await verify(token, Bun.env.JWT_SECRET || '');
        if (!payload || !payload.email) {
            return c.json({ success: false, message: "Unauthorized, invalid token" }, 401);
        }

        const { user } = await findUserByEmail(payload.email);
        if (!user) {
            return c.json({ success: false, message: "User not found" }, 404);
        }

        return c.json({
            success: true,
            user: sanitizeUser(user),
        }, 200);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return c.json({ success: false, message: "Internal server error" }, 500);
    }
});


export { authRouter };