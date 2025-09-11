import { PieChart, Code, Bug, Wrench, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WorkBreakdown {
  innovation: number;
  bugFixes: number;
  maintenance: number;
  documentation: number;
}

interface WorkClassificationProps {
  breakdown?: WorkBreakdown;
}

export default function WorkClassification({ breakdown }: WorkClassificationProps) {
  // todo: remove mock data when integrating with real API
  const mockBreakdown: WorkBreakdown = {
    innovation: 45,
    bugFixes: 28,
    maintenance: 20,
    documentation: 7,
  };

  const data = breakdown || mockBreakdown;

  const workTypes = [
    {
      type: 'Innovation',
      percentage: data.innovation,
      icon: <Code className="h-5 w-5" />,
      color: 'text-success',
      bgColor: 'bg-success',
      description: 'New features and improvements',
    },
    {
      type: 'Bug Fixes',
      percentage: data.bugFixes,
      icon: <Bug className="h-5 w-5" />,
      color: 'text-warning',
      bgColor: 'bg-warning',
      description: 'Issue resolution and error fixes',
    },
    {
      type: 'Maintenance',
      percentage: data.maintenance,
      icon: <Wrench className="h-5 w-5" />,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2',
      description: 'Code refactoring and optimization',
    },
    {
      type: 'Documentation',
      percentage: data.documentation,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      description: 'Documentation updates and comments',
    },
  ];

  const getWorkBalance = () => {
    if (data.innovation > 50) return { label: 'Innovation-Heavy', type: 'excellent' };
    if (data.bugFixes > 40) return { label: 'Bug-Heavy', type: 'poor' };
    if (data.innovation >= 30 && data.bugFixes <= 35) return { label: 'Balanced', type: 'good' };
    return { label: 'Maintenance-Heavy', type: 'fair' };
  };

  const workBalance = getWorkBalance();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PieChart className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Work Classification</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          workBalance.type === 'excellent' ? 'bg-success text-success-foreground' :
          workBalance.type === 'good' ? 'bg-chart-2 text-primary-foreground' :
          workBalance.type === 'fair' ? 'bg-warning text-warning-foreground' :
          'bg-destructive text-destructive-foreground'
        }`}>
          {workBalance.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Work Distribution</h3>
          <div className="space-y-4">
            {workTypes.map((work, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={work.color}>{work.icon}</span>
                    <span className="font-medium">{work.type}</span>
                  </div>
                  <span className="font-mono font-semibold" data-testid={`percentage-${work.type.toLowerCase().replace(' ', '-')}`}>
                    {work.percentage}%
                  </span>
                </div>
                <Progress value={work.percentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {work.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Analysis & Insights */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Analysis & Insights</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium mb-2">Work Balance Assessment</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This repository shows a <strong>{workBalance.label.toLowerCase()}</strong> development pattern.
              </p>
              {workBalance.type === 'excellent' && (
                <p className="text-sm text-success">
                  ✓ High focus on innovation and new features indicates healthy product growth.
                </p>
              )}
              {workBalance.type === 'good' && (
                <p className="text-sm text-chart-2">
                  ✓ Well-balanced mix of innovation and maintenance work.
                </p>
              )}
              {workBalance.type === 'fair' && (
                <p className="text-sm text-warning">
                  ⚠ Consider increasing innovation work to drive product forward.
                </p>
              )}
              {workBalance.type === 'poor' && (
                <p className="text-sm text-destructive">
                  ⚠ High bug fix percentage may indicate quality issues.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <div className="text-2xl font-bold font-mono text-success">
                    {data.innovation}%
                  </div>
                  <div className="text-sm text-muted-foreground">Innovation</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <div className="text-2xl font-bold font-mono text-warning">
                    {data.bugFixes}%
                  </div>
                  <div className="text-sm text-muted-foreground">Bug Fixes</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <strong>Recommendation:</strong> {
                  data.innovation > 40 ? 'Maintain strong innovation focus while ensuring code quality.' :
                  data.bugFixes > 35 ? 'Consider investing in better testing and code quality practices.' :
                  'Good balance - continue current development practices.'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}