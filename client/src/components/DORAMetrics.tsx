import { Target, Clock, AlertTriangle, Zap } from 'lucide-react';
import MetricCard from './MetricCard';

interface DORAMetricsProps {
  metrics?: {
    deploymentFrequency: { value: string; rating: string };
    leadTime: { value: string; rating: string };
    changeFailureRate: { value: string; rating: string };
    recoveryTime: { value: string; rating: string };
    doraScore: { value: number; rating: string };
  };
}

export default function DORAMetrics({ metrics }: DORAMetricsProps) {
  // todo: remove mock data when integrating with real API
  const mockMetrics = {
    deploymentFrequency: { value: '2.3 commits/day', rating: 'high' },
    leadTime: { value: '4.2 hours', rating: 'elite' },
    changeFailureRate: { value: '12.5%', rating: 'good' },
    recoveryTime: { value: '45 minutes', rating: 'elite' },
    doraScore: { value: 85, rating: 'high' },
  };

  const data = metrics || mockMetrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">DORA Metrics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="DORA Score"
          value={`${data.doraScore.value}/100`}
          rating={{
            label: data.doraScore.rating,
            type: data.doraScore.rating.toLowerCase() as any,
          }}
          icon={<Target className="h-5 w-5" />}
          trend={{ direction: 'up', value: '+12% from last month' }}
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
          trend={{ direction: 'down', value: '-30 min improvement' }}
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
          trend={{ direction: 'up', value: '+5% faster recovery' }}
        />
      </div>
    </div>
  );
}