import { User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { staticData } from "../client/src/data/static";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    // Load static data
    staticData.users.forEach(user => {
      this.users.set(user.id, user as User);
    });

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = (this.users.size + 1).toString();
    const user = { ...insertUser, id } as User;
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
