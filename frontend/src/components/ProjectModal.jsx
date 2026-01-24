import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const ProjectModal = ({ project, onClose, currentUserId, onDelete }) => {
  const { theme, currentTheme } = useTheme();
  const isLightMode = currentTheme === "light";
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreator = currentUserId === project.creatorId;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await fetch(`http://localhost:5000/api/projects/${project._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      onDelete(project._id);
      onClose();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: "20px",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.3s ease-out"
        }}
        onClick={onClose}
      />

      {}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: isLightMode 
            ? "#ffffff"
            : `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
          border: isLightMode
            ? `2px solid #d1d5db`
            : `2px solid ${theme.neonBlue}`,
          borderRadius: "12px",
          padding: "0",
          maxWidth: "750px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          zIndex: 1000,
          color: theme.text,
          boxShadow: isLightMode
            ? "0 10px 40px rgba(0, 0, 0, 0.15)"
            : theme.name === "Cyber Mode"
            ? `0 0 60px rgba(0, 212, 255, 0.4), 0 0 100px rgba(0, 212, 255, 0.2), inset 0 0 40px rgba(0, 212, 255, 0.1)`
            : "0 0 40px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div
          style={{
            padding: "32px 32px 0",
            borderBottom: isLightMode ? "1px solid #e5e7eb" : `1px solid rgba(0, 212, 255, 0.2)`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px"
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                color: isLightMode ? "#059669" : theme.neonGreen,
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "8px",
                fontWeight: "700",
                textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonGreen}` : "none"
              }}
            >
              {project.category}
            </div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: isLightMode ? "#1a1d29" : theme.neonCyan,
                margin: "0 0 12px 0",
                lineHeight: "1.2",
                textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonCyan}` : "none"
              }}
            >
              {project.title}
            </h1>
            <div
              style={{
                fontSize: "13px",
                color: theme.textDark,
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >
              {}
              <div style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "8px 14px",
                background: theme.name === "Cyber Mode" 
                  ? `rgba(0, 212, 255, 0.08)` 
                  : `rgba(0, 0, 0, 0.05)`,
                borderRadius: "24px",
                border: `1.5px solid ${theme.neonBlue}40`,
                boxShadow: theme.name === "Cyber Mode" ? `0 0 12px rgba(0, 212, 255, 0.15)` : "none"
              }}>
                {project.creatorAvatar ? (
                  <img
                    src={project.creatorAvatar.startsWith('http') 
                      ? project.creatorAvatar 
                      : `http://localhost:5000${project.creatorAvatar}`}
                    alt={project.creatorName}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${theme.neonCyan}`,
                      boxShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}60` : "none"
                    }}
                    onError={(e) => {
                      e.target.replaceWith(
                        Object.assign(document.createElement('div'), {
                          innerHTML: project.creatorName.charAt(0).toUpperCase(),
                          style: `width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonPurple}); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${theme.bg}; border: 2px solid ${theme.neonCyan}; box-shadow: ${theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"}`
                        })
                      );
                    }}
                  />
                ) : (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonPurple})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: theme.bg,
                    border: `2px solid ${theme.neonCyan}`,
                    boxShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
                  }}>
                    {project.creatorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <strong style={{
                  color: theme.neonCyan,
                  textShadow: theme.name === "Cyber Mode" ? `0 0 6px ${theme.neonCyan}60` : "none"
                }}>
                  {project.creatorName}
                </strong>
              </div>
              
              <span>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
              <span style={{ color: theme.neonGreen, fontWeight: "700" }}>
                ⬆️ {project.upvotes || 0} upvotes
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: `rgba(255, 0, 110, 0.1)`,
              border: `2px solid ${theme.neonPink}`,
              color: theme.neonPink,
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              boxShadow: theme.name === "Cyber Mode" ? "0 0 10px rgba(255, 0, 110, 0.2)" : "none",
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonPink}, inset 0 0 10px rgba(255, 0, 110, 0.2)` : "0 0 12px rgba(0, 0, 0, 0.2)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" ? "0 0 10px rgba(255, 0, 110, 0.2)" : "none";
              e.target.style.transform = "scale(1)";
            }}
          >
            ✕
          </button>
        </div>

        {}
        <div style={{ padding: "32px" }}>
          {}
          {project.imageUrl && (
            <div
              style={{
                width: "100%",
                height: "auto",
                minHeight: "300px",
                maxHeight: "600px",
                borderRadius: "8px",
                overflow: "hidden",
                border: isLightMode ? "2px solid #e5e7eb" : `2px solid ${theme.neonBlue}`,
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isLightMode ? "#f3f4f6" : `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)`,
                boxShadow: isLightMode ? "inset 0 0 10px rgba(0, 0, 0, 0.08)" : theme.name === "Cyber Mode" ? `inset 0 0 30px rgba(0, 212, 255, 0.2)` : "inset 0 0 10px rgba(0, 0, 0, 0.1)"
              }}
            >
              <img
                src={
                  project.imageUrl.startsWith("http")
                    ? project.imageUrl
                    : `http://localhost:5000${project.imageUrl}`
                }
                alt={project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  maxHeight: "600px"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {}
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: isLightMode ? "#374151" : theme.neonCyan,
                marginBottom: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
              }}
            >
              Description
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.8",
                color: isLightMode ? "#4b5563" : theme.textDark,
                whiteSpace: "pre-wrap",
                margin: "0",
                letterSpacing: "0.3px"
              }}
            >
              {project.description}
            </p>
          </div>

          {}
          {project.tags && (
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: isLightMode ? "#374151" : theme.neonCyan,
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
                }}
              >
                Tags
              </h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                {project.tags.split(" ").map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      background: isLightMode 
                        ? "linear-gradient(90deg, #0066cc, #003d7a)"
                        : "linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(181, 55, 242, 0.2))",
                      color: isLightMode ? "#fff" : theme.neonCyan,
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: isLightMode ? "1px solid #0066cc" : `1px solid ${theme.neonBlue}`,
                      boxShadow: isLightMode 
                        ? "rgba(0, 102, 204, 0.2) 0px 0px 10px"
                        : `rgba(0, 212, 255, 0.2) 0px 0px 10px`,
                      textTransform: "capitalize"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {}
          {project.videoUrl && (
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: isLightMode ? "#374151" : theme.neonCyan,
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
                }}
              >
                🎥 Watch Video
              </h2>
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: isLightMode
                    ? "linear-gradient(90deg, #0066cc, #003d7a)"
                    : `linear-gradient(90deg, ${theme.neonBlue}, ${theme.neonCyan})`,
                  color: isLightMode ? "#fff" : theme.bgDark,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  boxShadow: isLightMode
                    ? "rgba(0, 102, 204, 0.3) 0px 0px 15px"
                    : `rgba(0, 212, 255, 0.3) 0px 0px 15px`
                }}
              >
                ▶️ Watch Video
              </a>
            </div>
          )}

          {}
          {project.images && project.images.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: isLightMode ? "#374151" : theme.neonCyan,
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  textShadow: !isLightMode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
                }}
              >
                Gallery ({project.images.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "14px"
                }}
              >
                {project.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "100%",
                      height: "120px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: selectedImageIdx === idx 
                        ? `3px solid ${theme.neonPink}` 
                        : isLightMode ? "2px solid #e5e7eb" : `2px solid ${theme.neonBlue}`,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selectedImageIdx === idx
                        ? isLightMode ? "0 0 16px rgba(0, 0, 0, 0.15)" : `0 0 25px ${theme.neonPink}`
                        : isLightMode ? "0 0 10px rgba(0, 0, 0, 0.08)" : `0 0 15px rgba(0, 212, 255, 0.1)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isLightMode ? "#f9fafb" : `rgba(0, 212, 255, 0.05)`
                    }}
                    onClick={() => setSelectedImageIdx(idx)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isLightMode ? "0 0 16px rgba(0, 0, 0, 0.12)" : theme.name === "Cyber Mode" ? `0 0 25px ${theme.neonBlue}, inset 0 0 15px rgba(0, 212, 255, 0.2)` : "0 0 20px rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = selectedImageIdx === idx
                        ? isLightMode ? "0 0 16px rgba(0, 0, 0, 0.15)" : `0 0 25px ${theme.neonPink}`
                        : isLightMode ? "0 0 10px rgba(0, 0, 0, 0.08)" : `0 0 15px rgba(0, 212, 255, 0.1)`;
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <img
                      src={
                        img.startsWith("http") ? img : `http://localhost:5000${img}`
                      }
                      alt={`Gallery ${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "4px"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>

              {}
              {selectedImageIdx !== null && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    background: isLightMode ? "#f9fafb" : `rgba(0, 212, 255, 0.05)`,
                    border: isLightMode ? "2px solid #e5e7eb" : `2px solid ${theme.neonBlue}`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px"
                  }}
                >
                  <img
                    src={
                      project.images[selectedImageIdx].startsWith("http")
                        ? project.images[selectedImageIdx]
                        : `http://localhost:5000${project.images[selectedImageIdx]}`
                    }
                    alt={`Full Gallery ${selectedImageIdx}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "600px",
                      objectFit: "contain",
                      borderRadius: "6px"
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "14px",
              marginBottom: "28px",
              padding: "20px",
              background: theme.name === "Cyber Mode"
                ? `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.02) 100%)`
                : `rgba(0, 0, 0, 0.1)`,
              borderRadius: "8px",
              border: `1px solid ${theme.neonBlue}25`
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textDark,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px"
                }}
              >
                Upvotes
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme.neonGreen,
                  textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonGreen}` : "none"
                }}
              >
                {project.upvotes || 0}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textDark,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px"
                }}
              >
                Category
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: theme.neonCyan,
                  textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
                }}
              >
                {project.category}
              </div>
            </div>
          </div>

          {}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexDirection: "column"
            }}
          >
            {}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 24px",
                background: `linear-gradient(90deg, ${theme.neonGreen} 0%, ${theme.neonCyan} 100%)`,
                color: theme.bg,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "none",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
                boxShadow: theme.name === "Cyber Mode"
                  ? `0 0 25px ${theme.neonGreen}, inset 0 0 15px rgba(0, 255, 136, 0.2)`
                  : "0 0 12px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = theme.name === "Cyber Mode"
                  ? `0 0 40px ${theme.neonGreen}, inset 0 0 20px rgba(0, 255, 136, 0.3)`
                  : "0 0 20px rgba(0, 0, 0, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = theme.name === "Cyber Mode"
                  ? `0 0 25px ${theme.neonGreen}, inset 0 0 15px rgba(0, 255, 136, 0.2)`
                  : "0 0 12px rgba(0, 0, 0, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🔗 Visit Project
            </a>

            {}
            {isCreator && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "14px 24px",
                  background: `rgba(255, 0, 110, 0.1)`,
                  border: `2px solid ${theme.neonPink}`,
                  color: theme.neonPink,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease",
                  boxShadow: theme.name === "Cyber Mode"
                    ? "0 0 15px rgba(255, 0, 110, 0.2)"
                    : "0 0 8px rgba(0, 0, 0, 0.1)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? `0 0 25px ${theme.neonPink}, inset 0 0 15px rgba(255, 0, 110, 0.2)`
                    : "0 0 15px rgba(0, 0, 0, 0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? "0 0 15px rgba(255, 0, 110, 0.2)"
                    : "0 0 8px rgba(0, 0, 0, 0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🗑️ Delete Project
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          projectTitle={project.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeleting}
          theme={theme}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

const DeleteConfirmationModal = ({ projectTitle, onConfirm, onCancel, isDeleting, theme }) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 1001,
          animation: "fadeIn 0.2s ease-out"
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
          border: `2px solid ${theme.neonPink}`,
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "420px",
          width: "90%",
          zIndex: 1002,
          color: theme.text,
          boxShadow: theme.name === "Cyber Mode"
            ? `0 0 40px rgba(255, 0, 110, 0.4), 0 0 80px rgba(255, 0, 110, 0.2)`
            : "0 0 30px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px"
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: theme.neonPink,
              margin: "0 0 12px 0",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonPink}` : "none"
            }}
          >
            Delete Project?
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: theme.textDark,
              margin: "0 0 8px 0",
              lineHeight: "1.6"
            }}
          >
            You're about to permanently delete:
          </p>
          <p
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: theme.neonCyan,
              margin: "12px 0 24px 0",
              wordBreak: "break-word",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
            }}
          >
            "{projectTitle}"
          </p>
          <p
            style={{
              fontSize: "12px",
              color: theme.textDark,
              margin: "0 0 24px 0",
              fontStyle: "italic",
              opacity: 0.8
            }}
          >
            This action cannot be undone.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px"
            }}
          >
            <button
              onClick={onCancel}
              disabled={isDeleting}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: `rgba(0, 212, 255, 0.1)`,
                border: `2px solid ${theme.neonBlue}`,
                color: theme.neonBlue,
                borderRadius: "6px",
                cursor: isDeleting ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                boxShadow: theme.name === "Cyber Mode"
                  ? "0 0 10px rgba(0, 212, 255, 0.2)"
                  : "none",
                opacity: isDeleting ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? `0 0 20px ${theme.neonBlue}, inset 0 0 10px rgba(0, 212, 255, 0.2)`
                    : "0 0 12px rgba(0, 0, 0, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? "0 0 10px rgba(0, 212, 255, 0.2)"
                    : "none";
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: `linear-gradient(90deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%)`,
                border: `2px solid ${theme.neonPink}`,
                color: theme.neonPink,
                borderRadius: "6px",
                cursor: isDeleting ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                boxShadow: theme.name === "Cyber Mode"
                  ? "0 0 15px rgba(255, 0, 110, 0.2)"
                  : "0 0 8px rgba(0, 0, 0, 0.1)",
                opacity: isDeleting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? `0 0 30px ${theme.neonPink}, inset 0 0 15px rgba(255, 0, 110, 0.3)`
                    : "0 0 15px rgba(0, 0, 0, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.target.style.boxShadow = theme.name === "Cyber Mode"
                    ? "0 0 15px rgba(255, 0, 110, 0.2)"
                    : "0 0 8px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -48%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProjectModal;

