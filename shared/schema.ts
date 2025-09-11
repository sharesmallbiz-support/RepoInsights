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
  // Common fields
  analysisType: text("analysis_type").notNull(), // 'repository', 'user'
  createdAt: timestamp("created_at").defaultNow(),
  // Repository-specific fields
  repositoryUrl: text("repository_url"),
  repositoryName: text("repository_name"),
  repositoryOwner: text("repository_owner"),
  repositoryData: json("repository_data"),
  commitsData: json("commits_data"),
  contributorsData: json("contributors_data"),
  doraMetrics: json("dora_metrics"),
  healthMetrics: json("health_metrics"),
  timelineData: json("timeline_data"),
  workClassification: json("work_classification"),
  // User-specific fields
  userUrl: text("user_url"),
  username: text("username"),
  userAnalysisData: json("user_analysis_data"),
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

// User Analysis Specific Types
export const UserProfileSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string(),
  followers: z.number(),
  following: z.number(),
  publicRepos: z.number(),
  accountAgeDays: z.number(),
  hireable: z.boolean().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
});

export const PortfolioSummarySchema = z.object({
  totalOwned: z.number(),
  totalForked: z.number(),
  totalArchived: z.number(),
  reposActiveLast90d: z.number(),
  reposWithReleases: z.number(),
  languages: z.record(z.string(), z.number()),
  topReposByStars: z.array(z.object({
    name: z.string(),
    stars: z.number(),
    description: z.string().nullable(),
    language: z.string().nullable(),
  })),
  totalStars: z.number(),
  totalForks: z.number(),
});

export const ActivityMetricsSchema = z.object({
  totalCommits: z.number(),
  activeDays: z.number(),
  longestStreak: z.number(),
  avgCommitsPerActiveDay: z.number(),
  commitsByWeekday: z.array(z.number()).length(7),
  commitsByHour: z.array(z.number()).length(24),
  reposContributedCount: z.number(),
  firstCommitDate: z.string().nullable(),
  lastCommitDate: z.string().nullable(),
});

export const BestPracticesSchema = z.object({
  pctWithLicense: z.number(),
  pctWithReadme: z.number(),
  pctWithCI: z.number(),
  pctWithTopics: z.number(),
  pctWithContributing: z.number(),
  pctWithDescription: z.number(),
  archivedRatio: z.number(),
});

export const ImpactSchema = z.object({
  starsGainedLast90d: z.number().optional(),
  popularTopics: z.array(z.string()),
  contributionScore: z.number(),
  diversityScore: z.number(), // Based on language diversity
});

export const UserAnalysisSchema = z.object({
  userProfile: UserProfileSchema,
  portfolioSummary: PortfolioSummarySchema,
  activityMetrics: ActivityMetricsSchema,
  bestPractices: BestPracticesSchema,
  impact: ImpactSchema,
});

// Analysis Request/Response Types
export const AnalysisRequestSchema = z.object({
  url: z.string().url(),
  type: z.enum(['repository', 'user']), // Support both repository and user analysis
});

// Response schemas for different analysis types
export const RepositoryAnalysisResponseSchema = z.object({
  id: z.string(),
  repositoryUrl: z.string(),
  repositoryName: z.string(),
  repositoryOwner: z.string(),
  analysisType: z.literal('repository'),
  doraMetrics: DoraMetricsSchema,
  healthMetrics: HealthMetricsSchema,
  contributors: z.array(ContributorSchema),
  timeline: z.array(TimelineDaySchema),
  workClassification: WorkClassificationSchema,
  createdAt: z.string(),
});

export const UserAnalysisResponseSchema = z.object({
  id: z.string(),
  userUrl: z.string(),
  username: z.string(),
  analysisType: z.literal('user'),
  userAnalysis: UserAnalysisSchema,
  createdAt: z.string(),
});

export const AnalysisResponseSchema = z.discriminatedUnion('analysisType', [
  RepositoryAnalysisResponseSchema,
  UserAnalysisResponseSchema,
]);

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
export type RepositoryAnalysisResponse = z.infer<typeof RepositoryAnalysisResponseSchema>;
export type UserAnalysisResponse = z.infer<typeof UserAnalysisResponseSchema>;

// User analysis types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type ActivityMetrics = z.infer<typeof ActivityMetricsSchema>;
export type BestPractices = z.infer<typeof BestPracticesSchema>;
export type Impact = z.infer<typeof ImpactSchema>;
export type UserAnalysis = z.infer<typeof UserAnalysisSchema>;
