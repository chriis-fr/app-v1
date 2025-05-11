import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';

// Extend the Express Request type to include our user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Fetch the full user data from Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        moduleAccess: true,
        organization: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      isOwner: user.isOwner,
      moduleAccess: user.moduleAccess.map(ma => ma.module),
      organization: user.organization
    } as User;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 