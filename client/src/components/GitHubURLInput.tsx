import { useState } from 'react';
import { Github, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface GitHubURLInputProps {
  onAnalyze?: (url: string, type: 'repository' | 'user') => void;
  isLoading?: boolean;
}

export default function GitHubURLInput({ onAnalyze, isLoading = false }: GitHubURLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const detectUrlType = (url: string): 'repository' | 'user' | null => {
    // Repository URL: https://github.com/owner/repo
    const repoPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const repoMatch = url.match(repoPattern);
    
    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      if (owner && repo && !repo.includes('/')) {
        return 'repository';
      }
    }
    
    // User URL: https://github.com/username
    const userPattern = /^https:\/\/github\.com\/([^\/]+)\/?$/;
    const userMatch = url.match(userPattern);
    
    if (userMatch) {
      const [, username] = userMatch;
      if (username && !username.includes('/')) {
        return 'user';
      }
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    const type = detectUrlType(url);
    if (!type) {
      setError('Please enter a valid GitHub URL (repository: github.com/owner/repo or user: github.com/username)');
      return;
    }

    console.log('Analyzing:', url, 'Type:', type);
    onAnalyze?.(url, type);
  };

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Github className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">GitHub Repository Analysis</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            data-testid="input-github-url"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            data-testid="button-analyze"
            className="hover-elevate"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
        
        {error && (
          <p className="text-sm text-destructive" data-testid="text-error">
            {error}
          </p>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Supported URL formats:</p>
          <ul className="space-y-1 ml-4">
            <li>• Repository: https://github.com/owner/repository</li>
            <li>• User: https://github.com/username</li>
          </ul>
          <p className="mt-2 text-xs">
            <strong>Repository Analysis:</strong> Analyzes commits, contributors, and metrics for a specific repository.<br/>
            <strong>User Analysis:</strong> Aggregates metrics across all public repositories for a user.
          </p>
        </div>
      </form>
    </Card>
  );
}