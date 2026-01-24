import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "./auth.js";

const router = express.Router();


router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`[NOTIF FETCH] Fetching notifications for user: ${userId}`);
    
    const notifications = await Notification.find({ userId })
      .populate("fromUserId", "username avatar displayName")
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`[NOTIF FETCH] Found ${notifications.length} notifications`);

    const unreadCount = await Notification.countDocuments({ userId, read: false });
    console.log(`[NOTIF FETCH] Unread count: ${unreadCount}`);

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});


router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`[NOTIF COUNT] Fetching unread count for user: ${userId}`);
    
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    console.log(`[NOTIF COUNT] Unread count: ${unreadCount}`);

    res.json({ unreadCount });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});


router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { userId, type, title, message, projectId, fromUserId } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      projectId,
      fromUserId
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;

