import { Target, Clock, AlertTriangle, Zap } from 'lucide-react';
import MetricCard from './MetricCard';
import { type DoraMetrics } from '@shared/schema';

interface DORAMetricsProps {
  metrics?: DoraMetrics;
}

export default function DORAMetrics({ metrics }: DORAMetricsProps) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">DORA Metrics</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No metrics data available. Please run an analysis first.</p>
        </div>
      </div>
    );
  }

  const data = metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">DORA Metrics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="DORA Score"
          value={`${data.overallScore}/100`}
          rating={{
            label: data.overallRating,
            type: data.overallRating.toLowerCase() as any,
          }}
          icon={<Target className="h-5 w-5" />}
          trend={{ direction: 'up', value: `Score: ${data.overallScore}` }}
        />
        
        <MetricCard
          title="Deployment Frequency"
          value={data.deploymentFrequency.value}
          subtitle="How often deployments occur"
          rating={{
            label: data.deploymentFrequency.rating,
            type: data.deploymentFrequency.rating.toLowerCase() as any,
          }}
          icon={<Zap className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Lead Time for Changes"
          value={data.leadTime.value}
          subtitle="Time from commit to production"
          rating={{
            label: data.leadTime.rating,
            type: data.leadTime.rating.toLowerCase() as any,
          }}
          icon={<Clock className="h-5 w-5" />}
          trend={{ direction: 'up', value: `Score: ${data.leadTime.score}` }}
        />
        
        <MetricCard
          title="Change Failure Rate"
          value={data.changeFailureRate.value}
          subtitle="Percentage of changes causing issues"
          rating={{
            label: data.changeFailureRate.rating,
            type: data.changeFailureRate.rating.toLowerCase() as any,
          }}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Recovery Time"
          value={data.recoveryTime.value}
          subtitle="Time to recover from failures"
          rating={{
            label: data.recoveryTime.rating,
            type: data.recoveryTime.rating.toLowerCase() as any,
          }}
          icon={<Clock className="h-5 w-5" />}
          trend={{ direction: 'up', value: `Score: ${data.recoveryTime.score}` }}
        />
      </div>
    </div>
  );
}