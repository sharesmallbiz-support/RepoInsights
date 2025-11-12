import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Github, User } from "lucide-react";

/**
 * UserMenu Component
 *
 * Displays authentication UI in the application header:
 * - When not authenticated: Shows "Login with GitHub" button
 * - When authenticated: Shows user avatar with dropdown menu
 *
 * Features:
 * - GitHub OAuth login
 * - User profile display with avatar
 * - Logout functionality
 * - Loading states
 */
export function UserMenu() {
  const { user, isLoading, isAuthenticated, login, logout, isLoggingOut } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  // Show login button when not authenticated
  if (!isAuthenticated) {
    return (
      <Button
        onClick={login}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Github className="h-4 w-4" />
        Login with GitHub
      </Button>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string | null, username: string | null) => {
    if (name) {
      const names = name.split(' ');
      return names.length >= 2
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return username?.[0]?.toUpperCase() || 'U';
  };

  const displayName = user?.name || user?.githubUsername || 'User';
  const initials = getInitials(user?.name || null, user?.githubUsername || null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.githubUsername && (
              <p className="text-xs leading-none text-muted-foreground">
                @{user.githubUsername}
              </p>
            )}
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.githubUsername && (
          <DropdownMenuItem asChild>
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>GitHub Profile</span>
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          disabled={isLoggingOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
