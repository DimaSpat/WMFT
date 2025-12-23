import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { redisDB } from "../index";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
// import {JWTPayload} from "hono/utils/jwt";

const authRouter = new Hono();
const PORT = Bun.env.FRONTEND_PORT;

async function findUserFromDB(
  email: string | unknown,
): Promise<{ user: any | null; exists: boolean }> {
  try {
    // @ts-ignore
    const userData: string | Buffer = await redisDB.get(
      // @ts-ignore
      `user:${email.toLowerCase()}`,
    );

    if (!userData) {
      return {
        user: null,
        exists: false,
      };
    }

    return {
      user: JSON.parse(
        typeof userData === "string" ? userData : userData.toString(),
      ),
      exists: true,
    };
  } catch (error) {
    console.error(`Error finding user of type by email ${email}:`, error);
    throw new Error(`Error finding user of type by email ${email}: ${error}`);
  }
}

const sanitizeUser = (user: any) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

authRouter.use(
  "/google",
  googleAuth({
    client_id: Bun.env.GOOGLE_ID || "your-client-id",
    client_secret: Bun.env.GOOGLE_SECRET || "your-client-secret",
    scope: ["openid", "email", "profile"],
    redirect_uri: "https://wmft-backend.vercel.app/api/auth/google",
  }),
);

authRouter.get("/google", async (c) => {
  const userGoogle = c.get("user-google");
  const { user, exists } = await findUserFromDB(userGoogle.email);
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
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const token: string = await sign(payload, Bun.env.JWT_SECRET || "");
  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return c.redirect(`https://wmft.vercel.app/`);
});

authRouter.get("/telegram", async (c) => {
  const botUsername = Bun.env.BOT_USERNAME || "WMFT_bot";
  if (!botUsername) {
    return c.json(
      { success: false, message: "Bot username not configured" },
      500,
    );
  }

  return c.redirect(`https://t.me/${botUsername}`);
});

authRouter.post("/telegram/verify", async (c) => {
  try {
    const { telegramId, username, firstName, lastName } = await c.req.json();

    // @ts-ignore
    const existingUser: string = await redisDB.get(`user:${telegramId}`);

    if (existingUser) {
      const userData = JSON.parse(existingUser);
      return c.json({
        success: true,
        isNewUser: false,
        user: userData,
      });
    }

    // const newUser = {
    //     telegramId,
    //     username: username || `user_${telegramId}`,
    //     firstName,
    //     lastName,
    //     coins: 0,
    //     resources: [],
    //     createdAt: new Date().toISOString()
    // };

    const newUser = {
      email: telegramId,
      password: telegramId,
      coins: 0,
      resources: [],
    };

    await redisDB.set(`user:${telegramId}`, JSON.stringify(newUser));

    return c.json({
      success: true,
      isNewUser: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Telegram verification error:", error);
    return c.json(
      {
        success: false,
        message: "Error during verification process",
      },
      500,
    );
  }
});

authRouter.post("/telegram/complete-auth", async (c) => {
  try {
    const { telegramId } = await c.req.json();

    // @ts-ignore
    const userData: string = await redisDB.get(`user:${telegramId}`);

    if (!userData) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    const user = JSON.parse(userData);
    console.log(user);

    // Normalize token payload to include `email` so /me works
    const payload = {
      email: String(telegramId),
      telegramId,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    };

    const token = await sign(payload, Bun.env.JWT_SECRET || "");
    console.log(token);

    setCookie(c, "token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return c.json({
      success: true,
      token,
      redirectUrl: `https://wmft.vercel.app/`,
    });
  } catch (error) {
    console.error("Complete auth error:", error);
    return c.json(
      {
        success: false,
        message: "Error completing authentication",
      },
      500,
    );
  }
});

authRouter.get("/telegram/callback", async (c) => {
  try {
    const token = c.req.query("token");
    if (!token) {
      return c.redirect(`https://wmft.vercel.app/auth?error=no_token`, 302);
    }

    const payload = (await verify(token, Bun.env.JWT_SECRET || "")) as {
      telegramId?: number | string;
      email?: string;
    };

    const ensuredEmail =
      payload.email ??
      (payload.telegramId != null ? String(payload.telegramId) : undefined);
    if (!ensuredEmail) {
      return c.redirect(
        `https://wmft.vercel.app/auth?error=invalid_token_payload`,
        302,
      );
    }

    // @ts-ignore
    const userData: string | null = await redisDB.get(`user:${ensuredEmail}`);
    if (!userData) {
      return c.redirect(
        `https://wmft.vercel.app/auth?error=user_not_found`,
        302,
      );
    }

    const normalizedToken = await sign(
      {
        email: ensuredEmail,
        telegramId: payload.telegramId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      Bun.env.JWT_SECRET || "",
    );

    setCookie(c, "token", normalizedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return c.redirect(`https://wmft.vercel.app/`, 302);
  } catch (err) {
    console.error("Telegram callback error:", err);
    return c.redirect(
      `https://wmft.vercel.app/auth?error=callback_failed`,
      302,
    );
  }
});

authRouter.post("/register", async (c) => {
  const { email, password } = await c.req.json();
  const { exists } = await findUserFromDB(email);

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

  return c.json(
    {
      success: true,
      message: "Registered successfully!",
      user: sanitizeUser(newUser),
    },
    201,
  );
});

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json(
      { success: false, message: "Email and password are required" },
      400,
    );
  }

  try {
    const { user } = await findUserFromDB(email);
    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    if (user.password !== password) {
      return c.json({ success: false, message: "Invalid credentials" }, 401);
    }

    const payload = {
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    };

    const token: string = await sign(payload, Bun.env.JWT_SECRET || "");
    setCookie(c, "token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Login successful",
        user: sanitizeUser(user),
        payload: payload,
        token: token,
      },
      200,
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      {
        success: false,
        message: "Login failed",
      },
      500,
    );
  }
});

authRouter.post("/logout", async (c) => {
  setCookie(c, "token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0,
    path: "/",
  });

  setCookie(c, "session", "", {
    httpOnly: true,
    secure: false,
    sameSite: "None",
    maxAge: 0,
    path: "/",
  });
  setCookie(c, "auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0,
    path: "/",
  });

  return c.json({
    success: true,
    message: "Logged out successfully",
  });
});

// New: allow browser to exchange a token for an API cookie
authRouter.post("/telegram/set-cookie", async (c) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const payload = (await verify(token, Bun.env.JWT_SECRET || "")) as {
      email?: string;
      telegramId?: number | string;
    };

    const ensuredEmail =
      payload.email ??
      (payload.telegramId != null ? String(payload.telegramId) : undefined);
    if (!ensuredEmail) {
      return c.json({ success: false, message: "Invalid token payload" }, 401);
    }
    // @ts-ignore
    const userData: string | null = await redisDB.get(`user:${ensuredEmail}`);
    if (!userData) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const normalizedToken = await sign(
      {
        email: ensuredEmail,
        telegramId: payload.telegramId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      Bun.env.JWT_SECRET || "",
    );

    setCookie(c, "token", normalizedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return c.json({ success: true });
  } catch (err) {
    console.error("Set-cookie error:", err);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

authRouter.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("authorization");
    const headerToken = authHeader?.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7)
      : undefined;

    const token =
      headerToken ||
      getCookie(c, "token") ||
      getCookie(c, "auth_token") ||
      getCookie(c, "session");

    console.log("Token:", token);

    if (!token) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const payload = await verify(token, Bun.env.JWT_SECRET || "");
    const email =
      (payload as { email?: string; telegramId?: string | number }).email ??
      (payload as any).telegramId?.toString();

    if (!email) {
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    const { user, exists } = await findUserFromDB(email);
    if (!exists || !user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
});

authRouter.post("/met", async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const payload: any & { email?: string; telegramId?: number | string } =
      await verify(token, Bun.env.JWT_SECRET || "");
    let ensuredEmail = payload.email;
    if (!ensuredEmail && payload.telegramId != null) {
      ensuredEmail = String(payload.telegramId);
    }

    if (!ensuredEmail) {
      return c.json({ success: false, message: "Invalid token payload" }, 401);
    }

    // @ts-ignore
    const userData: string = await redisDB.get(`user:${ensuredEmail}`);
    if (!userData) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const user = JSON.parse(userData);

    const normalizedToken = await sign(
      {
        email: ensuredEmail,
        telegramId: payload.telegramId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      Bun.env.JWT_SECRET || "",
    );

    setCookie(c, "token", normalizedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return c.json({
      success: true,
      user: user,
      token: normalizedToken,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

export { authRouter };
