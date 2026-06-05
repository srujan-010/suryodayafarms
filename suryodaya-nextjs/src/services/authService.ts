export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
}

export interface MeResponse {
  success: boolean;
  user?: UserResponse;
}

export const authService = {
  /**
   * Logs in a user using email and password.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed with status: ${res.status}`);
    }

    return res.json();
  },

  /**
   * Registers a new user.
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed with status: ${res.status}`);
    }

    return res.json();
  },

  /**
   * Retrieves active session user profile details.
   */
  async getCurrentUser(): Promise<MeResponse> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch session, status: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Resets session cookies on the backend.
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Logout failed with status: ${res.status}`);
    }

    return res.json();
  },
};
