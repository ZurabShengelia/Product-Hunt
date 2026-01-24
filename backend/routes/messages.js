import express from "express";
import Message from "../models/Message.js";
import Friend from "../models/Friend.js";
import { verifyToken } from "./auth.js";

const router = express.Router();


router.post("/send", verifyToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.userId;

    
    if (!recipientId || !content) {
      return res.status(400).json({ error: "Recipient and content required" });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    
    const areFriends = await Friend.findOne({
      $or: [
        { userId: senderId, friendId: recipientId },
        { userId: recipientId, friendId: senderId }
      ]
    });

    if (!areFriends) {
      return res.status(403).json({ error: "You can only message friends" });
    }

    
    const message = new Message({
      senderId,
      receiverId: recipientId,
      content: content.trim(),
      seen: false
    });

    await message.save();

    
    await message.populate("senderId", "username displayName avatar");

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/conversation/:friendId", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const friendId = req.params.friendId;

    
    const areFriends = await Friend.findOne({
      $or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    });

    if (!areFriends) {
      return res.status(403).json({ error: "You can only view messages with friends" });
    }

    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    })
      .populate("senderId", "username displayName avatar")
      .sort({ createdAt: 1 })
      .limit(100);

    
    await Message.updateMany(
      {
        receiverId: userId,
        senderId: friendId,
        seen: false
      },
      {
        seen: true,
        seenAt: new Date()
      }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/conversations", verifyToken, async (req, res) => {
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
      .sort({ createdAt: -1 });

    
    const conversations = await Promise.all(
      friends.map(async (f) => {
        const friendUser = f.userId._id.toString() === userId ? f.friendId : f.userId;
        const friendId = friendUser._id;

        const latestMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          senderId: friendId,
          receiverId: userId,
          seen: false
        });

        return {
          friend: friendUser,
          latestMessage,
          unreadCount
        };
      })
    );

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      seen: false
    });

    res.json({ success: true, data: unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

