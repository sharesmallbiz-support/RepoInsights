import { useState } from 'react';
import { Github, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface GitHubURLInputProps {
  onAnalyze?: (url: string, type: 'repository') => void;
  isLoading?: boolean;
}

export default function GitHubURLInput({ onAnalyze, isLoading = false }: GitHubURLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const detectUrlType = (url: string): 'repository' | null => {
    const githubPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = url.match(githubPattern);
    
    if (!match) return null;
    
    const [, owner, repo] = match;
    if (owner && repo && !repo.includes('/')) {
      return 'repository';
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
      setError('Please enter a valid GitHub URL (e.g., https://github.com/owner/repo)');
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
          <p className="mb-2">Supported URL format:</p>
          <ul className="space-y-1 ml-4">
            <li>• Repository: https://github.com/owner/repository</li>
          </ul>
          <p className="mt-2 text-xs">
            <strong>Note:</strong> Organization and user analysis will be available in future updates.
          </p>
        </div>
      </form>
    </Card>
  );
}