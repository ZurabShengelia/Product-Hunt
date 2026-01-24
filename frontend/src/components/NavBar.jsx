import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";

const NavBar = ({ user, onLogout, onShowAuth, onSearch, onNavigate }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const navItems = [
    { label: "Home", onClick: () => { onNavigate("home"); setSearchTerm(""); } },
    { label: "Trending", onClick: () => { onNavigate("trending"); setSearchTerm(""); } },
    { label: "Submit", onClick: () => onNavigate("submit") }
  ];

  return (
    <nav
      style={{
        background: typeof theme.surface === 'string' && theme.surface.includes('linear-gradient')
          ? theme.surface
          : theme.surface,
        borderBottom: `2px solid ${theme.neonBlue}`,
        boxShadow: theme.borderGlow,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        position: "sticky",
        top: 0,
        zIndex: 1001,
        flexWrap: "wrap"
      }}
    >
      <div
        onClick={() => onNavigate("home")}
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: theme.neonCyan,
          cursor: "pointer",
          transition: "all 0.3s ease",
          textShadow: theme.neonBlue === "#00d4ff" ? `0 0 15px ${theme.neonBlue}` : "none",
          letterSpacing: "1px"
        }}
        onMouseEnter={(e) => {
          e.target.style.color = theme.neonPink;
          e.target.style.textShadow = theme.neonBlue === "#00d4ff" ? `0 0 20px ${theme.neonPink}` : "none";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = theme.neonCyan;
          e.target.style.textShadow = theme.neonBlue === "#00d4ff" ? `0 0 15px ${theme.neonBlue}` : "none";
        }}
      >
        🇬🇪 Product Hunt
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          alignItems: "center"
        }}
      >
        {navItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              color: theme.text,
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(${theme.neonBlue === "#00d4ff" ? "0, 212, 255" : "27, 127, 255"}, 0.1)`;
              e.target.style.color = theme.neonBlue;
              e.target.style.textShadow = theme.neonBlue === "#00d4ff" ? `0 0 10px ${theme.neonBlue}` : "none";
              e.target.style.borderBottom = `2px solid ${theme.neonBlue}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = theme.text;
              e.target.style.textShadow = "none";
              e.target.style.borderBottom = "none";
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: "1 1 auto",
          minWidth: "160px",
          maxWidth: "300px"
        }}
      >
        <input
          type="text"
          placeholder="Search startups..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: `rgba(${theme.neonBlue === "#00d4ff" ? "0, 212, 255" : "27, 127, 255"}, 0.05)`,
            border: `2px solid ${searchFocused ? theme.neonBlue : theme.border}`,
            borderRadius: "6px",
            color: theme.text,
            fontSize: "13px",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "all 0.3s ease",
            boxShadow: searchFocused ? theme.borderGlow : "none",
            textShadow: searchFocused && theme.neonBlue === "#00d4ff" ? `0 0 5px ${theme.neonBlue}` : "none"
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <ThemeSwitcher />
        
        {!user && (
          <button
            onClick={onShowAuth}
            style={{
              padding: "10px 18px",
              border: "none",
              background: `linear-gradient(90deg, ${theme.neonBlue}, ${theme.neonCyan})`,
              color: theme.bg,
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "12px",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: theme.neonBlue === "#00d4ff" ? `0 0 15px ${theme.neonBlue}` : "none"
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = theme.neonBlue === "#00d4ff" 
                ? `0 0 25px ${theme.neonBlue}, inset 0 0 20px rgba(0, 255, 255, 0.2)`
                : "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = theme.neonBlue === "#00d4ff" ? `0 0 15px ${theme.neonBlue}` : "none";
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

