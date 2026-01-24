import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const UpvoteButton = ({ project, onVoteChange }) => {
  const { theme } = useTheme();
  const [userVote, setUserVote] = useState(null);
  const [voteCount, setVoteCount] = useState(project.votes);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`http://localhost:5000/api/votes/check/${project._id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUserVote(data.hasVoted))
      .catch(err => console.error(err));
  }, [project._id]);

  const handleVote = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/votes/${project._id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserVote(data.hasVoted);
        setVoteCount(data.totalVotes);
        if (onVoteChange) onVoteChange(project._id, data.totalVotes);
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <button
      onClick={handleVote}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "8px",
        border: `2px solid ${userVote ? theme.neonPink : theme.neonBlue}`,
        background: userVote 
          ? `linear-gradient(135deg, rgba(255, 0, 110, 0.15) 0%, rgba(255, 0, 110, 0.05) 100%)`
          : isHovered
          ? `linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)`
          : `rgba(0, 212, 255, 0.05)`,
        color: userVote ? theme.neonPink : theme.neonBlue,
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontFamily: "inherit",
        boxShadow: userVote
          ? theme.name === "Cyber Mode" ? `0 0 15px rgba(255, 0, 110, 0.3), inset 0 0 10px rgba(255, 0, 110, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.1)"
          : isHovered
          ? theme.name === "Cyber Mode" ? `0 0 20px ${theme.neonBlue}, inset 0 0 15px rgba(0, 212, 255, 0.1)` : "0 0 10px rgba(0, 0, 0, 0.15)"
          : theme.name === "Cyber Mode" ? `0 0 10px rgba(0, 212, 255, 0.2)` : "0 0 5px rgba(0, 0, 0, 0.1)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}
    >
      <span style={{ fontSize: "16px" }}>{userVote ? "💗" : "🖤"}</span>
      <span>{voteCount}</span>
    </button>
  );
};

export default UpvoteButton;

