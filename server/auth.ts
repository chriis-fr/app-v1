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

const prisma = new PrismaClient();

// Middleware to check if user has access to specific module
export function hasModuleAccess(module: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as unknown as IUserDocument;
    
    // Check if user is owner
    if (user.isOwner) {
      return next(); // Owners have access to everything
    }

    // Check if user is admin
    if (user.role === 'admin') {
      // Admins can only access their assigned module
      const userModule = user.department.toLowerCase();
      if (module === userModule) {
        return next();
      }
      return res.status(403).json({ message: "Admins can only access their assigned module" });
    }

    // For regular employees, check module access
    const moduleAccess = await prisma.moduleAccess.findFirst({
      where: {
        userId: String(user.id), // Convert to string to match Prisma's type
        module: module
      }
    });

    if (!moduleAccess) {
      return res.status(403).json({ message: "No access to this module" });
    }

    next();
  };
}

// Middleware to check user role
export function hasRole(roles: string[]) { 
  return (req: Request, res: Response, next: NextFunction) => {
    // Always allow requests through without checking for role
    next();
  };
}

// Helper function to normalize a raw IUserDocument into a SelectUser.
function normalizeUser(user: IUserDocument): SelectUser {
  return {
    // Convert _id (of unknown type) to a string
    id: String(user._id),
    username: user.username,
    password: user.password,
    role: user.role,
    department: user.department,
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
    permissions: user.permissions ?? [],
  };
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
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
          include: {
            moduleAccess: true,
            organization: true
          }
        });

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

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        console.log('Login successful for user:', email);
        return done(null, user);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          moduleAccess: true,
          organization: true
        }
      });
      done(null, user);
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
        organizationId: organization._id,
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
    passport.authenticate('local', (err: any, user: any, info: { message: string }) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Invalid email or password' });
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
            isOwner: user.isOwner
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

        // Return user data without sensitive information
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
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

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access attempt to /api/user");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}
