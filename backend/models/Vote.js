import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
});

voteSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);

