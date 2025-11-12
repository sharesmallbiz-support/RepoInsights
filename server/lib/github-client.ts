import { Octokit } from '@octokit/rest';

/**
 * Gets GitHub access token from environment variables.
 *
 * For Azure App Service, set the GITHUB_TOKEN environment variable
 * with a GitHub Personal Access Token (PAT) or OAuth token.
 *
 * Required scopes: repo, read:user, read:org
 */
async function getAccessToken(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is not set. ' +
      'Please configure a GitHub Personal Access Token with repo, read:user, and read:org scopes.'
    );
  }

  return token;
}

/**
 * Creates a new GitHub API client.
 *
 * WARNING: Never cache this client instance.
 * Access tokens may expire, so a new client should be created for each request.
 * Always call this function to get a fresh client.
 *
 * @returns Promise<Octokit> - A new Octokit client instance
 */
export async function getUncachableGitHubClient(): Promise<Octokit> {
  const accessToken = await getAccessToken();
  return new Octokit({
    auth: accessToken,
    userAgent: 'GitHubSpark/1.0.0',
    baseUrl: 'https://api.github.com'
  });
}