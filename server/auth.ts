import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { IUserDocument, IOrganizationDocument } from "./storage";
import { Document, Types } from "mongoose";
import bcrypt from "bcrypt";

// Middleware to check if user has access to specific module
export function hasModuleAccess(module: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as unknown as IUserDocument;
    if (!user.moduleAccess || !user.moduleAccess.includes(module)) {
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

export function setupAuth(app: express.Express) {
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

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for user: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          console.log(`Login failed for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        console.log(`Login successful for user: ${username}`);
        // Normalize user before returning
        return done(null, normalizeUser(user));
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      // Changed parameter type from number to string to match what's being stored
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Normalize user before returning
      done(null, normalizeUser(user));
    } catch (err) {
      console.error("Session deserialization error:", err);
      done(err);
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
    // Validate that username and password are provided
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    console.log("Login attempt for user:", req.body.username);
    
    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: { message: string }) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.status(500).json({ message: "An error occurred during authentication" });
        }
        if (!user) {
          console.log("Authentication failed:", info?.message);
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Login failed. Please try again." });
          }
          console.log("User logged in successfully:", user.username);
          res.json({ user, message: "Login successful" });
        });
      }
    )(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return next(err);
      }
      
      // Clear the authentication cookie
      res.clearCookie('connect.sid');
      
      // Send success response
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      console.log("User:", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const organization = await storage.getOrganization(user.organizationId.toString());
      console.log("Organization:", organization);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const orgDoc = organization as unknown as Document & IOrganizationDocument & { _id: Types.ObjectId };

      res.json({
        ...normalizeUser(user),
        organization: {
          id: orgDoc._id.toString(),
          name: orgDoc.name,
          activeModules: orgDoc.activeModules,
          maxModules: orgDoc.maxModules
        }
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ message: "Error fetching user data" });
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
