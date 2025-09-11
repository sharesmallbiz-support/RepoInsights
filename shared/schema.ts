import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// GitHub Analysis Schema
export const githubAnalysis = pgTable("github_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryUrl: text("repository_url").notNull(),
  repositoryName: text("repository_name").notNull(),
  repositoryOwner: text("repository_owner").notNull(),
  analysisType: text("analysis_type").notNull(), // 'repository', 'organization', 'user'
  createdAt: timestamp("created_at").defaultNow(),
  // Raw GitHub data
  repositoryData: json("repository_data"),
  commitsData: json("commits_data"),
  contributorsData: json("contributors_data"),
  // Calculated metrics
  doraMetrics: json("dora_metrics"),
  healthMetrics: json("health_metrics"),
  timelineData: json("timeline_data"),
  workClassification: json("work_classification"),
});

// DORA Metrics Types
export const DoraMetricsSchema = z.object({
  deploymentFrequency: z.object({
    value: z.string(),
    score: z.number(),
    rating: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  leadTime: z.object({
    value: z.string(),
    score: z.number(),
    rating: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  changeFailureRate: z.object({
    value: z.string(),
    score: z.number(),
    rating: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  recoveryTime: z.object({
    value: z.string(),
    score: z.number(),
    rating: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  overallScore: z.number(),
  overallRating: z.enum(['elite', 'high', 'medium', 'low']),
});

// Repository Health Types
export const HealthMetricsSchema = z.object({
  overallScore: z.number(),
  status: z.enum(['excellent', 'good', 'fair', 'poor']),
  totalCommits: z.number(),
  filesChanged: z.number(),
  activeContributors: z.number(),
  codeVelocity: z.string(),
  innovationRatio: z.number(),
  technicalDebt: z.number(),
  lastActivity: z.string(),
});

// Contributor Types
export const ContributorSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  commits: z.number(),
  linesAdded: z.number(),
  linesDeleted: z.number(),
  filesChanged: z.number(),
  rank: z.number(),
});

// Timeline Types
export const TimelineDaySchema = z.object({
  date: z.string(),
  commits: z.number(),
  linesChanged: z.number(),
  activity: z.enum(['very-high', 'high', 'medium', 'low', 'none']),
});

// Work Classification Types
export const WorkClassificationSchema = z.object({
  innovation: z.number(),
  bugFixes: z.number(),
  maintenance: z.number(),
  documentation: z.number(),
});

// Analysis Request/Response Types
export const AnalysisRequestSchema = z.object({
  url: z.string().url(),
  type: z.enum(['repository', 'user']), // Support both repository and user analysis
});

export const AnalysisResponseSchema = z.object({
  id: z.string(),
  repositoryUrl: z.string(),
  repositoryName: z.string(),
  repositoryOwner: z.string(),
  analysisType: z.string(),
  doraMetrics: DoraMetricsSchema,
  healthMetrics: HealthMetricsSchema,
  contributors: z.array(ContributorSchema),
  timeline: z.array(TimelineDaySchema),
  workClassification: WorkClassificationSchema,
  createdAt: z.string(),
});

export const insertAnalysisSchema = createInsertSchema(githubAnalysis).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof githubAnalysis.$inferSelect;
export type DoraMetrics = z.infer<typeof DoraMetricsSchema>;
export type HealthMetrics = z.infer<typeof HealthMetricsSchema>;
export type Contributor = z.infer<typeof ContributorSchema>;
export type TimelineDay = z.infer<typeof TimelineDaySchema>;
export type WorkClassification = z.infer<typeof WorkClassificationSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
