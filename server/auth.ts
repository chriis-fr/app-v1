// Middleware to check if user has access to specific module
export function hasModuleAccess(module: string) {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const org = await storage.getOrganization(req.user.organizationId);
    if (!org || !org.activeModules || !org.activeModules.includes(module)) {
      return res.status(403).json({ message: "Module access not permitted" });
    }

    next();
  };
}

// Middleware to check user role
export function hasRole(roles: string[]) { 
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}


import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { IUserDocument } from "./storage";

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
    // Ensure phoneNumber is never undefined:
    phoneNumber: user.phoneNumber ?? null,
    // organizationId should be a string:
    organizationId: String(user.organizationId),
    // isOwner should be a boolean; default to false if null:
    isOwner: user.isOwner ?? false,
    // createdAt and updatedAt should be non-null Dates;
    // if null, you can choose a default (e.g., current date)
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
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

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Convert id to string as required by storage.getUser
      const user = await storage.getUser(String(id));
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
      console.log("Registration attempt with data:", {
        ...req.body,
        password: "[REDACTED]",
      });

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log(
          `Registration failed - username ${req.body.username} already exists`
        );
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      console.log(`User registered successfully: ${user.username}`);

      // Normalize the user before logging in
      req.login(normalizeUser(user), (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: { message: string }) => {
        if (err) {
          console.error("Authentication error:", err);
          return next(err);
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
            return next(err);
          }
          res.json(user);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access attempt to /api/user");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}
