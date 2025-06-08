import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../src/middleware/auth';

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
    const user = req.user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Owners have full access
    if (user.isOwner) {
      return next();
    }

    // HR admin special case: allow HR admins to create users/employees
    if (
      module === 'users' &&
      action === 'create' &&
      user.role === 'admin' &&
      (user.department === 'HR' || (Array.isArray(user.permissions) && user.permissions.some((p) => p.module === 'hr')))
    ) {
      return next();
    }

    const permission = user.permissions.find(p => p.module === module);
    if (!permission || !permission.actions.includes(action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
} 