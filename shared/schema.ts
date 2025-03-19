import { z } from "zod";

// Available modules enum
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

// Organization types
export const organizationTypes = ["business", "ngo"] as const;

// User roles with different access levels
export const userRoles = [
  "owner", // Full access to everything
  "admin", // Full access to assigned modules
  "manager", // Department-level access
  "employee", // Limited module-specific access
] as const;

// Department types matching available modules
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

// Define a schema for a User document for MongoDB.
// Note: 'id' is now a string (MongoDB ObjectId as a hex string).
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(userRoles),
  department: z.enum(departments),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  // Allow phoneNumber to be a string or null.
  phoneNumber: z.string().nullable().optional(),
  // organizationId is stored as a string (or ObjectId) in MongoDB.
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

// Registration schema for an organization along with the first admin user.
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

// User creation schema, based on the userSchema.
export const insertUserSchema = userSchema.extend({
  organizationId: z.string().optional(),
  department: z.enum(departments).optional(),
});

// Types for TypeScript using the Zod schemas.
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema> & {
  permissions: { module: string; actions: string[] }[];
};
export type Organization = z.infer<typeof organizationSchema>;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type UserRole = typeof userRoles[number];
export type Department = typeof departments[number];

export interface LoginData {
  username: string;
  password: string;
}
