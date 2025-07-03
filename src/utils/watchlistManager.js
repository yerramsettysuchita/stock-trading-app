// src/utils/watchlistManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_KEY = 'user_watchlists';

// Get all watchlists
export const getWatchlists = async () => {
  try {
    const watchlists = await AsyncStorage.getItem(WATCHLIST_KEY);
    return watchlists ? JSON.parse(watchlists) : [
      { id: '1', name: 'My Favorites', stocks: [] },
      { id: '2', name: 'Tech Stocks', stocks: [] },
      { id: '3', name: 'Growth Stocks', stocks: [] }
    ];
  } catch (error) {
    console.error('Error getting watchlists:', error);
    return [
      { id: '1', name: 'My Favorites', stocks: [] },
      { id: '2', name: 'Tech Stocks', stocks: [] },
      { id: '3', name: 'Growth Stocks', stocks: [] }
    ];
  }
};

// Save all watchlists
export const saveWatchlists = async (watchlists) => {
  try {
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlists));
  } catch (error) {
    console.error('Error saving watchlists:', error);
  }
};

// Add stock to watchlist
export const addStockToWatchlist = async (watchlistId, stock) => {
  try {
    const watchlists = await getWatchlists();
    const watchlistIndex = watchlists.findIndex(w => w.id === watchlistId);
    
    if (watchlistIndex !== -1) {
      // Check if stock already exists
      const stockExists = watchlists[watchlistIndex].stocks.some(s => s.ticker === stock.ticker);
      
      if (!stockExists) {
        watchlists[watchlistIndex].stocks.push(stock);
        await saveWatchlists(watchlists);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    return false;
  }
};

// Remove stock from watchlist
export const removeStockFromWatchlist = async (watchlistId, stockTicker) => {
  try {
    const watchlists = await getWatchlists();
    const watchlistIndex = watchlists.findIndex(w => w.id === watchlistId);
    
    if (watchlistIndex !== -1) {
      watchlists[watchlistIndex].stocks = watchlists[watchlistIndex].stocks.filter(
        s => s.ticker !== stockTicker
      );
      await saveWatchlists(watchlists);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    return false;
  }
};

// Check if stock is in any watchlist
export const isStockInWatchlist = async (stockTicker) => {
  try {
    const watchlists = await getWatchlists();
    for (const watchlist of watchlists) {
      if (watchlist.stocks.some(s => s.ticker === stockTicker)) {
        return { inWatchlist: true, watchlistId: watchlist.id };
      }
    }
    return { inWatchlist: false, watchlistId: null };
  } catch (error) {
    console.error('Error checking stock in watchlist:', error);
    return { inWatchlist: false, watchlistId: null };
  }
};

// Create new watchlist
export const createWatchlist = async (name) => {
  try {
    const watchlists = await getWatchlists();
    const newWatchlist = {
      id: Date.now().toString(),
      name: name,
      stocks: []
    };
    watchlists.push(newWatchlist);
    await saveWatchlists(watchlists);
    return newWatchlist;
  } catch (error) {
    console.error('Error creating watchlist:', error);
    return null;
  }
};

// Delete watchlist
export const deleteWatchlist = async (watchlistId) => {
  try {
    const watchlists = await getWatchlists();
    const filteredWatchlists = watchlists.filter(w => w.id !== watchlistId);
    await saveWatchlists(filteredWatchlists);
    return true;
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    return false;
  }
};