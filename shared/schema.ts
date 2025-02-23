import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available modules enum
export const availableModules = [
  'finance',
  'procurement',
  'manufacturing',
  'inventory',
  'order_management',
  'warehouse',
  'supply_chain',
  'crm',
  'project_service',
  'workforce',
  'hr',
  'ecommerce',
  'marketing'
] as const;

// Organization types
export const organizationTypes = ['business', 'ngo'] as const;

// User roles with different access levels
export const userRoles = [
  'owner',           // Full access to everything
  'admin',           // Full access to assigned modules
  'manager',         // Department-level access
  'employee'         // Limited module-specific access
] as const;

// Department types matching available modules
export const departments = [
  'executive',       // For owners and top admins
  'finance',
  'procurement',
  'manufacturing',
  'inventory',
  'sales',          // For order management
  'warehouse',
  'supply_chain',
  'crm',
  'project_management',
  'hr',
  'marketing'
] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('employee'),
  department: text("department").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phoneNumber"),
  organizationId: integer("organizationId").notNull(),
  isOwner: boolean("isOwner").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'business' or 'ngo'
  industry: text("industry").notNull(),
  size: text("size"), // small, medium, large
  walletAddress: text("walletAddress").unique(),
  activeModules: jsonb("activeModules").$type<string[]>().default(['dashboard']),
  maxModules: integer("maxModules").default(2), // Limit of modules they can use
  address: text("address"),
  country: text("country"),
  taxId: text("taxId"),
  website: text("website"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Registration schema for organization + first admin user
export const registerOrganizationSchema = createInsertSchema(organizations)
  .pick({
    name: true,
    type: true,
    industry: true,
    address: true,
    country: true,
    website: true,
  })
  .extend({
    // Organization type validation
    type: z.enum(organizationTypes),

    // Owner/Admin user details
    username: z.string().min(3),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),

    // Module selection (limit to 2 initially)
    selectedModules: z.array(z.enum(availableModules))
      .min(1)
      .max(2)
      .default(['dashboard']),
  });

// User creation schema
export const insertUserSchema = createInsertSchema(users)
  .extend({
    role: z.enum(userRoles),
    department: z.enum(departments),
  });

// Types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type UserRole = typeof userRoles[number];
export type Department = typeof departments[number];