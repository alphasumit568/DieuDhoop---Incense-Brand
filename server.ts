import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from 'razorpay';
import twilio from 'twilio';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, limit, updateDoc } from "firebase/firestore";
import fs from "fs";
import authRoutes from "./src/routes/authRoutes";

// Load Firebase Config for server-side use
let db: any;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn("Firebase configuration not found. Some features may be disabled.");
  }
} catch (err) {
  console.error("Critical: Failed to initialize Firebase:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MongoDB Connection - Non-blocking
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log("Connected to Sacred Vault (MongoDB)"))
      .catch((err) => console.error("MongoDB connection failed:", err));
  } else {
    console.warn("MONGODB_URI not provided. Running in limited mode.");
  }

  app.use(express.json());
  app.use(cookieParser());

  // Initialize Razorpay
  const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  }) : null;

  // Initialize Twilio
  const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  ) : null;

  // Initialize Nodemailer
  const transporter = process.env.EMAIL_USER ? nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }) : null;

  // API Routes
  app.use("/api/auth", authRoutes);

  // AI Recommendation Endpoint
  app.post("/api/ai/recommendation", async (req, res) => {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: "Answers are required" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY not provided. Returning mock recommendation.");
      return res.json({
        name: "Sandalwood Serenity",
        reason: "The deep, woody notes of Sandalwood align with your search for grounding and peace.",
        benefits: "Promotes mental clarity and emotional stability.",
        mood: "Meditative & Grounded"
      });
    }

    try {
      const genAI = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a fragrance expert for Vedic Vaani, a luxury Vedic incense brand. 
      Based on these user preferences from a quiz, recommend the perfect incense fragrance:
      ${Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}
      
      Provide:
      1. The name of the fragrance (e.g., Sandalwood Serenity, Vedic Rose, Sacred Oud)
      2. Why it matches their vibe (2-3 sentences)
      3. The spiritual benefits it offers.
      4. A "Mood" description.
      
      Respond in JSON format: { "name": "...", "reason": "...", "benefits": "...", "mood": "..." }`;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text;
      if (!text) throw new Error("Divine wisdom was empty.");
      
      // Clean up potential markdown formatting in JSON response
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Sacred wisdom is currently unavailable. Please try again later." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Welcome Email Endpoint
  app.post("/api/notifications/welcome-email", async (req, res) => {
    if (!transporter) {
      console.warn("Email service not configured. Skipping welcome email.");
      return res.status(200).json({ message: "Email service not configured, but proceeding." });
    }

    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Divine Aroma" <no-reply@divinearoma.com>',
        to: email,
        subject: "Welcome to Divine Aroma!",
        html: `
          <div style="font-family: serif; color: #1c1917; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4; padding: 40px; background-color: #fafaf9;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d97706; margin: 0; font-size: 28px; letter-spacing: 0.1em; text-transform: uppercase;">Divine Aroma</h1>
              <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; color: #78716c; margin-top: 5px;">Incense & Spirituality</p>
            </div>
            
            <h2 style="font-size: 24px; margin-bottom: 20px;">Welcome, Seeker ${name || ""}!</h2>
            
            <p style="line-height: 1.6; color: #44403c;">We are honored to have you join our sacred community. Your journey into the world of divine fragrances and spiritual tranquility starts here.</p>
            
            <div style="background-color: #f5f5f4; padding: 25px; margin: 30px 0; border-left: 4px solid #d97706;">
              <p style="margin: 0; font-style: italic; color: #57534e;">"Let the sacred smoke carry your prayers to the heavens."</p>
            </div>
            
            <p style="line-height: 1.6; color: #44403c;">As a welcome gift, use the code <strong>SACRED10</strong> on your first order for a 10% discount on all spiritual items.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${req.protocol}://${req.get('host')}/shop" style="background-color: #1c1917; color: #fafaf9; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Explore The Shop</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 30px 0;" />
            
            <p style="font-size: 11px; color: #78716c; text-align: center;">You received this email because you registered at Divine Aroma.<br />© ${new Date().getFullYear()} Divine Aroma Spirituality Store.</p>
          </div>
        `,
      });
      res.json({ message: "Welcome email sent successfully" });
    } catch (error: any) {
      console.error("Failed to send welcome email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create Razorpay Order
  app.post("/api/payment/create-order", async (req, res) => {
    if (!razorpay) return res.status(500).json({ error: "Razorpay not configured" });
    const { amount, currency = "INR" } = req.body;
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // amount in paisa
        currency,
        receipt: `receipt_${Date.now()}`,
      });
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Payment
  app.post("/api/payment/verify", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return res.status(500).json({ error: "Razorpay secret missing" });

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ status: "success" });
    } else {
      res.status(400).json({ status: "failed" });
    }
  });

  // Send WhatsApp Notification
  app.post("/api/notifications/whatsapp", async (req, res) => {
    if (!twilioClient) return res.status(500).json({ error: "Twilio not configured" });
    const { to, message } = req.body;
    try {
      const response = await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        body: message,
        to: `whatsapp:${to}`,
      });
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate Coupon Code (Server-side)
  app.post("/api/coupons/validate", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    if (!db) {
      return res.status(503).json({ error: "Sacred database is currently initializing." });
    }

    try {
      const q = query(
        collection(db, "coupons"), 
        where("code", "==", code.trim().toUpperCase()),
        where("active", "==", true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const coupon = querySnapshot.docs[0].data();
        // Check for expiry if applicable
        if (coupon.expiresAt) {
          const expiryDate = coupon.expiresAt?.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
          if (new Date() > expiryDate) {
            // Auto-deactivate in DB if it's already expired
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, { active: false });
            return res.status(400).json({ error: "This spiritual code has expired." });
          }
        }

        res.json({ 
          code: coupon.code, 
          discount: coupon.discount, 
          type: coupon.type 
        });
      } else {
        res.status(404).json({ error: "Invalid spiritual code. Please try again." });
      }
    } catch (error: any) {
      console.error("Coupon lookup failed", error);
      res.status(500).json({ error: "Unable to verify code at this moment." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
