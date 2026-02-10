import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface LeaderboardEntry {
  id: string;
  email?: string;
  value: number;
}

interface LeaderboardData {
  coins: LeaderboardEntry[];
  wheat: LeaderboardEntry[];
  wood: LeaderboardEntry[];
  mineral: LeaderboardEntry[];
  castles: LeaderboardEntry[];
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardData;
}

export const Leaderboard = component$(() => {
  const leaderboardData = useSignal<LeaderboardData | null>(null);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const activeTab = useSignal<
    "coins" | "wheat" | "wood" | "mineral" | "castles"
  >("coins");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/game/leaderboard`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data: LeaderboardResponse = await response.json();

      if (data.success) {
        leaderboardData.value = data.leaderboard;
      } else {
        error.value = "Failed to load leaderboard data";
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  });

  const formatValue = (value: number, type: string) => {
    if (type === "coins") {
      return value.toLocaleString();
    }
    return value.toLocaleString();
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      coins: "🪙",
      wheat: "🌾",
      wood: "🪵",
      mineral: "🪨",
      castles: "🏰",
    };
    return icons[category as keyof typeof icons] || "📊";
  };

  const tabs = [
    { key: "coins", label: "Coins", icon: "🪙" },
    { key: "wheat", label: "Wheat", icon: "🌾" },
    { key: "wood", label: "Wood", icon: "🪵" },
    { key: "mineral", label: "Minerals", icon: "🪨" },
    { key: "castles", label: "Castles", icon: "🏰" },
  ];

  if (loading.value) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "1.5rem",
        }}
      >
        Loading leaderboard...
      </div>
    );
  }

  if (error.value) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          color: "red",
          fontSize: "1.2rem",
        }}
      >
        Error: {error.value}
      </div>
    );
  }

  if (!leaderboardData.value) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          fontSize: "1.2rem",
        }}
      >
        No leaderboard data available
      </div>
    );
  }

  const currentData = leaderboardData.value[activeTab.value] || [];

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          marginBottom: "2rem",
          color: "#333",
        }}
      >
        🏆 Leaderboard
      </h2>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick$={() => (activeTab.value = tab.key as any)}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor:
                activeTab.value === tab.key ? "#007bff" : "#e9ecef",
              color: activeTab.value === tab.key ? "white" : "#333",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            color: "#333",
          }}
        >
          <span>{getCategoryIcon(activeTab.value)}</span>
          <span>
            Top{" "}
            {activeTab.value === "coins"
              ? "Coin Holders"
              : `${activeTab.value} Producers`}
          </span>
        </h3>

        {currentData.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem" }}>
            No players found in this category
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {currentData.map((entry, index) => {
              const rank = index + 1;
              const rankColors = {
                1: "#FFD700", // Gold
                2: "#C0C0C0", // Silver
                3: "#CD7F32", // Bronze
              };

              const rankColor =
                rankColors[rank as keyof typeof rankColors] || "#666";
              const isTopThree = rank <= 3;

              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    backgroundColor: isTopThree ? "#f8f9fa" : "#ffffff",
                    borderRadius: "0.5rem",
                    border: `2px solid ${rankColor}`,
                    boxShadow: isTopThree
                      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                      : "0 1px 3px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        backgroundColor: rankColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        color: "white",
                      }}
                    >
                      {rank}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          color: "#333",
                        }}
                      >
                        {entry.email || `Player ${entry.id}`}
                      </div>
                      {isTopThree && (
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: rankColor,
                            fontWeight: "bold",
                          }}
                        >
                          {rank === 1
                            ? "🥇 Champion"
                            : rank === 2
                              ? "🥈 Runner-up"
                              : "🥉 Third Place"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {formatValue(entry.value, activeTab.value)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          color: "#666",
          fontSize: "0.9rem",
        }}
      >
        <p>🎯 Compete with other players to reach the top!</p>
      </div>
    </div>
  );
});
