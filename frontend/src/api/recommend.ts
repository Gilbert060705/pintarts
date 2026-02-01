import { apiRequest, API_ENDPOINTS } from './config';

// Types matching backend PaintingResponse
export interface Painting {
  id: string;
  title: string;
  artist: string | null;
  image_url: string;
  style: string | null;
  description: string | null;
  is_wishlisted: boolean;
}

// Recommendations Service
export const recommendService = {
  /**
   * Get personalized recommendations for a user
   * GET /recommend/{user_id}
   */
  async getRecommendations(userId: string): Promise<Painting[]> {
    return apiRequest<Painting[]>(`${API_ENDPOINTS.RECOMMEND}/${userId}`);
  },

  /**
   * Search paintings by description
   * GET /recommend/search?query={query}&user_id={user_id}
   */
  async searchPaintings(query: string, userId?: string): Promise<Painting[]> {
    const params = new URLSearchParams({ query });
    if (userId) {
      params.append('user_id', userId);
    }
    return apiRequest<Painting[]>(`${API_ENDPOINTS.SEARCH}?${params.toString()}`);
  },
};
