import { component$ } from "@builder.io/qwik";
import { Leaderboard } from "~/components/leaderboard/leaderboard";
import { DocumentHead } from "@builder.io/qwik-city";

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
      <Leaderboard />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Leaderboard - WMFT",
  meta: [
    {
      name: "description",
      content:
        "View the top players in Wood Cutting Mining Farming Trading game",
    },
  ],
};
