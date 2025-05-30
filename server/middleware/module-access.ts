import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const checkModuleAccess = (module: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // If user is owner, grant access to all modules
    if (req.user.isOwner) {
      return next();
    }

    // Check if user has access to the specified module
    const hasAccess = req.user.moduleAccess?.includes(module);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this module' });
    }

    next();
  };
}; 