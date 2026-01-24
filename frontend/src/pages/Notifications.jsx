import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const Notifications = ({ user, onNavigate, onNotificationCountChange }) => {
  const { theme, currentTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLightMode = currentTheme === "light";

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      loadNotifications();
      
      if (onNotificationCountChange) {
        onNotificationCountChange();
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      loadNotifications();
      
      if (onNotificationCountChange) {
        onNotificationCountChange();
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "upvote":
        return "👍";
      case "save":
        return "🔖";
      case "comment":
        return "💬";
      default:
        return "🔔";
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
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.color = theme.neonCyan;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = theme.neonBlue;
            }}
          >
            <ion-icon name="arrow-back-outline" style={{ fontSize: "16px" }} />
            Back
          </button>

          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              color: isLightMode 
                ? "#0066cc"
                : theme.neonBlue,
              margin: "0 0 12px 0",
              letterSpacing: "-1px"
            }}
          >
            🔔 Notifications
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: theme.textDark,
              margin: 0
            }}
          >
            {notifications.length === 0
              ? "No notifications yet"
              : `You have ${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: theme.textDark,
              fontSize: "16px"
            }}
          >
            ⌛ Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              background: isLightMode
                ? "#ffffff"
                : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
              border: `2px solid ${isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.2)"}`,
              borderRadius: "16px",
              padding: "60px 24px",
              textAlign: "center",
              color: theme.textDark
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌟</div>
            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              All caught up!
            </p>
            <p style={{ fontSize: "14px", margin: 0, opacity: 0.7 }}>
              No new notifications. You'll be notified when someone upvotes, saves, or comments on your projects.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  background: isLightMode
                    ? "#ffffff"
                    : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.02) 100%)`,
                  border: `2px solid ${notification.read
                    ? isLightMode ? "#e5e7eb" : "rgba(0, 212, 255, 0.1)"
                    : isLightMode ? "#0066cc" : theme.neonPink}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  boxShadow: !notification.read
                    ? isLightMode
                      ? "0 2px 8px rgba(0, 102, 204, 0.15)"
                      : `0 0 15px rgba(${notification.type === "upvote" ? "255, 0, 110" : "0, 212, 255"}, 0.2)`
                    : "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.borderColor = theme.neonBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  <span style={{ fontSize: "20px" }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "600",
                        color: !notification.read ? theme.neonPink : theme.text
                      }}
                    >
                      {notification.title || "Notification"}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "12px",
                        color: theme.textDark,
                        opacity: 0.8
                      }}
                    >
                      {notification.message}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "11px",
                        color: theme.textDark,
                        opacity: 0.6
                      }}
                    >
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.neonBlue,
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px 8px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.neonCyan;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.neonBlue;
                      }}
                    >
                      <ion-icon name="checkmark-circle-outline" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    title="Delete notification"
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.neonPink,
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px 8px",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme.neonPink;
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <ion-icon name="trash-outline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default Notifications;

