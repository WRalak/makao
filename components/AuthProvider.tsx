'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, token, isAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      if (token && !isAuthenticated) {
        setLoading(true);
        try {
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // User is authenticated, store is already updated from localStorage
          } else {
            // Token is invalid, clear auth
            useAuthStore.getState().clearAuth();
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          useAuthStore.getState().clearAuth();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [token, isAuthenticated, setLoading]);

  return <>{children}</>;
}
