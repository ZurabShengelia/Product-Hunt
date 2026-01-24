import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const StatsBar = ({ projects, user }) => {
    const { theme } = useTheme();
    const [hoveredCard, setHoveredCard] = useState(null);

    const totalProjects = projects.length;
    const totalVotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
    const myProjects = user ? projects.filter(p => p.creatorId === user._id).length : 0;
    const topProject = projects.length > 0 ? projects.reduce((max, p) => p.upvotes > max.upvotes ? p : max) : null;

    const isDark = theme.name === "Cyber Mode";

    const styles = {
        container: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
            width: "100%",
            padding: "0"
        },
        card: {
            background: isDark 
                ? `linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 20, 50, 0.95) 100%)`
                : `linear-gradient(135deg, rgba(248, 249, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)`,
            border: `2px solid transparent`,
            borderRadius: "12px",
            padding: "28px",
            boxShadow: isDark
                ? `0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                : `0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            background: isDark
                ? `linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 20, 50, 0.95) 100%)`
                : `linear-gradient(135deg, rgba(248, 249, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)`
        },
        cardAfter: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "transparent",
            borderRadius: "12px",
            pointerEvents: "none",
            transition: "all 0.35s ease"
        },
        label: {
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: theme.textDark,
            opacity: 0.85
        },
        labelIcon: {
            fontSize: "16px",
            lineHeight: "1"
        },
        value: {
            fontSize: "36px",
            fontWeight: "900",
            lineHeight: "1.1",
            marginBottom: "8px",
            background: `linear-gradient(135deg, ${theme.neonBlue} 0%, ${theme.neonCyan} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `drop-shadow(0 0 2px ${theme.neonBlue}40)`
        },
        subText: {
            fontSize: "12px",
            color: theme.textDark,
            fontWeight: "500",
            opacity: 0.75,
            marginTop: "10px"
        }
    };

    const cardConfigs = [
        {
            id: "projects",
            label: "📦 Projects",
            value: totalProjects,
            subText: "Total on platform",
            accentColor: theme.neonBlue
        },
        {
            id: "votes",
            label: "⭐ Votes",
            value: totalVotes,
            subText: "Community engagement",
            accentColor: theme.neonCyan
        },
        ...(user ? [{
            id: "my-projects",
            label: "🎯 Your Projects",
            value: myProjects,
            subText: "Projects you created",
            accentColor: theme.neonPurple
        }] : []),
        ...(topProject ? [{
            id: "trending",
            label: "🏆 Trending",
            value: topProject.title,
            subText: `${topProject.upvotes} votes`,
            accentColor: theme.neonPink,
            isProject: true
        }] : [])
    ];

    const renderCard = (config) => {
        const isHovered = hoveredCard === config.id;
        
        return (
            <div
                key={config.id}
                style={{
                    ...styles.card,
                    borderColor: isHovered ? config.accentColor + "60" : config.accentColor + "30",
                    boxShadow: isHovered
                        ? isDark
                            ? `0 12px 40px ${config.accentColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 30px ${config.accentColor}20`
                            : `0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 0 20px ${config.accentColor}20`
                        : isDark
                            ? `0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                            : `0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
                    transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                    background: isHovered
                        ? isDark
                            ? `linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(20, 25, 60, 0.98) 100%)`
                            : `linear-gradient(135deg, rgba(248, 249, 252, 0.99) 0%, rgba(255, 255, 255, 0.99) 100%)`
                        : isDark
                            ? `linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 20, 50, 0.95) 100%)`
                            : `linear-gradient(135deg, rgba(248, 249, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)`
                }}
                onMouseEnter={() => setHoveredCard(config.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div style={styles.label}>
                    <span style={styles.labelIcon}>{config.label.split(" ")[0]}</span>
                    <span>{config.label.split(" ").slice(1).join(" ")}</span>
                </div>

                <div style={{
                    ...styles.value,
                    fontSize: config.isProject ? "18px" : "36px",
                    background: `linear-gradient(135deg, ${config.accentColor} 0%, ${
                        config.accentColor === theme.neonBlue ? theme.neonCyan :
                        config.accentColor === theme.neonCyan ? theme.neonBlue :
                        config.accentColor === theme.neonPurple ? theme.neonBlue :
                        theme.neonPurple
                    } 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: `drop-shadow(0 0 ${isHovered ? 4 : 2}px ${config.accentColor}50)`,
                    transition: "filter 0.35s ease",
                    whiteSpace: config.isProject ? "nowrap" : "normal",
                    overflow: config.isProject ? "hidden" : "visible",
                    textOverflow: config.isProject ? "ellipsis" : "clip",
                    wordBreak: !config.isProject ? "break-word" : "normal"
                }}>
                    {config.value}
                </div>

                <div style={styles.subText}>{config.subText}</div>

                {}
                {isHovered && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "2px",
                            background: `linear-gradient(90deg, transparent, ${config.accentColor}80, transparent)`,
                            borderRadius: "12px 12px 0 0",
                            animation: "shimmer 1.5s ease-in-out infinite"
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
            <div style={styles.container}>
                {cardConfigs.map(config => renderCard(config))}
            </div>
        </>
    );
};

export default StatsBar;
