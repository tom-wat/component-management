// src/services/authService.ts
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginData {
  password: string;
}

class InMemoryAuthService {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<void> | null = null;
  private refreshTimer: number | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  async login(credentials: LoginData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-App-Name': 'component-management'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    if (data.accessToken && data.refreshToken) {
      this.tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.tokenExpiresIn
      };
      
      this.scheduleRefresh();
      this.syncAcrossTabs();
    }
  }

  async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // アクセストークンの有効性をチェック
    await this.ensureValidToken();
    
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-App-Name': 'component-management',
      ...options.headers as Record<string, string>
    };

    // JWTがある場合はBearerトークンとして送信
    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Cookieも併用
    });
  }

  async refreshTokens(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        refreshToken: this.tokens.refreshToken
      })
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    };

    this.scheduleRefresh();
    this.syncAcrossTabs();
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.tokens) return;

    // トークンの有効期限をチェック（5分前に更新）
    const tokenPayload = this.parseJWT(this.tokens.accessToken);
    const expiryTime = tokenPayload.exp * 1000;
    const refreshThreshold = 5 * 60 * 1000; // 5分

    if (Date.now() >= expiryTime - refreshThreshold) {
      await this.refreshTokens();
    }
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.tokens) return;

    const tokenPayload = this.parseJWT(this.tokens.accessToken);
    const expiryTime = tokenPayload.exp * 1000;
    const refreshTime = expiryTime - Date.now() - (5 * 60 * 1000); // 5分前

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshTokens().catch(console.error);
      }, refreshTime);
    }
  }

  private parseJWT(token: string): { exp: number; [key: string]: unknown } {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private syncAcrossTabs(): void {
    // BroadcastChannelでタブ間同期
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('auth-sync');
      channel.postMessage({
        type: 'tokens-updated',
        tokens: this.tokens
      });
    }
  }

  async logout(): Promise<void> {
    this.tokens = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // サーバー側のログアウト
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    // タブ間同期
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('auth-sync');
      channel.postMessage({ type: 'logout' });
    }
  }

  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  async checkAuthStatus(): Promise<{ authenticated: boolean; user?: { id: string; role: string } }> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/auth/status`);
      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated,
          user: data.authenticated ? { id: 'admin', role: 'admin' } : undefined
        };
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    }
    
    return { authenticated: false };
  }
}

export const authService = new InMemoryAuthService();