import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Authenticated user data returned from the API
 */
export interface AuthUser {
  id: string;
  githubUsername: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

/**
 * React hook for managing authentication state
 *
 * Features:
 * - Automatically fetches current user on mount
 * - Provides login/logout functions
 * - Manages loading and error states
 * - Uses React Query for caching and automatic refetching
 *
 * @returns Authentication state and methods
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Fetch current authenticated user
  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include', // Important: send cookies with request
        });

        if (res.status === 401) {
          // Not authenticated - this is expected, not an error
          return null;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.statusText}`);
        }

        return res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: false, // Don't retry on 401
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      return res.json();
    },
    onSuccess: () => {
      // Clear all queries and reload the page
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });

  /**
   * Initiates GitHub OAuth login flow
   */
  const login = () => {
    window.location.href = '/api/auth/github';
  };

  /**
   * Logs out the current user
   */
  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
