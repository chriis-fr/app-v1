import { z } from "zod";

// ---------------------------------
// Available modules enum
// ---------------------------------
export const availableModules = [
  "finance",
  "procurement",
  "manufacturing",
  "inventory",
  "order_management",
  "warehouse",
  "supply_chain",
  "crm",
  "project_service",
  "workforce",
  "hr",
  "ecommerce",
  "marketing",
  "pos",
  // "dashboard"
] as const;

// ---------------------------------
// Organization types
// ---------------------------------
export const organizationTypes = ["business", "ngo"] as const;

// ---------------------------------
// User roles with different access levels
// ---------------------------------
export const userRoles = [
  "owner",   // Full access to everything
  "admin",   // Full access to assigned modules
  "manager", // Department-level access
  "employee" // Limited module-specific access
] as const;

// ---------------------------------
// Department types
// ---------------------------------
export const departments = [
  "executive", // For owners and top admins
  "finance",
  "procurement",
  "manufacturing",
  "inventory",
  "sales", // For order management
  "warehouse",
  "supply_chain",
  "crm",
  "project_management",
  "hr",
  "marketing",
  "pos",
] as const;

// ---------------------------------
// Zod Schemas
// ---------------------------------

// Define a schema for a User document for MongoDB.
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(userRoles),
  department: z.enum(departments),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  organizationId: z.string(),
  isOwner: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Define a schema for an Organization document.
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(organizationTypes),
  industry: z.string(),
  size: z.string().optional(),
  walletAddress: z.string().optional(),
  activeModules: z.array(z.enum(availableModules)),
  maxModules: z.number(),
  address: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Registration schema for an organization + the first admin user
export const registerOrganizationSchema = organizationSchema
  .pick({
    name: true,
    type: true,
    industry: true,
    address: true,
    country: true,
    website: true,
  })
  .extend({
    username: z.string().min(3),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    selectedModules: z
      .array(z.enum(availableModules))
      .min(1)
      .max(2)
      .default([]),
  });

// User creation schema, based on the userSchema
export const insertUserSchema = userSchema.extend({
  organizationId: z.string().optional(),
  department: z.enum(departments).optional(),
});

// ---------------------------------
// Additional Interfaces
// ---------------------------------

export interface OrganizationSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  branding: {
    logo: string | null;
    favicon: string | null;
    companyName: string;
    tagline?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  modules: {
    enabled: string[];
    defaultModule?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
  };
  integrations: {
    paymentGateways: string[];
    emailService?: string;
    smsService?: string;
  };
  backup: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
    autoBackup: boolean;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: "view" | "create" | "edit" | "delete" | "manage";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  isSystem: boolean;
}

// ---------------------------------
// Merged Organization type
// ---------------------------------
/**
 * Combines zod-inferred fields from organizationSchema
 * with any additional fields (like plan, roles, settings).
 * Also can override Date fields with string if needed.
 */
export type Organization = Omit<z.infer<typeof organizationSchema>, "createdAt" | "updatedAt"> & {
  // If you store createdAt/updatedAt as strings in your DB or JSON:
  createdAt: string;
  updatedAt: string;

  // If you need these extra fields that your code references:
  plan?: string;
  roles?: Role[];
  settings?: OrganizationSettings;
};

// ---------------------------------
// Merged "User" Type
// ---------------------------------
/**
 * We merge the fields from the zod userSchema
 * with extra fields we need (avatarUrl, organization, etc.).
 * We also override some fields to match the shape we want
 * (e.g., createdAt/updatedAt as strings, role as a string).
 */
export type User = Omit<z.infer<typeof userSchema>, "role" | "createdAt" | "updatedAt"> & {
  // We override role from z.enum(...) to a string or role ID
  role: string;

  // We override createdAt/updatedAt to strings (instead of Date)
  createdAt: string;
  updatedAt: string;

  // Additional fields from the old interface
  avatarUrl?: string | null;

  // Reference the merged Organization type
  organization?: Organization;

  // We also keep the "permissions" field we had before
  permissions: { module: string; actions: string[] }[];
};

// ---------------------------------
// Other Types
// ---------------------------------
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type UserRole = typeof userRoles[number];
export type Department = typeof departments[number];

export interface LoginData {
  username: string;
  password: string;
}

// Add these to your existing API endpoints
export interface UpdateOrganizationSettingsRequest {
  settings: Partial<OrganizationSettings>;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

// ---------------------------------
// Organization Settings Schema
// ---------------------------------
export const organizationSettingsSchema = z.object({
  theme: z.object({
    primaryColor: z.string().default('#282881'),
    secondaryColor: z.string().default('#ffffff'),
    darkMode: z.boolean().default(false),
  }),
  branding: z.object({
    logo: z.string().nullable(),
    favicon: z.string().nullable(),
    companyName: z.string(),
    tagline: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  modules: z.object({
    enabled: z.array(z.string()),
    defaultModule: z.string().optional(),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  security: z.object({
    twoFactorAuth: z.boolean().default(false),
    sessionTimeout: z.number().default(30), // minutes
    passwordPolicy: z.object({
      minLength: z.number().default(8),
      requireSpecialChars: z.boolean().default(true),
      requireNumbers: z.boolean().default(true),
    }),
  }),
  integrations: z.object({
    paymentGateways: z.array(z.string()).default([]),
    emailService: z.string().optional(),
    smsService: z.string().optional(),
  }),
  backup: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    retention: z.number().default(30), // days
    autoBackup: z.boolean().default(true),
  }),
});
