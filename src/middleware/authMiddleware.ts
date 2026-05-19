import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: "No authenticated, please login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret") as any;
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ error: "User not found with this token" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied: Admin only" });
  }
};
