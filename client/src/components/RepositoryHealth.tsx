import { Heart, AlertCircle, CheckCircle, TrendingUp, GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type HealthMetrics } from '@shared/schema';

interface RepositoryHealthProps {
  metrics?: HealthMetrics;
}

export default function RepositoryHealth({ metrics }: RepositoryHealthProps) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Repository Health</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No health data available. Please run an analysis first.</p>
        </div>
      </div>
    );
  }

  const data = metrics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-chart-2';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-6 w-6 text-success" />;
      case 'good': return <Heart className="h-6 w-6 text-chart-2" />;
      case 'fair': return <AlertCircle className="h-6 w-6 text-warning" />;
      case 'poor': return <AlertCircle className="h-6 w-6 text-destructive" />;
      default: return <Heart className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {getHealthIcon(data.status)}
        <h2 className="text-2xl font-bold">Repository Health</h2>
        <Badge className={`${
          data.status === 'excellent' ? 'bg-success text-success-foreground' :
          data.status === 'good' ? 'bg-chart-2 text-primary-foreground' :
          data.status === 'fair' ? 'bg-warning text-warning-foreground' :
          'bg-destructive text-destructive-foreground'
        }`}>
          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Health Score */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Overall Health Score</h3>
              <span className={`text-3xl font-bold font-mono ${getStatusColor(data.status)}`} data-testid="text-health-score">
                {data.overallScore}/100
              </span>
            </div>
            <Progress value={data.overallScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Based on commit frequency, code quality, and contributor activity
            </p>
          </div>
        </Card>

        {/* Key Statistics */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Key Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Commits</span>
              <span className="font-mono font-semibold" data-testid="text-total-commits">
                {data.totalCommits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Files Changed</span>
              <span className="font-mono font-semibold">
                {data.filesChanged.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Contributors</span>
              <span className="font-mono font-semibold">
                {data.activeContributors}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Code Velocity</span>
              <span className="font-mono font-semibold">
                {data.codeVelocity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Activity</span>
              <span className="font-semibold text-success">
                {data.lastActivity}
              </span>
            </div>
          </div>
        </Card>

        {/* Innovation vs Technical Debt */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Innovation Ratio</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm">New Features & Improvements</span>
              <span className="ml-auto font-mono font-semibold text-success">
                {data.innovationRatio}%
              </span>
            </div>
            <Progress value={data.innovationRatio} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Percentage of commits focused on innovation vs maintenance
            </p>
          </div>
        </Card>

        {/* Technical Debt */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Technical Debt Risk</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-warning" />
              <span className="text-sm">Large Commits & Fixes</span>
              <span className="ml-auto font-mono font-semibold text-warning">
                {data.technicalDebt}%
              </span>
            </div>
            <Progress value={data.technicalDebt} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {data.technicalDebt < 20 ? 'Low risk' : 
               data.technicalDebt < 40 ? 'Moderate risk' : 'High risk'} - 
              Percentage of commits that may introduce technical debt
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}