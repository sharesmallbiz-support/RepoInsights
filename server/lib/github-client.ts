import { Octokit } from '@octokit/rest';
import type { User } from '@shared/schema';

/**
 * Gets GitHub access token from user or environment variables.
 *
 * Priority:
 * 1. User's OAuth token (if logged in)
 * 2. Server GITHUB_TOKEN environment variable (fallback)
 *
 * Required scopes: repo, read:user, read:org
 *
 * @param user - Optional authenticated user with GitHub token
 * @returns Promise<string> - GitHub access token
 */
async function getAccessToken(user?: User): Promise<string> {
  // Priority 1: Use authenticated user's token
  if (user?.githubAccessToken) {
    return user.githubAccessToken;
  }

  // Priority 2: Use server-configured token
  const serverToken = process.env.GITHUB_TOKEN;
  if (serverToken) {
    return serverToken;
  }

  // No token available
  throw new Error(
    'No GitHub authentication available. ' +
    'Either login with GitHub or configure GITHUB_TOKEN environment variable.'
  );
}

/**
 * Creates a new GitHub API client.
 *
 * If a user is provided, uses their OAuth token (better rate limits, access to private repos).
 * Otherwise, falls back to server GITHUB_TOKEN if configured.
 *
 * WARNING: Never cache this client instance.
 * Access tokens may expire, so a new client should be created for each request.
 * Always call this function to get a fresh client.
 *
 * @param user - Optional authenticated user with GitHub token
 * @returns Promise<Octokit> - A new Octokit client instance
 */
export async function getUncachableGitHubClient(user?: User): Promise<Octokit> {
  const accessToken = await getAccessToken(user);
  return new Octokit({
    auth: accessToken,
    userAgent: 'GitHubSpark/1.0.0',
    baseUrl: 'https://api.github.com'
  });
}