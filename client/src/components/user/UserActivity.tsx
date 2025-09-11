import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Calendar, Clock, Flame, Target } from 'lucide-react';
import type { ActivityMetrics } from '@shared/schema';

interface UserActivityProps {
  activityMetrics: ActivityMetrics;
}

export default function UserActivity({ activityMetrics }: UserActivityProps) {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxWeekdayCommits = Math.max(...activityMetrics.commitsByWeekday);
  const maxHourCommits = Math.max(...activityMetrics.commitsByHour);
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <Card data-testid="card-activity-overview">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Overview
          </CardTitle>
          <CardDescription>
            Contribution patterns and coding habits
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-commits">
                {activityMetrics.totalCommits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Commits</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-active-days">
                {activityMetrics.activeDays}
              </div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-orange-500" data-testid="text-longest-streak">
                {activityMetrics.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">
                <Flame className="h-3 w-3 inline mr-1" />
                Longest Streak
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-avg-commits">
                {activityMetrics.avgCommitsPerActiveDay.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg per Day</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Contribution Timeline</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>First Commit:</span>
                  <span data-testid="text-first-commit">{formatDate(activityMetrics.firstCommitDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latest Commit:</span>
                  <span data-testid="text-last-commit">{formatDate(activityMetrics.lastCommitDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Repositories:</span>
                  <span data-testid="text-repos-contributed">{activityMetrics.reposContributedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Pattern */}
      <Card data-testid="card-weekly-pattern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Activity Pattern
          </CardTitle>
          <CardDescription>
            Commits by day of the week
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {weekdays.map((day, index) => {
              const commits = activityMetrics.commitsByWeekday[index];
              const percentage = maxWeekdayCommits > 0 ? (commits / maxWeekdayCommits) * 100 : 0;
              
              return (
                <div key={day} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium w-12">{day}</span>
                    <span className="text-muted-foreground" data-testid={`commits-${day.toLowerCase()}`}>
                      {commits} commits
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Pattern */}
      <Card data-testid="card-hourly-pattern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Activity Pattern
          </CardTitle>
          <CardDescription>
            Commits by hour of the day (24-hour format)
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {activityMetrics.commitsByHour.map((commits, hour) => {
              const percentage = maxHourCommits > 0 ? (commits / maxHourCommits) * 100 : 0;
              const intensity = percentage > 75 ? 'bg-primary' : 
                               percentage > 50 ? 'bg-primary/70' :
                               percentage > 25 ? 'bg-primary/40' :
                               percentage > 0 ? 'bg-primary/20' : 'bg-muted';
              
              return (
                <div key={hour} className="text-center space-y-1">
                  <div 
                    className={`h-8 w-full rounded ${intensity} flex items-end justify-center`}
                    title={`${hour}:00 - ${commits} commits`}
                    data-testid={`hour-${hour}`}
                  >
                    <div className="text-xs text-white font-medium">
                      {commits > 0 ? commits : ''}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hour.toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/40 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>High</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}