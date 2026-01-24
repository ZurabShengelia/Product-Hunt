import React, { useState, useEffect } from "react";
import Messages from "../components/Messages";
import FriendRequests from "../components/FriendRequests";
import MyFriends from "../components/MyFriends";
import FriendSearch from "../components/FriendSearch";
import { onlineStatusAPI, messagesAPI, friendsAPI } from "../services/api";
import "./Friends.css";

export default function Friends({ user, onNavigate, initialTab, unreadMessageCount, onUnreadChange, pendingRequestCount, onPendingRequestChange }) {
    const [activeTab, setActiveTab] = useState(initialTab || "messages");
    

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    
    useEffect(() => {
        const setOnline = async () => {
            try {
                await onlineStatusAPI.setOnline();
            } catch (err) {
                console.error("Error setting online status:", err);
            }
        };

        setOnline();

        
        return () => {
            const setOffline = async () => {
                try {
                    await onlineStatusAPI.setOffline();
                } catch (err) {
                    console.error("Error setting offline status:", err);
                }
            };
            setOffline();
        };
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (onNavigate) {
            if (tab === "messages") onNavigate("messages");
            if (tab === "requests") onNavigate("friend-requests");
            if (tab === "friends") onNavigate("friends-list");
            if (tab === "search") onNavigate("friend-search");
        }
    };

    return (
        <div className="friends-page-container">
            <div className="friends-tabs">
                <button
                    className={`tab-button ${activeTab === "messages" ? "active" : ""}`}
                    onClick={() => handleTabChange("messages")}
                    title="Messages"
                >
                    <span className="tab-icon">💬</span>
                    <span className="tab-label">Messages</span>
                    {unreadMessageCount > 0 && <span className="badge">{unreadMessageCount}</span>}
                </button>
                <button
                    className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => handleTabChange("requests")}
                    title="Friend Requests"
                >
                    <span className="tab-icon">👥</span>
                    <span className="tab-label">Requests</span>
                    {pendingRequestCount > 0 && <span className="badge">{pendingRequestCount}</span>}
                </button>
                <button
                    className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
                    onClick={() => handleTabChange("friends")}
                    title="My Friends"
                >
                    <span className="tab-icon">👫</span>
                    <span className="tab-label">Friends</span>
                </button>
                <button
                    className={`tab-button ${activeTab === "search" ? "active" : ""}`}
                    onClick={() => handleTabChange("search")}
                    title="Find Friends"
                >
                    <span className="tab-icon">🔍</span>
                    <span className="tab-label">Find Friends</span>
                </button>
            </div>

            <div className="friends-content">
                {activeTab === "messages" && <Messages onUnreadChange={onUnreadChange} />}
                {activeTab === "requests" && <FriendRequests onCountChange={onPendingRequestChange} />}
                {activeTab === "friends" && <MyFriends />}
                {activeTab === "search" && <FriendSearch />}
            </div>

            <style>{`
                .friends-page-container {
                    width: 100%;
                    height: calc(100vh - 80px);
                    display: flex;
                    flex-direction: column;
                    background: var(--bg);
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .friends-tabs {
                    display: flex;
                    gap: 0;
                    background: var(--card-bg);
                    border-bottom: 1px solid var(--border);
                    padding: 0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .tab-button {
                    flex: 1;
                    padding: 16px 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 3px solid transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                }

                .tab-button:hover {
                    color: var(--text-primary);
                }

                .tab-icon {
                    font-size: 18px;
                    display: inline-block;
                }

                .tab-label {
                    display: inline-block;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    background: #dc3545;
                    color: white;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-left: 4px;
                }

                [data-theme="light"] .tab-button.active {
                    color: #007bff;
                    border-bottom-color: #007bff;
                }

                [data-theme="cyber"] .tab-button.active {
                    color: #00ff88;
                    border-bottom-color: #00ff88;
                    text-shadow: 0 0 8px #00ff88;
                }

                .friends-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                @media (max-width: 600px) {
                    .friends-page-container {
                        height: calc(100vh - 120px);
                    }

                    .tab-label {
                        display: none;
                    }

                    .tab-button {
                        padding: 12px 8px;
                    }
                }
            `}</style>
        </div>
    );
}

