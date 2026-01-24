import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Footer = ({ onNavigate }) => {
  const { theme } = useTheme();
  
  const handleNavClick = (page) => {
    if (onNavigate) onNavigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <footer
      style={{
        background: theme.name === "Cyber Mode" ? `linear-gradient(180deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.98) 100%)` : "#f5f7fa",
        borderTop: `2px solid ${theme.name === "Cyber Mode" ? theme.neonBlue : "#e0e0e0"}`,
        boxShadow: theme.name === "Cyber Mode" ? `inset 0 0 20px rgba(0, 212, 255, 0.1)` : "inset 0 0 10px rgba(0, 0, 0, 0.05)",
        padding: "60px 24px 24px",
        marginTop: "80px",
        color: theme.text
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px"
        }}
      >
        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: theme.name === "Cyber Mode" ? theme.neonCyan : "#007bff",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
            }}
          >
            About
          </div>
          <p
            style={{
              fontSize: "13px",
              lineHeight: "1.6",
              color: theme.name === "Cyber Mode" ? theme.textDark : "#666",
              margin: "0"
            }}
          >
            Discover innovative Georgian startups and digital products in one place. Fast-track your startup journey.
          </p>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: theme.name === "Cyber Mode" ? theme.neonCyan : "#007bff",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
            }}
          >
            Navigation
          </div>
          <button
            onClick={() => handleNavClick("home")}
            style={{
              background: "none",
              border: "none",
              color: theme.name === "Cyber Mode" ? theme.neonBlue : "#007bff",
              textDecoration: "none",
              fontSize: "13px",
              transition: "0.3s",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
              textAlign: "left",
              hover: { color: theme.neonCyan }
            }}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("home")}
            style={{
              background: "none",
              border: "none",
              color: theme.name === "Cyber Mode" ? theme.neonBlue : "#007bff",
              textDecoration: "none",
              fontSize: "13px",
              transition: "0.3s",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
              textAlign: "left"
            }}
          >
            Trending
          </button>
          <button
            onClick={() => handleNavClick("submit")}
            style={{
              background: "none",
              border: "none",
              color: theme.name === "Cyber Mode" ? theme.neonBlue : "#007bff",
              textDecoration: "none",
              fontSize: "13px",
              transition: "0.3s",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
              textAlign: "left"
            }}
          >
            Submit
          </button>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: theme.name === "Cyber Mode" ? theme.neonCyan : "#007bff",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
            }}
          >
            Tech Stack
          </div>
          <p style={{ fontSize: "13px", color: theme.name === "Cyber Mode" ? theme.textDark : "#666", margin: "0" }}>
            React • Node.js • MongoDB
          </p>
          <p style={{ fontSize: "13px", color: theme.name === "Cyber Mode" ? theme.textDark : "#666", margin: "0" }}>
            Production-Ready • Open Source
          </p>
        </div>
      </div>

      {}
      <div style={{ borderTop: `2px solid ${theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.2)" : "#e0e0e0"}`, paddingTop: "20px" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: theme.name === "Cyber Mode" ? theme.textDark : "#999",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          <p style={{ margin: "0" }}>
            © 2026 Product Hunt • Built with <span style={{ color: theme.name === "Cyber Mode" ? "#ff4c4c" : "#e74c3c" }}>❤️</span> for makers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
