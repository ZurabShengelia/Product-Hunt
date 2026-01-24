import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();
const SECRET = "your_secret_key_change_this";

router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            email, 
            password: hashedPassword, 
            username,
            displayName: username
        });
        await user.save();
        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
        res.json({ 
            token, 
            user: { 
                _id: user._id, 
                email, 
                username,
                displayName: user.displayName
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(400).json({ error: "Invalid password" });
        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
        res.json({ 
            token, 
            user: { 
                _id: user._id, 
                email: user.email, 
                username: user.username,
                displayName: user.displayName || user.username,
                avatar: user.avatar
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export default router;

