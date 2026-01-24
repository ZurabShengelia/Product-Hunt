import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";
import Notifications from "./Notifications";
import Friends from "./Friends";
import SubmitProject from "./SubmitProject";
import { projectAPI, authAPI, saveAPI, userProjectsAPI, messagesAPI, friendsAPI } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import "./Home.css";

const CATEGORY_MAP = {
  "category-ai": "🤖 Artificial Intelligence",
  "category-web": "🌐 Web Development",
  "category-mobile": "📱 Mobile Apps",
  "category-game": "🎮 Game Development",
  "category-saas": "⚙️ SaaS Solutions",
  "category-design": "🎨 Design & UI/UX",
  "category-fintech": "💳 FinTech",
  "category-edtech": "📚 EdTech",
  "category-healthtech": "🏥 HealthTech",
  "category-logistics": "🚚 Logistics",
  "category-ecommerce": "🛒 E-Commerce",
  "category-custom": "➕ Custom Categories"
};

const Home = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingMyProjects, setLoadingMyProjects] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [rankingMode, setRankingMode] = useState("all-time");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [projectOfDay, setProjectOfDay] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  
  useEffect(() => {
    console.log("Home component mounted");
    
    
    loadProjects();
    
    
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "exists" : "missing");
    
    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log("User from localStorage:", userData);
        setUser(userData);
        
      }
    }
  }, []);

  
  useEffect(() => {
    console.log("User effect triggered with user:", user);
    if (user?._id) {
      console.log("Loading my projects and saved projects for user:", user._id);
      loadMyProjects(user._id);
      loadSavedProjects(user._id);
    } else {
      console.log("No user ID, clearing my projects and saved projects");
      setMyProjects([]);
      setSavedProjects([]);
    }
  }, [user]);

  
  useEffect(() => {
    if (user?._id) {
      const fetchUnreadMessages = async () => {
        try {
          const res = await messagesAPI.getUnreadCount();
          if (res.success) {
            setUnreadMessageCount(res.data || 0);
          }
        } catch (err) {
          console.error("Error fetching unread messages:", err);
        }
      };
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 5000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  
  useEffect(() => {
    if (user?._id) {
      const fetchPendingRequests = async () => {
        try {
          const res = await friendsAPI.getPendingRequests();
          if (res.success && Array.isArray(res.data)) {
            setPendingRequestCount(res.data.length);
          }
        } catch (err) {
          console.error("Error fetching pending requests:", err);
        }
      };
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 15000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      const fetchNotificationCount = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const response = await fetch("http://localhost:5000/api/notifications/unread-count", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            setNotificationRefreshTrigger(prev => prev + 1);
          }
        } catch (err) {
          console.error("Error fetching notification count:", err);
        }
      };
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (projects.length > 0) {
      const topProject = projects.reduce((top, p) => 
        p.upvotes > top.upvotes ? p : top
      );
      setProjectOfDay(topProject);
    }
  }, [projects]);

  useEffect(() => {
    let filtered = [...projects];

    
    if (currentPage === "home") {
      const now = new Date();
      filtered = filtered.filter(p => {
        const projectDate = new Date(p.createdAt);
        if (rankingMode === "today") {
          return projectDate.toDateString() === now.toDateString();
        } else if (rankingMode === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return projectDate >= weekAgo;
        }
        return true; 
      });
    }

    
    filtered = filtered.sort((a, b) => b.upvotes - a.upvotes);

    
    if (currentPage === "home") {
      filtered = filtered.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = !selectedCategory || p.category === selectedCategory;
        return matchSearch && matchCategory;
      });
    }

    setFilteredProjects(filtered);
  }, [searchTerm, projects, selectedCategory, currentPage, rankingMode]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getAll();
      setProjects(data.sort((a, b) => b.upvotes - a.upvotes));
      setError("");
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedProjects = async (userId) => {
    if (!userId) {
      setSavedProjects([]);
      return;
    }

    try {
      const data = await saveAPI.getSavedProjects();
      console.log("Saved Projects API response:", data);
      
      if (data && Array.isArray(data)) {
        console.log("Setting savedProjects to:", data);
        setSavedProjects(data);
        
        localStorage.setItem("savedProjects", JSON.stringify(data));
      } else if (data && data.error) {
        console.error("API error:", data.error);
        
        const cached = localStorage.getItem("savedProjects");
        setSavedProjects(cached ? JSON.parse(cached) : []);
      } else {
        console.warn("Unexpected data format:", data);
        
        const cached = localStorage.getItem("savedProjects");
        setSavedProjects(cached ? JSON.parse(cached) : []);
      }
    } catch (err) {
      console.error("Error loading saved projects:", err);
      
      const cached = localStorage.getItem("savedProjects");
      setSavedProjects(cached ? JSON.parse(cached) : []);
    }
  };

  const loadMyProjects = async (userId) => {
    if (!userId) {
      setMyProjects([]);
      return;
    }

    setLoadingMyProjects(true);
    try {
      const data = await userProjectsAPI.getMyProjects();
      console.log("My Projects API response:", data);
      
      let projects = [];
      if (Array.isArray(data)) {
        projects = data;
      } else if (data && Array.isArray(data.projects)) {
        projects = data.projects;
      } else if (data && Array.isArray(data.data)) {
        projects = data.data;
      }
      
      setMyProjects(projects);
      
      localStorage.setItem("myProjects", JSON.stringify(projects));
    } catch (err) {
      console.error("Error loading my projects:", err);
      
      const cached = localStorage.getItem("myProjects");
      if (cached) {
        setMyProjects(JSON.parse(cached));
      } else {
        setMyProjects([]);
      }
    } finally {
      setLoadingMyProjects(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const result = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password, username);
      if (result.error) return setError(result.error);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setEmail("");
      setPassword("");
      setUsername("");
      setShowAuthForm(false);
      setToast({ message: isLogin ? "Logged in!" : "Welcome!", type: "success" });
      setError("");
    } catch (error) {
      setError("Auth failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUserData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const handleVoteChange = (updatedProject) => {
    const updated = projects.map(p => p._id === updatedProject._id ? updatedProject : p)
      .sort((a, b) => b.upvotes - a.upvotes);
    setProjects(updated);
  };

  const handleDelete = (projectId) => {
    setProjects(projects.filter(p => p._id !== projectId));
    setToast({ message: "Project deleted", type: "success" });
  };

  const categories = ["AI", "Web", "Mobile", "Game", "SaaS", "Design"];
  
  // Map short names to full category names
  const categoryMap = {
    "AI": "🤖 Artificial Intelligence",
    "Web": "🌐 Web Development",
    "Mobile": "📱 Mobile Apps",
    "Game": "🎮 Game Development",
    "SaaS": "⚙️ SaaS Solutions",
    "Design": "🎨 Design & UI/UX"
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      position: "relative",
      overflow: "visible"
    },
    content: {
      maxWidth: "1200px",
      padding: "30px 24px",
      position: "relative",
      zIndex: 1
    },
    hero: {
      marginBottom: "40px",
      paddingBottom: "30px",
      borderBottom: `1px solid ${theme.neonBlue}40`,
      textAlign: "center"
    },
    heroTitle: {
      fontSize: "42px",
      fontWeight: "700",
      color: theme.name === "Cyber Mode" ? theme.neonCyan : theme.neonBlue,
      marginBottom: "12px",
      letterSpacing: "-1px",
      textShadow: theme.name === "Cyber Mode" ? `0 0 15px ${theme.neonBlue}` : "none",
      position: "relative",
      zIndex: 10
    },
    heroSubtitle: {
      fontSize: "16px",
      color: theme.textDark,
      marginBottom: "24px",
      maxWidth: "600px",
      margin: "12px auto 24px"
    },
    heroCTA: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      flexWrap: "wrap"
    },
    primaryButton: {
      padding: "12px 28px",
      background: `linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.1) 100%)`,
      border: `2px solid ${theme.neonBlue}`,
      color: theme.neonBlue,
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "14px",
      fontFamily: "inherit",
      transition: "all 0.3s ease",
      boxShadow: `0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)`,
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    projectOfDay: {
      background: `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%)`,
      border: `2px solid ${theme.neonBlue}`,
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "30px",
      boxShadow: theme.name === "Cyber Mode" ? `0 0 40px rgba(0, 212, 255, 0.2), inset 0 0 40px rgba(0, 212, 255, 0.05)` : "0 0 20px rgba(0, 0, 0, 0.1)",
      position: "relative"
    },
    podLabel: {
      fontSize: "12px",
      fontWeight: "700",
      color: theme.neonGreen,
      textTransform: "uppercase",
      letterSpacing: "2px",
      marginBottom: "8px",
      textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonGreen}` : "none"
    },
    podTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: theme.neonCyan,
      marginBottom: "8px",
      textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonCyan}` : "none"
    },
    rankingModes: {
      display: "flex",
      gap: "20px",
      marginBottom: "24px",
      borderBottom: `1px solid rgba(0, 212, 255, 0.2)`,
      paddingBottom: "12px"
    },
    rankingButton: {
      padding: "8px 0",
      background: "none",
      border: "none",
      color: theme.textDark,
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      borderBottom: "2px solid transparent",
      marginBottom: "-17px",
      fontFamily: "inherit",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    categoryTabs: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap"
    },
    categoryTag: {
      padding: "8px 16px",
      borderRadius: "20px",
      border: `2px solid rgba(0, 212, 255, 0.3)`,
      background: `rgba(0, 212, 255, 0.05)`,
      color: theme.neonBlue,
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      boxShadow: "0 0 10px rgba(0, 212, 255, 0.1)",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    form: {
      background: theme.name === "Cyber Mode" ? `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%)` : "#fff",
      padding: "24px",
      borderRadius: "12px",
      marginBottom: "30px",
      border: `2px solid ${theme.name === "Cyber Mode" ? theme.neonBlue : "#007bff"}`,
      boxShadow: theme.name === "Cyber Mode" ? `0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05)` : "0 0 10px rgba(0, 0, 0, 0.1)",
      backdropFilter: theme.name === "Cyber Mode" ? "blur(10px)" : "none"
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "14px",
      border: `2px solid ${theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.3)" : "#007bff"}`,
      borderRadius: "8px",
      fontSize: "14px",
      background: theme.name === "Cyber Mode" ? `rgba(10, 14, 39, 0.6)` : "#fff",
      color: theme.name === "Cyber Mode" ? theme.neonBlue : "#000",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "all 0.3s ease",
      boxShadow: theme.name === "Cyber Mode" ? "0 0 10px rgba(0, 212, 255, 0.1)" : "0 0 5px rgba(0, 0, 0, 0.1)"
    },
    error: {
      background: `rgba(255, 0, 110, 0.1)`,
      color: theme.neonPink,
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      border: `2px solid ${theme.neonPink}`,
      boxShadow: theme.name === "Cyber Mode" ? `0 0 20px rgba(255, 0, 110, 0.2)` : "0 0 10px rgba(0, 0, 0, 0.1)",
      textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonPink}` : "none"
    },
    loadingText: {
      color: theme.textDark,
      textAlign: "center",
      padding: "60px 20px",
      fontSize: "16px"
    },
    emptyState: {
      background: `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%)`,
      border: `2px solid ${theme.neonBlue}`,
      borderRadius: "12px",
      padding: "60px 20px",
      textAlign: "center",
      color: theme.textDark,
      boxShadow: `0 0 20px rgba(0, 212, 255, 0.1)`
    },
    projectsList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    sectionTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: theme.neonCyan,
      marginBottom: "20px",
      marginTop: "30px",
      textShadow: theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonBlue}` : "none",
      textTransform: "uppercase",
      letterSpacing: "1px"
    }
  };

  return (
    <div style={styles.container}>
      {user && (
        <Sidebar 
          user={user}
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === "logout") {
              handleLogout();
              setCurrentPage("home");
            } else if (page.startsWith("category-")) {
              setCurrentPage("home");
              setSelectedCategory(CATEGORY_MAP[page] || "");
            } else {
              setCurrentPage(page);
            }
          }}
          onLogout={handleLogout}
          notificationRefreshTrigger={notificationRefreshTrigger}
          unreadMessageCount={unreadMessageCount}
          pendingRequestCount={pendingRequestCount}
        />
      )}

      <NavBar 
        user={user} 
        onLogout={handleLogout} 
        onShowAuth={() => {
          setShowAuthForm(true);
          setIsLogin(true);
          setError("");
        }}
        onSearch={setSearchTerm}
        onNavigate={setCurrentPage}
      />

      <div className="home-content" style={{
        ...styles.content,
        position: "relative",
        zIndex: 100,
      }}>
        {error && <div style={styles.error}>⚠️ {error}</div>}

        {currentPage === "home" && (
          <>
            <div style={styles.hero}>
              <h1 style={styles.heroTitle}>Georgian StartUps</h1>
              <p style={styles.heroSubtitle}>
                Discover innovative Georgian products. Upvote your favorites and join our community.
              </p>
              <div style={styles.heroCTA}>
                <button
                  onClick={() => {
                    if (user) setCurrentPage("submit");
                    else {
                      setShowAuthForm(true);
                      setIsLogin(true);
                    }
                  }}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = `0 0 30px ${theme.neonBlue}, inset 0 0 30px rgba(0, 212, 255, 0.2)`;
                    e.target.style.borderColor = theme.neonCyan;
                    e.target.style.color = theme.neonCyan;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = `0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)`;
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.color = theme.neonBlue;
                  }}
                >
                  + Submit Product
                </button>
                {!user && (
                  <button
                    onClick={() => {
                      setShowAuthForm(true);
                      setIsLogin(true);
                    }}
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = `0 0 30px ${theme.neonPink}, inset 0 0 30px rgba(255, 0, 110, 0.2)`;
                      e.target.style.borderColor = theme.neonPink;
                      e.target.style.color = theme.neonPink;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = `0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)`;
                      e.target.style.borderColor = theme.neonBlue;
                      e.target.style.color = theme.neonBlue;
                    }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {projectOfDay && (
              <div style={styles.projectOfDay}>
                <div style={styles.podLabel}>🏆 Featured Today</div>
                <div style={styles.podTitle}>{projectOfDay.title}</div>
                <p style={{ color: theme.textDark, marginBottom: "16px" }}>{projectOfDay.description}</p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    background: `linear-gradient(90deg, ${theme.neonBlue}, ${theme.neonPurple})`,
                    color: theme.bg,
                    padding: "4px 12px",
                    borderRadius: "4px",
                    textShadow: "none",
                    boxShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
                  }}>
                    {projectOfDay.category}
                  </span>
                  <span style={{ fontSize: "13px", color: theme.textDark }}>
                    👤 {projectOfDay.creatorName}
                  </span>
                </div>
              </div>
            )}

            <div style={styles.rankingModes}>
              {["today", "week", "all-time"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setRankingMode(mode)}
                  style={{
                    ...styles.rankingButton,
                    color: rankingMode === mode ? theme.neonBlue : theme.textDark,
                    borderBottom: rankingMode === mode ? `2px solid ${theme.neonBlue}` : "2px solid transparent",
                    textShadow: rankingMode === mode && theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none"
                  }}
                >
                  {mode === "today" ? "TODAY" : mode === "week" ? "THIS WEEK" : "ALL TIME"}
                </button>
              ))}
            </div>

            <div style={styles.categoryTabs}>
              <button
                onClick={() => setSelectedCategory("")}
                style={{
                  ...styles.categoryTag,
                  borderColor: selectedCategory === "" ? theme.neonBlue : "rgba(0, 212, 255, 0.3)",
                  background: selectedCategory === "" ? `rgba(0, 212, 255, 0.15)` : `rgba(0, 212, 255, 0.05)`,
                  boxShadow: selectedCategory === "" && theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonBlue}` : "0 0 10px rgba(0, 212, 255, 0.1)"
                }}
              >
                ALL
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(categoryMap[cat])}
                  style={{
                    ...styles.categoryTag,
                    borderColor: selectedCategory === categoryMap[cat] ? theme.neonBlue : "rgba(0, 212, 255, 0.3)",
                    background: selectedCategory === categoryMap[cat] ? `rgba(0, 212, 255, 0.15)` : `rgba(0, 212, 255, 0.05)`,
                    boxShadow: selectedCategory === categoryMap[cat] && theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonBlue}` : "0 0 10px rgba(0, 212, 255, 0.1)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={styles.loadingText}>⌛ Loading products...</div>
            ) : filteredProjects.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No products found. Try adjusting filters or be the first to submit!</p>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {filteredProjects.map((project, idx) => (
                  <ProjectCard 
                    key={project._id}
                    project={project}
                    rank={idx + 1}
                    onVoteChange={handleVoteChange}
                    onDelete={handleDelete}
                    currentUserId={user?._id}
                    onCardClick={setSelectedProject}
                    onSaveChange={() => loadSavedProjects(user?._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentPage === "trending" && (
          <>
            <h2 style={styles.sectionTitle}>🔥 Trending Now</h2>
            {loading ? (
              <div style={styles.loadingText}>⌛ Loading...</div>
            ) : filteredProjects.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No projects yet. Be first!</p>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {filteredProjects.slice(0, 10).map((project, idx) => (
                  <ProjectCard 
                    key={project._id}
                    project={project}
                    rank={idx + 1}
                    onVoteChange={handleVoteChange}
                    onDelete={handleDelete}
                    currentUserId={user?._id}
                    onCardClick={setSelectedProject}
                    onSaveChange={() => loadSavedProjects(user?._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentPage === "submit" && (
          <SubmitProject 
            user={user} 
            onNavigate={setCurrentPage}
            onProjectSubmit={(newProject) => {
              setProjects(prev => [newProject, ...prev]);
              setFilteredProjects(prev => [newProject, ...prev]);
            }}
          />
        )}

        {currentPage === "profile" && (
          <UserProfile 
            user={user}
            onNavigate={setCurrentPage}
            onUserUpdate={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }}
          />
        )}

        {currentPage === "change-password" && (
          <ChangePassword 
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === "change-email" && (
          <ChangeEmail 
            currentEmail={user?.email}
            onNavigate={(page) => {
              refreshUserData();
              setCurrentPage(page);
            }}
          />
        )}

        {currentPage.startsWith("category-") && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700", textTransform: "capitalize" }}>
              {currentPage.replace("category-", "")} Projects
            </h2>
            {loading ? (
              <div style={styles.loadingText}>⌛ Loading...</div>
            ) : (
              <div style={styles.projectsList}>
                {projects
                  .filter(p => p.category?.toLowerCase() === currentPage.replace("category-", "").toLowerCase())
                  .map((project, idx) => (
                    <ProjectCard 
                      key={project._id}
                      project={project}
                      rank={idx + 1}
                      onVoteChange={handleVoteChange}
                      onDelete={handleDelete}
                      currentUserId={user?._id}
                      onCardClick={setSelectedProject}
                      onSaveChange={() => loadSavedProjects(user?._id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {currentPage === "overview" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700" }}>📊 Dashboard Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div style={{ background: theme.bgLight, padding: "20px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDark, fontSize: "14px" }}>Total Projects</p>
                <p style={{ color: theme.neonCyan, fontSize: "28px", fontWeight: "700" }}>{projects.length}</p>
              </div>
              <div style={{ background: theme.bgLight, padding: "20px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDark, fontSize: "14px" }}>Total Upvotes</p>
                <p style={{ color: theme.neonGreen, fontSize: "28px", fontWeight: "700" }}>{projects.reduce((sum, p) => sum + p.upvotes, 0)}</p>
              </div>
              <div style={{ background: theme.bgLight, padding: "20px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDark, fontSize: "14px" }}>Your Projects</p>
                <p style={{ color: theme.neonPink, fontSize: "28px", fontWeight: "700" }}>{myProjects.length}</p>
              </div>
              <div style={{ background: theme.bgLight, padding: "20px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDark, fontSize: "14px" }}>Saved Projects</p>
                <p style={{ color: theme.neonPurple, fontSize: "28px", fontWeight: "700" }}>{savedProjects.length}</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === "statistics" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700" }}>📈 Detailed Statistics</h2>
            <div style={{ background: theme.bgLight, padding: "24px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
              <p style={{ marginBottom: "16px", color: theme.text }}>Top Project: <strong>{projectOfDay?.title || "N/A"}</strong></p>
              <p style={{ marginBottom: "16px", color: theme.text }}>Top Project Upvotes: <strong>{projectOfDay?.upvotes || 0}</strong></p>
              <p style={{ marginBottom: "16px", color: theme.text }}>Most Popular Category: <strong>{projects.length > 0 ? projects[0].category : "N/A"}</strong></p>
              <p style={{ color: theme.text }}>Average Upvotes: <strong>{(projects.reduce((sum, p) => sum + p.upvotes, 0) / projects.length || 0).toFixed(1)}</strong></p>
            </div>
          </div>
        )}

        {currentPage === "analytics" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700" }}>📉 Analytics</h2>
            <div style={{ background: theme.bgLight, padding: "24px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
              <p style={{ marginBottom: "12px", color: theme.text }}>📊 Total Projects: {projects.length}</p>
              <p style={{ marginBottom: "12px", color: theme.text }}>👥 Active Projects: {projects.filter(p => p.upvotes > 0).length}</p>
              <p style={{ marginBottom: "12px", color: theme.text }}>🔝 Highest Upvotes: {Math.max(...projects.map(p => p.upvotes), 0)}</p>
              <p style={{ color: theme.text }}>💾 Saved by Users: {savedProjects.length}</p>
            </div>
          </div>
        )}

        {currentPage === "notifications" && (
          <Notifications 
            user={user}
            onNavigate={setCurrentPage}
            onNotificationCountChange={() => setNotificationRefreshTrigger(prev => prev + 1)}
          />
        )}

        {["messages", "friends-main", "friend-requests", "friends-list", "friend-search"].includes(currentPage) && (
          <Friends 
            user={user}
            onNavigate={setCurrentPage}
            initialTab={
                currentPage === "friend-requests" ? "requests" :
                currentPage === "friends-list" ? "friends" :
                currentPage === "friend-search" ? "search" :
                "messages"
            }
            unreadMessageCount={unreadMessageCount}
            onUnreadChange={setUnreadMessageCount}
            pendingRequestCount={pendingRequestCount}
            onPendingRequestChange={setPendingRequestCount}
          />
        )}

        {["leaderboard", "top-projects", "top-creators", "monthly-trending", "weekly-trending", "rising-stars", "most-commented"].includes(currentPage) && (
          <LeaderboardPage 
            theme={theme} 
            projects={projects} 
            loading={loading} 
            user={user} 
            handleVoteChange={handleVoteChange} 
            handleDelete={handleDelete} 
            setSelectedProject={setSelectedProject} 
            loadSavedProjects={loadSavedProjects} 
            styles={styles} 
            initialTab={currentPage === "leaderboard" ? "top-projects" : currentPage}
          />
        )}

        {["help", "faq", "documentation", "troubleshooting", "feedback"].includes(currentPage) && (
          <HelpAndSupportPage 
            theme={theme} 
            activeSection={currentPage === "help" ? "faq" : currentPage}
          />
        )}

        {currentPage === "my-projects" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700", textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none" }}>🎯 My Projects</h2>
            {loadingMyProjects ? (
              <div style={styles.loadingText}>⌛ Loading your projects...</div>
            ) : myProjects.length === 0 ? (
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                color: theme.textDark,
                background: `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
                border: `2px dashed rgba(0, 212, 255, 0.2)`,
                borderRadius: "10px"
              }}>
                <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No projects yet</p>
                <p style={{ fontSize: "14px", opacity: 0.7 }}>Projects you create will appear here</p>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {myProjects.map((project, idx) => (
                  <ProjectCard 
                    key={project._id}
                    project={project}
                    rank={idx + 1}
                    onVoteChange={handleVoteChange}
                    onDelete={handleDelete}
                    currentUserId={user?._id}
                    onCardClick={setSelectedProject}
                    onSaveChange={() => loadSavedProjects(user?._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === "saved" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700", textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none" }}>💾 Saved Projects</h2>
            {savedProjects.length === 0 ? (
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                color: theme.textDark,
                background: `linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)`,
                border: `2px dashed rgba(0, 212, 255, 0.2)`,
                borderRadius: "10px"
              }}>
                <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No saved projects</p>
                <p style={{ fontSize: "14px", opacity: 0.7 }}>Click the bookmark icon on projects to save them</p>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {savedProjects.map((project, idx) => (
                  <ProjectCard 
                    key={project._id}
                    project={project}
                    rank={idx + 1}
                    onVoteChange={handleVoteChange}
                    onDelete={handleDelete}
                    currentUserId={user?._id}
                    onCardClick={setSelectedProject}
                    onSaveChange={() => loadSavedProjects(user?._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === "trending" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700", textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none" }}>🔥 Trending Projects</h2>
            <p style={{ color: theme.textDark, marginBottom: "20px" }}>Most upvoted projects this week</p>
            {loading ? (
              <div style={styles.loadingText}>⌛ Loading...</div>
            ) : filteredProjects.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No projects yet</p>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {filteredProjects.slice(0, 10).map((project, idx) => (
                  <ProjectCard 
                    key={project._id}
                    project={project}
                    rank={idx + 1}
                    onVoteChange={handleVoteChange}
                    onDelete={handleDelete}
                    currentUserId={user?._id}
                    onCardClick={setSelectedProject}
                    onSaveChange={() => loadSavedProjects(user?._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === "account" && (
          <div style={{ padding: "40px 24px" }}>
            <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700" }}>👤 Account Settings</h2>
            {user ? (
              <div style={{ background: theme.bgLight, padding: "24px", borderRadius: "8px", border: `1px solid ${theme.border}`, maxWidth: "500px" }}>
                <p style={{ marginBottom: "16px", color: theme.text }}><strong>Email:</strong> {user.email}</p>
                <p style={{ marginBottom: "16px", color: theme.text }}><strong>Username:</strong> {user.username}</p>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    padding: "10px 18px", 
                    background: theme.neonPink, 
                    color: theme.bg,
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "16px"
                  }}>
                  Log Out
                </button>
              </div>
            ) : (
              <p style={{ color: theme.textDark }}>Please sign in to view account settings</p>
            )}
          </div>
        )}

        {showAuthForm && (
          <>
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 998
            }} onClick={() => {
              setShowAuthForm(false);
              setError("");
            }} />
            <form onSubmit={handleAuth} style={{
              ...styles.form,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "400px",
              width: "90%",
              zIndex: 999,
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
            <h3 style={{ color: theme.name === "Cyber Mode" ? theme.neonCyan : "#007bff", marginBottom: "20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "2px" }}>
              {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
            </h3>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                "::placeholder": {
                  color: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.5)" : "#999"
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.neonCyan;
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonCyan}, inset 0 0 10px rgba(0, 212, 255, 0.1)` : "0 0 5px rgba(0, 0, 0, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.3)" : "#007bff";
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? "0 0 10px rgba(0, 212, 255, 0.1)" : "0 0 5px rgba(0, 0, 0, 0.1)";
              }}
            />
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  ...styles.input,
                  "::placeholder": {
                    color: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.5)" : "#999"
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.neonCyan;
                  e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonCyan}, inset 0 0 10px rgba(0, 212, 255, 0.1)` : "0 0 5px rgba(0, 0, 0, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.3)" : "#007bff";
                  e.target.style.boxShadow = theme.name === "Cyber Mode" ? "0 0 10px rgba(0, 212, 255, 0.1)" : "0 0 5px rgba(0, 0, 0, 0.1)";
                }}
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                "::placeholder": {
                  color: theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.5)" : "#999"
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.neonCyan;
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonCyan}, inset 0 0 10px rgba(0, 212, 255, 0.1)` : "0 0 5px rgba(0, 0, 0, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.3)" : "#007bff";
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? "0 0 10px rgba(0, 212, 255, 0.1)" : "0 0 5px rgba(0, 0, 0, 0.1)";
              }}
            />
            <button
              type="submit"
              style={{
                ...styles.primaryButton,
                width: "100%",
                marginBottom: "12px"
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = theme.name === "Cyber Mode" ? `0 0 30px ${theme.neonBlue}, inset 0 0 30px rgba(0, 212, 255, 0.2)` : "0 0 10px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = `0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)`;
              }}
            >
              {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={{
                ...styles.primaryButton,
                width: "100%",
                marginBottom: "12px",
                borderColor: theme.neonPurple,
                color: theme.neonPurple
              }}
            >
              {isLogin ? "CREATE ACCOUNT" : "HAVE ACCOUNT?"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAuthForm(false);
                setError("");
                document.body.style.overflow = "auto";
              }}
              style={{
                ...styles.primaryButton,
                width: "100%",
                borderColor: theme.neonPink,
                color: theme.neonPink
              }}
            >
              CLOSE
            </button>
          </form>
          </>
        )}
      </div>

      <Footer onNavigate={setCurrentPage} />
      
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          currentUserId={user?._id}
          onDelete={handleDelete}
        />
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};


const FeedbackModal = ({ theme, onClose }) => {
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "bug"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(feedbackForm)
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFeedbackForm({
            name: "",
            email: "",
            subject: "",
            message: "",
            type: "bug"
          });
        }, 2000);
      } else {
        console.error("Feedback submission failed:", data);
        alert(`Failed to submit feedback: ${data.message || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(`Error submitting feedback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        background: theme.bgLight,
        borderRadius: "12px",
        padding: "32px",
        maxWidth: "500px",
        width: "90%",
        border: `2px solid ${theme.neonBlue}`,
        boxShadow: `0 20px 60px rgba(0, 212, 255, 0.2)`,
        animation: "slideUp 0.3s ease"
      }}>
        {!submitted ? (
          <>
            <h2 style={{ color: theme.neonCyan, marginBottom: "8px", fontSize: "22px", fontWeight: "700" }}>
              🐛 Report Bug / Send Feedback
            </h2>
            <p style={{ color: theme.textDark, marginBottom: "24px", fontSize: "13px" }}>
              Help us improve by sharing your feedback or reporting bugs
            </p>

            <form onSubmit={handleSubmitFeedback} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: theme.neonBlue, fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Feedback Type
                </label>
                <select
                  name="type"
                  value={feedbackForm.type}
                  onChange={handleFeedbackChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="improvement">📈 Improvement Suggestion</option>
                  <option value="other">💬 Other Feedback</option>
                </select>
              </div>

              <div>
                <label style={{ color: theme.neonBlue, fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={feedbackForm.name}
                  onChange={handleFeedbackChange}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ color: theme.neonBlue, fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={feedbackForm.email}
                  onChange={handleFeedbackChange}
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ color: theme.neonBlue, fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={feedbackForm.subject}
                  onChange={handleFeedbackChange}
                  placeholder="Brief subject (optional)"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ color: theme.neonBlue, fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  placeholder="Tell us what you think... (minimum 10 characters)"
                  rows="5"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.neonBlue;
                    e.target.style.boxShadow = `0 0 10px ${theme.neonBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: "transparent",
                    color: theme.text,
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme.bgLight;
                    e.target.style.borderColor = theme.neonBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.borderColor = theme.border;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    background: `linear-gradient(135deg, ${theme.neonBlue}, ${theme.neonCyan})`,
                    color: "#000",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow = `0 0 15px ${theme.neonBlue}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  {loading ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 32px" }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "20px",
              animation: "successPulse 0.6s ease-out",
              display: "inline-block"
            }}>
              ✅
            </div>
            
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "140px",
              height: "140px",
              border: `2px solid ${theme.neonGreen || theme.neonCyan}`,
              borderRadius: "50%",
              opacity: "0.3",
              animation: "expandRing 0.8s ease-out forwards"
            }}></div>
            
            <h3 style={{
              color: theme.neonCyan,
              marginBottom: "12px",
              fontSize: "24px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              animation: "slideInDown 0.5s ease-out"
            }}>
              Thank You! 🎉
            </h3>
            
            <p style={{
              color: theme.text,
              fontSize: "14px",
              marginBottom: "12px",
              fontWeight: "500",
              animation: "slideInUp 0.6s ease-out"
            }}>
              Your feedback has been sent successfully.
            </p>
            
            <div style={{
              background: `linear-gradient(135deg, ${theme.neonBlue}20, ${theme.neonCyan}20)`,
              borderLeft: `3px solid ${theme.neonCyan}`,
              borderRadius: "6px",
              padding: "12px 16px",
              marginTop: "16px",
              animation: "slideInUp 0.7s ease-out"
            }}>
              <p style={{
                color: theme.neonCyan,
                fontSize: "12px",
                margin: "0",
                fontWeight: "600"
              }}>
                ⏱️ We'll review it and get back to you within 24-48 hours!
              </p>
            </div>
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
        @keyframes successPulse {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expandRing {
          from {
            width: 60px;
            height: 60px;
            opacity: 0.8;
          }
          to {
            width: 140px;
            height: 140px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};


const HelpAndSupportPage = ({ theme, activeSection }) => {
  const [expandedSections, setExpandedSections] = useState({
    faq: true,
    documentation: false,
    troubleshooting: false,
    feedback: false
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (activeSection) {
      setExpandedSections(prev => ({
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        [activeSection]: true
      }));
    }
  }, [activeSection]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionCollapsible = ({ id, title, icon, children }) => (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => toggleSection(id)}
        style={{
          width: "100%",
          background: theme.bgLight,
          border: `2px solid ${theme.neonBlue}`,
          padding: "16px",
          borderRadius: "8px",
          color: theme.neonBlue,
          fontWeight: "600",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = theme.name === "Cyber Mode" ? "rgba(0, 212, 255, 0.1)" : "rgba(0, 100, 200, 0.05)";
          e.target.style.transform = "translateX(4px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = theme.bgLight;
          e.target.style.transform = "translateX(0)";
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>{icon}</span>
          {title}
        </span>
        <span style={{ transition: "transform 0.3s ease", transform: expandedSections[id] ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>
      {expandedSections[id] && (
        <div style={{
          background: theme.bgLight,
          padding: "20px",
          borderRadius: "0 0 8px 8px",
          border: `1px solid ${theme.border}`,
          borderTop: "none",
          animation: "slideDown 0.3s ease",
          marginTop: "-4px"
        }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px" }}>
      <h2 style={{ color: theme.neonCyan, marginBottom: "32px", fontSize: "28px", fontWeight: "700", textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none" }}>❓ Help & Support</h2>
      
      <SectionCollapsible id="faq" title="Frequently Asked Questions" icon="📋">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { q: "How do I submit a project?", a: "Click 'Submit Project' in the sidebar, fill in the project details, upload images, and submit. Your project will be visible immediately." },
            { q: "How can I increase visibility?", a: "Get upvotes from the community! Share your project and engage with other creators to gain visibility." },
            { q: "What categories exist?", a: "AI, Web Development, Mobile Apps, Game Development, SaaS Solutions, and Design & UI/UX." },
            { q: "How do I save projects?", a: "Click the bookmark icon on any project card to save it to your 'Saved Projects'." },
            { q: "Can I edit my project?", a: "Yes! Go to 'My Projects', find your project, and click edit." },
            { q: "How are projects ranked?", a: "By total upvotes. You can sort by 'All Time', 'This Week', or 'Today'." }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: theme.bg,
              padding: "12px",
              borderRadius: "6px",
              borderLeft: `3px solid ${theme.neonPink}`
            }}>
              <p style={{ color: theme.neonBlue, fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>{item.q}</p>
              <p style={{ color: theme.textDark, fontSize: "12px", lineHeight: "1.5" }}>{item.a}</p>
            </div>
          ))}
        </div>
      </SectionCollapsible>

      <SectionCollapsible id="documentation" title="Documentation & Guides" icon="📚">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { title: "Getting Started", desc: "Create account, explore projects, submit your first idea.", icon: "🚀" },
            { title: "Submission Guidelines", desc: "Best practices for project descriptions, categories, and previews.", icon: "📝" },
            { title: "Community Standards", desc: "Keep platform positive, respect others, provide constructive feedback.", icon: "🤝" },
            { title: "Feedback & Voting", desc: "Upvote projects, bookmark for later, leave thoughtful comments.", icon: "👍" }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: theme.bg,
              padding: "12px",
              borderRadius: "6px",
              display: "flex",
              gap: "10px"
            }}>
              <div style={{ fontSize: "18px" }}>{item.icon}</div>
              <div>
                <p style={{ color: theme.neonCyan, fontWeight: "600", marginBottom: "2px", fontSize: "13px" }}>{item.title}</p>
                <p style={{ color: theme.textDark, fontSize: "12px" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCollapsible>

      <SectionCollapsible id="troubleshooting" title="Troubleshooting" icon="🔧">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { issue: "Upload failed", solution: "Check file size (max 10MB) and format. Ensure stable internet connection." },
            { issue: "Project not appearing", solution: "Wait a few moments for server sync. Refresh page if needed." },
            { issue: "Can't log in", solution: "Check email/password. Use 'Forgot Password' if needed. Clear browser cache." },
            { issue: "Vote not counting", solution: "Must be logged in to vote. Refresh page if vote doesn't update." }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: theme.bg,
              padding: "12px",
              borderRadius: "6px",
              borderLeft: `3px solid ${theme.neonCyan}`
            }}>
              <p style={{ color: theme.neonPink, fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>⚠️ {item.issue}</p>
              <p style={{ color: theme.textDark, fontSize: "12px" }}>{item.solution}</p>
            </div>
          ))}
        </div>
      </SectionCollapsible>

      <SectionCollapsible id="feedback" title="Feedback & Bug Report" icon="🐛">
        <div style={{ 
          background: theme.bg,
          padding: "16px",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <p style={{ color: theme.textDark, marginBottom: "12px", fontSize: "13px" }}>
            Found a bug or have a feature request? We'd love to hear from you!
          </p>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            style={{
            background: `linear-gradient(135deg, ${theme.neonCyan}, ${theme.neonBlue})`,
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = `0 0 15px ${theme.neonCyan}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}>
            Submit Feedback →
          </button>
        </div>
      </SectionCollapsible>

      {showFeedbackModal && (
        <FeedbackModal theme={theme} onClose={() => setShowFeedbackModal(false)} />
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            overflow: hidden;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  );
};


const LeaderboardPage = ({ theme, projects, loading, user, handleVoteChange, handleDelete, setSelectedProject, loadSavedProjects, styles, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || "top-projects");

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const LeaderboardCard = ({ project, rank, mode = "project" }) => {
    const displayName = mode === "project" ? project.title : project.creatorName;
    const displayValue = mode === "project" ? project.upvotes : project.totalUpvotes;
    const secondaryValue = mode === "project" ? project.creatorName : `${project.projectCount} projects`;
    const imageUrl = mode === "project" ? project.imageUrl : project.creatorAvatar;
    
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: theme.bgLight,
        borderRadius: "8px",
        border: `1px solid ${theme.border}`,
        marginBottom: "12px",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          fontSize: "20px",
          fontWeight: "700",
          color: rank <= 3 ? theme.neonPink : theme.textDark,
          width: "30px",
          textAlign: "center"
        }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </div>
        
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: mode === "creator" ? "50%" : "4px",
          overflow: "hidden",
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          {imageUrl ? (
            <img src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`} />
          ) : (
            <span style={{ fontSize: "18px" }}>{mode === "creator" ? "👤" : "🚀"}</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ color: theme.neonCyan, fontWeight: "600", marginBottom: "2px", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </p>
          <p style={{ color: theme.textDark, fontSize: "12px" }}>
            {secondaryValue}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ color: theme.neonGreen, fontWeight: "700", fontSize: "14px" }}>
            {displayValue}
          </p>
          <p style={{ color: theme.textDark, fontSize: "10px" }}>
            Upvotes
          </p>
        </div>
      </div>
    );
  };

  
  const getLeaderboardData = () => {
    let data = [];
    switch(activeTab) {
      case "top-projects":
        data = [...projects].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
        break;
      case "top-creators":
        
        const creators = {};
        projects.forEach(p => {
          if (!creators[p.creatorId]) {
            creators[p.creatorId] = {
              creatorId: p.creatorId,
              creatorName: p.creatorName,
              creatorAvatar: p.creatorAvatar,
              totalUpvotes: 0,
              projectCount: 0
            };
          }
          creators[p.creatorId].totalUpvotes += p.upvotes;
          creators[p.creatorId].projectCount += 1;
        });
        data = Object.values(creators).sort((a, b) => b.totalUpvotes - a.totalUpvotes).slice(0, 10);
        break;
      case "monthly-trending":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        data = projects.filter(p => new Date(p.createdAt) > monthAgo).sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
        break;
      case "weekly-trending":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        data = projects.filter(p => new Date(p.createdAt) > weekAgo).sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
        break;
      case "rising-stars":
        
        data = [...projects].sort((a, b) => (b.upvotes / (Date.now() - new Date(b.createdAt).getTime())) - (a.upvotes / (Date.now() - new Date(a.createdAt).getTime()))).slice(0, 10);
        break;
      case "most-commented":
        
        data = [...projects].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
        break;
      default:
        data = [];
    }
    return data;
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div style={{ padding: "40px 24px" }}>
      <h2 style={{ color: theme.neonCyan, marginBottom: "24px", fontSize: "28px", fontWeight: "700", textShadow: theme.name === "Cyber Mode" ? `0 0 10px ${theme.neonBlue}` : "none" }}>🏆 Leaderboard</h2>
      
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
        {[
          { id: "top-projects", label: "Top Projects", icon: "⭐" },
          { id: "top-creators", label: "Top Creators", icon: "👥" },
          { id: "monthly-trending", label: "Monthly", icon: "📅" },
          { id: "weekly-trending", label: "Weekly", icon: "📈" },
          { id: "rising-stars", label: "Rising Stars", icon: "🚀" },
          { id: "most-commented", label: "Most Discussed", icon: "💬" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: activeTab === tab.id ? `2px solid ${theme.neonBlue}` : `1px solid ${theme.border}`,
              background: activeTab === tab.id ? `rgba(0, 212, 255, 0.1)` : "transparent",
              color: activeTab === tab.id ? theme.neonBlue : theme.textDark,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {leaderboardData.map((item, idx) => (
          <LeaderboardCard 
            key={idx} 
            project={item} 
            rank={idx + 1} 
            mode={activeTab === "top-creators" ? "creator" : "project"} 
          />
        ))}
        {leaderboardData.length === 0 && (
          <p style={{ color: theme.textDark, textAlign: "center", padding: "20px" }}>No data available for this period</p>
        )}
      </div>
    </div>
  );
};


export default Home;
