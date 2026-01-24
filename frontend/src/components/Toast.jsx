import React, { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const { theme } = useTheme();
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" 
    ? `rgba(0, 255, 136, 0.1)`
    : type === "error"
    ? `rgba(255, 0, 110, 0.1)`
    : `rgba(0, 212, 255, 0.1)`;

  const borderColor = type === "success" 
    ? theme.neonGreen
    : type === "error"
    ? theme.neonPink
    : theme.neonBlue;

  const textColor = type === "success" 
    ? theme.neonGreen
    : type === "error"
    ? theme.neonPink
    : theme.neonBlue;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "!";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        animation: "slideIn 0.3s ease-out",
        zIndex: 1000
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "700",
          boxShadow: theme.name === "Cyber Mode" ? `0 0 20px ${borderColor}, inset 0 0 10px ${borderColor}30` : `0 0 10px rgba(0, 0, 0, 0.2)`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: bgColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
