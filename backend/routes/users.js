import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { verifyToken } from "./auth.js";
import { uploadAvatar } from "../middleware/upload.js";
import nodemailer from "nodemailer";

const router = express.Router();
const SECRET = "your_secret_key_change_this";


let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "your_email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your_app_password_here"
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });

    
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email service verification FAILED!");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Full error:", error);
        console.log("⚠ Make sure you have:");
        console.log("  1. Valid Gmail app-specific password in .env");
        console.log("  2. Two-factor authentication enabled on Gmail");
        console.log("  3. Generated an app password at: https://myaccount.google.com/apppasswords");
      } else {
        console.log("✓ Email service ready");
      }
    });
  }
  return transporter;
}


router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID format" });
  }
  next();
});


router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/search", verifyToken, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.json({ success: true, data: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { displayName: { $regex: query, $options: "i" } }
      ]
    }).select("_id username displayName avatar bio").limit(20);

    res.json({ success: true, data: users || [] });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put("/profile", verifyToken, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.displayName) {
      user.displayName = req.body.displayName;
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) return res.status(400).json({ message: "Current password is incorrect" });

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/request-email-change", verifyToken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    
    const verificationCode = Math.random().toString().substring(2, 8);
    
    
    if (!global.emailVerifications) global.emailVerifications = {};
    global.emailVerifications[req.userId] = {
      newEmail,
      code: verificationCode,
      timestamp: Date.now()
    };

    
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "your_email@gmail.com",
        to: newEmail,
        subject: "🔐 Email Change Verification - ProductHunt Geo",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1d29 100%); padding: 40px; border-radius: 12px; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; margin-bottom: 10px;">🔐 Verify Your Email</h1>
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">ProductHunt Geo - Email Change Verification</p>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 2px solid #e5e7eb; border-top: none;">
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151;">
                Hello <strong>${user.displayName || user.username}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                You requested to change your email address to:
              </p>
              
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0066cc;">
                  ${newEmail}
                </p>
              </div>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                To confirm this change, use the verification code below:
              </p>
              
              <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 24px; border-radius: 8px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Verification Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: 700; color: white; font-family: monospace; letter-spacing: 4px;">
                  ${verificationCode}
                </p>
              </div>
              
              <p style="margin: 0 0 24px 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
                This code will expire in 10 minutes. Do not share this code with anyone.
              </p>
              
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; font-size: 12px; color: #7c2d12;">
                  <strong>💡 Tip:</strong> If you did not request this change, you can safely ignore this email. Your email will remain unchanged.
                </p>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">ProductHunt Geo © 2026 | All rights reserved</p>
            </div>
          </div>
        `
      };

      console.log("[EMAIL-CHANGE] EMAIL_USER:", process.env.EMAIL_USER);
      console.log("[EMAIL-CHANGE] EMAIL_PASSWORD set:", !!process.env.EMAIL_PASSWORD);
      console.log("[EMAIL-CHANGE] Sending verification email to:", newEmail);
      const response = await new Promise((resolve, reject) => {
        getTransporter().sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("[EMAIL-CHANGE] Email error:", error.message);
            reject(error);
          } else {
            console.log(`[EMAIL-CHANGE] ✓ Verification email sent successfully to ${newEmail}, MessageId:`, info.messageId);
            resolve(info);
          }
        });
      });
    } catch (emailError) {
      console.error("[EMAIL-CHANGE] ⚠ Failed to send email:", emailError.message);
      console.error("[EMAIL-CHANGE] Error code:", emailError.code);
      console.error("[EMAIL-CHANGE] Full error:", emailError);
      
      console.log(`[EMAIL-CHANGE] Verification code for ${newEmail}: ${verificationCode}`);
    }

    res.json({ message: "Verification code sent to your new email address" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put("/verify-email-change", verifyToken, async (req, res) => {
  try {
    const { newEmail, verificationCode } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    
    const verification = global.emailVerifications?.[req.userId];
    if (!verification) {
      return res.status(400).json({ message: "No pending email change request" });
    }

    if (verification.code !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    
    if (Date.now() - verification.timestamp > 10 * 60 * 1000) {
      delete global.emailVerifications[req.userId];
      return res.status(400).json({ message: "Verification code has expired" });
    }

    
    user.email = newEmail;
    user.updatedAt = new Date();
    await user.save();

    
    delete global.emailVerifications[req.userId];

    res.json({ message: "Email changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

