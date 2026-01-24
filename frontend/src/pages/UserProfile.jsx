import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const UserProfile = ({ user, onNavigate, onUserUpdate }) => {
  const { theme, currentTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    displayName: user?.displayName || user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : null
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarHover, setAvatarHover] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user?.username || "",
        displayName: user?.displayName || user?.username || "",
        email: user?.email || "",
        avatar: user?.avatar || ""
      });
      setAvatarPreview(
        user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : null
      );
      setAvatarLoadFailed(false);
    }
  }, [user]);

  const isLightMode = currentTheme === "light";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarLoadFailed(false);
        setProfileData(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarLoadFailed(false);
        setProfileData(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(""); 
    
    try {
      const formData = new FormData();
      formData.append("displayName", profileData.displayName);
      if (profileData.avatar instanceof File) {
        formData.append("avatar", profileData.avatar);
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      
      const responseData = await response.json();

      if (response.ok && response.status === 200) {
        
        const userData = responseData.user || responseData;
        
        
        localStorage.setItem("user", JSON.stringify(userData));
        
        
        setProfileData(prev => ({
          ...prev,
          displayName: userData.displayName,
          avatar: userData.avatar
        }));
        
        
        if (userData.avatar) {
          setAvatarPreview(
            userData.avatar.startsWith('http') 
              ? userData.avatar 
              : `http://localhost:5000${userData.avatar}`
          );
        }
        
        
        setMessage("✓ Profile updated successfully");
        
        
        if (onUserUpdate) {
          onUserUpdate(userData);
        }
        
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        
        const errorMsg = responseData.message || "Failed to update profile";
        setMessage(`✕ ${errorMsg}`);
      }
    } catch (err) {
      
      console.error("Profile update error:", err);
      setMessage("✕ Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isLightMode 
          ? `linear-gradient(135deg, ${theme.bg} 0%, #ffffff 100%)`
          : `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
        padding: "40px 24px",
        color: theme.text,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto"
        }}
      >
        {}
        <div
          style={{
            marginBottom: "48px",
            animation: "fadeIn 0.6s ease"
          }}
        >
          <button
            onClick={() => onNavigate("home")}
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
            ← Back to Home
          </button>
          <h1
            style={{
              fontSize: isLightMode ? "42px" : "36px",
              fontWeight: "800",
              color: isLightMode ? "#1a1d29" : theme.neonCyan,
              margin: "0 0 12px 0",
              textShadow: isLightMode ? "none" : `0 0 15px ${theme.neonBlue}`,
              letterSpacing: "-0.5px"
            }}
          >
            {isLightMode ? "👤 Your Profile" : "👤 User Profile"}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: isLightMode ? "#5a5f73" : theme.textDark,
              margin: "0",
              fontWeight: "500"
            }}
          >
            {isLightMode ? "Manage your profile information and preferences" : "Manage your profile information"}
          </p>
        </div>

        {}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
            borderBottom: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
            paddingBottom: "0"
          }}
        >
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "14px 24px",
              border: "none",
              background: activeTab === "profile" 
                ? isLightMode 
                  ? "#f3f4f6"
                  : `rgba(0, 212, 255, 0.1)`
                : "transparent",
              color: activeTab === "profile" ? theme.neonBlue : theme.textDark,
              borderBottom: activeTab === "profile" ? `3px solid ${theme.neonBlue}` : "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            style={{
              padding: "14px 24px",
              border: "none",
              background: activeTab === "security" 
                ? isLightMode 
                  ? "#f3f4f6"
                  : `rgba(0, 212, 255, 0.1)`
                : "transparent",
              color: activeTab === "security" ? theme.neonBlue : theme.textDark,
              borderBottom: activeTab === "security" ? `3px solid ${theme.neonBlue}` : "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            Security
          </button>
        </div>

        {}
        {activeTab === "profile" && (
          <div
            style={{
              background: isLightMode 
                ? "#ffffff"
                : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
              border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
              borderRadius: "16px",
              padding: "48px",
              boxShadow: isLightMode 
                ? "0 10px 30px rgba(0, 0, 0, 0.08)"
                : theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)",
              display: "flex",
              gap: "48px",
              animation: "slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transition: "all 0.4s ease"
            }}
          >
            {}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                minWidth: isLightMode ? "180px" : "150px"
              }}
            >
              {}
              <label
                style={{
                  cursor: "pointer",
                  display: "block"
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarChange(e)}
                  style={{ display: "none" }}
                />
                <div
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: theme.bgLight,
                    border: `2px solid ${isLightMode ? "#e0e0e0" : theme.neonCyan}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img
                    src={avatarPreview || "/default-avatar.png"}
                    alt="Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: (avatarLoadFailed || !avatarPreview) ? "none" : "block"
                    }}
                    onError={() => {
                      setAvatarLoadFailed(true);
                    }}
                  />
                  {(avatarLoadFailed || !avatarPreview) && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonPurple})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "20px",
                        fontSize: "48px",
                        fontWeight: "700",
                        color: theme.bg
                      }}
                    >
                      {user?.displayName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  {avatarHover && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "20px",
                        animation: "fadeIn 0.2s ease"
                      }}
                    >
                      <span style={{ color: "white", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Click to Change
                      </span>
                    </div>
                  )}
                </div>
              </label>
              {}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  background: isLightMode 
                    ? "#ecfdf5"
                    : "rgba(0, 255, 136, 0.1)",
                  border: `1px solid ${isLightMode ? "#86efac" : theme.neonGreen}`,
                  fontSize: "12px",
                  color: isLightMode ? "#166534" : theme.neonGreen,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                <span style={{ width: "8px", height: "8px", background: isLightMode ? "#22c55e" : theme.neonGreen, borderRadius: "50%", animation: "pulse 2s infinite" }} />
                Active
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  border: `2px dashed ${isLightMode ? "#d1d5db" : theme.neonPink}`,
                  borderRadius: "10px",
                  textAlign: "center",
                  color: isLightMode ? "#6b7280" : theme.neonPink,
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: isLightMode ? "#f9fafb" : "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isLightMode 
                    ? "#f3f4f6"
                    : `rgba(255, 0, 110, 0.1)`;
                  e.currentTarget.style.borderColor = theme.neonPink;
                  e.currentTarget.style.boxShadow = isLightMode 
                    ? "0 4px 12px rgba(0, 0, 0, 0.08)"
                    : `0 0 15px rgba(255, 0, 110, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isLightMode ? "#f9fafb" : "transparent";
                  e.currentTarget.style.borderColor = isLightMode ? "#d1d5db" : theme.neonPink;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  style={{
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e)}
                    style={{ display: "none" }}
                  />
                  Edit Avatar
                </label>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "24px"
              }}
            >
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
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  disabled
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: isLightMode ? "#f9fafb" : `rgba(0, 212, 255, 0.05)`,
                    border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
                    borderRadius: "10px",
                    color: theme.textDark,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    opacity: 0.65,
                    cursor: "not-allowed",
                    transition: "all 0.3s ease"
                  }}
                />
                <p style={{ fontSize: "12px", color: theme.textDark, margin: "8px 0 0 0", fontWeight: "500" }}>
                  Username cannot be changed
                </p>
              </div>

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
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: isLightMode ? "#ffffff" : `rgba(0, 212, 255, 0.05)`,
                    border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
                    borderRadius: "10px",
                    color: theme.text,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
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

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                style={{
                  padding: "14px 28px",
                  border: "none",
                  background: isLightMode 
                    ? `linear-gradient(135deg, #0066cc 0%, #0052a3 100%)`
                    : `linear-gradient(90deg, ${theme.neonBlue}, ${theme.neonCyan})`,
                  color: "#ffffff",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: isLightMode 
                    ? "0 4px 12px rgba(0, 102, 204, 0.3)"
                    : `0 0 15px ${theme.neonBlue}`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = isLightMode 
                      ? "0 8px 20px rgba(0, 102, 204, 0.4)"
                      : `0 0 25px ${theme.neonBlue}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = isLightMode 
                    ? "0 4px 12px rgba(0, 102, 204, 0.3)"
                    : `0 0 15px ${theme.neonBlue}`;
                }}
              >
                {loading ? "💾 Saving..." : "✓ Save Changes"}
              </button>

              {message && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    background: message.includes("✓") 
                      ? isLightMode 
                        ? "#ecfdf5"
                        : `rgba(0, 255, 136, 0.1)`
                      : isLightMode
                        ? "#fee2e2"
                        : `rgba(255, 0, 110, 0.1)`,
                    color: message.includes("✓") 
                      ? isLightMode 
                        ? "#166534"
                        : theme.neonGreen
                      : isLightMode
                        ? "#991b1b"
                        : theme.neonPink,
                    border: `2px solid ${message.includes("✓") 
                      ? isLightMode 
                        ? "#86efac"
                        : theme.neonGreen
                      : isLightMode
                        ? "#fca5a5"
                        : theme.neonPink}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    animation: "slideDown 0.3s ease"
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === "security" && (
          <div
            style={{
              background: isLightMode 
                ? "#ffffff"
                : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
              border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
              borderRadius: "16px",
              padding: "48px",
              boxShadow: isLightMode 
                ? "0 10px 30px rgba(0, 0, 0, 0.08)"
                : theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)",
              animation: "slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              {}
              <div style={{ flex: 1, minWidth: "300px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: isLightMode ? "#1a1d29" : theme.neonCyan,
                    marginBottom: "12px",
                    textShadow: isLightMode ? "none" : `0 0 10px ${theme.neonBlue}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  📧 Email Address
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: theme.text,
                    marginBottom: "16px",
                    fontWeight: "500"
                  }}
                >
                  Current: <strong style={{ color: isLightMode ? "#1a1d29" : theme.neonBlue }}>{profileData.email}</strong>
                </p>
                <button
                  onClick={() => onNavigate("change-email")}
                  style={{
                    padding: "12px 20px",
                    border: `2px solid ${isLightMode ? "#d1d5db" : theme.neonPurple}`,
                    background: isLightMode 
                      ? "#f9fafb"
                      : `rgba(176, 38, 255, 0.1)`,
                    color: isLightMode ? "#374151" : theme.neonPurple,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = isLightMode 
                      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                      : `0 0 20px ${theme.neonPurple}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Change Email
                </button>
              </div>

              {}
              <div style={{ flex: 1, minWidth: "300px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: isLightMode ? "#1a1d29" : theme.neonCyan,
                    marginBottom: "12px",
                    textShadow: isLightMode ? "none" : `0 0 10px ${theme.neonBlue}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  🔒 Password
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: theme.text,
                    marginBottom: "16px",
                    fontWeight: "500"
                  }}
                >
                  Secure your account with a strong password
                </p>
                <button
                  onClick={() => onNavigate("change-password")}
                  style={{
                    padding: "12px 20px",
                    border: `2px solid ${isLightMode ? "#d1d5db" : theme.neonPink}`,
                    background: isLightMode 
                      ? "#f9fafb"
                      : `rgba(255, 0, 110, 0.1)`,
                    color: isLightMode ? "#374151" : theme.neonPink,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = isLightMode 
                      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                      : `0 0 20px ${theme.neonPink}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;

