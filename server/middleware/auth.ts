import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../mongodb/models/user';

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
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ error: 'User not found' });
      }
      let plainUser = user.toObject ? user.toObject() : { ...user };
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