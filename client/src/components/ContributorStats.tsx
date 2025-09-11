import { Users, GitCommit, FileText, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type Contributor } from '@shared/schema';

interface ContributorStatsProps {
  contributors?: Contributor[];
}

export default function ContributorStats({ contributors }: ContributorStatsProps) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Top Contributors</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No contributor data available. Please run an analysis first.</p>
        </div>
      </div>
    );
  }

  const data = contributors;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: 'Top Contributor', type: 'excellent' as const };
    if (rank <= 3) return { label: 'Core Team', type: 'good' as const };
    return { label: 'Active', type: 'fair' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Top Contributors</h2>
        <Badge variant="secondary">{data.length} active developers</Badge>
      </div>

      <div className="grid gap-4">
        {data.map((contributor, index) => {
          const rankBadge = getRankBadge(contributor.rank);
          const initials = contributor.name.split(' ').map(n => n[0]).join('');
          
          return (
            <Card key={index} className="p-6 hover-elevate">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-contributor-${index}`}>
                      {contributor.name}
                    </h3>
                    <p className="text-muted-foreground">Rank #{contributor.rank}</p>
                  </div>
                </div>
                <Badge className={
                  rankBadge.type === 'excellent' ? 'bg-success text-success-foreground' :
                  rankBadge.type === 'good' ? 'bg-chart-2 text-primary-foreground' :
                  'bg-warning text-warning-foreground'
                }>
                  <Award className="h-3 w-3 mr-1" />
                  {rankBadge.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Commits</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">{contributor.commits}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-sm text-muted-foreground">Lines Added</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-success">
                    +{contributor.linesAdded.toLocaleString()}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-sm text-muted-foreground">Lines Removed</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-destructive">
                    -{contributor.linesDeleted.toLocaleString()}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Files</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">{contributor.filesChanged}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}