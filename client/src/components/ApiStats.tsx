import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, Database, TrendingUp, Zap } from 'lucide-react';

interface ApiStatsData {
  cache: {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
    size: number;
    hitRate: number;
  };
  api: {
    summary: {
      totalCalls: number;
      totalApiCalls: number;
      totalCacheHits: number;
      cacheHitRate: number;
      apiCallsLastHour: number;
      apiCallsLastDay: number;
    };
    endpoints: Array<{
      endpoint: string;
      count: number;
      cacheHits: number;
      cacheHitRate: number;
      avgResponseTime: number;
      lastCalledAgo: number;
    }>;
    recentActivity: Array<{
      endpoint: string;
      fromCache: boolean;
      timestamp: number;
      timeAgo: number;
    }>;
  };
}

interface StatsResponse {
  success: boolean;
  stats: ApiStatsData;
  timestamp: string;
}

export default function ApiStats() {
  const { data: statsData, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-api-stats">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading API statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !statsData?.success || !statsData?.stats) {
    return (
      <div className="space-y-6" data-testid="error-api-stats">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load API statistics</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsData.stats;

  const formatTimeAgo = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6" data-testid="api-stats-dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-cache-performance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cache-hit-rate">
              {(stats.cache.hitRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cache.hits} hits / {stats.cache.hits + stats.cache.misses} total
            </p>
            <Progress value={stats.cache.hitRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-api-calls">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-cache-hits">
              {stats.api.summary.totalCacheHits}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.api.summary.totalApiCalls} actual API calls made
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-activity">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-calls-last-hour">
              {stats.api.summary.apiCallsLastHour}
            </div>
            <p className="text-xs text-muted-foreground">
              API calls in the last hour
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cache-size">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cache-size">
              {stats.cache.size}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cache.evictions} evictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Statistics */}
      <Card data-testid="card-endpoint-stats">
        <CardHeader>
          <CardTitle>Endpoint Statistics</CardTitle>
          <CardDescription>Performance breakdown by GitHub API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="list-endpoints">
            {stats.api.endpoints.slice(0, 8).map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between" data-testid={`endpoint-${index}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" data-testid={`text-endpoint-name-${index}`}>
                    {endpoint.endpoint}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {endpoint.count} calls • {formatTimeAgo(endpoint.lastCalledAgo)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={endpoint.cacheHitRate > 0.5 ? "default" : "secondary"} data-testid={`badge-cache-rate-${index}`}>
                    {(endpoint.cacheHitRate * 100).toFixed(0)}% cached
                  </Badge>
                  {endpoint.avgResponseTime > 0 && (
                    <Badge variant="outline" data-testid={`badge-response-time-${index}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {endpoint.avgResponseTime.toFixed(0)}ms
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card data-testid="card-recent-calls">
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
          <CardDescription>Last 20 API requests and cache hits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" data-testid="list-recent-calls">
            {stats.api.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm" data-testid={`recent-call-${index}`}>
                <div className="flex items-center gap-2">
                  <Badge variant={activity.fromCache ? "default" : "secondary"} data-testid={`badge-source-${index}`}>
                    {activity.fromCache ? "Cache" : "API"}
                  </Badge>
                  <span className="font-mono text-xs truncate" data-testid={`text-endpoint-${index}`}>
                    {activity.endpoint}
                  </span>
                </div>
                <span className="text-muted-foreground" data-testid={`text-time-${index}`}>
                  {formatTimeAgo(activity.timeAgo)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}