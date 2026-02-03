import {
  $,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { UserContext } from "~/context/UserContext";

const CYCLE_TIME_MS = 30000; // 30 seconds instead of 1 hour

interface GameState {
  buildings: {
    wheatFarms: number;
    houses: number;
    woodcutters: number;
    mines: number;
    sawmills: number;
    castles: number;
    crystalMine: number;
    powerPlant: number;
  };
  productionRates: {
    wheat: number;
    wood: number;
    minerals: number;
    rareMinerals: number;
    energyCrystals: number;
    population: number;
  };
  consumptionRates: {
    wheat: number;
    minerals: number;
    rareMinerals: number;
    energyCrystals: number;
  };
  lastUpdate: number;
}

export default component$(() => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const user = useContext(UserContext);
  const gameState = useSignal<GameState>({
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
    productionRates: {
      wheat: 0,
      wood: 0,
      minerals: 0,
      rareMinerals: 0,
      energyCrystals: 0,
      population: 0,
    },
    consumptionRates: {
      wheat: 0,
      minerals: 0,
      rareMinerals: 0,
      energyCrystals: 0,
    },
    lastUpdate: Date.now(),
  });

  const buildingCosts = {
    wheatFarms: { wood: 50, minerals: 10 },
    houses: { wood: 50 },
    woodcutters: { wood: 200 },
    mines: { wood: 300, minerals: 50 },
    sawmills: { wood: 500, minerals: 100 },
    castles: { wood: 2000, minerals: 500 },
    crystalMine: { wood: 5000, minerals: 1000, rareMinerals: 10 },
    powerPlant: {
      wood: 10000,
      minerals: 2000,
      rareMinerals: 25,
      energyCrystals: 5,
    },
  };

  const calculateRates = $(() => {
    const {
      wheatFarms,
      houses,
      woodcutters,
      mines,
      sawmills,
      castles,
      crystalMine,
      powerPlant,
    } = gameState.value.buildings;

    const cyclesPerHour = 3600000 / CYCLE_TIME_MS; // Scale from hourly to cycle-based
    const wheatProduction = wheatFarms * (10 / cyclesPerHour);
    const woodProduction =
      woodcutters * (5 / cyclesPerHour) * (1 + sawmills * 0.5);
    const mineralsProduction = mines * (2 / cyclesPerHour);
    const rareMineralsProduction = crystalMine * (0.5 / cyclesPerHour);
    const energyCrystalsProduction = powerPlant * (0.2 / cyclesPerHour);
    const populationCapacity = houses * 5 + castles * 20;

    // Consumption per cycle
    const wheatConsumption = populationCapacity * (0.4 / cyclesPerHour);
    const mineralsConsumption = (sawmills + castles) * (1 / cyclesPerHour);
    const rareMineralsConsumption =
      (crystalMine + powerPlant) * (2 / cyclesPerHour);
    const energyCrystalsConsumption = powerPlant * (1 / cyclesPerHour);

    // Apply castle bonus
    const castleBonus = 1 + castles * 0.25;
    // Apply power plant bonus (only if powered)
    const powerBonus = powerPlant > 0 ? 1.5 : 1;

    gameState.value = {
      ...gameState.value,
      productionRates: {
        wheat: wheatProduction * castleBonus * powerBonus,
        wood: woodProduction * castleBonus * powerBonus,
        minerals: mineralsProduction * castleBonus * powerBonus,
        rareMinerals: rareMineralsProduction * castleBonus * powerBonus,
        energyCrystals: energyCrystalsProduction * castleBonus * powerBonus,
        population: populationCapacity,
      },
      consumptionRates: {
        wheat: wheatConsumption,
        minerals: mineralsConsumption,
        rareMinerals: rareMineralsConsumption,
        energyCrystals: energyCrystalsConsumption,
      },
    };
  });

  const updateGameState = $((newBuildings: Partial<GameState["buildings"]>) => {
    gameState.value = {
      ...gameState.value,
      buildings: { ...gameState.value.buildings, ...newBuildings },
    };
    calculateRates().then();
  });

  const canAfford = $(
    (cost: {
      coins?: number;
      wood?: number;
      minerals?: number;
      wheat?: number;
      rareMinerals?: number;
      energyCrystals?: number;
    }): boolean => {
      const userCoins = user.coins || 0;
      const userWood = user.resources?.wood || 0;
      const userMinerals = user.resources?.mineral || 0;
      const userWheat = user.resources?.wheat || 0;
      const userRareMinerals = user.resources?.mineralRare || 0;
      const userEnergyCrystals = user.resources?.energyCrystals || 0;

      return (
        (!cost.coins || userCoins >= cost.coins) &&
        (!cost.wood || userWood >= cost.wood) &&
        (!cost.minerals || userMinerals >= cost.minerals) &&
        (!cost.wheat || userWheat >= cost.wheat) &&
        (!cost.rareMinerals || userRareMinerals >= cost.rareMinerals) &&
        (!cost.energyCrystals || userEnergyCrystals >= cost.energyCrystals)
      );
    },
  );

  const purchaseBuilding = $(async (building: keyof GameState["buildings"]) => {
    const cost = buildingCosts[building];
    console.log(1);

    if (!cost) {
      alert("Invalid building type!");
      return;
    }

    if (!(await canAfford(cost))) {
      alert("Not enough resources!");
      return;
    }

    try {
      console.log(2);
      const response = await fetch(`${baseURL}/api/game/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.email?.toLowerCase(),
          buildingType: building,
          cost: cost,
        }),
      });

      if (response.ok) {
        console.log(3);
        const data = await response.json();
        console.log(data);
        await updateGameState({
          [building]: gameState.value.buildings[building] + 1,
        });
        if (user.resources) {
          user.resources = data.resources;
        }
        if (data.coins !== undefined) {
          user.coins = data.coins;
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to purchase building");
      }
    } catch (error) {
      console.error("Error purchasing building:", error);
      alert("Failed to purchase building");
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Move syncResources above the visible task so we can safely call it from the client task
  const syncResources = $(async () => {
    if (!user.resources) return;
    console.log("Starting sync resources");

    const migratedResources: any = {};

    const resourceMap = {
      Wheat: "wheat",
      Wood: "wood",
      Mineral: "mineral",
      MineralRare: "mineralRare",
      EnergyCrystals: "energyCrystals",
    };

    Object.entries(user.resources).forEach(([key, value]) => {
      if (key in resourceMap) {
        return;
      }
      migratedResources[key] = value;
    });

    Object.entries(resourceMap).forEach(([oldKey, newKey]) => {
      if (
        user.resources &&
        user.resources[oldKey as keyof typeof user.resources] !== undefined
      ) {
        const value = user.resources[oldKey as keyof typeof user.resources];
        if (typeof value === "number") {
          migratedResources[newKey] = (migratedResources[newKey] || 0) + value;
        }
      }
    });

    if (Object.keys(migratedResources).length > 0) {
      user.resources = migratedResources;
      try {
        await fetch(`${baseURL}/api/game/state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.email?.toLowerCase(),
            resources: migratedResources,
          }),
        });
      } catch (error) {
        console.error("Error saving cleaned resources:", error);
      }
    }
  });

  // Client-only initialization: fetch /auth/me and then load game state
  useVisibleTask$(async () => {
    console.log("Client visible task: loading /auth/me and game state");

    // 1) Try to load authenticated user from /auth/me (include cookies)
    try {
      const meResp = await fetch(`${baseURL}/api/auth/me`, {
        method: "GET",
        credentials: "include", // ensure cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (meResp.ok) {
        const meJson = await meResp.json();
        if (meJson.success && meJson.user) {
          const serverUser = meJson.user;
          // Initialize user context fields from server
          if (serverUser.email) user.email = serverUser.email;
          if (serverUser.coins !== undefined) user.coins = serverUser.coins;
          if (serverUser.resources !== undefined) {
            user.resources = serverUser.resources || {};
          }
          // If server returned gameState, merge into current gameState
          if (serverUser.gameState) {
            gameState.value = {
              ...gameState.value,
              buildings: {
                ...gameState.value.buildings,
                ...serverUser.gameState.buildings,
              },
              productionRates:
                serverUser.gameState.productionRates ??
                gameState.value.productionRates,
              consumptionRates:
                serverUser.gameState.consumptionRates ??
                gameState.value.consumptionRates,
              lastUpdate:
                serverUser.gameState.lastUpdate ?? gameState.value.lastUpdate,
            };
          }
        } else {
          console.warn("/auth/me returned no user", meJson);
        }
      } else {
        console.warn("/auth/me failed with status", meResp.status);
      }
    } catch (err) {
      console.warn("Failed to fetch /auth/me:", err);
    }

    // 2) Fetch stored game state (still useful if /auth/me didn't include it)
    if (user.email) {
      try {
        const response = await fetch(
          `${baseURL}/api/game/state?userId=${user.email.toLowerCase()}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.gameState) {
            gameState.value = {
              ...gameState.value,
              buildings: {
                ...gameState.value.buildings,
                ...data.gameState.buildings,
              },
            };

            // Sync resources to remove duplicates and use lowercase consistently
            await syncResources();
          }
        } else {
          console.warn("/api/game/state failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching /api/game/state:", err);
      }
    }

    // 3) calculate rates once initialized
    try {
      await calculateRates();
    } catch (err) {
      console.error("Error calculating rates after init:", err);
    }
  });

  useVisibleTask$(() => {
    syncResources();
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{ textAlign: "center", fontSize: "3rem", marginBottom: "2rem" }}
      >
        {" "}
        Kingdom Builder
      </h1>

      {/* Resource Display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "#fff9c4",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          <div> Wheat</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatNumber(user.resources?.wheat || 0)}
          </div>
          <small>
            ➚ {formatNumber(gameState.value.productionRates.wheat)}/h
          </small>
          <small style={{ display: "block", color: "#d32f2f" }}>
            ➘ {formatNumber(gameState.value.consumptionRates.wheat)}/h
          </small>
        </div>

        <div
          style={{
            background: "#e8f5e8",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          <div> Population</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatNumber(gameState.value.productionRates.population)}
          </div>
          <small>Capacity</small>
        </div>

        <div
          style={{
            background: "#d7ccc8",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          <div> Wood</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatNumber(user.resources?.wood || 0)}
          </div>
          <small>
            ➚ {formatNumber(gameState.value.productionRates.wood)}/h
          </small>
        </div>

        <div
          style={{
            background: "#bbdefb",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          <div>⛏️ Minerals</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatNumber(user.resources?.mineral || 0)}
          </div>
          <small>
            ➚ {formatNumber(gameState.value.productionRates.minerals)}/h
          </small>
          <small style={{ display: "block", color: "#d32f2f" }}>
            ➘ {formatNumber(gameState.value.consumptionRates.minerals)}/h
          </small>
        </div>

        <div
          style={{
            background: "#ffd700",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          <div> Coins</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatNumber(user.coins || 0)}
          </div>
        </div>
      </div>

      {/* Premium Resources Display */}
      {(user.resources?.mineralRare || user.resources?.energyCrystals) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {user.resources?.mineralRare && (
            <div
              style={{
                background: "#f3e5f5",
                padding: "1rem",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div> Rare Minerals</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {user.resources.mineralRare}
              </div>
              <small>
                ➚ {formatNumber(gameState.value.productionRates.rareMinerals)}/h
              </small>
              <small style={{ display: "block", color: "#d32f2f" }}>
                ➘ {formatNumber(gameState.value.consumptionRates.rareMinerals)}
                /h
              </small>
            </div>
          )}

          {user.resources?.energyCrystals && (
            <div
              style={{
                background: "#e1f5fe",
                padding: "1rem",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div>⚡ Energy Crystals</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {user.resources.energyCrystals}
              </div>
              <small>
                ➚ {formatNumber(gameState.value.productionRates.energyCrystals)}
                /h
              </small>
              <small style={{ display: "block", color: "#d32f2f" }}>
                ➘{" "}
                {formatNumber(gameState.value.consumptionRates.energyCrystals)}
                /h
              </small>
            </div>
          )}
        </div>
      )}

      {/* Building Categories */}
      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Tier 1: Basic Production */}
        <div>
          <h2> Food Production</h2>
          <BuildingCard
            title="Wheat Farm"
            description="Produces 10 wheat/hour"
            cost={buildingCosts.wheatFarms}
            current={gameState.value.buildings.wheatFarms}
            onPurchase$={() => purchaseBuilding("wheatFarms")}
          />
        </div>

        {/* Tier 1: Housing */}
        <div>
          <h2> Housing</h2>
          <BuildingCard
            title="Basic House"
            description="Houses 5 population"
            cost={buildingCosts.houses}
            current={gameState.value.buildings.houses}
            onPurchase$={() => purchaseBuilding("houses")}
          />
        </div>

        {/* Tier 2: Resource Gathering */}
        <div>
          <h2> Wood Production</h2>
          <BuildingCard
            title="Woodcutter's Hut"
            description="Produces 5 wood/hour"
            cost={buildingCosts.woodcutters}
            current={gameState.value.buildings.woodcutters}
            onPurchase$={() => purchaseBuilding("woodcutters")}
          />

          <BuildingCard
            title="Sawmill"
            description="+50% wood production"
            cost={buildingCosts.sawmills}
            current={gameState.value.buildings.sawmills}
            onPurchase$={() => purchaseBuilding("sawmills")}
          />
        </div>

        <div>
          <h2>⛏️ Mineral Production</h2>
          <BuildingCard
            title="Mining Camp"
            description="Produces 2 minerals/hour"
            cost={buildingCosts.mines}
            current={gameState.value.buildings.mines}
            onPurchase$={() => purchaseBuilding("mines")}
          />
        </div>

        {/* Tier 3: Advanced Buildings */}
        <div>
          <h2> Advanced Production</h2>
          <BuildingCard
            title="Castle"
            description="+25% all production, +20 population"
            cost={buildingCosts.castles}
            current={gameState.value.buildings.castles}
            onPurchase$={() => purchaseBuilding("castles")}
          />
        </div>

        {/* Tier 4: Premium Buildings (require rare resources) */}
        {(user.resources?.mineralRare || 0) > 0 && (
          <div>
            <h2> Premium Buildings</h2>
            <BuildingCard
              title="Crystal Mine"
              description="Produces rare minerals (very slow)"
              cost={buildingCosts.crystalMine}
              current={gameState.value.buildings.crystalMine}
              onPurchase$={() => purchaseBuilding("crystalMine")}
            />

            {(user.resources?.energyCrystals || 0) > 0 && (
              <BuildingCard
                title="Power Plant"
                description="+50% all production, consumes energy crystals"
                cost={buildingCosts.powerPlant}
                current={gameState.value.buildings.powerPlant}
                onPurchase$={() => purchaseBuilding("powerPlant")}
              />
            )}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <div
          style={{
            padding: "1rem",
            background:
              gameState.value.productionRates.wheat >
              gameState.value.consumptionRates.wheat
                ? "#e8f5e8"
                : "#ffcdd2",
            borderRadius: "0.5rem",
          }}
        >
          <strong>Food Balance:</strong>{" "}
          {gameState.value.productionRates.wheat >
          gameState.value.consumptionRates.wheat
            ? "✅ Surplus"
            : "❌ Deficit"}
        </div>

        <div
          style={{
            padding: "1rem",
            background:
              gameState.value.buildings.castles > 0 ? "#e8f5e8" : "#fff9c4",
            borderRadius: "0.5rem",
          }}
        >
          <strong>Kingdom Level:</strong>{" "}
          {gameState.value.buildings.castles > 0 ? "🏰 Advanced" : "🏠 Basic"}
        </div>

        {gameState.value.buildings.powerPlant > 0 && (
          <div
            style={{
              padding: "1rem",
              background: "#e1f5fe",
              borderRadius: "0.5rem",
            }}
          >
            <strong>Power Status:</strong> ⚡ Powered (
            {gameState.value.buildings.powerPlant} plants)
          </div>
        )}
      </div>

      {/* Game Tips */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#e0f7fa",
          borderRadius: "0.5rem",
        }}
      >
        <h3> Game Tips</h3>
        <ul>
          <li>
            {" "}
            Wheat feeds your population - keep production higher than
            consumption!
          </li>
          <li> More houses = more workers = more production</li>
          <li> Wood is needed for most buildings</li>
          <li>⛏️ Minerals unlock advanced buildings</li>
          <li> Castles boost all production</li>
          <li> Rare minerals are extremely valuable - use them wisely!</li>
          <li>⚡ Energy crystals provide massive production boosts</li>
        </ul>
      </div>
    </div>
  );
});

interface BuildingCardProps {
  title: string;
  description: string;
  cost: any;
  current: number;
  onPurchase$: () => void;
}

const BuildingCard = component$((props: BuildingCardProps) => {
  const formatCost = (cost: any) => {
    return Object.entries(cost)
      .map(([resource, amount]) => `${amount} ${resource}`)
      .join(", ");
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "0.5rem",
        padding: "1rem",
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background:
          props.cost.rareMinerals || props.cost.energyCrystals
            ? "#f3e5f5"
            : "white",
      }}
    >
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>{props.title}</h4>
        <p style={{ margin: "0", color: "#666" }}>{props.description}</p>
        <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
          <strong>Cost:</strong> {formatCost(props.cost)}
        </p>
        <p style={{ margin: "0", fontSize: "0.9rem" }}>
          <strong>Built:</strong> {props.current}
        </p>
      </div>
      <button
        onClick$={props.onPurchase$}
        style={{
          padding: "0.5rem 1rem",
          background:
            props.cost.rareMinerals || props.cost.energyCrystals
              ? "#9c27b0"
              : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {props.cost.rareMinerals || props.cost.energyCrystals
          ? "⚡ Build"
          : "Build"}
      </button>
    </div>
  );
});
