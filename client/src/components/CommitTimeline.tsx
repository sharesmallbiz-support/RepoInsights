import { Calendar, GitCommit, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type TimelineDay } from '@shared/schema';

interface CommitTimelineProps {
  timeline?: TimelineDay[];
  period?: string;
}

export default function CommitTimeline({ timeline, period = 'Last 20 Days' }: CommitTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Commit Timeline</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No timeline data available. Please run an analysis first.</p>
        </div>
      </div>
    );
  }

  const data = timeline;

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'very-high': return 'bg-success border-success';
      case 'high': return 'bg-chart-2 border-chart-2';
      case 'medium': return 'bg-warning border-warning';
      case 'low': return 'bg-muted border-muted';
      case 'none': return 'bg-background border-border';
      default: return 'bg-muted border-muted';
    }
  };

  const getActivityLabel = (activity: string) => {
    switch (activity) {
      case 'very-high': return 'Very High';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      case 'none': return 'No Activity';
      default: return 'Unknown';
    }
  };

  const totalCommits = data.reduce((sum, day) => sum + day.commits, 0);
  const averageCommits = totalCommits / data.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Commit Timeline</h2>
          <Badge variant="secondary">{period}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            <span>{totalCommits} total commits</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{averageCommits.toFixed(1)} avg/day</span>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-3">
          {data.map((day, index) => (
            <div
              key={index}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${getActivityColor(day.activity)}`}
              data-testid={`timeline-day-${index}`}
            >
              <div className="text-center space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {day.date}
                </div>
                <div className="text-lg font-bold font-mono">
                  {day.commits}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.linesChanged > 0 ? `${day.linesChanged} lines` : ''}
                </div>
                <div className="text-xs font-medium">
                  {getActivityLabel(day.activity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-medium mb-3">Activity Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success"></div>
              <span>Very High (10+ commits)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-chart-2"></div>
              <span>High (5+ commits)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning"></div>
              <span>Medium (2+ commits)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted"></div>
              <span>Low (1 commit)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-background border border-border"></div>
              <span>No Activity</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}