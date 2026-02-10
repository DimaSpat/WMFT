
import { component$ } from "@builder.io/qwik";
import { DocumentHead, Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        paddingTop: "6rem",
        paddingBottom: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <span
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              color: "black",
              marginBottom: "2rem",
            }}
          >
            <span style={{ color: "#966F33" }}>W</span> |{" "}
            <span style={{ color: "gray" }}>M</span> |{" "}
            <span style={{ color: "#BA8E23" }}>F</span> | <span>T</span>
          </span>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            Welcome to Wood Cutting Mining Farming Trading
          </h1>
          <h4 style={{ fontSize: "1.2rem", color: "#666", maxWidth: "600px" }}>
            This is a new game that combines resource gathering, trading, and
            strategy to become the richest player on the planet.
          </h4>
          <Link
            href={"/play/"}
            style={{
              background: "#966F33",
              marginTop: "2rem",
              padding: "1rem 2rem",
              borderRadius: "0.5rem",
              fontWeight: "bold",
              color: "white",
              textDecoration: "none",
            }}
          >
            Start playing
          </Link>
        </div>

        <div
          style={{
            height: "50vh",
            background: "black",
            borderRadius: "2rem",
            overflow: "hidden",
            color: "white",
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "3rem",
          }}
        >
          {/* Game preview content would go here */}
          <h2 style={{ fontSize: "2rem" }}>Game Preview</h2>
        </div>

        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
            Why is this game good?
          </h2>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Strategic Resource Management
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              Wood Cutting Mining Farming Trading requires players to carefully
              manage their resources. You'll need to balance your time between
              gathering wood, mining minerals, and farming wheat to produce
              energy crystals. Each resource has its own unique properties and
              can be traded for coins or other valuable items.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Dynamic Trading System
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              The trading system in this game is designed to be both challenging
              and rewarding. Prices fluctuate based on supply and demand, and
              players must make strategic decisions about when to buy and sell.
              This creates a dynamic economy where players must adapt to changing
              market conditions to maximize their profits.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Competitive Multiplayer Environment
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              Compete against other players in a global leaderboard to become
              the richest player on the planet. The game features a variety of
              competitive modes and challenges that will test your skills and
              strategies. Climb the ranks and prove your worth as a master
              trader and resource manager.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Engaging Gameplay Mechanics
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              Wood Cutting Mining Farming Trading offers a variety of engaging
              gameplay mechanics that keep the game fresh and exciting. From
              upgrading your tools and equipment to discovering rare resources,
              there's always something new to explore and discover. The game
              also features a rich storyline and quest system that adds depth
              and context to your adventures.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Cross-Platform Play
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              Play the game on any device with a web browser. Whether you're on
              a desktop computer, laptop, tablet, or smartphone, you can enjoy
              the game anytime, anywhere. The responsive design ensures that the
              game looks and plays great on all devices.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Regular Updates and New Content
            </h3>
            <p style={{ fontSize: "1rem", color: "#666" }}>
              The game receives regular updates with new content, features, and
              improvements. This ensures that the game stays fresh and exciting,
              and that players always have something new to look forward to.
              Keep an eye out for new events, challenges, and seasonal updates
              that will keep you engaged for months to come.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Home - WMFT",
  meta: [
    {
      name: "description",
      content: "Wood Cutting Mining Farming Trading - A new game to become the richest player",
    },
  ],
};

}
