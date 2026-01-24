import express from "express";
import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "./auth.js";

const router = express.Router();

router.get("/:projectId", verifyToken, async (req, res) => {
    try {
        const vote = await Vote.findOne({ userId: req.userId, projectId: req.params.projectId });
        const project = await Project.findById(req.params.projectId);
        res.json({ 
            hasVoted: !!vote,
            totalVotes: project?.votes || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/:projectId", verifyToken, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        const existingVote = await Vote.findOne({ userId: req.userId, projectId });
        
        let project;
        if (existingVote) {
            
            console.log(`[VOTE TOGGLE] Removing existing vote`);
            await Vote.findByIdAndDelete(existingVote._id);
            project = await Project.findByIdAndUpdate(
                projectId, 
                { $inc: { votes: -1, upvotes: -1 } }, 
                { new: true }
            );
        } else {
            
            console.log(`[VOTE TOGGLE] Adding new vote`);
            const vote = new Vote({ userId: req.userId, projectId });
            await vote.save();
            project = await Project.findByIdAndUpdate(
                projectId, 
                { $inc: { votes: 1, upvotes: 1 } }, 
                { new: true }
            );

            
            if (project.creatorId.toString() !== req.userId.toString()) {
                try {
                    console.log(`[UPVOTE NOTIF] Creating notification for project owner: ${project.creatorId}, from user: ${req.userId}`);
                    
                    
                    const votingUser = await User.findById(req.userId);
                    const userName = votingUser?.displayName || votingUser?.username || 'Someone';
                    console.log(`[UPVOTE NOTIF] Voting user: ${userName}`);
                    
                    
                    const recentNotif = await Notification.findOne({
                        userId: project.creatorId,
                        type: 'upvote',
                        projectId: projectId,
                        fromUserId: req.userId,
                        createdAt: { $gte: new Date(Date.now() - 60000) } 
                    });
                    
                    console.log(`[UPVOTE NOTIF] Recent notif found: ${!!recentNotif}`);
                    
                    if (!recentNotif) {
                        const newNotif = await Notification.create({
                            userId: project.creatorId,
                            type: 'upvote',
                            title: `${userName} upvoted your project`,
                            message: `Your project "${project.title}" received an upvote!`,
                            projectId: projectId,
                            fromUserId: req.userId,
                            read: false
                        });
                        console.log(`[UPVOTE NOTIF] Notification created successfully: ${newNotif._id}`);
                    }
                } catch (notifError) {
                    console.error("[UPVOTE NOTIF ERROR]", notifError);
                }
            } else {
                console.log(`[UPVOTE NOTIF] Skipping notification - user is project owner`);
            }
        }
        
        res.json({ 
            hasVoted: !existingVote,
            totalVotes: project?.votes || 0
        });
    } catch (error) {
        console.error(`[VOTE TOGGLE ERROR]`, error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/upvote", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        const existingVote = await Vote.findOne({ userId: req.userId, projectId });
        if (existingVote) return res.status(400).json({ message: "Already voted" });
        const vote = new Vote({ userId: req.userId, projectId });
        await vote.save();
        const project = await Project.findByIdAndUpdate(projectId, { $inc: { votes: 1, upvotes: 1 } }, { new: true });
        
        
        if (project.creatorId.toString() !== req.userId.toString()) {
            try {
                console.log(`[LEGACY UPVOTE NOTIF] Creating notification for project owner: ${project.creatorId}, from user: ${req.userId}`);
                
                const votingUser = await User.findById(req.userId);
                const userName = votingUser?.displayName || votingUser?.username || 'Someone';
                
                const recentNotif = await Notification.findOne({
                    userId: project.creatorId,
                    type: 'upvote',
                    projectId: projectId,
                    fromUserId: req.userId,
                    createdAt: { $gte: new Date(Date.now() - 60000) }
                });
                
                if (!recentNotif) {
                    await Notification.create({
                        userId: project.creatorId,
                        type: 'upvote',
                        title: `${userName} upvoted your project`,
                        message: `Your project "${project.title}" received an upvote!`,
                        projectId: projectId,
                        fromUserId: req.userId,
                        read: false
                    });
                    console.log(`[LEGACY UPVOTE NOTIF] Notification created successfully`);
                }
            } catch (notifError) {
                console.error("[LEGACY UPVOTE NOTIF ERROR]", notifError);
            }
        }
        
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/removeVote", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        const vote = await Vote.findOneAndDelete({ userId: req.userId, projectId });
        if (!vote) return res.status(400).json({ message: "Vote not found" });
        const project = await Project.findByIdAndUpdate(projectId, { $inc: { votes: -1, upvotes: -1 } }, { new: true });
        
        
        try {
            await Notification.deleteMany({
                userId: { $exists: true }, 
                type: 'upvote',
                projectId: projectId,
                fromUserId: req.userId
            });
        } catch (notifError) {
            console.warn("Could not delete upvote notification:", notifError.message);
        }
        
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/check/:projectId", verifyToken, async (req, res) => {
    try {
        const vote = await Vote.findOne({ userId: req.userId, projectId: req.params.projectId });
        res.json({ hasVoted: !!vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

