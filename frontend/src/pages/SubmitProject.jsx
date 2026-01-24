import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./SubmitProject.css";

const SubmitProject = ({ user, onNavigate, onProjectSubmit }) => {
  const { theme } = useTheme();
  
  
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem("submitProjectDraft");
    return savedDraft ? JSON.parse(savedDraft) : {
      title: "",
      description: "",
      link: "",
      category: "🤖 Artificial Intelligence",
      tags: "",
      images: [],
      videoUrl: "",
      customCategory: ""
    };
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);
  
  const [draggedImage, setDraggedImage] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [draftSaved, setDraftSaved] = useState(false);

  const categories = [
    "🤖 Artificial Intelligence",
    "🌐 Web Development",
    "📱 Mobile Apps",
    "🎮 Game Development",
    "⚙️ SaaS Solutions",
    "🎨 Design & UI/UX",
    "💳 FinTech",
    "📚 EdTech",
    "🏥 HealthTech",
    "🚚 Logistics",
    "🛒 E-Commerce",
    "+ Add Custom Category"
  ];

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.values(formData).some(val => val)) {
        localStorage.setItem("submitProjectDraft", JSON.stringify(formData));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Project title is required";
        if (value.length < 3) return "Title must be at least 3 characters";
        if (value.length > 100) return "Title must be less than 100 characters";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length < 10) return "Description must be at least 10 characters";
        if (value.length > 2000) return "Description must be less than 2000 characters";
        return "";
      case "link":
        if (!value.trim()) return "Project link is required";
        try {
          new URL(value);
          return "";
        } catch {
          return "Please enter a valid URL";
        }
      default:
        return "";
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    addImages(files);
  };

  const addImages = (files) => {
    const newPreviews = [];
    let loadedCount = 0;

    files.forEach(file => {
      if (imagePreviews.length + newPreviews.length < 5) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          loadedCount++;
          if (loadedCount === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...files]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const reorderImages = (fromIdx, toIdx) => {
    
    const newPreviews = [...imagePreviews];
    const newImages = [...formData.images];
    
    [newPreviews[fromIdx], newPreviews[toIdx]] = [newPreviews[toIdx], newPreviews[fromIdx]];
    [newImages[fromIdx], newImages[toIdx]] = [newImages[toIdx], newImages[fromIdx]];
    
    setImagePreviews(newPreviews);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setDraggedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const newErrors = {};
    newErrors.title = validateField("title", formData.title);
    newErrors.description = validateField("description", formData.description);
    newErrors.link = validateField("link", formData.link);

    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      setMessage("");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("category", formData.category === "+ Add Custom Category" ? formData.customCategory : formData.category);
      if (formData.tags) formDataToSend.append("tags", formData.tags);
      if (formData.videoUrl) formDataToSend.append("videoUrl", formData.videoUrl);

      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const newProject = await response.json();
        setMessage("✓ Project submitted successfully!");
        
        
        setFormData({
          title: "",
          description: "",
          link: "",
          category: "🤖 Artificial Intelligence",
          tags: "",
          images: [],
          videoUrl: "",
          customCategory: ""
        });
        setImagePreviews([]);
        localStorage.removeItem("submitProjectDraft");
        
        if (onProjectSubmit) {
          onProjectSubmit(newProject);
        }
        
        setTimeout(() => onNavigate("home"), 2000);
      } else {
        const data = await response.json();
        setMessage(`✕ ${data.message || "Failed to submit project"}`);
      }
    } catch (err) {
      setMessage("✕ Error submitting project");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
          padding: "40px 24px",
          color: theme.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: theme.neonPink,
              marginBottom: "16px"
            }}
          >
            Please Login First
          </h2>
          <p style={{ color: theme.textDark, marginBottom: "20px" }}>
            You need to be logged in to submit a project
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={theme.name === "Cyber Mode" ? "dark-mode" : "light-mode"}
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(10, 14, 39, 0.95) 100%)`,
        padding: "40px 24px",
        color: theme.text
      }}
    >
      <div className="submit-project-container">
        {}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => onNavigate("home")}
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
              fontSize: "36px",
              fontWeight: "700",
              color: theme.neonCyan,
              margin: "0 0 8px 0",
              textShadow: theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonBlue}` : "none",
              letterSpacing: "1px"
            }}
          >
            🚀 Submit Your Product
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: theme.textDark,
              margin: "0"
            }}
          >
            Share your Georgian startup with our community
          </p>
        </div>

        {}
        <form
          className="submit-project-form"
          onSubmit={handleSubmit}
          style={{
            background: theme.name === "Cyber Mode" ? `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)` : "#fff",
            border: `2px solid ${theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.2)" : "#007bff"}`,
            borderRadius: "10px",
            padding: "32px",
            boxShadow: theme.name === "Cyber Mode" ? `0 0 20px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="form-label" style={{ color: theme.neonCyan }}>
                Project Title *
              </label>
              <span style={{ fontSize: "12px", color: theme.textDark }}>
                {formData.title.length}/100
              </span>
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your project name"
              maxLength="100"
              required
              className="form-input"
              style={{
                borderColor: errors.title ? theme.neonPink : (theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc")
              }}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="form-label" style={{ color: theme.neonCyan }}>
                Description *
              </label>
              <span style={{ fontSize: "12px", color: theme.textDark }}>
                {formData.description.length}/2000
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project in detail..."
              maxLength="2000"
              required
              className="form-textarea"
              style={{
                borderColor: errors.description ? theme.neonPink : (theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc")
              }}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
            <div style={{ fontSize: "12px", color: theme.textDark, marginTop: "4px" }}>
              💡 Tip: Describe your product's features, benefits, and what makes it unique
            </div>
          </div>

          {}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.neonCyan }}>
              Project Link *
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              required
              className="form-input"
              style={{
                borderColor: errors.link ? theme.neonPink : (theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc")
              }}
            />
            {errors.link && <div className="error-message">{errors.link}</div>}
          </div>

          {}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.neonCyan }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
              style={{
                borderColor: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc",
                color: theme.name === "Cyber Mode" ? "#00d4ff" : "#333"
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {}
          {formData.category === "+ Add Custom Category" && (
            <div className="form-group">
              <label className="form-label" style={{ color: theme.neonCyan }}>
                Custom Category
              </label>
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleInputChange}
                placeholder="e.g., Green Tech, Web3"
                className="form-input"
                style={{
                  borderColor: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc"
                }}
              />
            </div>
          )}

          {}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.neonCyan }}>
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="#FinTech #Education #AI"
              className="form-input"
              style={{
                borderColor: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc"
              }}
            />
            <div style={{ fontSize: "12px", color: theme.textDark, marginTop: "4px" }}>
              Separate tags with spaces (e.g., #StartUp #Innovation #Tech)
            </div>
          </div>

          {}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.neonCyan }}>
              Demo Video URL (Optional)
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
              className="form-input"
              style={{
                borderColor: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.25)" : "#0066cc"
              }}
            />
            <div style={{ fontSize: "12px", color: theme.textDark, marginTop: "4px" }}>
              🎥 YouTube, Vimeo, or other video platform links
            </div>
          </div>

          {}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.neonCyan }}>
              Project Images (Up to 5)
            </label>
            
            <label
              className="image-upload-zone"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("drag-over");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("drag-over");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                handleDragDrop(e);
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e)}
                style={{ display: "none" }}
              />
              <div style={{ textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                <p style={{ color: theme.neonCyan, fontWeight: "600", marginBottom: "4px" }}>Drop images here or click to select</p>
                <p style={{ fontSize: "12px", color: theme.textDark }}>PNG, JPG, WebP • Max 5 images</p>
              </div>
            </label>
            {imagePreviews.length > 0 && (
              <>
                <div style={{ fontSize: "12px", color: theme.textDark, marginBottom: "12px", fontStyle: "italic" }}>
                  💡 Drag images to reorder them. First image will be the thumbnail.
                </div>
                <div className="image-preview-grid">
                  {imagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className={`image-preview-item ${draggedImage === idx ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => setDraggedImage(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedImage !== null && draggedImage !== idx) {
                          reorderImages(draggedImage, idx);
                        }
                      }}
                      onClick={() => setSelectedImageIdx(idx)}
                    >
                      {idx === 0 && <div className="image-badge">🏠 Cover</div>}
                      <img
                        src={preview}
                        alt={`Preview ${idx}`}
                        className="image-preview-img"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="image-remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {}
                {selectedImageIdx !== null && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                      }}
                      onClick={() => setSelectedImageIdx(null)}
                    />
                    <div
                      style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: theme.bg,
                        border: `2px solid ${theme.neonBlue}`,
                        borderRadius: "12px",
                        padding: "20px",
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        zIndex: 1001,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                      }}
                    >
                      <img
                        src={imagePreviews[selectedImageIdx]}
                        alt="Full view"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "70vh",
                          objectFit: "contain",
                          borderRadius: "8px"
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: theme.text,
                          fontSize: "14px"
                        }}
                      >
                        <span>Image {selectedImageIdx + 1} of {imagePreviews.length}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : imagePreviews.length - 1))}
                            style={{
                              padding: "8px 12px",
                              background: theme.neonBlue,
                              color: theme.bg,
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "700"
                            }}
                          >
                            ← Prev
                          </button>
                          <button
                            onClick={() => setSelectedImageIdx((prev) => (prev < imagePreviews.length - 1 ? prev + 1 : 0))}
                            style={{
                              padding: "8px 12px",
                              background: theme.neonBlue,
                              color: theme.bg,
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "700"
                            }}
                          >
                            Next →
                          </button>
                          <button
                            onClick={() => setSelectedImageIdx(null)}
                            style={{
                              padding: "8px 12px",
                              background: theme.neonPink,
                              color: theme.bg,
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "700"
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              background: theme.name === "Cyber Mode" ? "linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)" : "linear-gradient(135deg, #0066cc 0%, #003d7a 100%)",
              color: theme.name === "Cyber Mode" ? "#0a0e1b" : "#fff"
            }}
          >
            {loading ? "⏳ Submitting..." : "🚀 Submit Project"}
          </button>

          {}
          {draftSaved && (
            <div style={{
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              background: `rgba(0, 255, 136, 0.1)`,
              color: theme.neonGreen,
              border: `1px solid ${theme.neonGreen}`,
              textAlign: "center",
              animation: "fadeIn 0.3s ease"
            }}>
              ✓ Draft saved automatically
            </div>
          )}

          {message && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                background: message.includes("✓") ? `rgba(0, 255, 136, 0.1)` : `rgba(255, 0, 110, 0.1)`,
                color: message.includes("✓") ? theme.neonGreen : theme.neonPink,
                border: `2px solid ${message.includes("✓") ? theme.neonGreen : theme.neonPink}`,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                animation: "slideIn 0.3s ease"
              }}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;

