import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('user'),
  department: text("department").notNull().default('general'),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  organizationId: integer("organizationId"),
  isOwner: boolean("isOwner").default(false),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'business' or 'ngo'
  industry: text("industry"),
  size: text("size"),
  walletAddress: text("walletAddress").unique(),
  activeModules: jsonb("activeModules").$type<string[]>().default(['dashboard']),
  createdAt: timestamp("createdAt").defaultNow(),
});

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

// Registration schema for organization + first admin user
export const registerOrganizationSchema = createInsertSchema(organizations).extend({
  // Extend with user details
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  // Module selection (limit to 2 initially)
  selectedModules: z.array(z.enum(availableModules)).min(1).max(2),
});

// Basic user schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  department: true,
  firstName: true,
  lastName: true,
  email: true,
  organizationId: true,
  isOwner: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;