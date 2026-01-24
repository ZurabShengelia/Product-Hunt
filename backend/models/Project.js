import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    link: String,
    images: [String],
    imageUrl: String,
    tags: String,
    videoUrl: String,
    creatorId: mongoose.Schema.Types.ObjectId,
    creatorName: String,
    votes: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

projectSchema.index({ createdAt: -1, votes: -1, upvotes: -1 });

export default mongoose.model("Project", projectSchema);

