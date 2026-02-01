import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@pintarts_user_id';
const USER_DATA_KEY = '@pintarts_user_data';

export interface StoredUserData {
  userId: string;
  username?: string;
}

export const userStorage = {
  /**
   * Save user ID after login
   */
  async saveUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    } catch (error) {
      console.error('Error saving user ID:', error);
    }
  },

  /**
   * Get stored user ID
   */
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  /**
   * Save user data
   */
  async saveUserData(data: StoredUserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  /**
   * Get stored user data
   */
  async getUserData(): Promise<StoredUserData | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Clear all user data (logout)
   */
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USER_ID_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const userId = await this.getUserId();
    return userId !== null;
  },
};
