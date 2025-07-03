// src/services/stockApi.js
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Function to get Top Gainers and Losers
export const getTopGainersLosers = async () => {
  try {
    const response = await api.get('', {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: API_CONFIG.API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top gainers/losers:', error);
    throw error;
  }
};

// Function to search stocks
export const searchStocks = async (keywords) => {
  try {
    const response = await api.get('', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: API_CONFIG.API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
};

// Function to get company overview
export const getCompanyOverview = async (symbol) => {
  try {
    const response = await api.get('', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: API_CONFIG.API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
};

// Function to get daily prices for chart
export const getDailyPrices = async (symbol) => {
  try {
    const response = await api.get('', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_CONFIG.API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily prices:', error);
    throw error;
  }
};