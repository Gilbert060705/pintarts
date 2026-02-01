import { apiRequest } from './config';
import { Painting } from './recommend';

// Types matching backend schemas
export interface UserListItem {
  username: string;
  email: string;
  similarity?: number;
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
   * Create a blend between two users and get instant recommendations
   * POST /blend?user_1_id={id}&user_2_id={id}&user_id={id}
   * Returns list of paintings recommended for both users
   */
  async createBlend(user1Id: string, user2Id: string, userId?: string): Promise<Painting[]> {
    const params = new URLSearchParams({
      user_1_id: user1Id,
      user_2_id: user2Id,
    });
    if (userId) {
      params.append('user_id', userId);
    }
    return apiRequest<Painting[]>(`/blend?${params.toString()}`, {
      method: 'POST',
    });
  },
};
