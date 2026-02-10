import { Hono } from "hono";
import { redisDB } from "../index";

const gameRouter = new Hono();

gameRouter.get("/leaderboard", async (c) => {
  try {
    const keys = (await redisDB.keys("user:*")) || [];

    const entries: {
      id: string;
      email?: string;
      coins: number;
      resources: Record<string, number>;
      castles: number;
    }[] = [];

    for (const key of keys) {
      try {
        const raw = await redisDB.get(key);
        if (!raw) continue;
        const u = JSON.parse(typeof raw === "string" ? raw : raw.toString());
        entries.push({
          id: (typeof key === "string" ? key : key.toString()).replace(
            /^user:/,
            "",
          ),
          email: u.email,
          coins: u.coins ?? 0,
          resources: u.resources ?? {},
          castles: u.gameState?.buildings?.castles ?? 0,
        });
      } catch (err) {
        console.warn("leaderboard: failed to parse user", key, err);
      }
    }

    const topN = (
      arr: typeof entries,
      selector: (p: (typeof entries)[number]) => number,
    ) =>
      arr
        .map((p) => ({ id: p.id, email: p.email, value: selector(p) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const resourceKeys = {
      wheat: (p: (typeof entries)[number]) => p.resources?.wheat ?? 0,
      wood: (p: (typeof entries)[number]) => p.resources?.wood ?? 0,
      mineral: (p: (typeof entries)[number]) => p.resources?.mineral ?? 0,
    };

    const result: Record<string, any> = {
      wheat: topN(entries, resourceKeys.wheat),
      wood: topN(entries, resourceKeys.wood),
      mineral: topN(entries, resourceKeys.mineral),
      castles: topN(entries, (p) => p.castles),
      coins: topN(entries, (p) => p.coins),
    };

    return c.json({ success: true, leaderboard: result });
  } catch (err) {
    console.error("Error building leaderboard:", err);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

gameRouter.get("/state", async (c) => {
  try {
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const userData = await redisDB.get(`user:${userId}`);
    if (!userData) {
      const newUser = {
        coins: 1000,
        resources: {
          wheat: 100,
          wood: 200,
          mineral: 50,
          mineralRare: 0,
          energyCrystals: 0,
        },
        gameState: {
          buildings: {
            wheatFarms: 0,
            houses: 0,
            woodcutters: 0,
            mines: 0,
            sawmills: 0,
            castles: 0,
            crystalMine: 0,
            powerPlant: 0,
          },
          lastUpdate: Date.now(),
        },
      };
      await redisDB.set(`user:${userId}`, JSON.stringify(newUser));
      return c.json({ gameState: newUser.gameState });
    }

    const user = JSON.parse(userData.toString());
    return c.json({ gameState: user.gameState || {} });
  } catch (e) {
    console.log("Error loading game state:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Build a structure
gameRouter.post("/build", async (c) => {
  try {
    const { userId, buildingType, cost } = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const userData = await redisDB.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = JSON.parse(userData.toString());
    const resources = user.resources || {};
    const coins = user.coins || 0;

    // Check if user can afford the building
    if (cost.coins && coins < cost.coins) {
      return c.json({ error: "Insufficient coins" }, 400);
    }
    if (cost.wood && (resources.wood || 0) < cost.wood) {
      // Changed to lowercase
      return c.json({ error: "Insufficient wood" }, 400);
    }
    if (cost.minerals && (resources.mineral || 0) < cost.minerals) {
      // Changed to lowercase
      return c.json({ error: "Insufficient minerals" }, 400);
    }
    if (cost.wheat && (resources.wheat || 0) < cost.wheat) {
      // Changed to lowercase
      return c.json({ error: "Insufficient wheat" }, 400);
    }
    if (cost.rareMinerals && (resources.mineralRare || 0) < cost.rareMinerals) {
      return c.json({ error: "Insufficient rare minerals" }, 400);
    }
    if (
      cost.energyCrystals &&
      (resources.energyCrystals || 0) < cost.energyCrystals
    ) {
      return c.json({ error: "Insufficient energy crystals" }, 400);
    }

    // Deduct costs
    user.coins = coins - (cost.coins || 0);
    if (cost.wood) resources.wood -= cost.wood; // Changed to lowercase
    if (cost.minerals) resources.mineral -= cost.minerals; // Changed to lowercase
    if (cost.wheat) resources.wheat -= cost.wheat; // Changed to lowercase
    if (cost.rareMinerals) resources.mineralRare -= cost.rareMinerals;
    if (cost.energyCrystals) resources.energyCrystals -= cost.energyCrystals;

    // Update building count
    user.gameState = user.gameState || { buildings: {} };
    user.gameState.buildings = user.gameState.buildings || {};
    user.gameState.buildings[buildingType] =
      (user.gameState.buildings[buildingType] || 0) + 1;
    user.gameState.lastUpdate = Date.now();

    await redisDB.set(`user:${userId}`, JSON.stringify(user));

    console.log(`Successfully built ${buildingType} for user ${userId}`);

    return c.json({
      success: true,
      message: "Building constructed successfully",
      coins: user.coins,
      resources: user.resources,
    });
  } catch (e) {
    console.log("Error building structure:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Add the POST /state endpoint that's missing
gameRouter.post("/state", async (c) => {
  try {
    const { userId, gameState, resources, coins } = await c.req.json();

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const userData = await redisDB.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = JSON.parse(userData.toString());

    // Update user data
    if (gameState) user.gameState = gameState;
    if (resources) user.resources = resources;
    if (coins !== undefined) user.coins = coins;

    await redisDB.set(`user:${userId}`, JSON.stringify(user));

    return c.json({ success: true, message: "Game state saved successfully" });
  } catch (e) {
    console.log("Error saving game state:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { gameRouter };
