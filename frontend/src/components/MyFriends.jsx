import React, { useState, useEffect, useCallback } from "react";
import { friendsAPI, onlineStatusAPI } from "../services/api";
import "./MyFriends.css";

export default function MyFriends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onlineStatus, setOnlineStatus] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [avatarError, setAvatarError] = useState({});

    const loadOnlineStatus = useCallback(async (friendsList) => {
        try {
            const friendIds = friendsList.map(f => f._id);
            const res = await onlineStatusAPI.getBatchStatus(friendIds);
            if (res.success || res instanceof Object) {
                setOnlineStatus(res);
            }
        } catch (err) {
            console.error("Error loading online status:", err);
        }
    }, []);

    useEffect(() => {
        const loadFriends = async () => {
            try {
                const res = await friendsAPI.getFriendsList();
                if (res.success) {
                    setFriends(res.data || []);
                    
                    if (res.data && res.data.length > 0) {
                        loadOnlineStatus(res.data);
                    }
                }
            } catch (err) {
                console.error("Error loading friends:", err);
            } finally {
                setLoading(false);
            }
        };

        loadFriends();
        const interval = setInterval(loadFriends, 15000); 
        return () => clearInterval(interval);
    }, [loadOnlineStatus]);

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm("Are you sure you want to remove this friend?")) return;

        try {
            const res = await friendsAPI.removeFriend(friendId);
            if (res.success) {
                setFriends(prev => prev.filter(f => f._id !== friendId));
            }
        } catch (err) {
            console.error("Error removing friend:", err);
            alert("Failed to remove friend");
        }
    };

    const filteredFriends = friends.filter(friend => {
        const searchLower = searchQuery.toLowerCase();
        return (
            friend.displayName?.toLowerCase().includes(searchLower) ||
            friend.username?.toLowerCase().includes(searchLower)
        );
    });

    const getAvatarUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    if (loading) {
        return <div className="my-friends-container loading">Loading friends...</div>;
    }

    if (friends.length === 0) {
        return (
            <div className="my-friends-container empty">
                <div className="empty-state">
                    <p>👫 No friends yet</p>
                    <p>Go to Find Friends to add people!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-friends-container">
            <div className="friends-header">
                <h3>My Friends ({filteredFriends.length})</h3>
                <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {filteredFriends.length === 0 ? (
                <div className="no-results">No friends found</div>
            ) : (
                <div className="friends-grid">
                    {filteredFriends.map(friend => {
                        const status = onlineStatus[friend._id];
                        const isOnline = status?.isOnline;

                        return (
                            <div key={friend._id} className="friend-card">
                                <div className="friend-avatar-wrapper">
                                    {friend.avatar && !avatarError[friend._id] ? (
                                        <img
                                            src={getAvatarUrl(friend.avatar)}
                                            alt={friend.displayName}
                                            className="friend-avatar"
                                            loading="lazy"
                                            onError={() => setAvatarError(prev => ({ ...prev, [friend._id]: true }))}
                                        />
                                    ) : (
                                        <div style={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, rgb(0, 102, 204), rgb(102, 51, 153))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "18px",
                                            fontWeight: "700",
                                            color: "rgb(248, 249, 252)",
                                            border: "2px solid rgb(0, 153, 204)",
                                            boxShadow: "none"
                                        }}>{(friend.displayName || friend.username || "F").charAt(0).toUpperCase()}</div>
                                    )}
                                    {isOnline && <span className="online-indicator"></span>}
                                </div>
                                <div className="friend-info">
                                    <h4>{friend.displayName || friend.username}</h4>
                                    {friend.bio && <p className="friend-bio">{friend.bio}</p>}
                                    <p className="online-status">
                                        {isOnline ? "🟢 Online" : "⚫ Offline"}
                                    </p>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveFriend(friend._id)}
                                    title="Remove friend"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
