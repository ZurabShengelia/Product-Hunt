import express from "express";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "./auth.js";

const router = express.Router();


router.post("/save", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        console.log(`[SAVE] User ${req.userId} saving project ${projectId}`);
        
        if (!projectId) {
            return res.status(400).json({ error: "Project ID required" });
        }

        
        const project = await Project.findById(projectId);
        if (!project) {
            console.log(`[SAVE] Project not found: ${projectId}`);
            return res.status(404).json({ error: "Project not found" });
        }

        console.log(`[SAVE] Project found, creator: ${project.creatorId}`);

        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $addToSet: { savedProjects: projectId } },
            { new: true }
        ).populate("savedProjects");

        console.log(`[SAVE] User document updated`);

        
        if (project.creatorId.toString() !== req.userId.toString()) {
            try {
                console.log(`[SAVE NOTIF] Creating notification for project owner: ${project.creatorId}, from user: ${req.userId}`);
                
                
                const recentNotif = await Notification.findOne({
                    userId: project.creatorId,
                    type: 'save',
                    projectId: projectId,
                    fromUserId: req.userId,
                    createdAt: { $gte: new Date(Date.now() - 60000) } 
                });
                
                console.log(`[SAVE NOTIF] Recent notif found: ${!!recentNotif}`);
                
                if (!recentNotif) {
                    const userName = user.displayName || user.username;
                    const newNotif = await Notification.create({
                        userId: project.creatorId,
                        type: 'save',
                        title: `${userName} saved your project`,
                        message: `Your project "${project.title}" was saved!`,
                        projectId: projectId,
                        fromUserId: req.userId,
                        read: false
                    });
                    console.log(`[SAVE NOTIF] Notification created successfully: ${newNotif._id}`);
                }
            } catch (notifError) {
                console.error("[SAVE NOTIF ERROR]", notifError);
            }
        } else {
            console.log(`[SAVE NOTIF] Skipping notification - user is project owner`);
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(`[SAVE ERROR]`, error);
        res.status(500).json({ error: error.message });
    }
});


router.post("/unsave", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: "Project ID required" });
        }

        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $pull: { savedProjects: projectId } },
            { new: true }
        ).populate("savedProjects");

        
        try {
            await Notification.deleteMany({
                userId: { $exists: true }, 
                type: 'save',
                projectId: projectId,
                fromUserId: req.userId
            });
        } catch (notifError) {
            console.warn("Could not delete save notification:", notifError.message);
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/my-saves", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("savedProjects");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.savedProjects || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/check/:projectId", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isSaved = user.savedProjects.includes(projectId);
        res.json({ isSaved });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

