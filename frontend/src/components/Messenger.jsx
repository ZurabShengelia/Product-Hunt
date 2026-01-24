import React, { useState, useEffect, useRef } from "react";
import { messagesAPI, friendsAPI, onlineStatusAPI, userAPI } from "../services/api";
import "./Messenger.css";

export default function Messenger() {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState({});
    const [friendsData, setFriendsData] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const messagesEndRef = useRef(null);

    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch (err) {
                console.error("Error decoding token:", err);
            }
        }
    }, []);

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 30000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedFriend) {
            loadConversation();
            const interval = setInterval(loadConversation, 5000); 
            return () => clearInterval(interval);
        }
    }, [selectedFriend]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await messagesAPI.getConversations();
            if (res.success && res.data) {
                
                const friendIds = res.data.map(conv => conv.friend._id);
                setFriends(friendIds);
                
                
                const counts = {};
                const userData = {};
                const statusData = {};

                for (const conv of res.data) {
                    const friendId = conv.friend._id;
                    counts[friendId] = conv.unreadCount;
                    userData[friendId] = conv.friend;

                    
                    try {
                        const statusRes = await onlineStatusAPI.getStatus(friendId);
                        if (statusRes.success) {
                            statusData[friendId] = statusRes.data;
                        }
                    } catch (err) {
                        console.error(`Error loading status for ${friendId}:`, err);
                    }
                }

                setUnreadCounts(counts);
                setFriendsData(userData);
                setOnlineStatus(statusData);
            } else if (Array.isArray(res)) {
                
                const friendIds = res.map(conv => conv.friend._id);
                setFriends(friendIds);
                
                const counts = {};
                const userData = {};
                for (const conv of res) {
                    counts[conv.friend._id] = conv.unreadCount;
                    userData[conv.friend._id] = conv.friend;
                }
                setUnreadCounts(counts);
                setFriendsData(userData);
            }
        } catch (err) {
            console.error("Error loading conversations:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async () => {
        if (!selectedFriend) return;

        try {
            const res = await messagesAPI.getConversation(selectedFriend);
            if (res.success) {
                
                const mappedMessages = res.data?.map(msg => ({
                    ...msg,
                    isOwn: msg.senderId === currentUserId || msg.senderId._id === currentUserId
                })) || [];
                setMessages(mappedMessages);
                
                
                setUnreadCounts(prev => ({ ...prev, [selectedFriend]: 0 }));
            } else if (Array.isArray(res)) {
                
                const mappedMessages = res.map(msg => ({
                    ...msg,
                    isOwn: msg.senderId === currentUserId || msg.senderId._id === currentUserId
                }));
                setMessages(mappedMessages);
                setUnreadCounts(prev => ({ ...prev, [selectedFriend]: 0 }));
            }
        } catch (err) {
            console.error("Error loading conversation:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        const messageContent = newMessage;
        setNewMessage("");

        try {
            const res = await messagesAPI.sendMessage(selectedFriend, messageContent);
            if (res.success) {
                loadConversation();
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setNewMessage(messageContent); 
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getFriendName = (friendId) => {
        return friendsData[friendId]?.displayName || "Loading...";
    };

    const getFriendAvatar = (friendId) => {
        return friendsData[friendId]?.avatar || "/default-avatar.png";
    };

    const isOnline = (friendId) => {
        return onlineStatus[friendId]?.isOnline || false;
    };

    if (loading) {
        return <div className="messenger-container loading">Loading messenger...</div>;
    }

    if (friends.length === 0) {
        return (
            <div className="messenger-container empty">
                <p>No friends yet. Start by adding some friends!</p>
            </div>
        );
    }

    return (
        <div className="messenger-container">
            <div className="messenger-sidebar">
                <h2>Messages</h2>
                <div className="friends-list">
                    {friends.map(friendId => (
                        <div
                            key={friendId}
                            className={`friend-item ${selectedFriend === friendId ? "active" : ""}`}
                            onClick={() => setSelectedFriend(friendId)}
                        >
                            <div className="friend-item-avatar">
                                <img src={getFriendAvatar(friendId)} alt={getFriendName(friendId)} />
                                {isOnline(friendId) && <div className="online-indicator"></div>}
                            </div>
                            <div className="friend-item-info">
                                <p className="friend-name">{getFriendName(friendId)}</p>
                                <p className="friend-status">
                                    {isOnline(friendId) ? "Online" : "Offline"}
                                </p>
                            </div>
                            {unreadCounts[friendId] > 0 && (
                                <div className="unread-badge">{unreadCounts[friendId]}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="messenger-main">
                {selectedFriend ? (
                    <>
                        <div className="message-header">
                            <img src={getFriendAvatar(selectedFriend)} alt={getFriendName(selectedFriend)} className="header-avatar" />
                            <div className="header-info">
                                <h3>{getFriendName(selectedFriend)}</h3>
                                <p className={isOnline(selectedFriend) ? "online" : "offline"}>
                                    {isOnline(selectedFriend) ? "● Online" : "● Offline"}
                                </p>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`message ${msg.isOwn ? "sent" : "received"}`}
                                    >
                                        <div className="message-bubble">
                                            <p>{msg.content}</p>
                                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                                        </div>
                                        {msg.seen && msg.isOwn && (
                                            <span className="seen-indicator">✓✓</span>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                rows="1"
                                maxLength="5000"
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-selection">
                        <p>Select a friend to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}

