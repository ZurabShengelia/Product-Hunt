import express from "express";
import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Feedback from "../models/Feedback.js";
import { verifyToken } from "./auth.js";

const router = express.Router();

function getTransporter() {
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
      console.error("[FEEDBACK] ⚠ Email service error:", error.message);
    } else {
      console.log("[FEEDBACK] ✓ Email service verified");
    }
  });
  
  return transporter;
}

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, type, projectId } = req.body;
    
    console.log("[FEEDBACK] Received feedback:", { name, email, subject, message, type });

    const transporter = getTransporter();

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters long" });
    }

    
    const newFeedback = new Feedback({
      name,
      email,
      subject,
      message,
      type
    });
    await newFeedback.save();

    
    const typeEmojis = {
      bug: "🐛",
      feature: "✨",
      improvement: "📈",
      other: "💬"
    };

    const emailSubject = `[${typeEmojis[type]} ${type.toUpperCase()}] ${subject || "User Feedback"}`;
    const emailBody = `
      <h2>New Feedback Received</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      <hr>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><small>Sent from Product Hunt Feedback Form</small></p>
    `;

    
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: emailSubject,
      html: emailBody
    };

    
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ We received your feedback - Product Hunt",
      html: `
        <h2>Thank You for Your Feedback!</h2>
        <p>Hi ${name},</p>
        <p>We've received your ${type} feedback and appreciate you taking the time to help us improve.</p>
        <p><strong>Feedback Type:</strong> ${type}</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Our team will review your feedback carefully. If your feedback requires a response, we'll get back to you at this email address within 24-48 hours.</p>
        <p>Thank you for being part of the Product Hunt community!</p>
        <p>Best regards,<br>The Product Hunt Team</p>
      `
    };

    
    try {
      console.log("[FEEDBACK] EMAIL_USER:", process.env.EMAIL_USER);
      console.log("[FEEDBACK] EMAIL_PASSWORD set:", !!process.env.EMAIL_PASSWORD);
      console.log("[FEEDBACK] Sending admin email to:", process.env.EMAIL_USER);
      
      // Send admin notification
      const adminResponse = await new Promise((resolve, reject) => {
        transporter.sendMail(adminMailOptions, (error, info) => {
          if (error) {
            console.error("[FEEDBACK] Admin email error:", error.message);
            reject(error);
          } else {
            console.log("[FEEDBACK] ✓ Admin email sent successfully:", info.messageId);
            resolve(info);
          }
        });
      });
      
      console.log("[FEEDBACK] Sending user confirmation email to:", email);

      const userResponse = await new Promise((resolve, reject) => {
        transporter.sendMail(userMailOptions, (error, info) => {
          if (error) {
            console.error("[FEEDBACK] User email error:", error.message);
            reject(error);
          } else {
            console.log("[FEEDBACK] ✓ User confirmation email sent successfully:", info.messageId);
            resolve(info);
          }
        });
      });
    } catch (emailError) {
      console.error("[FEEDBACK] ⚠ Email sending failed:", emailError.message);
      console.error("[FEEDBACK] Error code:", emailError.code);
      console.error("[FEEDBACK] Full error:", emailError);
    }

    
    if (projectId && req.userId) {
      try {
        const project = await Project.findById(projectId);
        if (project && project.owner.toString() !== req.userId) {
          
          await Notification.create({
            userId: project.owner,
            type: 'comment',
            title: `New comment on "${project.title}"`,
            message: message.substring(0, 100),
            projectId: projectId,
            fromUserId: req.userId,
            read: false
          });
        }
      } catch (notifError) {
        console.warn("Could not create notification:", notifError.message);
      }
    }

    res.status(200).json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ success: false, message: "Error submitting feedback", error: error.message });
  }
});

export default router;

