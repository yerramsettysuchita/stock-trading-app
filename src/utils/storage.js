// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  WATCHLISTS: 'user_watchlists',
  API_CACHE: 'api_cache_',
};

// Watchlist functions
export const saveWatchlists = async (watchlists) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
  } catch (error) {
    console.error('Error saving watchlists:', error);
  }
};

export const getWatchlists = async () => {
  try {
    const watchlists = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLISTS);
    return watchlists ? JSON.parse(watchlists) : [];
  } catch (error) {
    console.error('Error getting watchlists:', error);
    return [];
  }
};

// API Cache functions
export const cacheApiResponse = async (key, data, expirationMinutes = 5) => {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      expiration: expirationMinutes * 60 * 1000, // Convert to milliseconds
    };
    await AsyncStorage.setItem(STORAGE_KEYS.API_CACHE + key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching API response:', error);
  }
};

export const getCachedApiResponse = async (key) => {
  try {
    const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.API_CACHE + key);
    if (!cachedData) return null;

    const parsed = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - parsed.timestamp > parsed.expiration) {
      // Remove expired cache
      await AsyncStorage.removeItem(STORAGE_KEYS.API_CACHE + key);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Error getting cached API response:', error);
    return null;
  }
};