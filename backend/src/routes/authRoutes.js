import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });

        if (password.length < 8) return res.status(400).json({ message: "Password must be 8 chracters or more" });

        if (username.length < 3) return res.status(400).json({ message: "Username can not be less than 3 characters" });


        // check if user already exists
        // const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        // if (existingUser) return res.status(400).json({ message: "User already exists" });

        // const existingEmail = await User.findOne({ email });
        // const existingUsername = await User.findOne({ username });

        // Option 1: Using $or operator (Recommended - fastest)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email && existingUser.username === username) return res.status(400).json({ message: "Both the username and email already exists" });
            if (existingUser.username === username) return res.status(400).json({ message: "Username already exists" });
            if (existingUser.email === email) return res.status(400).json({ message: "Email already exists" });
        }


        // get random avatars
        const profileImage = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

        const user = new User({
            email,
            password,
            username,
            profileImage,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        })

    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All Fields are required" });

        // Check if user exist
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User does not exists" });

        // Check If Password is correct or not
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid Credentials" });

        // generate token
        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
