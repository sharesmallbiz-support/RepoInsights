import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { storage } from "./storage";
import type { User } from "@shared/schema";

/**
 * Configure Passport with GitHub OAuth strategy
 */
export function setupAuth() {
  // Serialize user for session
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // GitHub OAuth Strategy
  const githubClientID = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackURL = process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback";

  if (githubClientID && githubClientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: githubClientID,
          clientSecret: githubClientSecret,
          callbackURL: callbackURL,
          scope: ["read:user", "user:email", "repo", "read:org"],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            // Extract user data from GitHub profile
            const githubProfile = {
              githubId: profile.id,
              githubUsername: profile.username,
              githubAccessToken: accessToken,
              githubRefreshToken: refreshToken,
              email: profile.emails?.[0]?.value || null,
              name: profile.displayName || profile.username,
              avatarUrl: profile.photos?.[0]?.value || profile.avatar_url || null,
            };

            // Create or update user in database
            const user = await storage.createOrUpdateGithubUser(githubProfile);

            done(null, user);
          } catch (error) {
            console.error("GitHub OAuth error:", error);
            done(error);
          }
        }
      )
    );

    console.log("✓ GitHub OAuth strategy configured");
  } else {
    console.warn("⚠ GitHub OAuth not configured (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)");
    console.warn("  Users will not be able to login with GitHub");
    console.warn("  Set environment variables or use fallback GITHUB_TOKEN for server-wide access");
  }

  return passport;
}
