import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { verifyToken } from "./auth.js";
import { uploadProjectImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/my-projects", verifyToken, async (req, res) => {
    try {
        const myProjects = await Project.find({ creatorId: req.userId }).populate('creatorId', 'avatar displayName username').sort({ createdAt: -1 });
        const enrichedProjects = myProjects.map(p => ({
            ...p.toObject(),
            creatorAvatar: p.creatorId?.avatar,
            creatorName: p.creatorId?.displayName || p.creatorId?.username || p.creatorName
        }));
        res.json(enrichedProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('creatorId', 'avatar displayName username');
        if (!project) return res.status(404).json({ error: "Project not found" });
        const enriched = {
            ...project.toObject(),
            creatorAvatar: project.creatorId?.avatar,
            creatorName: project.creatorId?.displayName || project.creatorId?.username || project.creatorName
        };
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate('creatorId', 'avatar displayName username').sort({ createdAt: -1, votes: -1, upvotes: -1 }).limit(100);
        const enrichedProjects = projects.map(p => ({
            ...p.toObject(),
            creatorAvatar: p.creatorId?.avatar,
            creatorName: p.creatorId?.displayName || p.creatorId?.username || p.creatorName
        }));
        console.log("[PROJECTS] Sample project:", enrichedProjects[0]);
        res.json(enrichedProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", verifyToken, uploadProjectImages.array("images", 5), async (req, res) => {
    try {
        const { title, description, category, link, tags, videoUrl } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        if (!link) {
            return res.status(400).json({ message: "Project link is required" });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        
        const images = req.files ? req.files.map(file => `/uploads/projects/${file.filename}`) : [];
        const imageUrl = images.length > 0 ? images[0] : null;

        const project = new Project({
            title,
            description,
            category: category || "Technology",
            link,
            tags: tags || "",
            videoUrl: videoUrl || "",
            imageUrl,
            images,
            creatorId: req.userId,
            creatorName: user.displayName || user.username,
            votes: 0,
            upvotes: 0
        });

        await project.save();
        const populatedProject = await Project.findById(project._id).populate('creatorId', 'avatar displayName username');
        const enriched = {
            ...populatedProject.toObject(),
            creatorAvatar: populatedProject.creatorId?.avatar,
            creatorName: populatedProject.creatorId?.displayName || populatedProject.creatorId?.username || populatedProject.creatorName
        };
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.creatorId.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to delete this project" });
        }
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

