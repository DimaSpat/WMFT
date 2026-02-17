import { component$ } from "@builder.io/qwik";

export const Footer = component$(() => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "3rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        <div>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            © {new Date().getFullYear()} WMFT. All rights reserved.
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            <a
              href="/privacy"
              style={{ color: "#666", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>{" "}
            |{" "}
            <a
              href="/terms"
              style={{ color: "#666", textDecoration: "underline" }}
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});
