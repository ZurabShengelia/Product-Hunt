

export const SIDEBAR_ITEMS = [
  
  
  
  {
    id: "analytics",
    label: "Analytics",
    icon: "analytics-outline",
    type: "submenu",
    section: "dashboard",
    children: [
      {
        id: "overview",
        label: "Overview",
        icon: "bar-chart-outline",
        description: "Dashboard insights"
      },
      {
        id: "statistics",
        label: "Statistics",
        icon: "pie-chart-outline",
        description: "Detailed metrics"
      }
    ]
  },

  
  
  
  {
    id: "projects",
    label: "Projects",
    icon: "folder-outline",
    type: "submenu",
    section: "content",
    children: [
      {
        id: "my-projects",
        label: "My Projects",
        icon: "document-outline",
        description: "Your uploaded projects"
      },
      {
        id: "saved",
        label: "Saved Projects",
        icon: "bookmark-outline",
        description: "Bookmarked projects"
      },
      {
        id: "trending",
        label: "Trending",
        icon: "flame-outline",
        description: "Most popular projects"
      }
    ]
  },

  
  
  
  {
    id: "friends",
    label: "Friends & Messaging",
    icon: "chatbubbles-outline",
    type: "submenu",
    section: "social",
    children: [
      {
        id: "friends-main",
        label: "Messenger",
        icon: "chatbox-outline",
        description: "Direct messages"
      },
      {
        id: "friend-requests",
        label: "Friend Requests",
        icon: "person-add-outline",
        description: "Pending requests"
      },
      {
        id: "friends-list",
        label: "My Friends",
        icon: "people-outline",
        description: "Your friends"
      }
    ]
  },

  
  
  
  {
    id: "categories",
    label: "Categories",
    icon: "layers-outline",
    type: "submenu",
    section: "filters",
    children: [
      {
        id: "category-ai",
        label: "🤖 Artificial Intelligence",
        icon: "flash-outline",
        description: "AI & Machine Learning"
      },
      {
        id: "category-web",
        label: "🌐 Web Development",
        icon: "globe-outline",
        description: "Web apps & sites"
      },
      {
        id: "category-mobile",
        label: "📱 Mobile Apps",
        icon: "phone-portrait-outline",
        description: "iOS & Android"
      },
      {
        id: "category-game",
        label: "🎮 Game Development",
        icon: "game-controller-outline",
        description: "Games & interactive"
      },
      {
        id: "category-saas",
        label: "⚙️ SaaS Solutions",
        icon: "settings-outline",
        description: "Cloud & enterprise"
      },
      {
        id: "category-design",
        label: "🎨 Design & UI/UX",
        icon: "brush-outline",
        description: "Design tools & assets"
      },
      {
        id: "category-fintech",
        label: "💳 FinTech",
        icon: "card-outline",
        description: "Finance & payments"
      },
      {
        id: "category-edtech",
        label: "📚 EdTech",
        icon: "book-outline",
        description: "Education & learning"
      },
      {
        id: "category-healthtech",
        label: "🏥 HealthTech",
        icon: "medical-outline",
        description: "Health & wellness"
      },
      {
        id: "category-logistics",
        label: "🚚 Logistics",
        icon: "cube-outline",
        description: "Supply & delivery"
      },
      {
        id: "category-ecommerce",
        label: "🛒 E-Commerce",
        icon: "bag-outline",
        description: "Shopping & retail"
      },
      {
        id: "category-custom",
        label: "➕ Custom Categories",
        icon: "add-circle-outline",
        description: "User-defined categories"
      }
    ]
  },

  
  
  
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    type: "page",
    section: "engagement",
    badgeColor: "neonPink" 
  },

  
  
  
  {
    id: "account",
    label: "Account",
    icon: "person-circle-outline",
    type: "submenu",
    section: "account",
    children: [
      {
        id: "profile",
        label: "Profile",
        icon: "person-outline",
        description: "Edit your profile"
      },
      {
        id: "change-email",
        label: "Change Email",
        icon: "mail-outline",
        description: "Update email address"
      },
      {
        id: "change-password",
        label: "Change Password",
        icon: "lock-closed-outline",
        description: "Update security"
      }
    ]
  },

  
  
  
  {
    id: "help",
    label: "Help & Support",
    icon: "help-circle-outline",
    type: "submenu",
    section: "support",
    children: [
      {
        id: "faq",
        label: "FAQ",
        icon: "document-outline",
        description: "Frequently asked questions"
      },
      {
        id: "documentation",
        label: "Documentation",
        icon: "book-outline",
        description: "User guides & tutorials"
      },
      {
        id: "troubleshooting",
        label: "Troubleshooting",
        icon: "construct-outline",
        description: "Common issues"
      },
      {
        id: "feedback",
        label: "Feedback / Report",
        icon: "bug-outline",
        description: "Report problems"
      }
    ]
  },

  
  
  
  {
    id: "submit",
    label: "Submit Project",
    icon: "cloud-upload-outline",
    type: "page",
    section: "action",
    highlight: true,
    highlightColor: "neonGreen"
  },

  
  
  
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: "trophy-outline",
    type: "submenu",
    section: "community",
    children: [
      {
        id: "top-projects",
        label: "Top Projects",
        icon: "star-outline",
        description: "Most upvoted"
      },
      {
        id: "top-creators",
        label: "Top Creators",
        icon: "people-outline",
        description: "Best developers"
      },
      {
        id: "monthly-trending",
        label: "Monthly Trending",
        icon: "calendar-outline",
        description: "This month's hits"
      },
      {
        id: "weekly-trending",
        label: "Weekly Trending",
        icon: "arrow-up-outline",
        description: "This week's hits"
      },
      {
        id: "rising-stars",
        label: "Rising Stars",
        icon: "flash-outline",
        description: "New & popular"
      },
      {
        id: "most-commented",
        label: "Most Commented",
        icon: "chatbox-ellipses-outline",
        description: "High engagement"
      }
    ]
  },

  
  
  
  {
    id: "logout",
    label: "Log Out",
    icon: "log-out-outline",
    type: "page",
    section: "action",
    danger: true
  }
];


export const getSidebarSections = () => ({
  dashboard: SIDEBAR_ITEMS.filter(item => item.section === "dashboard"),
  content: SIDEBAR_ITEMS.filter(item => item.section === "content"),
  filters: SIDEBAR_ITEMS.filter(item => item.section === "filters"),
  engagement: SIDEBAR_ITEMS.filter(item => item.section === "engagement"),
  account: SIDEBAR_ITEMS.filter(item => item.section === "account"),
  ui: SIDEBAR_ITEMS.filter(item => item.section === "ui"),
  support: SIDEBAR_ITEMS.filter(item => item.section === "support"),
  community: SIDEBAR_ITEMS.filter(item => item.section === "community"),
  actions: SIDEBAR_ITEMS.filter(item => item.section === "action")
});


export const findSidebarItem = (id) => {
  const findInList = (items) => {
    for (let item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findInList(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findInList(SIDEBAR_ITEMS);
};


export const getFlatSidebarItems = () => {
  const flat = [];
  const flatten = (items) => {
    items.forEach(item => {
      flat.push(item);
      if (item.children) {
        flatten(item.children);
      }
    });
  };
  flatten(SIDEBAR_ITEMS);
  return flat;
};

