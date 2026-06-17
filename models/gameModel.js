// models/gameModel.js
import mongoose from "mongoose";

const gameScoreSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },
        score: {
            type: Number,        // pairs matched (0–8)
            required: true,
            min: 0,
            max: 8,
        },
        moves: {
            type: Number,
            default: 0,
        },
        timeTaken: {
            type: Number,        // seconds
            default: 0,
        },
        discount: {
            type: Number,        // 0 | 5 | 10 | 15
            default: 0,
        },
        couponCode: {
            type: String,
            default: null,
        },
        couponUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

gameScoreSchema.index({ user: 1, createdAt: -1 });
gameScoreSchema.index({ score: -1, moves: 1 });

export default mongoose.model("GameScore", gameScoreSchema);