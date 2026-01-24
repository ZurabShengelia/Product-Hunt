import React, { useState, useEffect } from "react";
import { userAPI, friendsAPI } from "../services/api";
import "./FriendSearch.css";

export default function FriendSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [requestStatus, setRequestStatus] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);

    
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await userAPI.getCurrentUser();
                if (res.success) {
                    setCurrentUserId(res.data._id);
                }
            } catch (err) {
                console.error("Error getting current user:", err);
            }
        };
        getCurrentUser();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await userAPI.searchUsers(searchQuery);
            if (res.success) {
                
                const filteredResults = (res.data || []).filter(user => user._id !== currentUserId);
                setSearchResults(filteredResults);
                if (filteredResults.length === 0 && res.data.length > 0) {
                    setError("No other users found with that name");
                }
            } else {
                setError(res.message || "Failed to search users");
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error searching users:", err);
            setError("Error searching users");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (recipientId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to send friend requests.");
            return;
        }

        setRequestStatus(prev => ({ ...prev, [recipientId]: "loading" }));

        try {
            const res = await friendsAPI.sendRequest(recipientId);
            if (res.success) {
                setRequestStatus(prev => ({ ...prev, [recipientId]: "sent" }));
            } else {
                setRequestStatus(prev => ({ ...prev, [recipientId]: "error" }));
                alert(res.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Error sending friend request:", err);
            setRequestStatus(prev => ({ ...prev, [recipientId]: "error" }));
            if (err.message && err.message.includes("Failed to fetch")) {
                alert("Server unavailable. Ensure the backend (http://localhost:5000) is running");
            } else {
                alert("Error sending friend request");
            }
        }
    };

    const getAvatarUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    return (
        <div className="friend-search-container">
            <div className="search-section">
                <h2>Find Friends</h2>
                <form onSubmit={handleSearch}>
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>

                {error && <div className="error-message">{error}</div>}

                <div className="search-results">
                    {loading && <div className="loading">Searching...</div>}

                    {!loading && searchResults.length === 0 && searchQuery && (
                        <div className="no-results">No users found</div>
                    )}

                    {!loading && searchResults.length > 0 && (
                        <div className="results-list">
                            {searchResults.map(user => (
                                <div key={user._id} className="user-card">
                                    <div className="user-info">
                                        {user.avatar && (
                                            <img
                                                src={getAvatarUrl(user.avatar)}
                                                alt={user.displayName || user.username}
                                                className="user-avatar"
                                            />
                                        )}
                                        <div className="user-details">
                                            <h3>{user.displayName || user.username}</h3>
                                            <p className="user-username">@{user.username}</p>
                                            {user.bio && <p className="user-bio">{user.bio}</p>}
                                        </div>
                                    </div>
                                    <button
                                        className={`add-friend-btn ${requestStatus[user._id] || ""}`}
                                        onClick={() => handleSendRequest(user._id)}
                                        disabled={requestStatus[user._id] === "loading" || requestStatus[user._id] === "sent"}
                                    >
                                        {requestStatus[user._id] === "loading" && "Sending..."}
                                        {requestStatus[user._id] === "sent" && "✓ Sent"}
                                        {requestStatus[user._id] === "error" && "Error"}
                                        {!requestStatus[user._id] && "Add Friend"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

