import { Calendar, GitCommit, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineDay {
  date: string;
  commits: number;
  linesChanged: number;
  activity: 'very-high' | 'high' | 'medium' | 'low' | 'none';
}

interface CommitTimelineProps {
  timeline?: TimelineDay[];
  period?: string;
}

export default function CommitTimeline({ timeline, period = 'Last 20 Days' }: CommitTimelineProps) {
  // todo: remove mock data when integrating with real API
  const mockTimeline: TimelineDay[] = [
    { date: 'Dec 20', commits: 8, linesChanged: 1240, activity: 'very-high' },
    { date: 'Dec 19', commits: 5, linesChanged: 680, activity: 'high' },
    { date: 'Dec 18', commits: 3, linesChanged: 420, activity: 'medium' },
    { date: 'Dec 17', commits: 1, linesChanged: 125, activity: 'low' },
    { date: 'Dec 16', commits: 0, linesChanged: 0, activity: 'none' },
    { date: 'Dec 15', commits: 7, linesChanged: 890, activity: 'high' },
    { date: 'Dec 14', commits: 4, linesChanged: 560, activity: 'medium' },
    { date: 'Dec 13', commits: 9, linesChanged: 1420, activity: 'very-high' },
    { date: 'Dec 12', commits: 2, linesChanged: 280, activity: 'low' },
    { date: 'Dec 11', commits: 6, linesChanged: 780, activity: 'high' },
    { date: 'Dec 10', commits: 1, linesChanged: 95, activity: 'low' },
    { date: 'Dec 9', commits: 5, linesChanged: 640, activity: 'high' },
    { date: 'Dec 8', commits: 0, linesChanged: 0, activity: 'none' },
    { date: 'Dec 7', commits: 3, linesChanged: 380, activity: 'medium' },
    { date: 'Dec 6', commits: 8, linesChanged: 1120, activity: 'very-high' },
  ];

  const data = timeline || mockTimeline;

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