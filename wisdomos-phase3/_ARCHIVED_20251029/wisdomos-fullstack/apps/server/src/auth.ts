import jwt from "jsonwebtoken";
import { env } from "./env.js";
import type { Request, Response, NextFunction } from "express";

export interface JWTPayload {
  sub: string; // user id
  email: string;
  name?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    const token = header.slice("Bearer ".length);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}