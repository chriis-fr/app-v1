import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';
import { User, Organization, ModuleAccess } from '@prisma/client';

// Define the user type based on Prisma schema
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  isOwner: boolean;
  moduleAccess: string[];
  department?: string;
  permissions: { module: string; actions: string[] }[];
  organization?: {
    id: string;
    name: string;
    type: string;
    industry: string;
    size?: string;
    walletAddress?: string;
    activeModules: string[];
    maxModules: number;
    address?: string;
    country?: string;
    taxId?: string;
    website?: string;
    settings?: any;
    roles?: any[];
  };
}

// Extend the Express Request type to include our user
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
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

    // Set user in request with proper type handling
    const isOwner = user.role === 'owner' || user.isOwner === true;
    let moduleAccess = (user as any).moduleAccess?.map((ma: ModuleAccess) => ma.module) || [];
    if (isOwner && (!moduleAccess || moduleAccess.length === 0)) {
      // Grant all modules to owners
      moduleAccess = [
        'accounting', 'procurement', 'manufacturing', 'inventory', 'order_management', 'warehouse', 'supply_chain', 'crm', 'project_service', 'workforce', 'hr', 'ecommerce', 'marketing', 'pos', 'quality', 'maintenance', 'project', 'analytics', 'global_finance', 'international_trade', 'customer_experience', 'vendor_management', 'ai_analytics', 'ecommerce_global', 'localization', 'digital_currency'
      ];
    }
    let permissions: { module: string; actions: string[] }[] = [];
    if (typeof user.permissions === 'string') {
      try {
        permissions = JSON.parse(user.permissions);
      } catch {
        permissions = [];
      }
    } else if (Array.isArray(user.permissions)) {
      permissions = user.permissions as { module: string; actions: string[] }[];
    } else if (user.permissions && typeof user.permissions === 'object') {
      // Prisma JsonArray or similar
      permissions = Array.isArray(user.permissions)
        ? user.permissions.map((p: any) => ({ module: p.module, actions: p.actions }))
        : [];
    }
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || '',
      isOwner,
      moduleAccess,
      department: user.department || undefined,
      permissions,
      organization: (user as any).organization ? {
        id: (user as any).organization.id,
        name: (user as any).organization.name,
        type: (user as any).organization.type,
        industry: (user as any).organization.industry,
        size: (user as any).organization.size || undefined,
        walletAddress: (user as any).organization.walletAddress || undefined,
        activeModules: (user as any).organization.activeModules,
        maxModules: (user as any).organization.maxModules,
        address: (user as any).organization.address || undefined,
        country: (user as any).organization.country || undefined,
        taxId: (user as any).organization.taxId || undefined,
        website: (user as any).organization.website || undefined,
        settings: (user as any).organization.settings,
        roles: (user as any).organization.roles as any[]
      } : undefined
    };
    req.user = authenticatedUser;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 