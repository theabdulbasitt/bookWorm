import express from "express";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Search Users ────────────────────────────────────────────────────────────
// GET /api/users/search?q=username
router.get("/search", protectRoute, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json([]);

        // Find users whose username matches the query (case-insensitive)
        const users = await User.find({
            username: { $regex: q, $options: "i" },
            _id: { $ne: req.user._id } // Don't return the current user
        })
            .select("username profileImage followers")
            .limit(10);

        res.status(200).json(users);
    } catch (error) {
        console.log("Error in search route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ─── Suggested Users ─────────────────────────────────────────────────────────
// GET /api/users/suggestions
router.get("/suggestions", protectRoute, async (req, res) => {
    try {
        // Find 5 users that the current user is NOT already following, 
        // and also exclude the current user themselves
        const suggestedUsers = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: req.user._id,
                        $nin: req.user.following
                    }
                }
            },
            { $sample: { size: 5 } }, // Get 5 random users
            { $project: { username: 1, profileImage: 1, followers: 1 } }
        ]);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in suggestions route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ─── Follow / Unfollow User ──────────────────────────────────────────────────
// POST /api/users/follow/:id
router.post("/follow/:id", protectRoute, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
            res.status(200).json({ message: "Unfollowed successfully", isFollowing: false });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });
            res.status(200).json({ message: "Followed successfully", isFollowing: true });
        }
    } catch (error) {
        console.log("Error in follow route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ─── Get Current Logged-in User Profile ────────────────────────────────────────
// GET /api/users/me
router.get("/me", protectRoute, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in /me route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ─── Update User Profile ─────────────────────────────────────────────────────
// PUT /api/users/profile
router.put("/profile", protectRoute, async (req, res) => {
    try {
        const { username, email, profileImage } = req.body;
        const currentUserId = req.user._id;

        // Check for username or email conflicts if they are changing them
        if (username || email) {
            const existingUser = await User.findOne({
                _id: { $ne: currentUserId },
                $or: [{ username }, { email }]
            });

            if (existingUser) {
                if (existingUser.username === username) return res.status(400).json({ message: "Username is already taken" });
                if (existingUser.email === email) return res.status(400).json({ message: "Email is already in use" });
            }
        }

        // Build the update object dynamically
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (profileImage) updateFields.profileImage = profileImage; // Assuming base64 is being sent to Cloudinary via frontend or handled here (for simplicity we will just save the base64 or cloudinary URL directly passed from the frontend for now)

        const updatedUser = await User.findByIdAndUpdate(
            currentUserId,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
