
import { User, Organization } from './models';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export interface IMongoStorage {
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getOrganization(id: string): Promise<any>;
  sessionStore: session.Store;
}

export class MongoDBStorage implements IMongoStorage {
  sessionStore: session.Store;

  constructor() {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI must be set");
    }
    
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    });
  }

  async getUser(id: string) {
    return await User.findById(id);
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ username });
  }

  async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  async getOrganization(id: string) {
    return await Organization.findById(id);
  }
}

export const mongoStorage = new MongoDBStorage();
