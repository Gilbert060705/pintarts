import { apiRequest, API_ENDPOINTS } from './config';
import { Painting } from './recommend';

// Types matching backend schemas
export interface WishlistAddRequest {
  user_id: string;
  painting_id: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
}

// Wishlist Service
export const wishlistService = {
  /**
   * Add a painting to user's wishlist
   * POST /wishlist/
   */
  async addToWishlist(userId: string, paintingId: string): Promise<WishlistResponse> {
    return apiRequest<WishlistResponse>(API_ENDPOINTS.WISHLIST, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        painting_id: paintingId,
      }),
    });
  },

  /**
   * Get all paintings in user's wishlist
   * GET /wishlist/?user_id={user_id}
   */
  async getWishlist(userId: string): Promise<Painting[]> {
    return apiRequest<Painting[]>(`${API_ENDPOINTS.WISHLIST}?user_id=${userId}`);
  },

  /**
   * Remove a painting from user's wishlist
   * DELETE /wishlist/?user_id={user_id}&painting_id={painting_id}
   */
  async removeFromWishlist(userId: string, paintingId: string): Promise<WishlistResponse> {
    return apiRequest<WishlistResponse>(
      `${API_ENDPOINTS.WISHLIST}?user_id=${userId}&painting_id=${paintingId}`,
      { method: 'DELETE' }
    );
  },
};
