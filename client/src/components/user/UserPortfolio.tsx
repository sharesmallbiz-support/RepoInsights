import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Star, GitFork, Archive, Zap, Code } from 'lucide-react';
import type { PortfolioSummary } from '@shared/schema';

interface UserPortfolioProps {
  portfolioSummary: PortfolioSummary;
}

export default function UserPortfolio({ portfolioSummary }: UserPortfolioProps) {
  const totalRepos = portfolioSummary.totalOwned + portfolioSummary.totalForked;
  const ownedPercentage = totalRepos > 0 ? (portfolioSummary.totalOwned / totalRepos) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Repository Overview */}
      <Card data-testid="card-repo-overview">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Repository Portfolio
          </CardTitle>
          <CardDescription>
            Overview of repositories and contribution statistics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-owned-repos">
                {portfolioSummary.totalOwned}
              </div>
              <div className="text-sm text-muted-foreground">Owned</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-muted-foreground" data-testid="text-forked-repos">
                {portfolioSummary.totalForked}
              </div>
              <div className="text-sm text-muted-foreground">Forked</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-stars">
                {portfolioSummary.totalStars.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Stars</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-forks">
                {portfolioSummary.totalForks.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Forks</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Owned vs Forked Repositories</span>
              <span className="text-muted-foreground">
                {ownedPercentage.toFixed(1)}% owned
              </span>
            </div>
            <Progress value={ownedPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Active (90d): <strong data-testid="text-active-repos">{portfolioSummary.reposActiveLast90d}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span>Archived: <strong data-testid="text-archived-repos">{portfolioSummary.totalArchived}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>With Releases: <strong data-testid="text-releases-repos">{portfolioSummary.reposWithReleases}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Languages */}
      <Card data-testid="card-languages">
        <CardHeader>
          <CardTitle>Programming Languages</CardTitle>
          <CardDescription>
            Primary languages across repositories
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {Object.entries(portfolioSummary.languages).slice(0, 8).map(([language, repos], index) => (
              <div key={language} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: getLanguageColor(language) }}
                     data-testid={`color-${language.toLowerCase()}`}
                />
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-medium">{language}</span>
                  <Badge variant="secondary" className="text-xs" data-testid={`repos-${language.toLowerCase()}`}>
                    {repos} {repos === 1 ? 'repo' : 'repos'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Starred Repositories */}
      {portfolioSummary.topReposByStars.length > 0 && (
        <Card data-testid="card-top-repos">
          <CardHeader>
            <CardTitle>Top Starred Repositories</CardTitle>
            <CardDescription>
              Most popular repositories by star count
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {portfolioSummary.topReposByStars.map((repo, index) => (
                <div key={repo.name} className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate">
                  <div className="space-y-1">
                    <div className="font-medium" data-testid={`repo-name-${index}`}>{repo.name}</div>
                    {repo.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2" data-testid={`repo-desc-${index}`}>
                        {repo.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {repo.language && (
                        <span data-testid={`repo-lang-${index}`}>{repo.language}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span data-testid={`repo-stars-${index}`}>{repo.stars}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to get language colors
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Scala': '#c22d40',
    'R': '#198CE7',
    'MATLAB': '#e16737',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Vue': '#2c3e50',
    'React': '#61DAFB',
  };
  
  return colors[language] || '#6B7280';
}