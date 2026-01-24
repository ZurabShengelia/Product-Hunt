import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import UpvoteButton from "./UpvoteButton";
import { useTheme } from "../contexts/ThemeContext";
import { saveAPI } from "../services/api";

const ProjectCard = ({ project, rank, onVoteChange, onDelete, currentUserId, onCardClick, onSaveChange }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const cancelButtonRef = useRef(null);
  const isCreator = currentUserId === project.creatorId;

  
  
  useEffect(() => {
    if (currentUserId) {
      checkSaveStatus();
    }
  }, [project._id, currentUserId]);

  
  useEffect(() => {
    if (!showDeleteConfirm) return;

    console.log("Delete modal opened - listening for Escape key and setting focus trap");

    const handleEscape = (e) => {
      console.log("Key pressed:", e.key);
      if (e.key === "Escape" && !isDeleting) {
        console.log("Escape pressed - closing modal");
        setShowDeleteConfirm(false);
      }
    };

    const handleFocusTrap = (e) => {
      
      const modal = document.querySelector('[role="alertdialog"]');
      if (!modal || !modal.contains(e.target)) {
        console.log("Focus trap - returning focus to modal");
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }
    };

    
    if (cancelButtonRef.current) {
      console.log("Setting focus to Cancel button");
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }

    
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("focus", handleFocusTrap, true);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("focus", handleFocusTrap, true);
    };
  }, [showDeleteConfirm, isDeleting]);

  const checkSaveStatus = async () => {
    if (!currentUserId) return;
    
    try {
      const result = await saveAPI.checkSave(project._id);
      console.log("Check save result for project", project._id, ":", result);
      if (result && result.isSaved !== undefined) {
        setIsSaved(result.isSaved);
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Error checking save status:", err);
      setIsSaved(false);
    }
  };

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      console.warn("No current user ID, cannot save");
      return;
    }
    
    setIsSaving(true);
    const oldSaveState = isSaved;
    
    try {
      const newSavedState = !isSaved;
      console.log("Toggling save state from", oldSaveState, "to", newSavedState, "for project", project._id);
      setIsSaved(newSavedState);
      
      
      if (newSavedState) {
        console.log("Calling saveAPI.saveProject");
        await saveAPI.saveProject(project._id);
      } else {
        console.log("Calling saveAPI.unsaveProject");
        await saveAPI.unsaveProject(project._id);
      }
      
      console.log("Save API call succeeded");
      
      
      if (onSaveChange) {
        console.log("Calling onSaveChange callback");
        onSaveChange(project._id, newSavedState);
      }
    } catch (err) {
      console.error("Error saving project:", err);
      
      setIsSaved(oldSaveState);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div
      onClick={() => onCardClick && onCardClick(project)}
      style={{
        background: isHovered 
          ? `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)`
          : `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
        border: `2px solid ${isHovered ? theme.neonBlue : "rgba(0, 212, 255, 0.2)"}`,
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        gap: "16px",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
        boxShadow: isHovered 
          ? theme.name === "Cyber Mode" ? `0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 20px rgba(0, 0, 0, 0.2)"
          : theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 10px rgba(0, 212, 255, 0.05)` : "0 0 10px rgba(0, 0, 0, 0.1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {rank && (
        <div style={{
          fontSize: "20px",
          fontWeight: "700",
          color: theme.neonBlue,
          minWidth: "32px",
          textAlign: "center",
          textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
        }}>
          #{rank}
        </div>
      )}

      <div style={{
        width: "80px",
        height: "80px",
        minWidth: "80px",
        borderRadius: "8px",
        overflow: "hidden",
        background: `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)`,
        border: `2px solid rgba(0, 212, 255, 0.3)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 15px rgba(0, 212, 255, 0.2)`
      }}>
        {project.imageUrl ? (
          <img
            src={project.imageUrl.startsWith('http') ? project.imageUrl : `http://localhost:5000${project.imageUrl}`}
            alt={project.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = "🚀";
            }}
          />
        ) : (
          <div style={{ fontSize: "32px" }}>🚀</div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "12px" }}>
          <span
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: theme.neonCyan,
              textDecoration: "none",
              lineHeight: "1.4",
              textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.target.style.color = theme.neonPink;
              e.target.style.textShadow = theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonPink}` : "none";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = theme.neonCyan;
              e.target.style.textShadow = theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none";
            }}
          >
            {project.title}
          </span>
        </div>

        <p style={{
          fontSize: "14px",
          color: theme.textDark,
          margin: "8px 0 0 0",
          lineHeight: "1.5"
        }}>
          {project.description}
        </p>

        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginTop: "12px",
          flexWrap: "wrap"
        }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            background: `linear-gradient(90deg, ${theme.neonBlue}, ${theme.neonPurple})`,
            color: theme.bg,
            padding: "4px 10px",
            borderRadius: "4px",
            boxShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {project.category}
          </span>

          {}
          {project.tags && project.tags.split(" ").slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "10px",
                fontWeight: "600",
                background: theme.name === "Cyber Mode"
                  ? `rgba(0, 255, 65, 0.1)`
                  : `rgba(0, 102, 204, 0.1)`,
                color: theme.name === "Cyber Mode" ? theme.neonGreen : "#0066cc",
                padding: "3px 8px",
                borderRadius: "12px",
                border: theme.name === "Cyber Mode"
                  ? `1px solid rgba(0, 255, 65, 0.3)`
                  : `1px solid rgba(0, 102, 204, 0.3)`,
                textTransform: "capitalize",
                whiteSpace: "nowrap"
              }}
            >
              {tag}
            </span>
          ))}
          
          {}
          <div style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            padding: "6px 10px",
            background: theme.name === "Cyber Mode" 
              ? `rgba(0, 212, 255, 0.05)` 
              : `rgba(0, 0, 0, 0.05)`,
            borderRadius: "20px",
            border: `1px solid ${theme.neonBlue}25`,
            boxShadow: theme.name === "Cyber Mode" ? `0 0 10px rgba(0, 212, 255, 0.1)` : "none",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = theme.name === "Cyber Mode" 
              ? `0 0 15px rgba(0, 212, 255, 0.3)` 
              : "0 0 10px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.background = theme.name === "Cyber Mode" 
              ? `rgba(0, 212, 255, 0.1)` 
              : `rgba(0, 0, 0, 0.1)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 10px rgba(0, 212, 255, 0.1)` : "none";
            e.currentTarget.style.background = theme.name === "Cyber Mode" 
              ? `rgba(0, 212, 255, 0.05)` 
              : `rgba(0, 0, 0, 0.05)`;
          }}
          >
            {project.creatorAvatar ? (
              <img
                src={project.creatorAvatar.startsWith('http') 
                  ? project.creatorAvatar 
                  : `http://localhost:5000${project.creatorAvatar}`}
                alt={project.creatorName}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `1.5px solid ${theme.neonBlue}`,
                  boxShadow: theme.name === "Cyber Mode" ? `0 0 8px ${theme.neonBlue}40` : "none"
                }}
                onError={(e) => {
                  e.target.replaceWith(
                    Object.assign(document.createElement('div'), {
                      innerHTML: project.creatorName.charAt(0).toUpperCase(),
                      style: `width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonPurple}); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: ${theme.bg}; box-shadow: ${theme.name === "Cyber Mode" ? `0 0 8px ${theme.neonBlue}` : "none"}`
                    })
                  );
                }}
              />
            ) : (
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonPurple})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: theme.bg,
                boxShadow: theme.name === "Cyber Mode" ? `0 0 8px ${theme.neonBlue}` : "none"
              }}>
                {project.creatorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{
              fontSize: "12px",
              color: theme.neonCyan,
              fontWeight: "600",
              textShadow: theme.name === "Cyber Mode" ? `0 0 4px ${theme.neonCyan}40` : "none"
            }}>
              {project.creatorName}
            </span>
          </div>
          
          <span style={{ fontSize: "12px", color: theme.textDark }}>
            {formatTime(project.createdAt)}
          </span>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        minWidth: "fit-content"
      }}
      onClick={(e) => e.stopPropagation()}>
        <UpvoteButton
          project={project}
          onVoteChange={onVoteChange}
        />
        {currentUserId && (
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `2px solid ${isSaved ? theme.neonPurple : theme.neonCyan}`,
              background: isSaved 
                ? `rgba(${theme.neonPurple === "#b026ff" ? "176, 38, 255" : "156, 39, 176"}, 0.15)`
                : `rgba(0, 212, 255, 0.1)`,
              color: isSaved ? theme.neonPurple : theme.neonCyan,
              fontSize: "12px",
              fontWeight: "700",
              cursor: isSaving ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              boxShadow: theme.name === "Cyber Mode" 
                ? isSaved 
                  ? `0 0 10px rgba(176, 38, 255, 0.3)`
                  : `0 0 10px rgba(0, 212, 255, 0.2)`
                : "0 0 5px rgba(0, 0, 0, 0.1)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              opacity: isSaving ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.target.style.boxShadow = theme.name === "Cyber Mode" 
                  ? isSaved
                    ? `0 0 20px ${theme.neonPurple}, inset 0 0 15px rgba(176, 38, 255, 0.2)`
                    : `0 0 20px ${theme.neonCyan}, inset 0 0 15px rgba(0, 212, 255, 0.2)`
                  : "0 0 10px rgba(0, 0, 0, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" 
                ? isSaved 
                  ? `0 0 10px rgba(176, 38, 255, 0.3)`
                  : `0 0 10px rgba(0, 212, 255, 0.2)`
                : "0 0 5px rgba(0, 0, 0, 0.1)";
            }}
            title={isSaved ? "Remove from saved" : "Save project"}
          >
            {isSaved ? "💾" : "📌"}
          </button>
        )}
        {isCreator && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `2px solid ${theme.neonPink}`,
              background: `rgba(255, 0, 110, 0.1)`,
              color: theme.neonPink,
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              boxShadow: theme.name === "Cyber Mode" ? "0 0 10px rgba(255, 0, 110, 0.2)" : "0 0 5px rgba(0, 0, 0, 0.1)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonPink}, inset 0 0 15px rgba(255, 0, 110, 0.2)` : "0 0 10px rgba(0, 0, 0, 0.2)";
              e.target.style.borderColor = theme.neonPink;
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = theme.name === "Cyber Mode" ? "0 0 10px rgba(255, 0, 110, 0.2)" : "0 0 5px rgba(0, 0, 0, 0.1)";
              e.target.style.borderColor = theme.neonPink;
            }}
            title="Delete this project"
          >
            🗑️
          </button>
        )}
      </div>

      {}
      {showDeleteConfirm && createPortal(
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              pointerEvents: "auto",
              cursor: "default"
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Overlay clicked");
              if (!isDeleting) {
                console.log("Closing modal from overlay click");
                setShowDeleteConfirm(false);
              }
            }}
            onMouseDown={(e) => {
              console.log("Overlay mouse down - preventing default");
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-hidden="true"
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
              zIndex: 10000,
              color: theme.text,
              boxShadow: theme.name === "Cyber Mode"
                ? `0 0 40px rgba(255, 0, 110, 0.4), 0 0 80px rgba(255, 0, 110, 0.2)`
                : "0 0 30px rgba(0, 0, 0, 0.3)",
              animation: "modalSlideIn 0.3s ease-out",
              pointerEvents: "auto"
            }}
            onClick={(e) => {
              console.log("Modal clicked");
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-message"
            tabIndex={-1}
          >
            <style>{`
              @keyframes modalSlideIn {
                from {
                  opacity: 0;
                  transform: translate(-50%, -55%);
                }
                to {
                  opacity: 1;
                  transform: translate(-50%, -50%);
                }
              }
            `}</style>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <h2 
                id="delete-title"
                style={{
                fontSize: "20px",
                fontWeight: "700",
                color: theme.neonPink,
                margin: "0 0 12px 0",
                textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonPink}` : "none"
              }}>
                Delete Project?
              </h2>
              <p style={{
                fontSize: "14px",
                color: theme.textDark,
                margin: "0 0 8px 0",
                lineHeight: "1.6"
              }}>
                You're about to permanently delete:
              </p>
              <p style={{
                fontSize: "15px",
                fontWeight: "700",
                color: theme.neonCyan,
                margin: "12px 0 24px 0",
                wordBreak: "break-word",
                textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
              }}>
                "{project.title}"
              </p>
              <p 
                id="delete-message"
                style={{
                fontSize: "12px",
                color: theme.textDark,
                margin: "0 0 24px 0",
                fontStyle: "italic",
                opacity: 0.8
              }}>
                This action cannot be undone.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  ref={cancelButtonRef}
                  onClick={() => !isDeleting && setShowDeleteConfirm(false)}
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
                    opacity: isDeleting ? 0.5 : 1,
                    outline: "none"
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
                  onClick={async (e) => {
                    console.log("Delete button clicked");
                    e.stopPropagation();
                    e.preventDefault();
                    setIsDeleting(true);
                    console.log("Starting delete process for project:", project._id);
                    try {
                      const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
                        method: "DELETE",
                        headers: {
                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                      });
                      console.log("Delete response:", response.status);
                      setShowDeleteConfirm(false);
                      onDelete(project._id);
                      console.log("Project deleted successfully");
                    } catch (err) {
                      console.error("Delete failed:", err);
                      setIsDeleting(false);
                    }
                  }}
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
                    opacity: isDeleting ? 0.7 : 1,
                    outline: "none",
                    pointerEvents: "auto"
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
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default ProjectCard;

