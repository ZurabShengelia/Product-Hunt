import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: String,
    username: String,
    displayName: String,
    avatar: String,
    bio: String,    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
