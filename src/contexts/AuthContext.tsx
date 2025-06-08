// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初期化時に認証状態をチェック
    checkAuthStatus();
    
    // タブ間同期のリスナー
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('auth-sync');
      channel.onmessage = (event) => {
        if (event.data.type === 'logout') {
          setUser(null);
        } else if (event.data.type === 'tokens-updated') {
          checkAuthStatus();
        }
      };
      
      return () => channel.close();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await authService.checkAuthStatus();
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { password: string }) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      setUser({ id: 'admin', role: 'admin' });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ESLint will complain about fast refresh here, but we need to export both
// the component and the hook from the same file for the auth context pattern
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}