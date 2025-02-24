import { Request, Response, NextFunction } from 'express';

interface UserPermission {
  module: string;
  actions: string[];
}

interface User {
  permissions: UserPermission[];
}

// Extend Express Request
declare global {
  namespace Express {
    interface User {
      permissions: UserPermission[];
    }
  }
}

export function checkPermission(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const permission = user.permissions.find((p: UserPermission) => p.module === module);
    if (!permission || !permission.actions.includes(action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
} 