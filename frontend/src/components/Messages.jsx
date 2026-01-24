import React, { useState, useEffect, useRef, useCallback } from "react";
import { messagesAPI, onlineStatusAPI } from "../services/api";
import "./Messages.css";

export default function Messages({ onUnreadChange }) {
    const [conversations, setConversations] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState({});
    const [searching, setSearching] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesListRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [avatarError, setAvatarError] = useState({});
    const lastMessageIdRef = useRef(null);

    
    const getAvatarUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

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

    const loadOnlineStatus = useCallback(async (friendIds) => {
        try {
            const res = await onlineStatusAPI.getBatchStatus(friendIds);
            setOnlineStatus(res.success ? res.data : res);
        } catch (err) {
            console.error("Error loading online status:", err);
        }
    }, []);

    
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const res = await messagesAPI.getConversations();
                const data = (res.success ? res.data : res) || [];
                setConversations(data);

                
                const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                if (onUnreadChange) onUnreadChange(totalUnread);

                
                if (data.length > 0) {
                    const friendIds = data.map(c => c.friend._id);
                    loadOnlineStatus(friendIds);
                }
            } catch (err) {
                console.error("Error loading conversations:", err);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, [onUnreadChange, loadOnlineStatus]);

    
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedFriend) return;
            try {
                const res = await messagesAPI.getConversation(selectedFriend);
                const data = (res.success ? res.data : res) || [];

                const mappedMessages = data.map(msg => ({
                    ...msg,
                    isOwn: msg.senderId === currentUserId || (msg.senderId && msg.senderId._id === currentUserId),
                    senderId: (msg.senderId && msg.senderId._id) || msg.senderId
                }));
                setMessages(mappedMessages);

                
                setConversations(prev =>
                    prev.map(conv =>
                        conv.friend._id === selectedFriend
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                );

                
                if (onUnreadChange) {
                    const totalUnread = conversations.reduce((sum, c) => {
                        if (c.friend._id === selectedFriend) return sum;
                        return sum + (c.unreadCount || 0);
                    }, 0);
                    onUnreadChange(totalUnread);
                }
            } catch (err) {
                console.error("Error loading messages:", err);
            }
        };

        if (selectedFriend) {
            loadMessages();
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedFriend, currentUserId, onUnreadChange, conversations]);

    
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        const lastMsgId = lastMsg?._id;

        if (autoScroll && (lastMsgId !== lastMessageIdRef.current || messages.length === 0)) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        lastMessageIdRef.current = lastMsgId;
    }, [messages, autoScroll]);

    const handleMessagesScroll = (e) => {
        const el = e.target;
        
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        setAutoScroll(atBottom);
    };






    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        const content = newMessage.trim();
        setNewMessage("");

        try {
            await messagesAPI.sendMessage(selectedFriend, content);
            
            const res = await messagesAPI.getConversation(selectedFriend);
            const data = (res.success ? res.data : res) || [];
            const mappedMessages = data.map(msg => ({
                ...msg,
                isOwn: msg.senderId === currentUserId || (msg.senderId && msg.senderId._id === currentUserId),
                senderId: (msg.senderId && msg.senderId._id) || msg.senderId
            }));
            setMessages(mappedMessages);
            setAutoScroll(true);
            inputRef.current?.focus();
        } catch (err) {
            console.error("Error sending message:", err);
            setNewMessage(content);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
    };

    const formatLastMessage = (text, maxLength = 50) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const filteredConversations = conversations.filter(conv => {
        const searchLower = searching.toLowerCase();
        return (
            conv.friend.displayName?.toLowerCase().includes(searchLower) ||
            conv.friend.username?.toLowerCase().includes(searchLower)
        );
    });

    const selectedFriendData = conversations.find(c => c.friend._id === selectedFriend)?.friend;
    const selectedStatus = onlineStatus[selectedFriend];

    return (
        <div className="messages-container">
            <div className="conversations-panel">
                <div className="conversations-header">
                    <h3>Messages</h3>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searching}
                        onChange={(e) => setSearching(e.target.value)}
                        className="search-conversations"
                    />
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : filteredConversations.length === 0 ? (
                    <div className="empty-conversations">
                        <p>No messages yet</p>
                    </div>
                ) : (
                    <div className="conversations-list">
                        {filteredConversations.map(conv => {
                            const isSelected = selectedFriend === conv.friend._id;
                            const isOnline = onlineStatus[conv.friend._id]?.isOnline;
                            const hasUnread = conv.unreadCount > 0;

                            return (
                                <div
                                    key={conv.friend._id}
                                    className={`conversation-item ${isSelected ? "active" : ""} ${hasUnread ? "unread" : ""}`}
                                    onClick={() => { setSelectedFriend(conv.friend._id); setAutoScroll(true); }}
                                >
                                    <div className="conversation-avatar-wrapper">
                                        {conv.friend.avatar && !avatarError[conv.friend._id] ? (
                                            <img
                                                src={getAvatarUrl(conv.friend.avatar)}
                                                alt={conv.friend.displayName}
                                                className="conversation-avatar"
                                                loading="lazy"
                                                onError={() => setAvatarError(prev => ({ ...prev, [conv.friend._id]: true }))}
                                            />
                                        ) : (
                                            <div className="conversation-avatar-placeholder">👤</div>
                                        )}
                                        {isOnline && <span className="online-dot"></span>}
                                    </div>

                                    <div className="conversation-content">
                                        <div className="conversation-header-row">
                                            <h4>{conv.friend.displayName || conv.friend.username}</h4>
                                            <span className="message-time">
                                                {conv.latestMessage ? formatTime(conv.latestMessage.createdAt) : ""}
                                            </span>
                                        </div>
                                        <p className="last-message">
                                            {conv.latestMessage
                                                ? formatLastMessage(conv.latestMessage.content)
                                                : "No messages"}
                                        </p>
                                    </div>

                                    {hasUnread && <span className="unread-badge">{conv.unreadCount}</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="chat-panel">
                {selectedFriend ? (
                    <>
                        <div className="chat-header">
                            {selectedFriendData && (
                                <>
                                    <div className="chat-friend-info">
                                        {selectedFriendData?.avatar && !avatarError[selectedFriend] ? (
                                            <img
                                                src={getAvatarUrl(selectedFriendData.avatar)}
                                                alt={selectedFriendData.displayName}
                                                className="chat-avatar"
                                                loading="lazy"
                                                onError={() => setAvatarError(prev => ({ ...prev, [selectedFriend]: true }))}
                                            />
                                        ) : (
                                            <div className="chat-avatar-placeholder">👤</div>
                                        )}
                                        <div>
                                            <h3>{selectedFriendData.displayName || selectedFriendData.username}</h3>
                                            <p className="status">
                                                {selectedStatus?.isOnline ? "🟢 Active now" : "⚫ Offline"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="messages-list" ref={messagesListRef} onScroll={handleMessagesScroll}>
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>No messages yet. Say hi! 👋</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const showAvatar =
                                        idx === 0 ||
                                        messages[idx - 1].senderId !== msg.senderId;

                                    return (
                                        <div
                                            key={msg._id || idx}
                                            className={`message-group ${msg.isOwn ? "own" : "other"}`}
                                        >
                                            {!msg.isOwn && showAvatar && (
                                                <div className="message-avatar">
                                                    {selectedFriendData?.avatar && !avatarError[selectedFriend] ? (
                                                        <img
                                                            src={getAvatarUrl(selectedFriendData.avatar)}
                                                            alt="sender"
                                                            loading="lazy"
                                                            onError={() => setAvatarError(prev => ({ ...prev, [selectedFriend]: true }))}
                                                        />
                                                    ) : (
                                                        <span>👤</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="message-bubble">
                                                <p>{msg.content}</p>
                                                <span className="message-time">
                                                    {formatTime(msg.createdAt)}
                                                    {msg.isOwn && msg.seen && " ✓✓"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Aa"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="message-input"
                            />
                            <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>💬 Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}

