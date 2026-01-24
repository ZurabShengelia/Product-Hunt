import React, { useState, useEffect } from "react";
import { friendsAPI, userAPI } from "../services/api";
import "./FriendRequests.css";

export default function FriendRequests({ onCountChange }) {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [senderData, setSenderData] = useState({});
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const [avatarError, setAvatarError] = useState({});

    useEffect(() => {
        fetchPendingRequests();
        const interval = setInterval(fetchPendingRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(pendingRequests.length);
        }
    }, [pendingRequests, onCountChange]);

    const fetchPendingRequests = async () => {
        try {
            const res = await friendsAPI.getPendingRequests();
            if (res.success) {
                setPendingRequests(res.data || []);
                
                if (res.data && res.data.length > 0) {
                    fetchSendersData(res.data);
                }
            }
        } catch (err) {
            console.error("Error fetching pending requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSendersData = async (requests) => {
        try {
            const data = {};
            
            for (const request of requests) {
                
                const userId = typeof request.senderId === 'string' ? request.senderId : request.senderId._id;
                
                
                if (typeof request.senderId === 'object' && request.senderId._id) {
                    data[userId] = request.senderId;
                } else {
                    
                    const res = await userAPI.getUserById(userId);
                    if (res.success) {
                        data[userId] = res.data;
                    }
                }
            }
            
            setSenderData(data);
        } catch (err) {
            console.error("Error fetching sender data:", err);
        }
    };

    const handleAccept = async (requestId, senderId) => {
        setProcessing(prev => ({ ...prev, [requestId]: "accepting" }));
        try {
            const res = await friendsAPI.acceptRequest(requestId);
            if (res.success) {
                setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            }
        } catch (err) {
            console.error("Error accepting request:", err);
        } finally {
            setProcessing(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const handleReject = async (requestId) => {
        setProcessing(prev => ({ ...prev, [requestId]: "rejecting" }));
        try {
            const res = await friendsAPI.rejectRequest(requestId);
            if (res.success) {
                setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            }
        } catch (err) {
            console.error("Error rejecting request:", err);
        } finally {
            setProcessing(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const getAvatarUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    if (loading) {
        return <div className="friend-requests-container loading">Loading friend requests...</div>;
    }

    if (pendingRequests.length === 0) {
        return (
            <div className="friend-requests-container empty">
                <p>No pending friend requests</p>
            </div>
        );
    }

    return (
        <div className="friend-requests-container">
            <h3>Friend Requests ({pendingRequests.length})</h3>
            <div className="requests-list">
                {pendingRequests.map(request => {
                    const senderId = typeof request.senderId === 'string' ? request.senderId : request.senderId._id;
                    const sender = senderData[senderId] || request.senderId || {};
                    return (
                        <div key={request._id} className="request-item">
                            <div className="request-sender-info">
                                {sender.avatar && !avatarError[senderId] ? (
                                    <img 
                                        src={getAvatarUrl(sender.avatar)} 
                                        alt={sender.displayName || sender.username} 
                                        className="sender-avatar"
                                        onError={() => setAvatarError(prev => ({ ...prev, [senderId]: true }))}
                                    />
                                ) : (
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, rgb(0, 102, 204), rgb(102, 51, 153))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        color: "rgb(248, 249, 252)",
                                        border: "2px solid rgb(0, 153, 204)",
                                        boxShadow: "none",
                                        flexShrink: 0
                                    }}>{(sender.displayName || sender.username || "U").charAt(0).toUpperCase()}</div>
                                )}
                                <div className="sender-details">
                                    <p className="sender-name">{sender.displayName || sender.username || "Unknown User"}</p>
                                    <p className="request-time">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="request-actions">
                                <button
                                    className="accept-btn"
                                    onClick={() => handleAccept(request._id, senderId)}
                                    disabled={processing[request._id] === "accepting"}
                                >
                                    {processing[request._id] === "accepting" ? "..." : "Confirm"}
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => handleReject(request._id)}
                                    disabled={processing[request._id] === "rejecting"}
                                >
                                    {processing[request._id] === "rejecting" ? "..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
