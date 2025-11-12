import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Github, BarChart3, Users, Heart, GitBranch, PieChart, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import ThemeToggle from '@/components/ThemeToggle';
import GitHubURLInput from '@/components/GitHubURLInput';
import DORAMetrics from '@/components/DORAMetrics';
import RepositoryHealth from '@/components/RepositoryHealth';
import ContributorStats from '@/components/ContributorStats';
import CommitTimeline from '@/components/CommitTimeline';
import WorkClassification from '@/components/WorkClassification';
import ExportOptions from '@/components/ExportOptions';
import UserOverviewCard from '@/components/user/UserOverviewCard';
import UserPortfolio from '@/components/user/UserPortfolio';
import UserActivity from '@/components/user/UserActivity';
import UserBestPractices from '@/components/user/UserBestPractices';
import UserImpact from '@/components/user/UserImpact';
import { UserMenu } from '@/components/user/UserMenu';
import ApiStats from '@/components/ApiStats';
import { apiRequest } from '@/lib/queryClient';
import type { AnalysisResponse, RepositoryAnalysisResponse, UserAnalysisResponse } from '@shared/schema';

interface AnalysisState {
  isAnalyzing: boolean;
  hasResults: boolean;
  repositoryUrl: string;
  analysisType: 'repository' | 'user' | null;
  data: AnalysisResponse | null;
  error: string | null;
}

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    hasResults: false,
    repositoryUrl: '',
    analysisType: null,
    data: null,
    error: null,
  });

  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async ({ url, type }: { url: string; type: 'repository' | 'user' }) => {
      const response = await apiRequest('POST', '/api/analyze', { url, type });
      return response.json() as Promise<AnalysisResponse>;
    },
    onSuccess: (data) => {
      setAnalysis(prev => ({
        ...prev,
        isAnalyzing: false,
        hasResults: true,
        data,
        error: null,
      }));
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.analysisType === 'repository' ? (data as RepositoryAnalysisResponse).repositoryName : (data as UserAnalysisResponse).username}`,
      });
    },
    onError: (error: Error) => {
      setAnalysis(prev => ({
        ...prev,
        isAnalyzing: false,
        hasResults: false,
        error: error.message,
      }));
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = async (url: string, type: 'repository' | 'user') => {
    setAnalysis({
      isAnalyzing: true,
      hasResults: false,
      repositoryUrl: url,
      analysisType: type,
      data: null,
      error: null,
    });

    console.log('Starting analysis for:', url, 'Type:', type);
    analysisMutation.mutate({ url, type });
  };

  const resetAnalysis = () => {
    setAnalysis({
      isAnalyzing: false,
      hasResults: false,
      repositoryUrl: '',
      analysisType: null,
      data: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Github className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">GitHubSpark</h1>
                  <p className="text-sm text-muted-foreground">
                    Next Generation GitHub Analytics by Mark Hazleton
                  </p>
                </div>
              </div>
              {analysis.hasResults && (
                <div className="flex items-center gap-2">
                  <Separator orientation="vertical" className="h-6" />
                  <Badge variant="secondary" className="font-mono text-xs">
                    {analysis.repositoryUrl}
                  </Badge>
                  <Badge className="bg-success text-success-foreground">
                    {analysis.analysisType === 'repository' ? 'Repository' : 'User'}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {analysis.hasResults && (
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  data-testid="button-new-analysis"
                  className="hover-elevate"
                >
                  New Analysis
                </Button>
              )}
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!analysis.hasResults ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Spark Your GitHub Insights</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover comprehensive repository analytics, developer productivity metrics, 
                DORA insights, and collaboration patterns with GitHubSpark.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={() => handleAnalyze('https://github.com/markhazleton', 'user')}
                    disabled={analysis.isAnalyzing}
                    className="flex items-center gap-2"
                    data-testid="button-quick-user-markhazleton"
                  >
                    <Users className="h-4 w-4" />
                    Analyze Mark Hazleton
                  </Button>
                  <Button
                    onClick={() => handleAnalyze('https://github.com/markhazleton/WebSpark', 'repository')}
                    disabled={analysis.isAnalyzing}
                    className="flex items-center gap-2"
                    data-testid="button-quick-repo-webspark"
                  >
                    <Github className="h-4 w-4" />
                    Analyze WebSpark Project
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or analyze any repository</span>
                  </div>
                </div>
              </div>
            </div>

            {/* URL Input */}
            <GitHubURLInput 
              onAnalyze={handleAnalyze} 
              isLoading={analysis.isAnalyzing}
            />

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">DORA Metrics</h3>
                <p className="text-sm text-muted-foreground">
                  Deployment frequency, lead time, change failure rate, and recovery time
                </p>
              </div>
              <div className="text-center space-y-2">
                <Users className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">Contributor Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Individual statistics, collaboration patterns, and team dynamics
                </p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">Repository Health</h3>
                <p className="text-sm text-muted-foreground">
                  Overall health score, risk assessment, and quality indicators
                </p>
              </div>
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">Activity Timeline</h3>
                <p className="text-sm text-muted-foreground">
                  Commit patterns, development streaks, and activity trends
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="dora" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  DORA
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="contributors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contributors
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="classification" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Work Analysis
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  API Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <>
                    <DORAMetrics metrics={(analysis.data as RepositoryAnalysisResponse).doraMetrics} />
                    <Separator />
                    <RepositoryHealth metrics={(analysis.data as RepositoryAnalysisResponse).healthMetrics} />
                  </>
                ) : (
                  <div className="space-y-8">
                    <UserOverviewCard userProfile={(analysis.data as UserAnalysisResponse).userAnalysis.userProfile} />
                    <UserPortfolio portfolioSummary={(analysis.data as UserAnalysisResponse).userAnalysis.portfolioSummary} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dora" className="mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <DORAMetrics metrics={(analysis.data as RepositoryAnalysisResponse).doraMetrics} />
                ) : (
                  <UserImpact impact={(analysis.data as UserAnalysisResponse).userAnalysis.impact} />
                )}
              </TabsContent>

              <TabsContent value="health" className="mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <RepositoryHealth metrics={(analysis.data as RepositoryAnalysisResponse).healthMetrics} />
                ) : (
                  <UserBestPractices bestPractices={(analysis.data as UserAnalysisResponse).userAnalysis.bestPractices} />
                )}
              </TabsContent>

              <TabsContent value="contributors" className="mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <ContributorStats contributors={(analysis.data as RepositoryAnalysisResponse).contributors} />
                ) : (
                  <UserPortfolio portfolioSummary={(analysis.data as UserAnalysisResponse).userAnalysis.portfolioSummary} />
                )}
              </TabsContent>

              <TabsContent value="timeline" className="mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <CommitTimeline timeline={(analysis.data as RepositoryAnalysisResponse).timeline} />
                ) : (
                  <UserActivity activityMetrics={(analysis.data as UserAnalysisResponse).userAnalysis.activityMetrics} />
                )}
              </TabsContent>

              <TabsContent value="classification" className="space-y-8 mt-8">
                {analysis.data?.analysisType === 'repository' ? (
                  <>
                    <WorkClassification breakdown={(analysis.data as RepositoryAnalysisResponse).workClassification} />
                    <Separator />
                    <ExportOptions 
                      repositoryUrl={analysis.repositoryUrl} 
                      analysisData={analysis.data}
                    />
                  </>
                ) : (
                  <div className="space-y-8">
                    <UserBestPractices bestPractices={(analysis.data as UserAnalysisResponse).userAnalysis.bestPractices} />
                    <UserImpact impact={(analysis.data as UserAnalysisResponse).userAnalysis.impact} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="mt-8">
                <ApiStats />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              GitHubSpark - Next Generation GitHub Analytics by <strong>Mark Hazleton</strong>
            </p>
            <p className="mt-2">
              Built with React, TypeScript, and TailwindCSS. 
              Empowering developers with actionable repository insights and DORA metrics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}