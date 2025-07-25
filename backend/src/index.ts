import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { getCookie } from "hono/cookie";
import { createClient } from "redis";

import { authRouter } from "./routes/authRouter";

const app = new Hono();

const redisDB = createClient({
    username: 'default',
    password: Bun.env.REDIS_PASSWORD,
    socket: {
        host: Bun.env.REDIS_HOST,
        port: Bun.env.REDIS_PORT,
    }
});

const start = async ():Promise<void> => {
    await redisDB.connect().then(() => console.log("Connected Database server: Redis"));
}

app.use('/*', cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(logger());

app.route('/api/auth', authRouter);
app.use('/api/user/*', bearerAuth({
    verifyToken: async (token:string, c:any):Promise<boolean> => {
        return token === getCookie(c, 'token');
    }
}));

app.get('/api/user/test', (c) => {
    return c.json({ message: 'Hello, authenticated user!' });
});

start().then(() => console.log("Server started successfully"));

export default {
    port: process.env.PORT,
    fetch: app.fetch,
}

export { redisDB };