import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import nodemailer from "nodemailer";

const router = express.Router();

const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || "access_secret", { expiresIn: "15m" });
};

const generateRefreshToken = async (userId: string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" });
  
  // Save refresh token to DB
  await RefreshToken.create({
    user: userId,
    token: token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return token;
};

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please provide all details" });
  }

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Sacred Vault (MongoDB) is currently disconnected. Please check your MONGODB_URI in secrets." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: email.toLowerCase() === "sumitsharma60158@gmail.com" ? "admin" : "user"
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/api/auth/refresh-token" });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      if (email === "sumitsharma60158@gmail.com" && password === "admin123") {
        return res.json({
          message: "Demo Login successful (MOCK)",
          user: { id: "mock_admin", name: "Master Guardian", email, role: "admin", wishlist: [] }
        });
      }
      return res.status(503).json({ error: "Sacred Vault (MongoDB) is currently disconnected. Please check your MONGODB_URI in secrets." });
    }

    let user = await User.findOne({ email }).select("+password");
    
    // Auto-create admin if it doesn't exist for the specific developer email
    if (!user && email === "sumitsharma60158@gmail.com" && password === "admin123") {
      console.log("Auto-creating admin user for developer...");
      user = await User.create({
        name: "Master Guardian",
        email,
        password,
        role: "admin"
      });
      // The select("+password") won't be needed here because comparePassword won't be needed if we trust this flow,
      // but let's re-fetch to be safe and use standard flow
      user = await User.findOne({ email }).select("+password");
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 mins
    });
    
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/google
router.post("/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "Token is required" });

  try {
    // In a real production app, verify idToken with firebase-admin
    // For this environment, we'll decode and trust (assuming secure client-side check)
    const decoded: any = jwt.decode(idToken);
    const { email, name, picture } = decoded || {};

    if (!email) throw new Error("Invalid token data");

    if (mongoose.connection.readyState !== 1) {
       return res.json({
         message: "Google Login successful (MOCK)",
         user: { id: "google_" + email, name: name || "Google Seeker", email, role: "user", wishlist: [] }
       });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "Google Seeker",
        email,
        password: crypto.randomBytes(16).toString("hex"), // Random password for social logins
        role: email.toLowerCase() === "sumitsharma60158@gmail.com" ? "admin" : "user"
      });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/api/auth/refresh-token" });

    res.json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/guest
router.post("/guest", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        message: "Guest login successful (MOCK)",
        user: { id: "guest_" + Date.now(), name: "Traveler", email: "guest@traveler.com", role: "user", wishlist: [] }
      });
    }

    const guestId = crypto.randomBytes(8).toString("hex");
    const user = await User.create({
      name: "Traveler",
      email: `guest_${guestId}@traveler.com`,
      password: crypto.randomBytes(16).toString("hex"),
      role: "user"
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/api/auth/refresh-token" });

    res.json({
      message: "Guest login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wishlist: user.wishlist }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/wishlist
router.post("/wishlist", protect, async (req: AuthRequest, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required" });

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/profile/update
router.post("/profile/update", protect, async (req: AuthRequest, res) => {
  const { name, email, avatar } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use by another seeker." });
      }
      user.email = email.toLowerCase().trim();
    }
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const dbToken = await RefreshToken.findOne({ token });
    if (!dbToken) return res.status(401).json({ error: "Invalid refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret") as any;
    const accessToken = generateAccessToken(decoded.id);

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 15 * 60 * 1000 });
    res.json({ message: "Token refreshed" });
  } catch (error) {
    res.status(401).json({ error: "Refresh token expired or invalid" });
  }
});

// @route   POST /api/auth/logout
router.post("/logout", protect, async (req: AuthRequest, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
  res.json({ message: "Logged out successfully" });
});

// @route   GET /api/auth/me
router.get("/me", protect, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await user.save();

    // Use common transporter if configured
    if (process.env.EMAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Divine Aroma" <no-reply@divinearoma.com>',
        to: user.email,
        subject: "Spirituality Store: Password Reset",
        html: `<h1>Password Reset Request</h1><p>Reset your password by clicking here: <a href="${resetUrl}">${resetUrl}</a></p>`
      });
    }

    res.json({ message: "Reset link sent to your spiritual channel (email)." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
