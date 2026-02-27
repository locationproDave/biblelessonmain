/**
 * Auth Client for React - FastAPI Backend Version
 * Replaces Better Auth + Convex with REST API calls
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI, type User } from './api';
import { initializeOfflineSupport, clearOfflineData, startAutoSync, stopAutoSync } from './offline-sync';

// Types
export interface Session {
  user: User | null;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignInResult {
  success: boolean;
  error?: AuthError;
}

// Context
interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, name?: string) => Promise<SignInResult>;
  signOut: () => Promise<SignInResult>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const data = await authAPI.getSession();
      if (data && data.user) {
        setSession({ user: data.user });
        // Initialize offline support for logged-in user
        try {
          await initializeOfflineSupport(data.user.id);
          startAutoSync();
        } catch (offlineError) {
          console.error('[Auth] Failed to initialize offline support:', offlineError);
        }
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const data = await authAPI.signIn(email, password);
      setSession({ user: data.user });
      // Initialize offline support for newly signed-in user
      if (data.user?.id) {
        try {
          await initializeOfflineSupport(data.user.id);
          startAutoSync();
        } catch (offlineError) {
          console.error('[Auth] Failed to initialize offline support:', offlineError);
        }
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.detail || 'Sign in failed',
          code: error.response?.status?.toString(),
        },
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<SignInResult> => {
    try {
      const data = await authAPI.signUp(email, password, name);
      setSession({ user: data.user });
      // Initialize offline support for newly signed-up user
      if (data.user?.id) {
        try {
          await initializeOfflineSupport(data.user.id);
          startAutoSync();
        } catch (offlineError) {
          console.error('[Auth] Failed to initialize offline support:', offlineError);
        }
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.detail || 'Sign up failed',
          code: error.response?.status?.toString(),
        },
      };
    }
  };

  const signOut = async (): Promise<SignInResult> => {
    try {
      await authAPI.signOut();
      setSession(null);
      // Clear offline data and stop sync
      try {
        stopAutoSync();
        await clearOfflineData();
      } catch (offlineError) {
        console.error('[Auth] Failed to clear offline data:', offlineError);
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Sign out failed',
        },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refetch: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hooks
export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return {
    data: context.session,
    isPending: context.isLoading,
    isLoading: context.isLoading,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Legacy exports for compatibility
export const authClient = {
  signOut: async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      localStorage.removeItem('auth_token');
    }
    return { error: null };
  },
};

// Error handling utilities
export const errorMessages: Record<string, string> = {
  USER_NOT_FOUND: "No account found with this email",
  INVALID_PASSWORD: "Invalid password",
  USER_ALREADY_EXISTS: "An account with this email already exists",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again later",
};

export function getErrorMessage(code: string | undefined): string {
  if (!code) return "An unexpected error occurred";
  return errorMessages[code] ?? code.replace(/_/g, " ").toLowerCase();
}

export function parseAuthError(error: unknown): AuthError {
  if (error && typeof error === "object") {
    const err = error as { code?: string; message?: string };
    return {
      message: err.message ?? getErrorMessage(err.code),
      code: err.code,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "An unexpected error occurred" };
}

// Sign in/up helpers
export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  try {
    await authAPI.signIn(email, password);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || 'Sign in failed',
        code: error.response?.status?.toString(),
      },
    };
  }
}

export async function signUpWithEmail(email: string, password: string, name?: string): Promise<SignInResult> {
  try {
    await authAPI.signUp(email, password, name);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || 'Sign up failed',
        code: error.response?.status?.toString(),
      },
    };
  }
}

export async function signOutUser(): Promise<SignInResult> {
  try {
    await authAPI.signOut();
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: parseAuthError(error),
    };
  }
}
