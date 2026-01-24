import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, ".env");
console.log("[ENV] Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });
console.log("[ENV] dotenv result:", result.error ? result.error.message : "✓ Loaded");
console.log("[ENV] EMAIL_USER after load:", process.env.EMAIL_USER);
console.log("[ENV] EMAIL_PASSWORD after load:", process.env.EMAIL_PASSWORD ? "***set***" : "***NOT SET***");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import voteRoutes from "./routes/votes.js";
import usersRoutes from "./routes/users.js";
import savesRoutes from "./routes/saves.js";
import feedbackRoutes from "./routes/feedback.js";
import notificationRoutes from "./routes/notifications.js";
import friendsRoutes from "./routes/friends.js";
import messagesRoutes from "./routes/messages.js";
import onlineStatusRoutes from "./routes/onlineStatus.js";
import nodemailer from "nodemailer";

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const avatarsDir = path.join(uploadsDir, "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
const projectsDir = path.join(uploadsDir, "projects");
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const mongoURL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/producthunt_geo";

mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 2000,
    socketTimeoutMS: 2000,
})
.then(() => console.log("✓ MongoDB connected"))
.catch(err => {
    console.log("⚠ MongoDB unavailable - running in memory mode");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/saves", savesRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/online-status", onlineStatusRoutes);

// Test email endpoint
app.get("/api/test-email", (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("[TEST-EMAIL] Verification failed:", error);
        return res.json({ 
          status: "error", 
          message: "Email service verification failed",
          details: error.message 
        });
      } else {
        console.log("[TEST-EMAIL] Verification successful");
        return res.json({ 
          status: "success", 
          message: "Email service is working",
          email: process.env.EMAIL_USER
        });
      }
    });
  } catch (error) {
    console.error("[TEST-EMAIL] Error:", error);
    res.json({ status: "error", message: error.message });
  }
});

app.listen(5000, () => {
    console.log("✓ Server running on http://localhost:5000");
    console.log("✓ Ready to accept requests");
});
