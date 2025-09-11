interface ApiCall {
  endpoint: string;
  method: string;
  timestamp: number;
  fromCache: boolean;
  responseTime?: number;
}

export class ApiStatsTracker {
  private calls: ApiCall[] = [];
  private endpointStats = new Map<string, {
    count: number;
    cacheHits: number;
    avgResponseTime: number;
    lastCalled: number;
  }>();

  trackCall(endpoint: string, method: string = 'GET', fromCache: boolean = false, responseTime?: number): void {
    const call: ApiCall = {
      endpoint,
      method,
      timestamp: Date.now(),
      fromCache,
      responseTime,
    };

    this.calls.push(call);

    // Update endpoint stats
    const stats = this.endpointStats.get(endpoint) || {
      count: 0,
      cacheHits: 0,
      avgResponseTime: 0,
      lastCalled: 0,
    };

    stats.count++;
    stats.lastCalled = call.timestamp;
    
    if (fromCache) {
      stats.cacheHits++;
    }

    if (responseTime !== undefined) {
      // Update average response time
      const totalCalls = stats.count - stats.cacheHits;
      if (totalCalls > 0) {
        stats.avgResponseTime = ((stats.avgResponseTime * (totalCalls - 1)) + responseTime) / totalCalls;
      }
    }

    this.endpointStats.set(endpoint, stats);

    // Keep only last 1000 calls to prevent memory issues
    if (this.calls.length > 1000) {
      this.calls = this.calls.slice(-1000);
    }
  }

  getStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentCalls = {
      lastHour: this.calls.filter(call => now - call.timestamp < oneHour),
      lastDay: this.calls.filter(call => now - call.timestamp < oneDay),
      total: this.calls,
    };

    const totalCalls = this.calls.length;
    const totalCacheHits = this.calls.filter(call => call.fromCache).length;
    const totalApiCalls = totalCalls - totalCacheHits;

    return {
      summary: {
        totalCalls,
        totalApiCalls,
        totalCacheHits,
        cacheHitRate: totalCalls > 0 ? (totalCacheHits / totalCalls) : 0,
        apiCallsLastHour: recentCalls.lastHour.filter(call => !call.fromCache).length,
        apiCallsLastDay: recentCalls.lastDay.filter(call => !call.fromCache).length,
      },
      endpoints: Array.from(this.endpointStats.entries()).map(([endpoint, stats]) => ({
        endpoint,
        ...stats,
        cacheHitRate: stats.count > 0 ? (stats.cacheHits / stats.count) : 0,
        lastCalledAgo: now - stats.lastCalled,
      })).sort((a, b) => b.count - a.count),
      recentActivity: this.calls.slice(-20).map(call => ({
        ...call,
        timeAgo: now - call.timestamp,
      })),
    };
  }

  reset(): void {
    this.calls = [];
    this.endpointStats.clear();
  }
}