import { apiRequest, API_ENDPOINTS } from './config';
import { Painting } from './recommend';

// Types matching backend schemas
export interface WishlistToggleRequest {
  user_id: string;
  painting_id: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  is_wishlisted: boolean;
}

// Wishlist Service
export const wishlistService = {
  /**
   * Toggle a painting in user's wishlist (add if not present, remove if present)
   * POST /wishlist/
   * Returns the new wishlist state (is_wishlisted: true/false)
   */
  async toggleWishlist(userId: string, paintingId: string): Promise<WishlistResponse> {
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
   * GET /wishlist?user_id={user_id}
   */
  async getWishlist(userId: string): Promise<Painting[]> {
    return apiRequest<Painting[]>(`/wishlist?user_id=${userId}`);
  },
};
