import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, FileText, Shield, Cog, Tag, Users, Archive } from 'lucide-react';
import type { BestPractices } from '@shared/schema';

interface UserBestPracticesProps {
  bestPractices: BestPractices;
}

export default function UserBestPractices({ bestPractices }: UserBestPracticesProps) {
  const practiceItems = [
    {
      key: 'license',
      label: 'License',
      percentage: bestPractices.pctWithLicense * 100,
      icon: Shield,
      description: 'Repositories with license files',
    },
    {
      key: 'readme',
      label: 'README',
      percentage: bestPractices.pctWithReadme * 100,
      icon: FileText,
      description: 'Repositories with README files',
    },
    {
      key: 'ci',
      label: 'CI/CD',
      percentage: bestPractices.pctWithCI * 100,
      icon: Cog,
      description: 'Repositories with CI/CD configurations',
    },
    {
      key: 'topics',
      label: 'Topics',
      percentage: bestPractices.pctWithTopics * 100,
      icon: Tag,
      description: 'Repositories with topic tags',
    },
    {
      key: 'contributing',
      label: 'Contributing',
      percentage: bestPractices.pctWithContributing * 100,
      icon: Users,
      description: 'Repositories with contributing guidelines',
    },
    {
      key: 'description',
      label: 'Description',
      percentage: bestPractices.pctWithDescription * 100,
      icon: FileText,
      description: 'Repositories with descriptions',
    },
  ];

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'default' as const, label: 'Excellent' };
    if (percentage >= 60) return { variant: 'secondary' as const, label: 'Good' };
    if (percentage >= 40) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Needs Work' };
  };

  const overallScore = practiceItems.reduce((sum, item) => sum + item.percentage, 0) / practiceItems.length;
  const scoreBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card data-testid="card-overall-score">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Best Practices Score
              </CardTitle>
              <CardDescription>
                Overall adherence to repository best practices
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`} data-testid="text-overall-score">
                {overallScore.toFixed(0)}%
              </div>
              <Badge variant={scoreBadge.variant} data-testid="badge-score-level">
                {scoreBadge.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Progress value={overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Individual Practices */}
      <Card data-testid="card-practices-breakdown">
        <CardHeader>
          <CardTitle>Practice Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of repository best practices
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {practiceItems.map((item) => (
            <div key={item.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(item.percentage)}`} 
                       data-testid={`percentage-${item.key}`}>
                    {item.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Archive Analysis */}
      <Card data-testid="card-archive-analysis">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Repository Health
          </CardTitle>
          <CardDescription>
            Analysis of repository maintenance and activity
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Archived Repositories</div>
                <div className="text-sm text-muted-foreground">
                  Ratio of archived vs active repositories
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getScoreColor((1 - bestPractices.archivedRatio) * 100)}`} 
                     data-testid="text-archived-ratio">
                  {(bestPractices.archivedRatio * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">archived</div>
              </div>
            </div>
            <Progress value={bestPractices.archivedRatio * 100} className="h-2" />
            
            <div className="text-sm text-muted-foreground">
              {bestPractices.archivedRatio < 0.1 ? (
                <span className="text-green-600">✓ Low archive ratio indicates active maintenance</span>
              ) : bestPractices.archivedRatio < 0.3 ? (
                <span className="text-yellow-600">◐ Moderate archive ratio</span>
              ) : (
                <span className="text-red-600">⚠ High archive ratio may indicate inactive projects</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}