import { useState } from 'react';
import { Github, BarChart3, Users, Heart, GitBranch, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import ThemeToggle from '@/components/ThemeToggle';
import GitHubURLInput from '@/components/GitHubURLInput';
import DORAMetrics from '@/components/DORAMetrics';
import RepositoryHealth from '@/components/RepositoryHealth';
import ContributorStats from '@/components/ContributorStats';
import CommitTimeline from '@/components/CommitTimeline';
import WorkClassification from '@/components/WorkClassification';
import ExportOptions from '@/components/ExportOptions';

interface AnalysisState {
  isAnalyzing: boolean;
  hasResults: boolean;
  repositoryUrl: string;
  analysisType: 'repository' | null;
}

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    hasResults: false,
    repositoryUrl: '',
    analysisType: null,
  });

  const handleAnalyze = async (url: string, type: 'repository') => {
    setAnalysis({
      isAnalyzing: true,
      hasResults: false,
      repositoryUrl: url,
      analysisType: type,
    });

    console.log('Starting analysis for:', url, 'Type:', type);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setAnalysis({
      isAnalyzing: false,
      hasResults: true,
      repositoryUrl: url,
      analysisType: type,
    });

    console.log('Analysis completed for:', url);
  };

  const resetAnalysis = () => {
    setAnalysis({
      isAnalyzing: false,
      hasResults: false,
      repositoryUrl: '',
      analysisType: null,
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
                  <h1 className="text-2xl font-bold">GitHub Analytics</h1>
                  <p className="text-sm text-muted-foreground">
                    DORA Metrics & Repository Insights
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
                    {analysis.analysisType}
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
              <h2 className="text-3xl font-bold">Analyze GitHub Repositories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get comprehensive insights into repository health, developer productivity, 
                DORA metrics, and team collaboration patterns.
              </p>
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
              <TabsList className="grid w-full grid-cols-6">
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
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-8">
                <DORAMetrics />
                <Separator />
                <RepositoryHealth />
              </TabsContent>

              <TabsContent value="dora" className="mt-8">
                <DORAMetrics />
              </TabsContent>

              <TabsContent value="health" className="mt-8">
                <RepositoryHealth />
              </TabsContent>

              <TabsContent value="contributors" className="mt-8">
                <ContributorStats />
              </TabsContent>

              <TabsContent value="timeline" className="mt-8">
                <CommitTimeline />
              </TabsContent>

              <TabsContent value="classification" className="space-y-8 mt-8">
                <WorkClassification />
                <Separator />
                <ExportOptions repositoryUrl={analysis.repositoryUrl} />
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
              Built with React, TypeScript, and TailwindCSS. 
              Providing comprehensive GitHub repository analytics and DORA metrics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}