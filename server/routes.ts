import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import {
  AnalysisRequestSchema,
  type AnalysisResponse,
  type RepositoryAnalysisResponse,
  type UserAnalysisResponse,
  type DoraMetrics,
  type HealthMetrics,
  type Contributor,
  type TimelineDay,
  type WorkClassification,
  type UserAnalysis,
  type User
} from "@shared/schema";
import { GitHubAnalyzer } from "./lib/github-analyzer";

// Authentication middleware
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes

  // GET /api/auth/github - Initiate GitHub OAuth
  app.get("/api/auth/github", passport.authenticate("github", {
    scope: ["read:user", "user:email", "repo", "read:org"]
  }));

  // GET /api/auth/github/callback - GitHub OAuth callback
  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login?error=oauth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/");
    }
  );

  // GET /api/auth/user - Get current logged-in user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as User;
      // Don't send sensitive data to client
      res.json({
        id: user.id,
        githubUsername: user.githubUsername,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // POST /api/auth/logout - Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // GitHub Analysis Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const validationResult = AnalysisRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validationResult.error.errors
        });
      }

      const { url, type } = validationResult.data;
      console.log(`Starting analysis for ${type}: ${url}`);

      // Check if we have a recent analysis for this URL (optional caching)
      const existingAnalysis = await storage.getAnalysisByUrl(url);
      if (existingAnalysis && existingAnalysis.createdAt) {
        const hoursSinceAnalysis = (Date.now() - new Date(existingAnalysis.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceAnalysis < 1) { // Cache for 1 hour
          console.log(`Returning cached analysis for ${url}`);
          
          // Return appropriate response type based on analysis type
          if (existingAnalysis.analysisType === 'user') {
            const userResponse: UserAnalysisResponse = {
              id: existingAnalysis.id,
              userUrl: existingAnalysis.userUrl!,
              username: existingAnalysis.username!,
              analysisType: 'user',
              userAnalysis: existingAnalysis.userAnalysisData as UserAnalysis,
              createdAt: existingAnalysis.createdAt.toISOString(),
            };
            return res.json(userResponse);
          } else {
            const repoResponse: RepositoryAnalysisResponse = {
              id: existingAnalysis.id,
              repositoryUrl: existingAnalysis.repositoryUrl!,
              repositoryName: existingAnalysis.repositoryName!,
              repositoryOwner: existingAnalysis.repositoryOwner!,
              analysisType: 'repository',
              doraMetrics: existingAnalysis.doraMetrics as DoraMetrics,
              healthMetrics: existingAnalysis.healthMetrics as HealthMetrics,
              contributors: existingAnalysis.contributorsData as Contributor[],
              timeline: existingAnalysis.timelineData as TimelineDay[],
              workClassification: existingAnalysis.workClassification as WorkClassification,
              createdAt: existingAnalysis.createdAt.toISOString(),
            };
            return res.json(repoResponse);
          }
        }
      }

      // Initialize GitHub analyzer
      const analyzer = new GitHubAnalyzer();
      await analyzer.initialize(req.user as User | undefined);

      // Parse GitHub URL to determine type (repository or user)
      const parseResult = analyzer.parseGitHubUrl(url);
      
      let doraMetrics: DoraMetrics;
      let healthMetrics: HealthMetrics;
      let contributors: Contributor[];
      let timeline: TimelineDay[];
      let workClassification: WorkClassification;
      let repositoryName: string;
      let repositoryOwner: string;
      let analysisSpecificData: any = {};

      if (parseResult.type === 'repository') {
        // Repository analysis
        const { owner, repo } = parseResult;
        if (!repo) {
          throw new Error('Repository name is required for repository analysis');
        }

        console.log(`Analyzing repository: ${owner}/${repo}`);

        // Fetch repository data
        const repositoryData = await analyzer.fetchRepositoryData(owner, repo);
        
        // Fetch commits for the last 90 days
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 90);
        const commits = await analyzer.fetchCommits(owner, repo, sinceDate);
        
        console.log(`Fetched ${commits.length} commits for analysis`);

        // Calculate metrics
        doraMetrics = analyzer.calculateDoraMetrics(commits);
        healthMetrics = analyzer.calculateHealthMetrics(commits, repositoryData);
        contributors = analyzer.calculateContributors(commits);
        timeline = analyzer.calculateTimeline(commits);
        workClassification = analyzer.calculateWorkClassification(commits);
        
        repositoryName = repo;
        repositoryOwner = owner;
        analysisSpecificData = {
          repositoryData: repositoryData,
          commitsData: commits,
        };
      } else {
        // User analysis - return different response structure
        const { owner } = parseResult;
        console.log(`Analyzing user: ${owner}`);
        
        const userAnalysisResult = await analyzer.analyzeUser(owner);
        
        // Store user analysis
        const userAnalysisData = {
          userUrl: url,
          username: owner,
          analysisType: parseResult.type,
          userAnalysisData: userAnalysisResult.userAnalysis,
        };

        const savedAnalysis = await storage.createAnalysis(userAnalysisData);
        
        // Return user-specific response
        const userResponse: UserAnalysisResponse = {
          id: savedAnalysis.id,
          userUrl: url,
          username: owner,
          analysisType: 'user',
          userAnalysis: userAnalysisResult.userAnalysis,
          createdAt: savedAnalysis.createdAt!.toISOString(),
        };

        console.log(`User analysis completed for ${url}`);
        return res.json(userResponse);
      }

      // Store analysis results
      const analysisData = {
        repositoryUrl: url,
        repositoryName: repositoryName,
        repositoryOwner: repositoryOwner,
        analysisType: parseResult.type,
        contributorsData: contributors,
        doraMetrics: doraMetrics,
        healthMetrics: healthMetrics,
        timelineData: timeline,
        workClassification: workClassification,
        ...analysisSpecificData,
      };

      const savedAnalysis = await storage.createAnalysis(analysisData);
      
      // Format repository analysis response
      const response: RepositoryAnalysisResponse = {
        id: savedAnalysis.id,
        repositoryUrl: savedAnalysis.repositoryUrl!,
        repositoryName: savedAnalysis.repositoryName!,
        repositoryOwner: savedAnalysis.repositoryOwner!,
        analysisType: 'repository',
        doraMetrics: doraMetrics,
        healthMetrics: healthMetrics,
        contributors: contributors,
        timeline: timeline,
        workClassification: workClassification,
        createdAt: savedAnalysis.createdAt!.toISOString(),
      };

      console.log(`Repository analysis completed for ${url}`);
      res.json(response);

    } catch (error: any) {
      console.error("Analysis error:", error);
      
      // Handle specific GitHub API errors
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: "Resource not found",
          message: "The specified repository or user could not be found or is not publicly accessible."
        });
      }
      
      if (error.message.includes('GitHub not connected')) {
        return res.status(401).json({
          error: "GitHub connection required",
          message: "Please ensure GitHub integration is properly configured."
        });
      }

      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "GitHub API rate limit exceeded. Please try again later."
        });
      }

      res.status(500).json({
        error: "Analysis failed",
        message: error.message || "An unexpected error occurred during analysis."
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Return appropriate response type based on analysis type
      let response: AnalysisResponse;
      
      if (analysis.analysisType === 'user') {
        response = {
          id: analysis.id,
          userUrl: analysis.userUrl!,
          username: analysis.username!,
          analysisType: 'user',
          userAnalysis: analysis.userAnalysisData as UserAnalysis,
          createdAt: analysis.createdAt!.toISOString(),
        } as UserAnalysisResponse;
      } else {
        response = {
          id: analysis.id,
          repositoryUrl: analysis.repositoryUrl!,
          repositoryName: analysis.repositoryName!,
          repositoryOwner: analysis.repositoryOwner!,
          analysisType: 'repository',
          doraMetrics: analysis.doraMetrics as DoraMetrics,
          healthMetrics: analysis.healthMetrics as HealthMetrics,
          contributors: analysis.contributorsData as Contributor[],
          timeline: analysis.timelineData as TimelineDay[],
          workClassification: analysis.workClassification as WorkClassification,
          createdAt: analysis.createdAt!.toISOString(),
        } as RepositoryAnalysisResponse;
      }

      res.json(response);
    } catch (error: any) {
      console.error("Get analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve analysis" });
    }
  });

  // Get recent analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      
      const response = analyses.map(analysis => ({
        id: analysis.id,
        repositoryUrl: analysis.repositoryUrl,
        repositoryName: analysis.repositoryName,
        repositoryOwner: analysis.repositoryOwner,
        analysisType: analysis.analysisType,
        createdAt: analysis.createdAt!.toISOString(),
      }));

      res.json(response);
    } catch (error: any) {
      console.error("Get analyses error:", error);
      res.status(500).json({ error: "Failed to retrieve analyses" });
    }
  });

  // API Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const { ApiStatsTracker } = await import('./lib/api-stats.js');
      const { MemoryCache } = await import('./lib/memory-cache.js');
      
      // Get the shared cache instance
      const cache = MemoryCache.getInstance();
      const statsTracker = ApiStatsTracker.getInstance();
      
      const stats = {
        cache: cache.getStats(),
        api: statsTracker.getStats(),
      };
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching API stats:", error);
      res.status(500).json({
        error: "Failed to fetch API statistics",
        details: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
