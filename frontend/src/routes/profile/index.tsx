import { component$, useContext } from "@builder.io/qwik";
import { UserContext } from "~/context/UserContext";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const { email, coins, resources } = useContext(UserContext);

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
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Profile</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Email:</p>
            <p>{email}</p>
          </div>
          <div>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Coins:</p>
            <p>{coins}</p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Resources:</p>
          {resources && Object.keys(resources).length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(resources)
                .filter(([resourceType]) =>
                  [
                    "wheat",
                    "wood",
                    "mineral",
                    "mineralRare",
                    "energyCrystals",
                  ].includes(resourceType),
                )
                .map(([resourceType, amount]) => (
                  <li
                    key={resourceType}
                    style={{
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{resourceType}:</span>{" "}
                    {Math.round(Number(amount))}
                  </li>
                ))}
            </ul>
          ) : (
            <p>No resources</p>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Profile - WMFT",
  meta: [
    {
      name: "description",
      content: "View your profile in Wood Cutting Mining Farming Trading game",
    },
  ],
};
