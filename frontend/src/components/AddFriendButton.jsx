import React, { useState, useEffect } from "react";
import { friendsAPI } from "../services/api";
import "./AddFriendButton.css";

export default function AddFriendButton({ userId, onStatusChange }) {
    const [status, setStatus] = useState("loading"); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000); 
        return () => clearInterval(interval);
    }, [userId]);

    const checkStatus = async () => {
        try {
            const res = await friendsAPI.checkFriendStatus(userId);
            if (res.success) {
                setStatus(res.data.status);
                onStatusChange?.(res.data.status);
            }
        } catch (err) {
            console.error("Error checking friend status:", err);
        }
    };

    const handleSendRequest = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const res = await friendsAPI.sendRequest(userId);
            if (res.success) {
                setStatus("requestSent");
                onStatusChange?.("requestSent");
            } else {
                setError(res.message || "Failed to send friend request");
            }
        } catch (err) {
            setError("Error sending friend request");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelRequest = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            
            const sentRequests = await friendsAPI.getSentRequests();
            const request = sentRequests.data?.find(r => r.recipientId === userId);
            
            if (request) {
                const res = await friendsAPI.cancelRequest(request._id);
                if (res.success) {
                    setStatus("none");
                    onStatusChange?.("none");
                }
            }
        } catch (err) {
            setError("Error canceling request");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAcceptRequest = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            
            const pendingRequests = await friendsAPI.getPendingRequests();
            const request = pendingRequests.data?.find(r => r.senderId === userId);
            
            if (request) {
                const res = await friendsAPI.acceptRequest(request._id);
                if (res.success) {
                    setStatus("friends");
                    onStatusChange?.("friends");
                }
            }
        } catch (err) {
            setError("Error accepting request");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectRequest = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            
            const pendingRequests = await friendsAPI.getPendingRequests();
            const request = pendingRequests.data?.find(r => r.senderId === userId);
            
            if (request) {
                const res = await friendsAPI.rejectRequest(request._id);
                if (res.success) {
                    setStatus("none");
                    onStatusChange?.("none");
                }
            }
        } catch (err) {
            setError("Error rejecting request");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!window.confirm("Remove this friend?")) return;
        
        setIsProcessing(true);
        setError(null);
        try {
            const res = await friendsAPI.removeFriend(userId);
            if (res.success) {
                setStatus("none");
                onStatusChange?.("none");
            }
        } catch (err) {
            setError("Error removing friend");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (status === "loading") {
        return <button className="friend-btn loading" disabled>...</button>;
    }

    if (status === "self") {
        return null;
    }

    if (status === "friends") {
        return (
            <button 
                className="friend-btn friends"
                onClick={handleRemoveFriend}
                disabled={isProcessing}
            >
                {isProcessing ? "..." : "✓ Friends"}
            </button>
        );
    }

    if (status === "requestSent") {
        return (
            <button 
                className="friend-btn request-sent"
                onClick={handleCancelRequest}
                disabled={isProcessing}
            >
                {isProcessing ? "..." : "Pending"}
            </button>
        );
    }

    if (status === "requestReceived") {
        return (
            <div className="friend-request-actions">
                <button 
                    className="friend-btn accept"
                    onClick={handleAcceptRequest}
                    disabled={isProcessing}
                >
                    {isProcessing ? "..." : "Confirm"}
                </button>
                <button 
                    className="friend-btn reject"
                    onClick={handleRejectRequest}
                    disabled={isProcessing}
                >
                    {isProcessing ? "..." : "✕"}
                </button>
            </div>
        );
    }

    
    return (
        <button 
            className="friend-btn add"
            onClick={handleSendRequest}
            disabled={isProcessing}
        >
            {isProcessing ? "..." : "+ Add Friend"}
        </button>
    );
}

