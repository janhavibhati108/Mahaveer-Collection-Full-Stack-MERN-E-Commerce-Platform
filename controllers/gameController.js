// controllers/gameController.js
import GameScore from "../models/gameModel.js";

function calcDiscount(pairsMatched) {
    if (pairsMatched >= 8) return 15;
    if (pairsMatched >= 5) return 10;
    if (pairsMatched >= 3) return 5;
    return 0;
}

function genCouponCode(discount) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `MATCH${discount}OFF${rand}`;
}

// POST /api/v1/game/save-score
// Logic: Block if user has an UNUSED coupon (regardless of day).
//        Once coupon is used, they can play and win again freely.
export const saveScore = async (req, res) => {
    try {
        const { score, moves, timeTaken } = req.body;
        const userId = req.user?._id;

        if (userId) {
            // Check if user has any unused coupon sitting around
            const unusedCoupon = await GameScore.findOne({
                user: userId,
                discount: { $gt: 0 },
                couponUsed: false,
            });

            if (unusedCoupon) {
                return res.status(429).json({
                    success: false,
                    message: "You have an unused coupon! Use it at checkout before playing again.",
                    coupon: { code: unusedCoupon.couponCode, discount: unusedCoupon.discount },
                });
            }
        }

        const discount = calcDiscount(score);
        const couponCode = discount > 0 ? genCouponCode(discount) : null;

        await new GameScore({
            user: userId || null,
            score,
            moves,
            timeTaken,
            discount,
            couponCode,
        }).save();

        console.log("✅ Game score saved:", { score, discount, couponCode });

        res.status(201).json({
            success: true,
            message: discount > 0 ? "You won a coupon! 🎉" : "No discount this time — match 3+ pairs to win! Try again!",
            coupon: couponCode ? { code: couponCode, discount } : null,
        });
    } catch (err) {
        console.error("Game save error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/v1/game/check-status
// Returns unused coupon if one exists — used to lock the game on page load
export const checkStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.json({ hasUnusedCoupon: false });

        const unusedCoupon = await GameScore.findOne({
            user: userId,
            discount: { $gt: 0 },
            couponUsed: false,
        });

        if (unusedCoupon) {
            return res.json({
                hasUnusedCoupon: true,
                couponCode: unusedCoupon.couponCode,
                discount: unusedCoupon.discount,
            });
        }

        res.json({ hasUnusedCoupon: false });
    } catch (err) {
        console.error("Check status error:", err);
        res.status(500).json({ hasUnusedCoupon: false });
    }
};

// POST /api/v1/game/apply-coupon
export const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        if (!couponCode?.trim()) {
            return res.status(400).json({ success: false, message: "No coupon code provided." });
        }

        const code = couponCode.trim();
        console.log("🔍 Applying coupon:", code);

        const record = await GameScore.findOne({
            couponCode: { $regex: new RegExp(`^${code}$`, "i") },
            couponUsed: false,
            discount: { $gt: 0 },
        });

        if (!record) {
            const usedRecord = await GameScore.findOne({
                couponCode: { $regex: new RegExp(`^${code}$`, "i") },
            });
            if (usedRecord) {
                return res.status(400).json({ success: false, message: "This coupon has already been used." });
            }
            return res.status(404).json({ success: false, message: "Coupon not found. Please check the code." });
        }

        console.log("✅ Coupon valid:", code, "→", record.discount, "% off");
        res.json({ success: true, discount: record.discount, message: `${record.discount}% discount applied!` });
    } catch (err) {
        console.error("Apply coupon error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Called after successful payment to unlock the game
export const markCouponUsed = async (couponCode) => {
    if (!couponCode) return;
    try {
        const result = await GameScore.findOneAndUpdate(
            { couponCode: { $regex: new RegExp(`^${couponCode}$`, "i") } },
            { couponUsed: true },
            { new: true }
        );
        if (result) console.log("✅ Coupon marked used:", couponCode, "— game unlocked for user");
    } catch (err) {
        console.error("markCouponUsed error:", err);
    }
};

// GET /api/v1/game/leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const top = await GameScore.find({ score: { $gt: 0 } })
            .sort({ score: -1, moves: 1 })
            .limit(10)
            .populate("user", "name");
        res.json({ success: true, leaderboard: top });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};