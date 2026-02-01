import { apiRequest, API_ENDPOINTS } from './config';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user_id: string;
  message: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  preferences: string[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

// Auth Service
export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user with preferences
   */
  async register(data: RegisterData): Promise<UserResponse> {
    return apiRequest<UserResponse>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
