import { Users, GitCommit, FileText, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Contributor {
  name: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
  rank: number;
}

interface ContributorStatsProps {
  contributors?: Contributor[];
}

export default function ContributorStats({ contributors }: ContributorStatsProps) {
  // todo: remove mock data when integrating with real API
  const mockContributors: Contributor[] = [
    { name: 'Sarah Chen', commits: 142, linesAdded: 8420, linesDeleted: 2130, filesChanged: 89, rank: 1 },
    { name: 'Alex Rodriguez', commits: 89, linesAdded: 5230, linesDeleted: 1890, filesChanged: 67, rank: 2 },
    { name: 'Jamie Kim', commits: 76, linesAdded: 4180, linesDeleted: 1200, filesChanged: 54, rank: 3 },
    { name: 'Morgan Taylor', commits: 58, linesAdded: 3240, linesDeleted: 980, filesChanged: 42, rank: 4 },
    { name: 'River Johnson', commits: 43, linesAdded: 2150, linesDeleted: 760, filesChanged: 31, rank: 5 },
  ];

  const data = contributors || mockContributors;

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