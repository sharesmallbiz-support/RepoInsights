import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Code2, Star, Hash } from 'lucide-react';
import type { Impact } from '@shared/schema';

interface UserImpactProps {
  impact: Impact;
}

export default function UserImpact({ impact }: UserImpactProps) {
  const getDiversityLevel = (score: number) => {
    if (score >= 0.8) return { level: 'Very High', color: 'text-green-600', variant: 'default' as const };
    if (score >= 0.6) return { level: 'High', color: 'text-blue-600', variant: 'secondary' as const };
    if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', variant: 'outline' as const };
    return { level: 'Low', color: 'text-red-600', variant: 'destructive' as const };
  };

  const getContributionLevel = (score: number) => {
    if (score >= 80) return { level: 'Exceptional', color: 'text-green-600', variant: 'default' as const };
    if (score >= 60) return { level: 'High', color: 'text-blue-600', variant: 'secondary' as const };
    if (score >= 40) return { level: 'Moderate', color: 'text-yellow-600', variant: 'outline' as const };
    return { level: 'Developing', color: 'text-orange-600', variant: 'destructive' as const };
  };

  const diversityInfo = getDiversityLevel(impact.diversityScore);
  const contributionInfo = getContributionLevel(impact.contributionScore);

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <Card data-testid="card-impact-overview">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Developer Impact
          </CardTitle>
          <CardDescription>
            Measures of contribution quality and technical diversity
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diversity Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Technical Diversity</span>
                </div>
                <Badge variant={diversityInfo.variant} data-testid="badge-diversity-level">
                  {diversityInfo.level}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Diversity Score</span>
                  <span className={`font-bold ${diversityInfo.color}`} data-testid="text-diversity-score">
                    {(impact.diversityScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={impact.diversityScore * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Based on language and technology variety across repositories
                </div>
              </div>
            </div>

            {/* Contribution Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-medium">Contribution Impact</span>
                </div>
                <Badge variant={contributionInfo.variant} data-testid="badge-contribution-level">
                  {contributionInfo.level}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Impact Score</span>
                  <span className={`font-bold ${contributionInfo.color}`} data-testid="text-contribution-score">
                    {impact.contributionScore.toFixed(0)}
                  </span>
                </div>
                <Progress value={Math.min(impact.contributionScore, 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Based on repository quality, stars, and engagement metrics
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stars Growth */}
      {impact.starsGainedLast90d !== undefined && (
        <Card data-testid="card-stars-growth">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Growth
            </CardTitle>
            <CardDescription>
              Stars gained in the last 90 days
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary" data-testid="text-stars-gained">
                +{impact.starsGainedLast90d}
              </div>
              <div className="text-muted-foreground">
                Stars gained in the last 90 days
              </div>
              {impact.starsGainedLast90d > 0 && (
                <Badge variant="secondary" className="text-green-600">
                  Growing
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Topics */}
      <Card data-testid="card-popular-topics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Popular Topics
          </CardTitle>
          <CardDescription>
            Most frequently used repository topics
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {impact.popularTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {impact.popularTopics.slice(0, 12).map((topic, index) => (
                <Badge 
                  key={topic} 
                  variant="outline" 
                  className="text-sm"
                  data-testid={`topic-${index}`}
                >
                  #{topic}
                </Badge>
              ))}
              {impact.popularTopics.length > 12 && (
                <Badge variant="secondary" className="text-sm">
                  +{impact.popularTopics.length - 12} more
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No topics found in repositories
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Insights */}
      <Card data-testid="card-impact-insights">
        <CardHeader>
          <CardTitle>Impact Insights</CardTitle>
          <CardDescription>
            Key takeaways from your development profile
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-sm">
            {impact.diversityScore >= 0.7 && (
              <div className="flex items-start gap-2 text-green-600">
                <div className="mt-1">✓</div>
                <div>Strong technical diversity across multiple languages and technologies</div>
              </div>
            )}
            
            {impact.contributionScore >= 60 && (
              <div className="flex items-start gap-2 text-green-600">
                <div className="mt-1">✓</div>
                <div>High-impact contributions with strong community engagement</div>
              </div>
            )}
            
            {impact.popularTopics.length >= 5 && (
              <div className="flex items-start gap-2 text-blue-600">
                <div className="mt-1">ℹ</div>
                <div>Diverse project interests spanning {impact.popularTopics.length} different topics</div>
              </div>
            )}
            
            {impact.starsGainedLast90d !== undefined && impact.starsGainedLast90d > 10 && (
              <div className="flex items-start gap-2 text-blue-600">
                <div className="mt-1">↗</div>
                <div>Active growth with {impact.starsGainedLast90d} stars gained recently</div>
              </div>
            )}
            
            {impact.diversityScore < 0.3 && (
              <div className="flex items-start gap-2 text-yellow-600">
                <div className="mt-1">!</div>
                <div>Consider exploring more languages and technologies to increase technical diversity</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}