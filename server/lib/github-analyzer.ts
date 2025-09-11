import { getUncachableGitHubClient } from './github-client';
import type { 
  DoraMetrics, 
  HealthMetrics, 
  Contributor, 
  TimelineDay, 
  WorkClassification,
  UserProfile,
  PortfolioSummary,
  ActivityMetrics,
  BestPractices,
  Impact,
  UserAnalysis
} from '@shared/schema';

interface GitHubRepoData {
  owner: string;
  repo?: string;
  url: string;
  type: 'repository' | 'user';
}

interface CommitData {
  sha: string;
  message: string;
  author: string;
  email: string;
  date: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export class GitHubAnalyzer {
  private client: any;

  constructor() {
    this.client = null;
  }

  async initialize() {
    this.client = await getUncachableGitHubClient();
  }

  parseGitHubUrl(url: string): GitHubRepoData {
    // Repository URL: https://github.com/owner/repo
    const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      return {
        owner: owner.trim(),
        repo: repo.replace(/\.git$/, '').trim(),
        url: url.trim(),
        type: 'repository'
      };
    }
    
    // User URL: https://github.com/username
    const userMatch = url.match(/github\.com\/([^\/]+)\/?$/);
    if (userMatch) {
      const [, owner] = userMatch;
      return {
        owner: owner.trim(),
        url: url.trim(),
        type: 'user'
      };
    }
    
    throw new Error('Invalid GitHub URL format. Expected repository (github.com/owner/repo) or user (github.com/username)');
  }

  async fetchRepositoryData(owner: string, repo: string) {
    try {
      const { data: repository } = await this.client.repos.get({
        owner,
        repo,
      });
      return repository;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository ${owner}/${repo} not found or not accessible`);
      }
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }

  async fetchUserData(username: string) {
    try {
      const { data: user } = await this.client.users.getByUsername({
        username,
      });
      return user;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`User ${username} not found or not accessible`);
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async fetchUserRepositories(username: string, maxRepos: number = 10): Promise<any[]> {
    try {
      const repos: any[] = [];
      let page = 1;
      const perPage = 30;

      while (repos.length < maxRepos) {
        const { data: repoPage } = await this.client.repos.listForUser({
          username,
          type: 'owner',
          sort: 'updated',
          per_page: perPage,
          page,
        });

        if (repoPage.length === 0) break;

        repos.push(...repoPage.slice(0, maxRepos - repos.length));
        page++;

        if (repoPage.length < perPage) break;
      }

      // Filter out forks to focus on original repositories for meaningful analysis
      const originalRepos = repos.filter(repo => !repo.fork);
      console.log(`Fetched ${originalRepos.length} original repositories for user ${username}`);
      
      return originalRepos.slice(0, Math.min(maxRepos, originalRepos.length));
    } catch (error: any) {
      throw new Error(`Failed to fetch user repositories: ${error.message}`);
    }
  }

  async fetchCommits(owner: string, repo: string, since?: Date): Promise<CommitData[]> {
    const commits: CommitData[] = [];
    const perPage = 50; // Reduced to minimize rate limit impact
    let page = 1;
    const maxCommits = 500; // Reduced limit for better performance and rate limiting
    const maxDetailedCommits = 100; // Only fetch detailed stats for recent commits
    
    try {
      while (commits.length < maxCommits) {
        const { data: commitPage } = await this.client.repos.listCommits({
          owner,
          repo,
          per_page: perPage,
          page,
          since: since?.toISOString(),
        });

        if (commitPage.length === 0) break;

        for (const commit of commitPage) {
          // Only fetch detailed commit info for the most recent commits to avoid rate limiting
          if (commits.length < maxDetailedCommits) {
            try {
              const { data: commitDetails } = await this.client.repos.getCommit({
                owner,
                repo,
                ref: commit.sha,
              });

              commits.push({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name || 'Unknown',
                email: commit.commit.author?.email || '',
                date: commit.commit.author?.date || '',
                additions: commitDetails.stats?.additions || 0,
                deletions: commitDetails.stats?.deletions || 0,
                changedFiles: commitDetails.files?.length || 0,
              });
            } catch (error) {
              // Skip commits we can't fetch details for and continue with basic data
              console.warn(`Could not fetch details for commit ${commit.sha}, using basic data`);
              commits.push({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name || 'Unknown',
                email: commit.commit.author?.email || '',
                date: commit.commit.author?.date || '',
                additions: 0, // Default to 0 if we can't get stats
                deletions: 0,
                changedFiles: 1, // Assume 1 file changed as minimum
              });
            }
          } else {
            // For older commits, just use basic data to avoid excessive API calls
            commits.push({
              sha: commit.sha,
              message: commit.commit.message,
              author: commit.commit.author?.name || 'Unknown',
              email: commit.commit.author?.email || '',
              date: commit.commit.author?.date || '',
              additions: 0,
              deletions: 0,
              changedFiles: 1,
            });
          }
        }

        page++;
        if (commitPage.length < perPage) break;
      }
      
      console.log(`Fetched ${commits.length} commits (${Math.min(commits.length, maxDetailedCommits)} with detailed stats)`);
      return commits;
    } catch (error: any) {
      if (error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }
  }

  calculateDoraMetrics(commits: CommitData[]): DoraMetrics {
    if (commits.length === 0) {
      return {
        deploymentFrequency: { value: '0 commits/day', score: 0, rating: 'low' },
        leadTime: { value: 'No data', score: 0, rating: 'low' },
        changeFailureRate: { value: '0%', score: 100, rating: 'elite' },
        recoveryTime: { value: 'No data', score: 0, rating: 'low' },
        overallScore: 0,
        overallRating: 'low',
      };
    }

    // Calculate deployment frequency (commits per day)
    const sortedCommits = commits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstCommit = new Date(sortedCommits[0].date);
    const lastCommit = new Date(sortedCommits[sortedCommits.length - 1].date);
    const daysDiff = Math.max(1, (lastCommit.getTime() - firstCommit.getTime()) / (1000 * 60 * 60 * 24));
    const commitsPerDay = commits.length / daysDiff;
    
    const deploymentFrequency = {
      value: `${commitsPerDay.toFixed(1)} commits/day`,
      score: Math.min(100, commitsPerDay * 20),
      rating: commitsPerDay > 1 ? 'elite' : commitsPerDay > 0.5 ? 'high' : commitsPerDay > 0.1 ? 'medium' : 'low'
    } as const;

    // Calculate lead time (average time between commits)
    let totalTimeBetweenCommits = 0;
    for (let i = 1; i < sortedCommits.length; i++) {
      const timeDiff = new Date(sortedCommits[i].date).getTime() - new Date(sortedCommits[i - 1].date).getTime();
      totalTimeBetweenCommits += timeDiff;
    }
    const avgTimeBetweenCommits = totalTimeBetweenCommits / Math.max(1, sortedCommits.length - 1);
    const avgHours = avgTimeBetweenCommits / (1000 * 60 * 60);
    
    const leadTime = {
      value: avgHours < 1 ? `${Math.round(avgHours * 60)} minutes` : 
             avgHours < 24 ? `${avgHours.toFixed(1)} hours` : 
             `${(avgHours / 24).toFixed(1)} days`,
      score: Math.max(0, 100 - avgHours),
      rating: avgHours < 1 ? 'elite' : avgHours < 24 ? 'high' : avgHours < 168 ? 'medium' : 'low'
    } as const;

    // Calculate change failure rate (commits with fix/bug keywords)
    const failureKeywords = ['fix', 'bug', 'error', 'revert', 'hotfix', 'patch'];
    const failureCommits = commits.filter(commit => 
      failureKeywords.some(keyword => 
        commit.message.toLowerCase().includes(keyword)
      )
    );
    const changeFailureRate = (failureCommits.length / commits.length) * 100;
    
    const changeFailureMetric = {
      value: `${changeFailureRate.toFixed(1)}%`,
      score: Math.max(0, 100 - changeFailureRate * 2),
      rating: changeFailureRate < 15 ? 'elite' : changeFailureRate < 20 ? 'high' : changeFailureRate < 30 ? 'medium' : 'low'
    } as const;

    // Calculate recovery time (average time between failure and fix)
    const recoveryTimes: number[] = [];
    for (let i = 0; i < failureCommits.length - 1; i++) {
      const failureTime = new Date(failureCommits[i].date).getTime();
      const nextCommitTime = new Date(failureCommits[i + 1].date).getTime();
      if (nextCommitTime > failureTime) {
        recoveryTimes.push(nextCommitTime - failureTime);
      }
    }
    
    const avgRecoveryTime = recoveryTimes.length > 0 ? 
      recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length : 0;
    const recoveryHours = avgRecoveryTime / (1000 * 60 * 60);
    
    const recoveryTime = {
      value: recoveryTimes.length === 0 ? 'No data' :
             recoveryHours < 1 ? `${Math.round(recoveryHours * 60)} minutes` :
             recoveryHours < 24 ? `${recoveryHours.toFixed(1)} hours` :
             `${(recoveryHours / 24).toFixed(1)} days`,
      score: recoveryTimes.length === 0 ? 50 : Math.max(0, 100 - recoveryHours),
      rating: recoveryTimes.length === 0 ? 'medium' :
              recoveryHours < 1 ? 'elite' : recoveryHours < 24 ? 'high' : recoveryHours < 168 ? 'medium' : 'low'
    } as const;

    // Calculate overall score
    const scores = [
      deploymentFrequency.score,
      leadTime.score,
      changeFailureMetric.score,
      recoveryTime.score
    ];
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    const overallRating = overallScore >= 90 ? 'elite' : 
                         overallScore >= 70 ? 'high' : 
                         overallScore >= 50 ? 'medium' : 'low';

    return {
      deploymentFrequency,
      leadTime,
      changeFailureRate: changeFailureMetric,
      recoveryTime,
      overallScore,
      overallRating,
    };
  }

  calculateHealthMetrics(commits: CommitData[], repositoryData: any): HealthMetrics {
    const totalCommits = commits.length;
    const filesChanged = commits.reduce((sum, commit) => sum + commit.changedFiles, 0);
    const contributors = new Set(commits.map(commit => commit.author)).size;
    
    // Calculate code velocity
    const totalLines = commits.reduce((sum, commit) => sum + commit.additions + commit.deletions, 0);
    const daysSinceFirstCommit = commits.length > 0 ? 
      Math.max(1, (Date.now() - new Date(commits[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const linesPerDay = Math.round(totalLines / daysSinceFirstCommit);
    
    // Calculate innovation ratio (non-fix commits)
    const fixKeywords = ['fix', 'bug', 'error', 'revert', 'hotfix'];
    const innovationCommits = commits.filter(commit => 
      !fixKeywords.some(keyword => commit.message.toLowerCase().includes(keyword))
    );
    const innovationRatio = Math.round((innovationCommits.length / Math.max(1, totalCommits)) * 100);
    
    // Calculate technical debt (large commits)
    const largeCommits = commits.filter(commit => commit.additions + commit.deletions > 500);
    const technicalDebt = Math.round((largeCommits.length / Math.max(1, totalCommits)) * 100);
    
    // Calculate overall score
    const deploymentScore = Math.min(100, totalCommits / 10 * 10); // 10 points per 10 commits
    const activityScore = Math.min(100, contributors * 15); // 15 points per contributor
    const qualityScore = Math.max(0, 100 - technicalDebt); // Reduce score for high debt
    const overallScore = Math.round((deploymentScore + activityScore + qualityScore) / 3);
    
    const status = overallScore >= 90 ? 'excellent' :
                  overallScore >= 70 ? 'good' :
                  overallScore >= 50 ? 'fair' : 'poor';
    
    const lastActivity = commits.length > 0 ? 
      this.formatTimeAgo(new Date(commits[commits.length - 1].date)) : 'No activity';

    return {
      overallScore,
      status,
      totalCommits,
      filesChanged,
      activeContributors: contributors,
      codeVelocity: `${linesPerDay} lines/day`,
      innovationRatio,
      technicalDebt,
      lastActivity,
    };
  }

  calculateContributors(commits: CommitData[]): Contributor[] {
    const contributorMap = new Map<string, {
      name: string;
      email: string;
      commits: number;
      linesAdded: number;
      linesDeleted: number;
      filesChanged: number;
    }>();

    commits.forEach(commit => {
      const key = commit.author + commit.email;
      const existing = contributorMap.get(key) || {
        name: commit.author,
        email: commit.email,
        commits: 0,
        linesAdded: 0,
        linesDeleted: 0,
        filesChanged: 0,
      };

      existing.commits++;
      existing.linesAdded += commit.additions;
      existing.linesDeleted += commit.deletions;
      existing.filesChanged += commit.changedFiles;
      
      contributorMap.set(key, existing);
    });

    const contributors = Array.from(contributorMap.values())
      .sort((a, b) => b.commits - a.commits)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1,
      }));

    return contributors.slice(0, 10); // Top 10 contributors
  }

  calculateTimeline(commits: CommitData[], days: number = 20): TimelineDay[] {
    const endDate = new Date();
    const timeline: TimelineDay[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayCommits = commits.filter(commit => {
        const commitDate = new Date(commit.date);
        return commitDate.toDateString() === date.toDateString();
      });

      const commitCount = dayCommits.length;
      const linesChanged = dayCommits.reduce((sum, commit) => sum + commit.additions + commit.deletions, 0);
      
      const activity = commitCount >= 10 ? 'very-high' :
                      commitCount >= 5 ? 'high' :
                      commitCount >= 2 ? 'medium' :
                      commitCount >= 1 ? 'low' : 'none';

      timeline.push({
        date: dateStr,
        commits: commitCount,
        linesChanged,
        activity,
      });
    }

    return timeline;
  }

  calculateWorkClassification(commits: CommitData[]): WorkClassification {
    if (commits.length === 0) {
      return { innovation: 0, bugFixes: 0, maintenance: 0, documentation: 0 };
    }

    const categories = {
      innovation: 0,
      bugFixes: 0,
      maintenance: 0,
      documentation: 0,
    };

    commits.forEach(commit => {
      const message = commit.message.toLowerCase();
      
      if (message.includes('fix') || message.includes('bug') || message.includes('error')) {
        categories.bugFixes++;
      } else if (message.includes('refactor') || message.includes('cleanup') || message.includes('optimize')) {
        categories.maintenance++;
      } else if (message.includes('doc') || message.includes('readme') || message.includes('comment')) {
        categories.documentation++;
      } else {
        categories.innovation++;
      }
    });

    const total = commits.length;
    return {
      innovation: Math.round((categories.innovation / total) * 100),
      bugFixes: Math.round((categories.bugFixes / total) * 100),
      maintenance: Math.round((categories.maintenance / total) * 100),
      documentation: Math.round((categories.documentation / total) * 100),
    };
  }

  async analyzeUser(username: string) {
    console.log(`Starting user analysis for: ${username}`);
    
    // Fetch user data
    const userData = await this.fetchUserData(username);
    
    // Fetch user's repositories (limit to 10 for performance)
    const repositories = await this.fetchUserRepositories(username, 10);
    
    if (repositories.length === 0) {
      throw new Error(`No public repositories found for user ${username}`);
    }
    
    console.log(`Analyzing ${repositories.length} repositories for user ${username}`);
    
    // Aggregate data across all repositories
    let allCommits: CommitData[] = [];
    const repositoryNames: string[] = [];
    
    // Fetch commits from each repository (reduced limit per repo for performance)
    const maxCommitsPerRepo = 25; // Further reduced to avoid rate limits
    const since = new Date();
    since.setDate(since.getDate() - 90); // Last 90 days
    
    for (const repo of repositories) {
      try {
        console.log(`Fetching commits for ${repo.name}...`);
        const repoCommits = await this.fetchCommits(username, repo.name, since);
        allCommits = allCommits.concat(repoCommits.slice(0, maxCommitsPerRepo));
        repositoryNames.push(repo.name);
      } catch (error) {
        console.warn(`Could not fetch commits for ${repo.name}:`, error);
        // Continue with other repositories
      }
    }
    
    if (allCommits.length === 0) {
      throw new Error(`No commits found in the last 90 days for user ${username}`);
    }
    
    console.log(`Analyzing ${allCommits.length} total commits across ${repositoryNames.length} repositories`);
    
    // Calculate aggregated metrics
    const doraMetrics = this.calculateDoraMetrics(allCommits);
    const healthMetrics = this.calculateUserHealthMetrics(allCommits, repositories, userData);
    const contributors = this.calculateContributors(allCommits);
    const timeline = this.calculateTimeline(allCommits);
    const workClassification = this.calculateWorkClassification(allCommits);
    
    // Build user-focused analysis instead of aggregated repository metrics
    const userAnalysis = this.buildUserAnalysis(userData, repositories, allCommits);
    
    return {
      userAnalysis,
      userData,
      repositories,
      totalRepositories: repositories.length,
    };
  }

  calculateUserHealthMetrics(commits: CommitData[], repositories: any[], userData: any): HealthMetrics {
    const totalCommits = commits.length;
    const filesChanged = commits.reduce((sum, commit) => sum + commit.changedFiles, 0);
    const contributors = new Set(commits.map(commit => commit.author)).size;
    
    // Calculate code velocity across all repositories
    const totalLines = commits.reduce((sum, commit) => sum + commit.additions + commit.deletions, 0);
    const daysSinceFirstCommit = commits.length > 0 ? 
      Math.max(1, (Date.now() - new Date(commits[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const linesPerDay = Math.round(totalLines / daysSinceFirstCommit);
    
    // Calculate innovation ratio (non-fix commits)
    const fixKeywords = ['fix', 'bug', 'error', 'revert', 'hotfix'];
    const innovationCommits = commits.filter(commit => 
      !fixKeywords.some(keyword => commit.message.toLowerCase().includes(keyword))
    );
    const innovationRatio = Math.round((innovationCommits.length / Math.max(1, totalCommits)) * 100);
    
    // Calculate technical debt (large commits)
    const largeCommits = commits.filter(commit => commit.additions + commit.deletions > 500);
    const technicalDebt = Math.round((largeCommits.length / Math.max(1, totalCommits)) * 100);
    
    // Calculate overall score for user (different from single repository)
    const repositoryScore = Math.min(100, repositories.length * 10); // 10 points per repository (max 10 repos)
    const activityScore = Math.min(100, totalCommits / 10 * 5); // 5 points per 10 commits
    const diversityScore = Math.min(100, contributors * 20); // 20 points per unique contributor
    const qualityScore = Math.max(0, 100 - technicalDebt); // Reduce score for high debt
    
    const overallScore = Math.round((repositoryScore + activityScore + diversityScore + qualityScore) / 4);
    
    const status = overallScore >= 90 ? 'excellent' :
                  overallScore >= 70 ? 'good' :
                  overallScore >= 50 ? 'fair' : 'poor';
    
    const lastActivity = commits.length > 0 ? 
      this.formatTimeAgo(new Date(commits[commits.length - 1].date)) : 'No activity';

    return {
      overallScore,
      status,
      totalCommits,
      filesChanged,
      activeContributors: contributors,
      codeVelocity: `${linesPerDay} lines/day`,
      innovationRatio,
      technicalDebt,
      lastActivity,
    };
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  private buildUserAnalysis(userData: any, repositories: any[], commits: CommitData[]): UserAnalysis {
    const userProfile = this.buildUserProfile(userData);
    const portfolioSummary = this.buildPortfolioSummary(repositories);
    const activityMetrics = this.buildActivityMetrics(commits);
    const bestPractices = this.buildBestPractices(repositories);
    const impact = this.buildImpact(repositories, commits);

    return {
      userProfile,
      portfolioSummary,
      activityMetrics,
      bestPractices,
      impact,
    };
  }

  private buildUserProfile(userData: any): UserProfile {
    const accountAge = userData.created_at 
      ? Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      username: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepos: userData.public_repos || 0,
      accountAgeDays: accountAge,
      hireable: userData.hireable,
      company: userData.company,
      location: userData.location,
      bio: userData.bio,
    };
  }

  private buildPortfolioSummary(repositories: any[]): PortfolioSummary {
    const owned = repositories.filter(repo => !repo.fork);
    const forked = repositories.filter(repo => repo.fork);
    const archived = repositories.filter(repo => repo.archived);
    
    // Activity in last 90 days
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const reposActiveLast90d = repositories.filter(repo => 
      repo.updated_at && new Date(repo.updated_at) > ninetyDaysAgo
    ).length;

    const reposWithReleases = repositories.filter(repo => repo.has_downloads).length;

    // Language analysis
    const languages: Record<string, number> = {};
    repositories.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Top repositories by stars
    const topReposByStars = repositories
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count || 0,
        description: repo.description,
        language: repo.language,
      }));

    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

    return {
      totalOwned: owned.length,
      totalForked: forked.length,
      totalArchived: archived.length,
      reposActiveLast90d,
      reposWithReleases,
      languages,
      topReposByStars,
      totalStars,
      totalForks,
    };
  }

  private buildActivityMetrics(commits: CommitData[]): ActivityMetrics {
    if (commits.length === 0) {
      return {
        totalCommits: 0,
        activeDays: 0,
        longestStreak: 0,
        avgCommitsPerActiveDay: 0,
        commitsByWeekday: [0, 0, 0, 0, 0, 0, 0],
        commitsByHour: Array(24).fill(0),
        reposContributedCount: 0,
        firstCommitDate: null,
        lastCommitDate: null,
      };
    }

    // Sort commits by date
    const sortedCommits = commits.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate active days and streaks
    const commitDates = new Set<string>();
    const weekdayCount = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
    const hourCount = Array(24).fill(0);

    commits.forEach(commit => {
      const date = new Date(commit.date);
      const dateStr = date.toISOString().split('T')[0];
      commitDates.add(dateStr);
      
      // Track weekday distribution (0 = Sunday)
      weekdayCount[date.getDay()]++;
      
      // Track hour distribution
      hourCount[date.getHours()]++;
    });

    const activeDays = commitDates.size;
    const avgCommitsPerActiveDay = activeDays > 0 ? commits.length / activeDays : 0;

    // Calculate longest streak
    const sortedDates = Array.from(commitDates).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Repository contribution count - using commit sha patterns to identify repos
    const reposContributed = new Set<string>();
    commits.forEach(commit => {
      if (commit.sha) {
        // Simplified repo counting for user analysis
        reposContributed.add(commit.sha.substring(0, 7)); // Use commit prefix as proxy
      }
    });

    return {
      totalCommits: commits.length,
      activeDays,
      longestStreak,
      avgCommitsPerActiveDay: Math.round(avgCommitsPerActiveDay * 100) / 100,
      commitsByWeekday: weekdayCount,
      commitsByHour: hourCount,
      reposContributedCount: reposContributed.size,
      firstCommitDate: sortedCommits[0]?.date || null,
      lastCommitDate: sortedCommits[sortedCommits.length - 1]?.date || null,
    };
  }

  private buildBestPractices(repositories: any[]): BestPractices {
    if (repositories.length === 0) {
      return {
        pctWithLicense: 0,
        pctWithReadme: 0,
        pctWithCI: 0,
        pctWithTopics: 0,
        pctWithContributing: 0,
        pctWithDescription: 0,
        archivedRatio: 0,
      };
    }

    const total = repositories.length;
    const withLicense = repositories.filter(repo => repo.license).length;
    const withReadme = repositories.filter(repo => repo.has_wiki || repo.description?.toLowerCase().includes('readme')).length;
    const withCI = repositories.filter(repo => repo.has_pages || repo.has_downloads).length; // Proxy for CI/CD
    const withTopics = repositories.filter(repo => repo.topics && repo.topics.length > 0).length;
    const withContributing = repositories.filter(repo => repo.has_issues).length; // Proxy for contributing guidelines
    const withDescription = repositories.filter(repo => repo.description && repo.description.trim().length > 0).length;
    const archived = repositories.filter(repo => repo.archived).length;

    return {
      pctWithLicense: Math.round((withLicense / total) * 100),
      pctWithReadme: Math.round((withReadme / total) * 100),
      pctWithCI: Math.round((withCI / total) * 100),
      pctWithTopics: Math.round((withTopics / total) * 100),
      pctWithContributing: Math.round((withContributing / total) * 100),
      pctWithDescription: Math.round((withDescription / total) * 100),
      archivedRatio: Math.round((archived / total) * 100),
    };
  }

  private buildImpact(repositories: any[], commits: CommitData[]): Impact {
    // Popular topics across repositories
    const topicCounts: Record<string, number> = {};
    repositories.forEach(repo => {
      if (repo.topics) {
        repo.topics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });

    const popularTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);

    // Language diversity score
    const languages = new Set<string>();
    repositories.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    const diversityScore = Math.min(languages.size * 10, 100); // Cap at 100

    // Contribution score based on activity and repositories
    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const contributionScore = Math.min(
      (commits.length * 0.1) + (totalStars * 0.5) + (repositories.length * 2),
      100
    );

    return {
      popularTopics,
      contributionScore: Math.round(contributionScore),
      diversityScore,
    };
  }
}