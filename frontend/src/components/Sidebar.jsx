import { useRef, useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { SIDEBAR_ITEMS } from "./sidebar-items.js";
import "./Sidebar.css";


const Submenu = ({ isOpen, activeItem, items, onItemClick, theme }) => {
  const listRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    if (isOpen && listRef.current) {
      setMenuHeight(listRef.current.scrollHeight);
    } else {
      setMenuHeight(0);
    }
  }, [isOpen]);

  return (
    <div 
      className={`sub-menu ${!isOpen ? "closed" : ""}`}
      style={{
        height: `${menuHeight}px`,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease"
      }}
    >
      <ul ref={listRef} style={{ listStyle: "none", padding: 0, margin: 0, display: "block" }}>
        {items.map((child) => (
          <li key={child.id} className="sub-menu-item" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <button 
              className={`submenu-button ${activeItem === child.id ? "active" : ""}`}
              onClick={() => onItemClick(child.id)}
              title={child.description}
            >
              <span className="child-label">{child.label}</span>
              <span className="child-description">{child.description && `• ${child.description}`}</span>
              {child.badgeCount > 0 && (
                <span className="badge" style={{
                  backgroundColor: theme.neonPink,
                  color: theme.bgDark,
                  marginLeft: "auto"
                }}>
                  {child.badgeCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};


const SidebarItem = ({
  item,
  activeItem,
  isOpen,
  onPageClick,
  onSubmenuToggle,
  onItemClick,
  theme,
}) => {
  const isActive = activeItem === item.id;
  
  return (
    <li style={{ listStyle: "none", margin: 0, padding: 0, display: "block" }}>
      <div className="sidebar-item-wrapper">
        <button 
          className={`sidebar-button ${isActive ? "active" : ""} ${item.highlight ? "highlight" : ""} ${item.danger ? "danger" : ""}`}
          onClick={() => {
            if (item.type === "page") {
              onPageClick(item.id);
            } else {
              onSubmenuToggle(item.id);
            }
          }}
          title={item.label}
        >
          <ion-icon name={item.icon} className="item-icon" />
          <p className="item-label">{item.label}</p>
          
          {item.badgeCount && (
            <span className="badge" style={{
              backgroundColor: theme.neonPink,
              color: theme.bgDark
            }}>
              {item.badgeCount}
            </span>
          )}
          
          {item.type === "submenu" && (
            <ion-icon name="chevron-down-outline" className="chevron-icon" />
          )}
        </button>

        {isActive && (
          <div className="active-indicator" style={{
            backgroundColor: item.danger ? theme.neonPink : theme.neonCyan
          }} />
        )}
      </div>

      {item.type === "submenu" && (
        <Submenu 
          isOpen={isOpen} 
          activeItem={activeItem} 
          items={item.children}
          onItemClick={onItemClick}
          theme={theme}
        />
      )}
    </li>
  );
};


export default function Sidebar({ onNavigate, onLogout, currentPage, user, onUserUpdate, notificationRefreshTrigger, unreadMessageCount, pendingRequestCount }) {
  const { theme } = useTheme();
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  
  useEffect(() => {
    if (user?._id) {
      fetchNotificationCount();
      
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  
  useEffect(() => {
    if (user?._id) {
      fetchNotificationCount();
    }
  }, [notificationRefreshTrigger, user]);

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
        const data = await response.json();
        setNotificationCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  const handlePageClick = (id) => {
    if (id === "logout") {
      onLogout?.();
      return;
    }
    setActiveItem(id);
    setOpenSubmenu(null);
    onNavigate?.(id);
  };

  const handleSubmenuToggle = (id) => {
    setActiveItem(id);
    setOpenSubmenu(prev => (prev === id ? null : id));
  };

  const handleSubmenuItemClick = (id) => {
    setActiveItem(id);
    onNavigate?.(id);
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
  };

  
  const processedItems = SIDEBAR_ITEMS.map(item => {
    const newItem = { ...item };
    if (newItem.label === "Messenger") newItem.label = "Messages";
    
    let parentBadgeCount = 0;

    if (newItem.children) {
      newItem.children = newItem.children.map(child => {
        const newChild = child.label === "Messenger" ? { ...child, label: "Messages" } : { ...child };
        
        
        if (newChild.id === "friends-main") {
          newChild.badgeCount = unreadMessageCount;
          parentBadgeCount += (unreadMessageCount || 0);
        }
        
        
        if (newChild.id === "friend-requests") {
          newChild.badgeCount = pendingRequestCount;
          parentBadgeCount += (pendingRequestCount || 0);
        }

        return newChild;
      });
    }

    
    if (parentBadgeCount > 0) {
      newItem.badgeCount = parentBadgeCount;
    }
    return newItem;
  });

  
  const filteredItems = searchQuery.trim() === "" 
    ? processedItems 
    : processedItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.children?.some(child => child.label.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <aside className="sidebar" style={{
      backgroundColor: theme.bgDark,
      borderRight: "1px solid " + theme.border + "20"
    }}>
      <header className="sidebar-header">
        <div className="logo" title="Dashboard">
          <ion-icon name="layers-outline"></ion-icon>
        </div>
      </header>

      {user && (
        <div 
          className="sidebar-profile"
          onClick={() => onNavigate?.("profile")}
          style={{ 
            cursor: "pointer",
            borderBottomColor: theme.neonCyan + "30"
          }}
        >
          <div className="profile-avatar" style={{
            backgroundColor: theme.neonCyan + "15",
            borderColor: theme.neonCyan + "40"
          }}>
            {getAvatarUrl() ? (
              <img src={getAvatarUrl()} alt={user.username} />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgb(0, 102, 204), rgb(102, 51, 153))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "700",
                color: "rgb(248, 249, 252)",
                boxShadow: "none"
              }}>{(user.displayName || user.username || "U").charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="profile-info">
            <p className="profile-username" style={{ color: theme.textDark }}>{user.displayName || user.username}</p>
            <span className="profile-status" style={{ color: theme.neonCyan }}>Active</span>
          </div>
        </div>
      )}

      <div className="sidebar-search" style={{
        borderColor: theme.neonBlue + "20",
        backgroundColor: theme.neonBlue + "08"
      }}>
        <ion-icon name="search-outline"></ion-icon>
        <input 
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            color: theme.textDark,
            backgroundColor: "transparent",
            borderColor: theme.neonBlue + "30"
          }}
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery("")}
            title="Clear search"
          >
            <ion-icon name="close-outline"></ion-icon>
          </button>
        )}
      </div>

      <ul className="sidebar-menu" style={{ 
        color: theme.textDark,
        scrollbarColor: theme.neonBlue + "40 transparent"
      }}>
        {filteredItems.map((item) => {
          
          const itemToRender = item.id === "notifications" 
            ? { ...item, badgeCount: notificationCount }
            : item;
          
          return (
            <SidebarItem
              key={item.id}
              item={itemToRender}
              activeItem={activeItem}
              isOpen={openSubmenu === item.id}
              onPageClick={handlePageClick}
              onSubmenuToggle={handleSubmenuToggle}
              onItemClick={handleSubmenuItemClick}
              theme={theme}
            />
          );
        })}
      </ul>

      <div className="sidebar-footer" style={{
        borderTopColor: theme.neonCyan + "20",
        color: theme.textDark
      }}>
        <p>v1.0.0 • Georgian Startup Hub</p>
      </div>
    </aside>
  );
}
