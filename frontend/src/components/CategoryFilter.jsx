import React, { useState, useEffect } from "react";

const CategoryFilter = ({ projects, onCategorySelect, selectedCategory }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const cats = ["All"];
        const uniqueCats = [...new Set(projects.map(p => p.category).filter(Boolean))];
        setCategories([...cats, ...uniqueCats]);
    }, [projects]);

    const styles = {
        container: {
            display: "flex",
            gap: "10px",
            marginBottom: "25px",
            flexWrap: "wrap",
            padding: "15px",
            background: "linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 10, 62, 0.8) 100%)",
            borderRadius: "8px",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            boxShadow: "0 0 15px rgba(0, 255, 136, 0.1)"
        },
        button: (isActive) => ({
            padding: "10px 18px",
            border: isActive ? "2px solid #00ff88" : "2px solid #00d4ff",
            background: isActive 
                ? "linear-gradient(90deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 212, 255, 0.3) 100%)"
                : "rgba(10, 14, 39, 0.6)",
            color: isActive ? "#00ff88" : "#00d4ff",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "13px",
            transition: "all 0.3s ease",
            boxShadow: isActive 
                ? "0 0 15px rgba(0, 255, 136, 0.4)"
                : "0 0 8px rgba(0, 212, 255, 0.2)",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
        })
    };

    return (
        <div style={styles.container}>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => onCategorySelect(cat === "All" ? "" : cat)}
                    onMouseEnter={(e) => {
                        if (cat !== selectedCategory) {
                            e.target.style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.6)";
                            e.target.style.borderColor = "#00d4ff";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.boxShadow = cat === selectedCategory 
                            ? "0 0 15px rgba(0, 255, 136, 0.4)"
                            : "0 0 8px rgba(0, 212, 255, 0.2)";
                        e.target.style.borderColor = cat === selectedCategory ? "#00ff88" : "#00d4ff";
                    }}
                    style={styles.button(cat === selectedCategory || (selectedCategory === "" && cat === "All"))}
                >
                    {cat === "All" ? "🌐 All" : `◆ ${cat}`}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
