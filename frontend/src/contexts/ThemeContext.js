import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const themes = {
  
  light: {
    name: "Light Mode",
    
    bg: "#f8f9fc",           
    bgDark: "#eef0f7",       
    bgLight: "#ffffff",      

    
    neonBlue: "#0066cc",     
    neonPink: "#cc0033",     
    neonPurple: "#663399",   
    neonGreen: "#009900",    
    neonCyan: "#0099cc",     

    
    text: "#1a1a2e",         
    textDark: "#4a4a6a",     

    
    accent: "#0066cc",
    surface: "#ffffff",
    border: "#ccddff",
    borderGlow: "0 2px 10px rgba(0, 102, 204, 0.1)",
    shadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
  },

  cyber: {
    name: "Cyber Mode",
    
    bg: "#0a0d1a",           
    bgDark: "#050608",       
    bgLight: "#151a2e",      

    
    neonBlue: "#00d4ff",     
    neonPink: "#ff006e",     
    neonPurple: "#b537f2",   
    neonGreen: "#00ff41",    
    neonCyan: "#00ffd9",     

    
    text: "#e8e8f0",         
    textDark: "#a8a8b8",     

    
    accent: "#00d4ff",
    surface: "#0f1220",      
    border: "#00d4ff",
    borderGlow: "0 0 25px rgba(0, 212, 255, 0.2)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [currentTheme, mounted]);

  const switchTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
  };

  const theme = themes[currentTheme];

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ currentTheme, switchTheme, theme, themes }}>
      <style>{`
        :root {
          --transition-speed: 0.3s;
        }
        body {
          background-color: var(--bg);
          color: var(--text);
          transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--bgDark);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--neonBlue);
        }
        
        a, button, .card, input, select, textarea, div, nav, aside, header, footer {
          transition: background-color var(--transition-speed) ease, border-color var(--transition-speed) ease, color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

