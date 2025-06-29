import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../mongodb/models/user';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.token || req.cookies?.auth_token;
    console.log('Auth middleware: token =', token);
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
      console.log('Decoded token:', decoded);
      
      // Try to find user in MongoDB first
      let user = await User.findById(decoded.id);
      let plainUser;
      
      if (user) {
        // User found in MongoDB
        plainUser = user.toObject ? user.toObject() : { ...user };
        console.log('User found in MongoDB');
      } else {
        // Try to find user in Prisma
        const prismaUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: {
            moduleAccess: true,
            organization: true
          }
        });
        
        if (prismaUser) {
          // User found in Prisma
          plainUser = {
            id: prismaUser.id,
            email: prismaUser.email,
            firstName: prismaUser.firstName,
            lastName: prismaUser.lastName,
            role: prismaUser.role,
            organizationId: prismaUser.organizationId,
            department: prismaUser.department,
            position: prismaUser.position,
            isActive: prismaUser.isActive,
            isOwner: prismaUser.isOwner,
            moduleAccess: prismaUser.moduleAccess?.map(ma => ma.module) || [],
            permissions: prismaUser.permissions,
            organization: prismaUser.organization
          };
          console.log('User found in Prisma');
        } else {
          console.log('User not found in either MongoDB or Prisma');
          return res.status(401).json({ error: 'User not found' });
        }
      }
      
      // Parse permissions if string
      if (typeof plainUser.permissions === 'string') {
        try {
          plainUser.permissions = JSON.parse(plainUser.permissions);
        } catch (e) {
          plainUser.permissions = [];
        }
      }
      
      // For owners, set moduleAccess to all modules if missing/empty
      if (plainUser.isOwner && (!plainUser.moduleAccess || plainUser.moduleAccess.length === 0)) {
        plainUser.moduleAccess = [
          'accounting', 'procurement', 'manufacturing', 'inventory', 'order_management', 'warehouse', 'supply_chain', 'crm', 'project_service', 'workforce', 'hr', 'ecommerce', 'marketing', 'pos', 'quality', 'maintenance', 'project', 'analytics', 'global_finance', 'international_trade', 'customer_experience', 'vendor_management', 'ai_analytics', 'ecommerce_global', 'localization', 'digital_currency'
        ];
      }
      
      req.user = plainUser;
      console.log('Auth middleware: req.user =', req.user);
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const isHR = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'hr') {
    return res.status(403).json({ error: 'HR access required' });
  }
  next();
}; 