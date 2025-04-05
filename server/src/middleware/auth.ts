import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Extend the Express Request type to include our user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Always allow requests through without checking for tokens
  next();
}; 