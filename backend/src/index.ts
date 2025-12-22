import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { getCookie } from "hono/cookie";
import { createClient } from "redis";

import { authRouter } from "./routes/authRouter";
import { paymentRouter } from "./routes/paymentRouter";
import { gameRouter } from "./routes/gameRouter";

const app = new Hono();

const redisDB = createClient({
  username: "default",
  password: Bun.env.REDIS_PASSWORD || process.env.REDIS_PASSWORD,
  socket: {
    host: Bun.env.REDIS_HOST || process.env.REDIS_HOST,
    port: Number(Bun.env.REDIS_PORT || process.env.REDIS_PORT),
  },
});

const start = async (): Promise<void> => {
  await redisDB
    .connect()
    .then(() => console.log("Connected Database server: Redis"));
};

app.use(
  "/api/*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

if (Bun.env.IS_DEPLOYMENT || process.env.NODE_ENV === "development") {
  app.use(logger());
}

app.route("/api/auth", authRouter);
app.route("/api/payment", paymentRouter);
app.route("/api/game", gameRouter);
app.use(
  "/api/user/*",
  bearerAuth({
    verifyToken: async (token: string, c: any): Promise<boolean> => {
      return token === getCookie(c, "token");
    },
  }),
);

app.get("/", async (c: any) => {
  return c.status(200);
});
app.post("/api/test", async (c: any) => {
  const { message } = await c.req.json();

  return c.json({ message: "Test endpoint hit successfully" }, 200);
});

start().then(() => console.log("Server started successfully"));

export default app;
// export default {
//     port: Bun.env.PORT || 5000,
//     fetch: app.fetch,
// }

export { redisDB };
