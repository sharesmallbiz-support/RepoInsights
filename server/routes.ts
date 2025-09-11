import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  AnalysisRequestSchema, 
  type AnalysisResponse, 
  type DoraMetrics, 
  type HealthMetrics, 
  type Contributor, 
  type TimelineDay, 
  type WorkClassification 
} from "@shared/schema";
import { GitHubAnalyzer } from "./lib/github-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
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
          const response: AnalysisResponse = {
            id: existingAnalysis.id,
            repositoryUrl: existingAnalysis.repositoryUrl,
            repositoryName: existingAnalysis.repositoryName,
            repositoryOwner: existingAnalysis.repositoryOwner,
            analysisType: existingAnalysis.analysisType,
            doraMetrics: existingAnalysis.doraMetrics as DoraMetrics,
            healthMetrics: existingAnalysis.healthMetrics as HealthMetrics,
            contributors: existingAnalysis.contributorsData as Contributor[],
            timeline: existingAnalysis.timelineData as TimelineDay[],
            workClassification: existingAnalysis.workClassification as WorkClassification,
            createdAt: existingAnalysis.createdAt.toISOString(),
          };
          return res.json(response);
        }
      }

      // Initialize GitHub analyzer
      const analyzer = new GitHubAnalyzer();
      await analyzer.initialize();

      // Parse GitHub URL
      const repoData = analyzer.parseGitHubUrl(url);
      
      // Fetch repository data
      const repositoryData = await analyzer.fetchRepositoryData(repoData.owner, repoData.repo);
      
      // Fetch commits (last 90 days for reasonable performance)
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 90);
      const commits = await analyzer.fetchCommits(repoData.owner, repoData.repo, sinceDate);
      
      console.log(`Fetched ${commits.length} commits for analysis`);

      // Calculate all metrics
      const doraMetrics = analyzer.calculateDoraMetrics(commits);
      const healthMetrics = analyzer.calculateHealthMetrics(commits, repositoryData);
      const contributors = analyzer.calculateContributors(commits);
      const timeline = analyzer.calculateTimeline(commits);
      const workClassification = analyzer.calculateWorkClassification(commits);

      // Store analysis results
      const analysisData = {
        repositoryUrl: url,
        repositoryName: repositoryData.name,
        repositoryOwner: repositoryData.owner.login,
        analysisType: type,
        repositoryData: repositoryData,
        commitsData: commits,
        contributorsData: contributors,
        doraMetrics: doraMetrics,
        healthMetrics: healthMetrics,
        timelineData: timeline,
        workClassification: workClassification,
      };

      const savedAnalysis = await storage.createAnalysis(analysisData);
      
      // Format response
      const response: AnalysisResponse = {
        id: savedAnalysis.id,
        repositoryUrl: savedAnalysis.repositoryUrl,
        repositoryName: savedAnalysis.repositoryName,
        repositoryOwner: savedAnalysis.repositoryOwner,
        analysisType: savedAnalysis.analysisType,
        doraMetrics: doraMetrics,
        healthMetrics: healthMetrics,
        contributors: contributors,
        timeline: timeline,
        workClassification: workClassification,
        createdAt: savedAnalysis.createdAt!.toISOString(),
      };

      console.log(`Analysis completed for ${url}`);
      res.json(response);

    } catch (error: any) {
      console.error("Analysis error:", error);
      
      // Handle specific GitHub API errors
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: "Repository not found",
          message: "The specified repository could not be found or is not publicly accessible."
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

      const response: AnalysisResponse = {
        id: analysis.id,
        repositoryUrl: analysis.repositoryUrl,
        repositoryName: analysis.repositoryName,
        repositoryOwner: analysis.repositoryOwner,
        analysisType: analysis.analysisType,
        doraMetrics: analysis.doraMetrics as DoraMetrics,
        healthMetrics: analysis.healthMetrics as HealthMetrics,
        contributors: analysis.contributorsData as Contributor[],
        timeline: analysis.timelineData as TimelineDay[],
        workClassification: analysis.workClassification as WorkClassification,
        createdAt: analysis.createdAt!.toISOString(),
      };

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

  const httpServer = createServer(app);
  return httpServer;
}
