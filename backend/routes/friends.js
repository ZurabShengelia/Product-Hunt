import express from "express";
import FriendRequest from "../models/FriendRequest.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "./auth.js";

const router = express.Router();


router.post("/request/send", verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.userId;

    
    if (senderId === recipientId) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID required" });
    }

    
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    
    const existingFriend = await Friend.findOne({
      $or: [
        { userId: senderId, friendId: recipientId },
        { userId: recipientId, friendId: senderId }
      ]
    });

    if (existingFriend) {
      return res.status(400).json({ success: false, message: "Already friends" });
    }

    
    const existingRequest = await FriendRequest.findOne({
      senderId,
      receiverId: recipientId
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ success: false, message: "Friend request already sent" });
      } else if (existingRequest.status === "accepted") {
        return res.status(400).json({ success: false, message: "Already friends" });
      } else {
        
        existingRequest.status = "pending";
        await existingRequest.save();

        
        try {
          const sender = await User.findById(senderId);
          const senderName = sender?.displayName || sender?.username || 'Someone';
          
          await Notification.create({
            userId: recipientId,
            type: 'friendRequest',
            title: `${senderName} sent you a friend request`,
            message: `${senderName} wants to be your friend`,
            fromUserId: senderId,
            read: false
          });
        } catch (notifError) {
          console.warn("Could not create friend request notification:", notifError.message);
        }

        return res.status(200).json({ success: true, message: "Friend request sent" });
      }
    }

    
    const reverseRequest = await FriendRequest.findOne({
      senderId: recipientId,
      receiverId: senderId,
      status: "pending"
    });

    if (reverseRequest) {
      return res.status(400).json({ success: false, message: "This user already sent you a request" });
    }

    
    const friendRequest = new FriendRequest({
      senderId,
      receiverId: recipientId,
      status: "pending"
    });

    try {
      await friendRequest.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: "Friend request already exists" });
      }
      throw err;
    }

    
    try {
      const sender = await User.findById(senderId);
      const senderName = sender?.displayName || sender?.username || 'Someone';
      
      await Notification.create({
        userId: recipientId,
        type: 'friendRequest',
        title: `${senderName} sent you a friend request`,
        message: `${senderName} wants to be your friend`,
        fromUserId: senderId,
        read: false
      });
    } catch (notifError) {
      console.warn("Could not create friend request notification:", notifError.message);
    }

    res.status(201).json({
      success: true,
      friendRequest,
      message: "Friend request sent"
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/requests/pending", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const pendingRequests = await FriendRequest.find({
      receiverId: userId,
      status: "pending"
    })
      .populate("senderId", "username displayName avatar bio")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: pendingRequests });
  } catch (error) {
    console.error("Fetch pending requests error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/requests/sent", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const sentRequests = await FriendRequest.find({
      senderId: userId,
      status: "pending"
    })
      .populate("receiverId", "username displayName avatar bio")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: sentRequests });
  } catch (error) {
    console.error("Fetch sent requests error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post("/request/accept", verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    
    if (friendRequest.receiverId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    
    friendRequest.status = "accepted";
    await friendRequest.save();

    
    const senderId = friendRequest.senderId;
    
    
    const [user1, user2] = senderId < userId 
      ? [senderId, userId] 
      : [userId, senderId];

    const friend = new Friend({
      userId: user1,
      friendId: user2
    });

    await friend.save();

    
    try {
      const receiver = await User.findById(userId);
      const receiverName = receiver?.displayName || receiver?.username || 'Someone';
      
      await Notification.create({
        userId: senderId,
        type: 'friendAccepted',
        title: `${receiverName} accepted your friend request`,
        message: `${receiverName} is now your friend`,
        fromUserId: userId,
        read: false
      });
    } catch (notifError) {
      console.warn("Could not create accept notification:", notifError.message);
    }

    res.json({
      success: true,
      message: "Friend request accepted"
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/request/reject", verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    
    if (friendRequest.receiverId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    
    friendRequest.status = "rejected";
    await friendRequest.save();

    res.json({
      success: true,
      message: "Friend request rejected"
    });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/list", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const friends = await Friend.find({
      $or: [
        { userId: userId },
        { friendId: userId }
      ]
    })
      .populate("userId", "username displayName avatar bio")
      .populate("friendId", "username displayName avatar bio")
      .sort({ createdAt: -1 })
      .limit(1000);

    
    const friendList = friends.map(f => {
      const isFriend = f.userId._id.toString() === userId ? f.friendId : f.userId;
      return {
        ...isFriend._doc || isFriend,
        friendshipId: f._id
      };
    });

    res.json({ success: true, data: friendList });
  } catch (error) {
    console.error("Fetch friends error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/status/:userId", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.json({ status: "self" });
    }

    
    const friend = await Friend.findOne({
      $or: [
        { userId: currentUserId, friendId: targetUserId },
        { userId: targetUserId, friendId: currentUserId }
      ]
    });

    if (friend) {
      return res.json({ status: "friends" });
    }

    
    const sentRequest = await FriendRequest.findOne({
      senderId: currentUserId,
      receiverId: targetUserId,
      status: "pending"
    });

    if (sentRequest) {
      return res.json({ status: "requestSent" });
    }

    const receivedRequest = await FriendRequest.findOne({
      senderId: targetUserId,
      receiverId: currentUserId,
      status: "pending"
    });

    if (receivedRequest) {
      return res.json({ status: "requestReceived" });
    }

    res.json({ status: "none" });
  } catch (error) {
    console.error("Check friend status error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/request/cancel", verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    
    if (friendRequest.senderId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    
    await FriendRequest.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: "Friend request cancelled"
    });
  } catch (error) {
    console.error("Cancel friend request error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/remove", verifyToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.userId;

    
    await Friend.findOneAndDelete({
      $or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    });

    res.json({
      success: true,
      message: "Friend removed"
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/search", verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, 
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { displayName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
          ]
        }
      ]
    })
    .select("username displayName avatar")
    .limit(20);

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

