// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any; // you can replace `any` with a better type if you have a UserPayload interface
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = (req.headers.authorization || req.headers.Authorization) as
    | string
    | undefined;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = auth.split(" ")[1];
  const secret = process.env.JWT_SECRET || "changeme";

  try {
    const payload = jwt.verify(token, secret);
    // attach payload to req.user so controllers can use it
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
