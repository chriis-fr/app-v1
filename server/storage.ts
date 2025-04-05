import dotenv from "dotenv"
import { User, Organization } from './mongodb/models';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Document, Types } from 'mongoose';
import { userRoles, departments } from '@shared/schema';
import mongoose from 'mongoose';

dotenv.config()

const mongoUri = process.env.MONGODB_URI

export interface IUserDocument extends Document {
  id?: number;
  username: string;
  password: string;
  role: typeof userRoles[number];
  department: typeof departments[number];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  // Allow organizationId to be either a string or a Mongoose ObjectId
  organizationId: string | Types.ObjectId;
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
  moduleAccess?: string[];
  permissions?: {
    module: string;
    actions: string[];
  }[];
  avatarUrl?: string | null;
}

export interface IOrganizationDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IStorage {
  getUser(id: string): Promise<IUserDocument | null>;
  getUserByUsername(username: string): Promise<IUserDocument | null>;
  createUser(user: any): Promise<IUserDocument>;
  getOrganization(id: string): Promise<IOrganizationDocument | null>;
  sessionStore: session.Store;
  createOrganization(orgData: any): Promise<IOrganizationDocument>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (!mongoUri) {
      throw new Error("MONGODB_URI must be set");
    }
    
    this.sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions'
    });
  }

  async getUser(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUserDocument | null> {
    return await User.findOne({ username });
  }

  async createUser(userData: any): Promise<IUserDocument> {
    const user = new User(userData);
    return await user.save();
  }

  async getOrganization(id: string): Promise<IOrganizationDocument | null> {
    return await Organization.findById(id);
  }

  async createOrganization(orgData: any): Promise<IOrganizationDocument> {
    try {
      const Organization = mongoose.model('Organization');
      const newOrg = new Organization(orgData);
      const savedOrg = await newOrg.save();
      return savedOrg;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
