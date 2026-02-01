// API Configuration
// Change this to your backend URL when deploying
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Development - local backend
  : 'https://your-production-api.com'; // Production

export const API_ENDPOINTS = {
  // Users
  LOGIN: '/users/login',
  REGISTER: '/users/',
  
  // Wishlist
  WISHLIST: '/wishlist',
  
  // Blend
  BLENDS: '/blend/my-blends',
  BLEND_PAINTINGS: '/blend', // /{blend_id}/paintings
  CREATE_BLEND: '/blend',
  
  // Recommendations
  RECOMMEND: '/recommend',
  SEARCH: '/recommend/search',
};

// API Request helper with logging
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Log request in development
  if (__DEV__) {
    console.log('🌐 API Request:', {
      url,
      method: config.method || 'GET',
      body: config.body ? JSON.parse(config.body as string) : undefined,
    });
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    // Log response in development
    if (__DEV__) {
      console.log('📥 API Response:', {
        url,
        status: response.status,
        ok: response.ok,
        data,
      });
    }
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (__DEV__) {
      console.error('❌ API Error:', { url, error });
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}
