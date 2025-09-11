import GitHubURLInput from '../GitHubURLInput';

export default function GitHubURLInputExample() {
  const handleAnalyze = (url: string, type: 'repository' | 'organization' | 'user') => {
    console.log('Analyzing:', url, 'Type:', type);
  };

  return (
    <div className="p-8">
      <GitHubURLInput onAnalyze={handleAnalyze} />
    </div>
  );
}