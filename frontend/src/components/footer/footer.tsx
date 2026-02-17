import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export const Footer = component$(() => {
  return (
    <footer
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Navigation Links */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link href="/" style={{ color: "#666", fontSize: "0.9rem" }}>
            Home
          </Link>
          <span style={{ color: "#666" }}>|</span>
          <Link href="/profile" style={{ color: "#666", fontSize: "0.9rem" }}>
            Profile
          </Link>
          <span style={{ color: "#666" }}>|</span>
          <Link href="/shop" style={{ color: "#666", fontSize: "0.9rem" }}>
            Shop
          </Link>
          <span style={{ color: "#666" }}>|</span>
          <Link href="/play" style={{ color: "#666", fontSize: "0.9rem" }}>
            Portal
          </Link>
          <span style={{ color: "#666" }}>|</span>
          <Link
            href="/leaderboard"
            style={{ color: "#666", fontSize: "0.9rem" }}
          >
            Leaderboard
          </Link>
        </div>

        {/* Game Description */}
        <div style={{ textAlign: "center", maxWidth: "800px" }}>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0" }}>
            WMFT is a strategic resource management game where you gather wood,
            mine minerals, farm wheat, and trade to become the richest player.
            Compete with others on the global leaderboard and build your empire.
          </p>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", color: "#666", margin: "0" }}>
            © {new Date().getFullYear()} WMFT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});
