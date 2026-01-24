import React, { useState } from "react";
import { useTheme, themes } from "../contexts/ThemeContext";

const ThemeSwitcher = () => {
  const { currentTheme, switchTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const themeIcons = {
    cyber: "🌌",
    light: "☀️"
  };

  const theme = themes[currentTheme];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: "10px 16px",
          border: `2px solid ${theme.neonBlue}`,
          background: currentTheme === "cyber" 
            ? `rgba(0, 212, 255, 0.05)` 
            : "transparent",
          color: theme.neonBlue,
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "14px",
          fontFamily: "inherit",
          transition: "all 0.3s ease",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: currentTheme === "cyber" ? `0 0 10px ${theme.neonBlue}30` : "none"
        }}
        onMouseEnter={(e) => {
          if (currentTheme === "cyber") {
            e.target.style.boxShadow = `0 0 20px ${theme.neonBlue}`;
          } else {
            e.target.style.background = `rgba(27, 127, 255, 0.1)`;
          }
        }}
        onMouseLeave={(e) => {
          if (currentTheme === "cyber") {
            e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}30`;
          } else {
            e.target.style.background = "transparent";
          }
        }}
      >
        {themeIcons[currentTheme]} Theme
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            background: currentTheme === "cyber" ? theme.bgLight : theme.surface,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            boxShadow: currentTheme === "cyber" 
              ? `0 0 20px ${theme.neonBlue}40` 
              : "0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            minWidth: "200px",
            overflow: "hidden"
          }}
        >
          {Object.entries(themes).map(([key, themeObj]) => (
            <button
              key={key}
              onClick={() => {
                switchTheme(key);
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                background: currentTheme === key 
                  ? currentTheme === "cyber"
                    ? `rgba(0, 212, 255, 0.2)`
                    : currentTheme === "light"
                    ? "#e3f2fd"
                    : "#f0f0f0"
                  : "transparent",
                color: currentTheme === key ? theme.neonBlue : theme.text,
                cursor: "pointer",
                fontWeight: currentTheme === key ? "700" : "500",
                fontSize: "13px",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 0.2s ease",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderLeft: currentTheme === key ? `4px solid ${theme.neonBlue}` : "4px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (currentTheme !== key) {
                  e.target.style.background = currentTheme === "cyber"
                    ? `rgba(0, 212, 255, 0.1)`
                    : `rgba(0, 0, 0, 0.05)`;
                }
              }}
              onMouseLeave={(e) => {
                if (currentTheme !== key) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <span style={{ marginRight: "8px" }}>{themeIcons[key]}</span>
              {themeObj.name}
            </button>
          ))}
        </div>
      )}

      {showMenu && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;

