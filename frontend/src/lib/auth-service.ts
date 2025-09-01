// Authentication service for BiteBase Intelligence platform

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: string;
  created_at?: string;
  uid?: string; // For compatibility
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface SessionResponse {
  user?: User;
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:56223';

class AuthService {
  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setToken(data.token);
        return {
          success: true,
          data: {
            user: data.user,
            token: data.token,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async signUp(
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      phone?: string;
      company?: string;
    }
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...userData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setToken(data.token);
        return {
          success: true,
          data: {
            user: data.user,
            token: data.token,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async signInWithGoogle(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setToken(data.token);
        return {
          success: true,
          data: {
            user: data.user,
            token: data.token,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || 'Google authentication failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async verifySession(): Promise<SessionResponse> {
    const token = this.getToken();
    if (!token) {
      return { error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { user: data.user };
      } else {
        this.removeToken();
        return { error: data.message || 'Session verification failed' };
      }
    } catch (error) {
      this.removeToken();
      return { error: 'Network error occurred' };
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.removeToken();
    }
  }

  async refreshToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setToken(data.token);
        return true;
      } else {
        this.removeToken();
        return false;
      }
    } catch (error) {
      this.removeToken();
      return false;
    }
  }
}

export const authService = new AuthService();