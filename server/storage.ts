import {
  type User,
  type InsertUser,
  type Analysis,
  type InsertAnalysis,
  users,
  githubAnalysis
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getDatabase } from "./db";
import { eq, or, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // GitHub Analysis methods
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAnalysisByUrl(url: string): Promise<Analysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
}

export class SqliteStorage implements IStorage {
  private get db() {
    return getDatabase().db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await this.db.insert(users).values(user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date()
    } as Analysis;
    await this.db.insert(githubAnalysis).values(analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    const result = await this.db.select().from(githubAnalysis).where(eq(githubAnalysis.id, id)).limit(1);
    return result[0];
  }

  async getAnalysisByUrl(url: string): Promise<Analysis | undefined> {
    const result = await this.db.select().from(githubAnalysis).where(
      or(
        eq(githubAnalysis.repositoryUrl, url),
        eq(githubAnalysis.userUrl, url)
      )
    ).limit(1);
    return result[0];
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    const result = await this.db.select()
      .from(githubAnalysis)
      .orderBy(desc(githubAnalysis.createdAt))
      .limit(limit);
    return result;
  }
}

export const storage = new SqliteStorage();
