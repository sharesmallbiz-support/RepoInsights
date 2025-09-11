import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  rating?: {
    label: string;
    type: 'excellent' | 'good' | 'fair' | 'poor' | 'elite' | 'high' | 'medium' | 'low';
  };
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  icon?: React.ReactNode;
}

const ratingColors = {
  excellent: 'bg-success text-success-foreground',
  elite: 'bg-success text-success-foreground',
  good: 'bg-success text-success-foreground',
  high: 'bg-chart-2 text-primary-foreground',
  fair: 'bg-warning text-warning-foreground',
  medium: 'bg-warning text-warning-foreground',
  poor: 'bg-destructive text-destructive-foreground',
  low: 'bg-destructive text-destructive-foreground',
};

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  rating, 
  trend, 
  icon 
}: MetricCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                   trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <Card className="p-6 hover-elevate transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="font-medium text-muted-foreground">{title}</h3>
        </div>
        {rating && (
          <Badge 
            className={ratingColors[rating.type]}
            data-testid={`badge-rating-${rating.type}`}
          >
            {rating.label}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold font-mono" data-testid="text-metric-value">
          {value}
        </div>
        
        {subtitle && (
          <div className="text-sm text-muted-foreground" data-testid="text-metric-subtitle">
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-success' :
            trend.direction === 'down' ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            <TrendIcon className="h-4 w-4" />
            <span data-testid="text-trend-value">{trend.value}</span>
          </div>
        )}
      </div>
    </Card>
  );
}