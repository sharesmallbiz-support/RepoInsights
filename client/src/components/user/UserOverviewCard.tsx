import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, UserPlus, Github } from 'lucide-react';
import type { UserProfile } from '@shared/schema';

interface UserOverviewCardProps {
  userProfile: UserProfile;
}

export default function UserOverviewCard({ userProfile }: UserOverviewCardProps) {
  const accountAgeYears = Math.floor(userProfile.accountAgeDays / 365);
  const accountAgeLabel = accountAgeYears === 1 ? 'year' : 'years';

  return (
    <Card data-testid="card-user-overview">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} />
            <AvatarFallback className="text-lg">
              {userProfile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl" data-testid="text-username">
                {userProfile.name || userProfile.username}
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                @{userProfile.username}
              </Badge>
            </div>
            
            {userProfile.bio && (
              <CardDescription className="text-base" data-testid="text-bio">
                {userProfile.bio}
              </CardDescription>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {userProfile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-location">{userProfile.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-account-age">
                  {accountAgeYears} {accountAgeLabel} on GitHub
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary" data-testid="text-public-repos">
              {userProfile.publicRepos}
            </div>
            <div className="text-sm text-muted-foreground">Public Repos</div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary" data-testid="text-followers">
              {userProfile.followers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary" data-testid="text-following">
              {userProfile.following.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary" data-testid="text-hireable">
              {userProfile.hireable ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-muted-foreground">Available for Hire</div>
          </div>
        </div>

        {userProfile.company && (
          <>
            <Separator />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Company</div>
              <div className="font-medium" data-testid="text-company">
                {userProfile.company}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}