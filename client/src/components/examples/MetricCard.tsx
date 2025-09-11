import MetricCard from '../MetricCard';
import { Target } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
      <MetricCard
        title="DORA Score"
        value="85/100"
        rating={{ label: 'High', type: 'high' }}
        icon={<Target className="h-5 w-5" />}
        trend={{ direction: 'up', value: '+12%' }}
      />
      <MetricCard
        title="Deployment Frequency"
        value="2.3/day"
        subtitle="commits per day"
        rating={{ label: 'Elite', type: 'elite' }}
      />
    </div>
  );
}