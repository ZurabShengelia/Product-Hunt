import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const ChangeEmail = ({ currentEmail, onNavigate }) => {
  const { theme, currentTheme } = useTheme();
  const isLightMode = currentTheme === "light";
  const [step, setStep] = useState("email"); 
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailError, setEmailError] = useState("");

  
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (value) => {
    setNewEmail(value);
    setEmailError("");
  };

  const handleRequestChange = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(newEmail)) {
      setEmailError("Invalid email address");
      return;
    }

    if (newEmail === currentEmail) {
      setEmailError("New email must be different from current email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/request-email-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newEmail })
      });

      if (response.ok) {
        setMessage("Verification code sent!");
        setStep("verify");
        setResendCooldown(60);
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to send verification code");
      }
    } catch (err) {
      setMessage("Error sending verification code");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setMessage("Verification code must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/verify-email-change", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newEmail,
          verificationCode
        })
      });

      if (response.ok) {
        setMessage("");
        setStep("success");
        
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.email = newEmail;
          localStorage.setItem("user", JSON.stringify(user));
        }
        setTimeout(() => onNavigate("profile"), 2500);
      } else {
        const data = await response.json();
        setMessage(data.message || "Invalid verification code");
      }
    } catch (err) {
      setMessage("Error verifying code");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/request-email-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newEmail })
      });

      if (response.ok) {
        setMessage("Code resent successfully!");
        setResendCooldown(60);
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Failed to resend code");
      }
    } catch (err) {
      setMessage("Error resending code");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isLightMode
          ? `linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%)`
          : `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
        padding: "40px 24px",
        color: theme.text,
        transition: "all 0.4s ease"
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {}
        <div style={{ marginBottom: "48px", animation: "fadeIn 0.6s ease" }}>
          <button
            onClick={() => onNavigate("profile")}
            style={{
              background: "none",
              border: "none",
              color: theme.neonBlue,
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "20px",
              textDecoration: "none",
              fontFamily: "inherit",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.gap = "10px";
              e.target.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.target.style.gap = "6px";
              e.target.style.opacity = "1";
            }}
          >
            ← Back to Profile
          </button>
          <h1
            style={{
              fontSize: isLightMode ? "42px" : "36px",
              fontWeight: "800",
              color: isLightMode ? "#1a1d29" : theme.neonCyan,
              margin: "0 0 12px 0",
              textShadow: !isLightMode ? `0 0 15px ${theme.neonBlue}` : "none",
              letterSpacing: "-0.5px"
            }}
          >
            📧 Change Email
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: isLightMode ? "#5a5f73" : theme.textDark,
              margin: "0",
              fontWeight: "500"
            }}
          >
            {step === "email" && "Enter your new email address"}
            {step === "verify" && "Verify your new email"}
            {step === "success" && "Email updated successfully"}
          </p>
        </div>

        {}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "32px",
            alignItems: "center"
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: step !== "email" ? theme.neonGreen : theme.neonPurple,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: isLightMode
                ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                : `0 0 15px ${theme.neonPurple}40`,
              transition: "all 0.4s ease",
              animation: step !== "email" ? "scaleIn 0.3s ease" : "none"
            }}
          >
            {step === "success" ? "✓" : "1"}
          </div>
          <div
            style={{
              flex: 1,
              height: "2px",
              background: step !== "email" ? theme.neonGreen : (isLightMode ? "#d1d5db" : "rgba(0, 212, 255, 0.2)"),
              transition: "all 0.4s ease"
            }}
          />
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: step === "verify" || step === "success" ? theme.neonGreen : (isLightMode ? "#d1d5db" : "rgba(0, 212, 255, 0.2)"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: step === "verify" || step === "success" ? "white" : (isLightMode ? "#6b7280" : theme.textDark),
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: (step === "verify" || step === "success")
                ? isLightMode
                  ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                  : `0 0 15px ${theme.neonGreen}40`
                : "none",
              transition: "all 0.4s ease",
              animation: (step === "verify" || step === "success") ? "scaleIn 0.3s ease" : "none"
            }}
          >
            {step === "success" ? "✓" : "2"}
          </div>
        </div>

        {}
        <form
          onSubmit={step === "email" ? handleRequestChange : handleVerifyCode}
          style={{
            background: isLightMode ? "#ffffff" : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
            border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
            borderRadius: "16px",
            padding: "48px",
            boxShadow: isLightMode
              ? "0 10px 30px rgba(0, 0, 0, 0.08)"
              : theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            animation: "slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transition: "all 0.4s ease"
          }}
        >
          {}
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: isLightMode ? "#374151" : theme.neonCyan,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                display: "block",
                marginBottom: "10px"
              }}
            >
              Current Email
            </label>
            <div
              style={{
                width: "100%",
                padding: "14px 16px",
                background: isLightMode ? "#f9fafb" : `rgba(0, 212, 255, 0.05)`,
                border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
                borderRadius: "10px",
                color: isLightMode ? "#4b5563" : theme.textDark,
                fontSize: "14px",
                fontWeight: "500",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>✓</span>
              {currentEmail}
            </div>
          </div>

          {step === "email" && (
            <>
              {}
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: isLightMode ? "#374151" : theme.neonCyan,
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    display: "block",
                    marginBottom: "10px"
                  }}
                >
                  Enter New Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="newemail@example.com"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: isLightMode ? "#ffffff" : `rgba(0, 212, 255, 0.05)`,
                    border: emailError 
                      ? `2px solid ${theme.neonPink}`
                      : `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
                    borderRadius: "10px",
                    color: theme.text,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = isLightMode
                      ? `0 0 0 3px rgba(0, 102, 204, 0.1)`
                      : `0 0 15px rgba(0, 212, 255, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = emailError 
                      ? theme.neonPink
                      : isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {emailError && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: theme.neonPink,
                      margin: "8px 0 0 0",
                      fontWeight: "500"
                    }}
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {}
              <button
                type="submit"
                disabled={loading || !newEmail || emailError}
                style={{
                  padding: "14px 28px",
                  border: "none",
                  background: isLightMode
                    ? `linear-gradient(135deg, #0066cc 0%, #0052a3 100%)`
                    : `linear-gradient(90deg, ${theme.neonPurple}, ${theme.neonBlue})`,
                  color: "#ffffff",
                  borderRadius: "10px",
                  cursor: (loading || !newEmail || emailError) ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: (loading || !newEmail || emailError) ? 0.7 : 1,
                  boxShadow: isLightMode
                    ? "0 4px 12px rgba(0, 102, 204, 0.3)"
                    : `0 0 15px ${theme.neonPurple}`,
                  animation: !newEmail || emailError ? "none" : "pulse 2s infinite"
                }}
                onMouseEnter={(e) => {
                  if (!loading && newEmail && !emailError) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = isLightMode
                      ? "0 8px 20px rgba(0, 102, 204, 0.4)"
                      : `0 0 25px ${theme.neonPurple}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = isLightMode
                    ? "0 4px 12px rgba(0, 102, 204, 0.3)"
                    : `0 0 15px ${theme.neonPurple}`;
                }}
              >
                {loading ? "💌 Sending Code..." : "Send Verification Code"}
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              {}
              <div
                style={{
                  padding: "16px",
                  background: isLightMode ? "#f0f4ff" : "rgba(0, 212, 255, 0.05)",
                  border: `1px solid ${isLightMode ? "#d1d5db" : "rgba(0, 212, 255, 0.2)"}`,
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: isLightMode ? "#374151" : theme.textDark,
                  lineHeight: "1.6"
                }}
              >
                A verification code has been sent to:
                <br />
                <strong style={{ color: isLightMode ? "#1a1d29" : theme.neonCyan }}>
                  {newEmail}
                </strong>
              </div>

              {}
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: isLightMode ? "#374151" : theme.neonCyan,
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    display: "block",
                    marginBottom: "10px"
                  }}
                >
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase().replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "16px 14px",
                    background: isLightMode ? "#ffffff" : `rgba(0, 212, 255, 0.05)`,
                    border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
                    borderRadius: "10px",
                    color: theme.text,
                    fontSize: "24px",
                    fontFamily: "monospace",
                    fontWeight: "700",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    letterSpacing: "12px",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = isLightMode
                      ? `0 0 0 3px rgba(0, 102, 204, 0.1)`
                      : `0 0 15px rgba(0, 212, 255, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {}
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                style={{
                  padding: "14px 28px",
                  border: "none",
                  background: isLightMode
                    ? `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`
                    : `linear-gradient(90deg, ${theme.neonGreen}, ${theme.neonCyan})`,
                  color: isLightMode ? "#ffffff" : theme.bg,
                  borderRadius: "10px",
                  cursor: (loading || verificationCode.length !== 6) ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: (loading || verificationCode.length !== 6) ? 0.7 : 1,
                  boxShadow: isLightMode
                    ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                    : `0 0 15px ${theme.neonGreen}`
                }}
                onMouseEnter={(e) => {
                  if (!loading && verificationCode.length === 6) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = isLightMode
                      ? "0 8px 20px rgba(34, 197, 94, 0.4)"
                      : `0 0 25px ${theme.neonGreen}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = isLightMode
                    ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                    : `0 0 15px ${theme.neonGreen}`;
                }}
              >
                {loading ? "✓ Verifying..." : "✓ Confirm Email Change"}
              </button>

              {}
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendCode}
                style={{
                  padding: "14px 28px",
                  border: `2px solid ${isLightMode ? "#d1d5db" : theme.neonBlue}`,
                  background: isLightMode ? "#f9fafb" : "transparent",
                  color: isLightMode ? "#6b7280" : theme.neonBlue,
                  borderRadius: "10px",
                  cursor: (resendCooldown > 0 || loading) ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: (resendCooldown > 0 || loading) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (resendCooldown === 0 && !loading) {
                    e.target.style.background = isLightMode
                      ? "#f3f4f6"
                      : `rgba(0, 212, 255, 0.1)`;
                    e.target.style.borderColor = theme.neonBlue;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isLightMode ? "#f9fafb" : "transparent";
                  e.target.style.borderColor = isLightMode ? "#d1d5db" : theme.neonBlue;
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>

              {}
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setVerificationCode("");
                  setMessage("");
                }}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  background: isLightMode ? "#f3f4f6" : "rgba(0, 212, 255, 0.05)",
                  color: isLightMode ? "#6b7280" : theme.textDark,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isLightMode ? "#f3f4f6" : "rgba(0, 212, 255, 0.05)";
                }}
              >
                Change Email
              </button>
            </>
          )}

          {step === "success" && (
            <div
              style={{
                textAlign: "center",
                animation: "slideUp 0.4s ease"
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "20px",
                  animation: "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: isLightMode ? "#1a1d29" : theme.neonGreen,
                  margin: "0 0 12px 0",
                  textShadow: !isLightMode ? `0 0 10px ${theme.neonGreen}40` : "none"
                }}
              >
                Email Updated!
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: isLightMode ? "#5a5f73" : theme.textDark,
                  margin: "0",
                  lineHeight: "1.6"
                }}
              >
                Your email has been successfully changed to:
                <br />
                <strong style={{ color: isLightMode ? "#1a1d29" : theme.neonCyan }}>
                  {newEmail}
                </strong>
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: isLightMode ? "#6b7280" : theme.textDark,
                  margin: "16px 0 0 0",
                  fontStyle: "italic"
                }}
              >
                Redirecting to profile...
              </p>
            </div>
          )}

          {}
          {message && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                background: message.includes("successfully") || message.includes("sent")
                  ? isLightMode
                    ? "#ecfdf5"
                    : `rgba(0, 255, 136, 0.1)`
                  : isLightMode
                    ? "#fee2e2"
                    : `rgba(255, 0, 110, 0.1)`,
                color: message.includes("successfully") || message.includes("sent")
                  ? isLightMode
                    ? "#166534"
                    : theme.neonGreen
                  : isLightMode
                    ? "#991b1b"
                    : theme.neonPink,
                border: `2px solid ${
                  message.includes("successfully") || message.includes("sent")
                    ? isLightMode
                      ? "#86efac"
                      : theme.neonGreen
                    : isLightMode
                      ? "#fca5a5"
                      : theme.neonPink
                }`,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                animation: "slideDown 0.3s ease"
              }}
            >
              {message}
            </div>
          )}
        </form>
      </div>

      {}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0, 102, 204, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default ChangeEmail;

