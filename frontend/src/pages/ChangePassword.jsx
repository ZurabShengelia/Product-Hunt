import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const ChangePassword = ({ onNavigate }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "newPassword") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("✕ Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage("✕ Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/change-password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setMessage("✓ Password changed successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => onNavigate("profile"), 2000);
      } else {
        const data = await response.json();
        setMessage(`✕ ${data.message || "Failed to change password"}`);
      }
    } catch (err) {
      setMessage("✕ Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return theme.textDark;
    if (passwordStrength === 1) return theme.neonPink;
    if (passwordStrength === 2) return "#ff9800";
    if (passwordStrength === 3) return theme.neonGreen;
    return theme.neonBlue;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
        padding: "40px 24px",
        color: theme.text
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto"
        }}
      >
        {}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => onNavigate("profile")}
            style={{
              background: "none",
              border: "none",
              color: theme.neonBlue,
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "20px",
              textDecoration: "underline",
              fontFamily: "inherit"
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: theme.neonCyan,
              margin: "0 0 8px 0",
              textShadow: theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonBlue}` : "none",
              letterSpacing: "1px"
            }}
          >
            🔐 Change Password
          </h1>
        </div>

        {}
        <form
          onSubmit={handleChangePassword}
          style={{
            background: `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
            border: `2px solid rgba(0, 212, 255, 0.2)`,
            borderRadius: "10px",
            padding: "32px",
            boxShadow: theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}
        >
          {}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: theme.neonCyan,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px"
              }}
            >
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                background: `rgba(0, 212, 255, 0.05)`,
                border: `2px solid rgba(0, 212, 255, 0.2)`,
                borderRadius: "6px",
                color: theme.text,
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.neonBlue;
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 15px rgba(0, 212, 255, 0.2)` : `0 0 8px rgba(0, 0, 0, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 212, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: theme.neonCyan,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px"
              }}
            >
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                background: `rgba(0, 212, 255, 0.05)`,
                border: `2px solid rgba(0, 212, 255, 0.2)`,
                borderRadius: "6px",
                color: theme.text,
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.neonBlue;
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 15px rgba(0, 212, 255, 0.2)` : `0 0 8px rgba(0, 0, 0, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 212, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />

            {}
            {formData.newPassword && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "2px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(passwordStrength / 4) * 100}%`,
                      background: getStrengthColor(),
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: getStrengthColor(),
                    margin: "4px 0 0 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Strength: {passwordStrength === 0 ? "Very Weak" : passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Fair" : passwordStrength === 3 ? "Good" : "Strong"}
                </p>
              </div>
            )}
          </div>

          {}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: theme.neonCyan,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px"
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                background: `rgba(0, 212, 255, 0.05)`,
                border: `2px solid rgba(0, 212, 255, 0.2)`,
                borderRadius: "6px",
                color: theme.text,
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.neonBlue;
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 15px rgba(0, 212, 255, 0.2)` : `0 0 8px rgba(0, 0, 0, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 212, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              border: "none",
              background: `linear-gradient(90deg, ${theme.neonPink}, ${theme.neonPurple})`,
              color: theme.bg,
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "14px",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonPink}` : "0 0 8px rgba(0, 0, 0, 0.1)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 25px ${theme.neonPink}, inset 0 0 20px rgba(255, 0, 110, 0.2)` : "0 0 12px rgba(0, 0, 0, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonPink}` : "0 0 8px rgba(0, 0, 0, 0.1)";
            }}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>

          {message && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "700",
                background: message.includes("✓") ? `rgba(0, 255, 136, 0.1)` : `rgba(255, 0, 110, 0.1)`,
                color: message.includes("✓") ? theme.neonGreen : theme.neonPink,
                border: `2px solid ${message.includes("✓") ? theme.neonGreen : theme.neonPink}`,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {message}
            </div>
          )}
        </form>

        {}
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            background: `rgba(0, 212, 255, 0.05)`,
            border: `2px solid rgba(0, 212, 255, 0.1)`,
            borderRadius: "6px",
            fontSize: "12px",
            color: theme.textDark
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Password Requirements:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>At least 8 characters long</li>
            <li>Mix of uppercase and lowercase letters</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

