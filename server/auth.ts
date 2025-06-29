import express, { Request, Response, NextFunction, Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { IUserDocument, IOrganizationDocument } from "./storage";
import { Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { AuthenticatedUser } from './src/middleware/auth';

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      organizationId: string;
      isOwner: boolean;
      moduleAccess: string[];
      department?: string;
      permissions: { module: string; actions: string[] }[];
    }
  }
}

// Middleware to check if user has access to specific module
export const hasModuleAccess = (module: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Owners have full access
    if (user.isOwner) {
      return next();
    }

    // Check for explicit module access
    if (user.moduleAccess.includes(module)) {
      return next();
    }

    // Check for permissions
    const modulePermissions = user.permissions.find(p => p.module === module);
    if (modulePermissions && modulePermissions.actions.length > 0) {
      return next();
    }

    // For admins, check department-based access
    if (user.role === 'admin') {
      const departmentModules: { [key: string]: string[] } = {
        'Finance': ['accounting', 'payroll', 'invoicing'],
        'HR': ['hr', 'payroll', 'recruitment'],
        'Operations': ['inventory', 'warehouse', 'supply_chain'],
        'Sales': ['crm', 'sales', 'marketing'],
        'IT': ['system', 'security', 'analytics']
      };

      const userDepartment = user.department as any;
      if (userDepartment && departmentModules[userDepartment]?.includes(module)) {
        return next();
      }
    }

    return res.status(403).json({ message: 'Access denied' });
  };
};

// Middleware to check user role
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Owners have full access
    if (user.isOwner) {
      return next();
    }

    // Check if user's role is in the allowed roles
    if (roles.includes(user.role as any)) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied' });
  };
};

// Helper function to normalize a raw IUserDocument into a SelectUser.
function normalizeUser(user: IUserDocument): SelectUser {
  return {
    // Convert _id (of unknown type) to a string
    id: String(user._id),
    username: user.username,
    password: user.password,
    role: user.role as any,
    department: user.department as any,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    // Ensure phoneNumber is always a string, not null
    phoneNumber: user.phoneNumber || "",
    // organizationId should be a string:
    organizationId: String(user.organizationId),
    // isOwner should be a boolean; default to false if null:
    isOwner: user.isOwner ?? false,
    // Add status property with default value "active"
    status: "active",
    // Add moduleAccess with default empty array if not present
    moduleAccess: user.moduleAccess || [],
    // createdAt and updatedAt should be non-null Dates;
    // if null, you can choose a default (e.g., current date)
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    permissions: user.permissions || [],
  };
}

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        console.log('Attempting login for user:', email);
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true }
        });

        // Log the full user object for debugging
        console.dir(user, { depth: null, colors: true });

        if (!user) {
          console.log('User not found:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log('Invalid password for user:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Update last login if field exists
        try {
        await prisma.user.update({
          where: { id: user.id },
            data: { lastLogin: new Date() } as any
        });
        } catch (e) {
          console.warn('Could not update lastLogin:', e);
        }

        // Transform user to match Express User interface
        const expressUser: Express.User = {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId || '',
          isOwner: user.role === 'owner' ? true : ((user as any).isOwner ?? false),
          moduleAccess: (user as any).moduleAccess || [],
          department: (user as any).department || undefined,
          permissions: Array.isArray((user as any).permissions) ? (user as any).permissions : ((user as any).permissions ? (user as any).permissions : [])
        };

        console.log('Login successful for user:', email);
        return done(null, expressUser);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { organization: true }
      });

      if (!user) {
        return done(null, false);
      }

      // Transform user to match Express User interface
      const expressUser: Express.User = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId || '',
        isOwner: user.role === 'owner' ? true : ((user as any).isOwner ?? false),
        moduleAccess: (user as any).moduleAccess || [],
        department: (user as any).department || undefined,
        permissions: Array.isArray((user as any).permissions) ? (user as any).permissions : ((user as any).permissions ? (user as any).permissions : [])
      };

      done(null, expressUser);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Accept the client's format and handle the transformation server-side
      const formData = req.body;
      console.log('Registration form data:', formData);

      const existingUser = await storage.getUserByUsername(formData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Step 1: Create the organization
      const organizationData = {
        name: formData.name || `${formData.firstName}'s Organization`,
        type: formData.type || 'business',
        industry: formData.industry || 'other',
        address: formData.address || '',
        country: formData.country || '',
        website: formData.website || '',
        activeModules: formData.selectedModules || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Creating organization with data:', organizationData);
      const organization = await storage.createOrganization(organizationData);
      console.log('Organization created:', organization);
      
      // Step 2: Create the user with the new organization ID
      const userData = {
        username: formData.username,
        password: await hashPassword(formData.password),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null,
        role: "owner",
        department: "Executive",
        organizationId: new Types.ObjectId(String(organization._id)),
        isOwner: true,
        moduleAccess: formData.selectedModules || [], // Use the selected modules from the form
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: []
      };

      console.log('Creating user with data:', userData);
      const user = await storage.createUser(userData);
      console.log('User created:', user);

      req.login(normalizeUser(user), (err) => {
        if (err) {
          console.error('Login error after registration:', err);
          return next(err);
        }
        res.status(201).json({ 
          user: normalizeUser(user),
          organization: organization
        });
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ 
        message: "Registration failed", 
        error: errorMessage
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', async (err: any, user: any, info: { message: string }) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Invalid email or password' });
      }

      // Fetch full user data with organization
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { organization: true }
      });

      if (!fullUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user is activated and email verified
      if (!fullUser.isActive || !fullUser.emailVerified) {
        return res.status(403).json({ 
          message: 'Account not activated', 
          requiresActivation: true,
          userEmail: fullUser.email,
          userId: fullUser.id
        });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Session error:', err);
          return res.status(500).json({ message: 'Failed to create session' });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            isOwner: user.isOwner ?? false
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        // Set the token in an HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Also set a non-HTTP-only cookie for client-side access
        res.cookie('auth_token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });

        // Return user data with organization and module access
        const { password, ...userWithoutPassword } = fullUser;
        res.json({ 
          user: {
            ...userWithoutPassword,
            moduleAccess: (fullUser as any).moduleAccess || [],
            organization: fullUser.organization ? {
              id: fullUser.organization.id,
              name: fullUser.organization.name,
              type: (fullUser.organization as any)?.type ?? null,
              industry: (fullUser.organization as any)?.industry ?? null,
              size: (fullUser.organization as any)?.size ?? null,
              walletAddress: (fullUser.organization as any)?.walletAddress ?? null,
              activeModules: (fullUser.organization as any)?.activeModules || [],
              maxModules: (fullUser.organization as any)?.maxModules ?? 2,
              address: (fullUser.organization as any)?.address ?? null,
              country: (fullUser.organization as any)?.country ?? null,
              taxId: (fullUser.organization as any)?.taxId ?? null,
              website: (fullUser.organization as any)?.website ?? null,
              settings: (fullUser.organization as any)?.settings ?? null,
              roles: (fullUser.organization as any)?.roles ?? null
            } : null
          }, 
          token 
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.clearCookie('token');
      res.clearCookie('auth_token');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const currentToken = req.cookies?.token || req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];
      
      if (!currentToken) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify the current token (even if expired, we can still extract user info)
      let decoded;
      try {
        decoded = jwt.verify(currentToken, process.env.JWT_SECRET || 'your-secret-key') as any;
      } catch (jwtError: any) {
        // If token is expired, try to decode it without verification to get user info
        if (jwtError.name === 'TokenExpiredError') {
          decoded = jwt.decode(currentToken) as any;
        } else {
          return res.status(401).json({ error: 'Invalid token' });
        }
      }

      if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      // Get the user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { organization: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          isOwner: user.isOwner ?? false
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Set new token in cookies
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.cookie('auth_token', newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      // Return new token
      res.json({ 
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Fetch full user data with organization
      const fullUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
      });

      if (!fullUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = fullUser;
      res.json({
        ...userWithoutPassword,
        moduleAccess: (fullUser as any).moduleAccess || [],
        organization: fullUser.organization ? {
          id: fullUser.organization.id,
          name: fullUser.organization.name,
          type: (fullUser.organization as any)?.type ?? null,
          industry: (fullUser.organization as any)?.industry ?? null,
          size: (fullUser.organization as any)?.size ?? null,
          walletAddress: (fullUser.organization as any)?.walletAddress ?? null,
          activeModules: (fullUser.organization as any)?.activeModules || [],
          maxModules: (fullUser.organization as any)?.maxModules ?? 2,
          address: (fullUser.organization as any)?.address ?? null,
          country: (fullUser.organization as any)?.country ?? null,
          taxId: (fullUser.organization as any)?.taxId ?? null,
          website: (fullUser.organization as any)?.website ?? null,
          settings: (fullUser.organization as any)?.settings ?? null,
          roles: (fullUser.organization as any)?.roles ?? null
        } : null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access attempt to /api/user");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}
