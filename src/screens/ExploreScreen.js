// src/screens/ExploreScreen.js
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import StockCard from '../components/StockCard';
import { COLORS } from '../constants/config';
import { getTopGainersLosers } from '../services/stockApi';
import { cacheApiResponse, getCachedApiResponse } from '../utils/storage';

// Demo data for when API fails
const DEMO_DATA = {
  top_gainers: [
    { ticker: 'AAPL', price: '150.25', change_amount: '12.50', change_percentage: '9.08%' },
    { ticker: 'TSLA', price: '245.67', change_amount: '18.30', change_percentage: '8.04%' },
    { ticker: 'MSFT', price: '378.85', change_amount: '25.12', change_percentage: '7.11%' },
    { ticker: 'GOOGL', price: '2845.32', change_amount: '156.78', change_percentage: '5.83%' },
    { ticker: 'AMZN', price: '3234.56', change_amount: '167.89', change_percentage: '5.48%' },
    { ticker: 'META', price: '485.34', change_amount: '23.45', change_percentage: '5.08%' },
    { ticker: 'NVDA', price: '789.12', change_amount: '34.56', change_percentage: '4.58%' },
    { ticker: 'AMD', price: '123.45', change_amount: '5.67', change_percentage: '4.82%' },
    { ticker: 'CRM', price: '234.56', change_amount: '10.23', change_percentage: '4.56%' },
    { ticker: 'NFLX', price: '456.78', change_amount: '18.90', change_percentage: '4.32%' },
    { ticker: 'SHOP', price: '67.89', change_amount: '2.78', change_percentage: '4.27%' },
    { ticker: 'ZM', price: '89.12', change_amount: '3.45', change_percentage: '4.03%' },
    { ticker: 'ADBE', price: '345.67', change_amount: '13.21', change_percentage: '3.98%' },
    { ticker: 'ORCL', price: '78.90', change_amount: '2.98', change_percentage: '3.93%' },
    { ticker: 'INTC', price: '56.78', change_amount: '2.12', change_percentage: '3.88%' },
  ],
  top_losers: [
    { ticker: 'PYPL', price: '78.45', change_amount: '-8.90', change_percentage: '-10.19%' },
    { ticker: 'SNAP', price: '12.34', change_amount: '-1.23', change_percentage: '-9.06%' },
    { ticker: 'UBER', price: '45.67', change_amount: '-4.12', change_percentage: '-8.28%' },
    { ticker: 'LYFT', price: '23.45', change_amount: '-1.89', change_percentage: '-7.46%' },
    { ticker: 'ROKU', price: '56.78', change_amount: '-3.21', change_percentage: '-5.35%' },
    { ticker: 'COIN', price: '234.56', change_amount: '-12.34', change_percentage: '-5.00%' },
    { ticker: 'SQ', price: '89.12', change_amount: '-4.23', change_percentage: '-4.54%' },
    { ticker: 'TWTR', price: '45.32', change_amount: '-2.10', change_percentage: '-4.43%' },
    { ticker: 'PINS', price: '34.56', change_amount: '-1.45', change_percentage: '-4.02%' },
    { ticker: 'ABNB', price: '123.45', change_amount: '-4.89', change_percentage: '-3.81%' },
    { ticker: 'SPOT', price: '156.78', change_amount: '-5.67', change_percentage: '-3.49%' },
    { ticker: 'DOCU', price: '67.89', change_amount: '-2.34', change_percentage: '-3.33%' },
    { ticker: 'HOOD', price: '12.45', change_amount: '-0.42', change_percentage: '-3.27%' },
    { ticker: 'UPST', price: '23.67', change_amount: '-0.78', change_percentage: '-3.19%' },
    { ticker: 'SOFI', price: '8.90', change_amount: '-0.28', change_percentage: '-3.05%' },
  ]
};

const ExploreScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const fetchData = async (useCache = true) => {
    try {
      setLoading(true);
      
      // Try to get cached data first
      if (useCache) {
        const cachedData = await getCachedApiResponse('top_gainers_losers');
        if (cachedData) {
          setData(cachedData);
          setUsingDemoData(false);
          setLoading(false);
          return;
        }
      }

      // Try to fetch fresh data from API
      try {
        console.log('Attempting to fetch from API...');
        const response = await getTopGainersLosers();
        
        if (response && response.top_gainers && response.top_losers) {
          console.log('API success!');
          setData(response);
          setUsingDemoData(false);
          // Cache the response for 5 minutes
          await cacheApiResponse('top_gainers_losers', response, 5);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.log('API failed, using demo data:', apiError.message);
        // If API fails, use demo data
        setData(DEMO_DATA);
        setUsingDemoData(true);
        // Show user-friendly message
        if (!useCache) { // Only show alert on manual refresh
          Alert.alert(
            'Demo Mode', 
            'API limit reached. Using demo data for demonstration.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      // Fallback to demo data
      setData(DEMO_DATA);
      setUsingDemoData(true);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(false); // Don't use cache on refresh
  };

  const onStockPress = (stock) => {
    navigation.navigate('StockDetails', { stock, usingDemoData });
  };

  const onViewAll = (type) => {
    // Navigate to ViewAllStocksScreen with the data
    const stocksData = type === 'gainers' ? data.top_gainers : data.top_losers;
    const title = type === 'gainers' ? '🚀 Top Gainers' : '📉 Top Losers';
    
    navigation.navigate('ViewAllStocks', {
      type: type,
      data: stocksData,
      title: title,
      usingDemoData: usingDemoData
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading stock data..." />;
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchData(false)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Demo Mode Banner */}
      {usingDemoData && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>📊 Demo Mode - Showing sample data</Text>
        </View>
      )}

      {/* Top Gainers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚀 Top Gainers</Text>
          <TouchableOpacity onPress={() => onViewAll('gainers')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridContainer}>
          {data.top_gainers?.slice(0, 6).map((stock, index) => (
            <View key={`gainer_${index}`} style={styles.gridItem}>
              <StockCard stock={stock} onPress={onStockPress} />
            </View>
          ))}
        </View>
      </View>

      {/* Top Losers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📉 Top Losers</Text>
          <TouchableOpacity onPress={() => onViewAll('losers')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridContainer}>
          {data.top_losers?.slice(0, 6).map((stock, index) => (
            <View key={`loser_${index}`} style={styles.gridItem}>
              <StockCard stock={stock} onPress={onStockPress} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  demoBanner: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  demoText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '50%', // Two columns
    paddingHorizontal: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ExploreScreen;