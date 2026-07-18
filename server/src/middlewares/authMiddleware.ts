import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include Clerk's auth property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string;
        sessionId?: string;
        claims?: any;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Clerk's clerkMiddleware attaches req.auth to the request object
  if (!req.auth || !req.auth.userId) {
    res.status(401).json({ message: "Unauthorized. Please log in." });
    return;
  }
  next();
};
