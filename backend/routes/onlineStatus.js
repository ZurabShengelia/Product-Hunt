import express from "express";
import OnlineStatus from "../models/OnlineStatus.js";
import { verifyToken } from "./auth.js";

const router = express.Router();


router.post("/online", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const status = await OnlineStatus.findOneAndUpdate(
      { userId },
      {
        isOnline: true,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error("Set online status error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/offline", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const status = await OnlineStatus.findOneAndUpdate(
      { userId },
      {
        isOnline: false,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error("Set offline status error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/status/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const status = await OnlineStatus.findOne({ userId }).lean();

    if (!status) {
      return res.json({
        isOnline: false,
        lastActive: null
      });
    }

    res.json(status);
  } catch (error) {
    console.error("Get online status error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/status/batch", verifyToken, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    const statuses = await OnlineStatus.find({
      userId: { $in: userIds }
    }).lean();

    const statusMap = {};
    userIds.forEach(id => {
      const status = statuses.find(s => s.userId.toString() === id);
      statusMap[id] = status || {
        isOnline: false,
        lastActive: null
      };
    });

    res.json(statusMap);
  } catch (error) {
    console.error("Get batch online status error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

