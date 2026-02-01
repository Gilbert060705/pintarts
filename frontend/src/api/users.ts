import { apiRequest, API_ENDPOINTS } from './config';

// Types matching backend schemas
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  similarity?: number;
}

export interface BlendResponse {
  success: boolean;
  message: string;
  blend_id: string;
}

export interface Blend {
  id: string;
  user_1_id: string;
  user_2_id: string;
  created_at: string;
}

export interface GetBlendsResponse {
  message: string;
  blends: Blend[];
}

// Users Service
export const usersService = {
  /**
   * Get all users (excluding current user if provided)
   * GET /users?user_id={user_id}
   */
  async getAllUsers(currentUserId?: string): Promise<UserListItem[]> {
    const params = currentUserId ? `?user_id=${currentUserId}` : '';
    return apiRequest<UserListItem[]>(`/users${params}`);
  },
};

// Blend Service
export const blendService = {
  /**
   * Get user's blends
   * GET /blend/my-blends/{user_id}
   */
  async getMyBlends(userId: string): Promise<GetBlendsResponse> {
    return apiRequest<GetBlendsResponse>(`/blend/my-blends/${userId}`);
  },

  /**
   * Create a blend between two users
   * POST /blend?user_1_id={id}&user_2_id={id}
   */
  async createBlend(user1Id: string, user2Id: string): Promise<BlendResponse> {
    return apiRequest<BlendResponse>(`/blend?user_1_id=${user1Id}&user_2_id=${user2Id}`, {
      method: 'POST',
    });
  },

  /**
   * Get blend recommendations
   * GET /blend/{blend_id}/paintings?user_id={user_id}
   */
  async getBlendRecommendations(blendId: string, userId?: string): Promise<any[]> {
    const params = userId ? `?user_id=${userId}` : '';
    return apiRequest<any[]>(`/blend/${blendId}/paintings${params}`);
  },
};
