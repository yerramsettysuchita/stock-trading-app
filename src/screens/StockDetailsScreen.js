// src/screens/StockDetailsScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS } from '../constants/config';
import { getCompanyOverview, getDailyPrices } from '../services/stockApi';
import { cacheApiResponse, getCachedApiResponse } from '../utils/storage';
import {
  addStockToWatchlist,
  getWatchlists,
  isStockInWatchlist,
  removeStockFromWatchlist,
} from '../utils/watchlistManager';

const { width: screenWidth } = Dimensions.get('window');

// Demo company data for different stocks
const DEMO_COMPANY_DATA = {
  AAPL: {
    Name: 'Apple Inc.',
    MarketCapitalization: 2500000000000,
    PERatio: 28.5,
    _52WeekHigh: 180.50,
    _52WeekLow: 120.25,
    Sector: 'Technology',
    Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
  },
  TSLA: {
    Name: 'Tesla, Inc.',
    MarketCapitalization: 800000000000,
    PERatio: 65.2,
    _52WeekHigh: 300.00,
    _52WeekLow: 150.00,
    Sector: 'Consumer Cyclical',
    Description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'
  },
  MSFT: {
    Name: 'Microsoft Corporation',
    MarketCapitalization: 2800000000000,
    PERatio: 32.1,
    _52WeekHigh: 420.00,
    _52WeekLow: 280.00,
    Sector: 'Technology',
    Description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
  },
  default: {
    Name: 'Demo Company Inc.',
    MarketCapitalization: 500000000000,
    PERatio: 25.8,
    _52WeekHigh: 200.00,
    _52WeekLow: 100.00,
    Sector: 'Technology',
    Description: 'This is a demo company for testing purposes. The company operates in the technology sector and provides innovative solutions.'
  }
};

const StockDetailsScreen = ({ route, navigation }) => {
  const { stock, usingDemoData } = route.params;
  const [companyData, setCompanyData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlists, setWatchlists] = useState([]);

  const isPositive = parseFloat(stock.change_percentage.replace('%', '')) >= 0;

  const generateDemoChartData = (currentPrice) => {
    const basePrice = parseFloat(currentPrice);
    const data = [];
    const labels = [];
    
    // Generate 7 days of demo data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }));
      
      // Generate realistic price variation (±5% from base)
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      const price = basePrice * (1 + variation);
      data.push(parseFloat(price.toFixed(2)));
    }
    
    // Ensure last price matches current price
    data[data.length - 1] = basePrice;
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        strokeWidth: 2,
      }],
    };
  };

  const loadWatchlists = async () => {
    try {
      const allWatchlists = await getWatchlists();
      setWatchlists(allWatchlists);
    } catch (error) {
      console.error('Error loading watchlists:', error);
    }
  };

  const fetchStockDetails = async () => {
    try {
      setLoading(true);

      if (usingDemoData) {
        // Use demo data
        const demoCompany = DEMO_COMPANY_DATA[stock.ticker] || DEMO_COMPANY_DATA.default;
        setCompanyData(demoCompany);
        
        // Generate demo chart data
        const demoChart = generateDemoChartData(stock.price);
        setChartData(demoChart);
        
        setLoading(false);
        return;
      }

      // Try API first, fallback to demo data
      try {
        // Fetch company overview
        const cacheKey = `company_${stock.ticker}`;
        let cachedCompany = await getCachedApiResponse(cacheKey);
        
        if (!cachedCompany) {
          cachedCompany = await getCompanyOverview(stock.ticker);
          await cacheApiResponse(cacheKey, cachedCompany, 60); // Cache for 1 hour
        }
        
        if (cachedCompany && cachedCompany.Name) {
          setCompanyData(cachedCompany);
        } else {
          throw new Error('Invalid company data');
        }

        // Fetch chart data
        const chartCacheKey = `chart_${stock.ticker}`;
        let cachedChart = await getCachedApiResponse(chartCacheKey);
        
        if (!cachedChart) {
          cachedChart = await getDailyPrices(stock.ticker);
          await cacheApiResponse(chartCacheKey, cachedChart, 30); // Cache for 30 minutes
        }

        // Process chart data
        if (cachedChart && cachedChart['Time Series (Daily)']) {
          const timeSeries = cachedChart['Time Series (Daily)'];
          const dates = Object.keys(timeSeries).slice(0, 7).reverse(); // Last 7 days
          const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
          
          setChartData({
            labels: dates.map(date => date.slice(5)), // Show MM-DD format
            datasets: [{
              data: prices,
              strokeWidth: 2,
            }],
          });
        } else {
          // Generate demo chart if no chart data
          const demoChart = generateDemoChartData(stock.price);
          setChartData(demoChart);
        }

      } catch (apiError) {
        console.log('API failed, using demo data for stock details');
        // Use demo data on API failure
        const demoCompany = DEMO_COMPANY_DATA[stock.ticker] || DEMO_COMPANY_DATA.default;
        setCompanyData(demoCompany);
        
        // Generate demo chart data
        const demoChart = generateDemoChartData(stock.price);
        setChartData(demoChart);
      }

    } catch (error) {
      console.error('Error fetching stock details:', error);
      Alert.alert('Error', 'Using demo data for stock details');
      
      // Fallback to demo data
      const demoCompany = DEMO_COMPANY_DATA[stock.ticker] || DEMO_COMPANY_DATA.default;
      setCompanyData(demoCompany);
      const demoChart = generateDemoChartData(stock.price);
      setChartData(demoChart);
    }
    setLoading(false);
  };

  const toggleWatchlist = async () => {
    if (inWatchlist) {
      // Remove from watchlist
      const success = await removeStockFromWatchlist(watchlistId, stock.ticker);
      if (success) {
        setInWatchlist(false);
        setWatchlistId(null);
        Alert.alert('Removed', `${stock.ticker} removed from watchlist`);
      }
    } else {
      // Show watchlist selection modal
      await loadWatchlists();
      setShowWatchlistModal(true);
    }
  };

  const addToSelectedWatchlist = async (selectedWatchlistId) => {
    try {
      const success = await addStockToWatchlist(selectedWatchlistId, stock);
      if (success) {
        setInWatchlist(true);
        setWatchlistId(selectedWatchlistId);
        const selectedWatchlist = watchlists.find(w => w.id === selectedWatchlistId);
        Alert.alert('Added', `${stock.ticker} added to ${selectedWatchlist?.name || 'watchlist'}`);
        setShowWatchlistModal(false);
      } else {
        Alert.alert('Info', `${stock.ticker} is already in this watchlist`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist');
    }
  };

  const checkWatchlistStatus = async () => {
    const result = await isStockInWatchlist(stock.ticker);
    setInWatchlist(result.inWatchlist);
    setWatchlistId(result.watchlistId);
  };

  const renderWatchlistItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.watchlistModalItem}
      onPress={() => addToSelectedWatchlist(item.id)}
    >
      <View style={styles.watchlistModalInfo}>
        <Text style={styles.watchlistModalName}>{item.name}</Text>
        <Text style={styles.watchlistModalCount}>
          {item.stocks.length} stock{item.stocks.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchStockDetails();
    checkWatchlistStatus();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading stock details..." />;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Demo Mode Banner */}
        {usingDemoData && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>📊 Demo Mode - Sample stock data</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.symbol}>{stock.ticker}</Text>
            <Text style={styles.companyName}>
              {companyData?.Name || 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.watchlistButton} 
            onPress={toggleWatchlist}
          >
            <Ionicons 
              name={inWatchlist ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Price Info */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>${parseFloat(stock.price).toFixed(2)}</Text>
          <View style={styles.changeRow}>
            <Text style={[styles.changeAmount, { color: isPositive ? COLORS.secondary : COLORS.danger }]}>
              {isPositive ? '+' : ''}${parseFloat(stock.change_amount).toFixed(2)}
            </Text>
            <Text style={[styles.changePercent, { color: isPositive ? COLORS.secondary : COLORS.danger }]}>
              ({stock.change_percentage})
            </Text>
          </View>
        </View>

        {/* Chart */}
        {chartData && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>7-Day Price Chart</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Company Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Market Cap</Text>
            <Text style={styles.infoValue}>
              {companyData?.MarketCapitalization ? 
                `$${(companyData.MarketCapitalization / 1000000000).toFixed(2)}B` : 
                'N/A'
              }
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>P/E Ratio</Text>
            <Text style={styles.infoValue}>
              {companyData?.PERatio || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>52W High</Text>
            <Text style={styles.infoValue}>
              {companyData?._52WeekHigh ? `$${companyData._52WeekHigh}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>52W Low</Text>
            <Text style={styles.infoValue}>
              {companyData?._52WeekLow ? `$${companyData._52WeekLow}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sector</Text>
            <Text style={styles.infoValue}>
              {companyData?.Sector || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {companyData?.Description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {companyData.Description.length > 300 
                ? `${companyData.Description.substring(0, 300)}...` 
                : companyData.Description
              }
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Watchlist Selection Modal */}
      <Modal
        visible={showWatchlistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWatchlistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Watchlist</Text>
            <Text style={styles.modalSubtitle}>Choose a watchlist for {stock.ticker}</Text>
            
            <FlatList
              data={watchlists}
              renderItem={renderWatchlistItem}
              keyExtractor={(item) => item.id}
              style={styles.watchlistModalList}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowWatchlistModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  headerLeft: {
    flex: 1,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  companyName: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 4,
  },
  watchlistButton: {
    padding: 8,
  },
  priceSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  changePercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.black,
  },
  chart: {
    borderRadius: 16,
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray,
  },
  bottomPadding: {
    height: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  watchlistModalList: {
    maxHeight: 250,
  },
  watchlistModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  watchlistModalInfo: {
    flex: 1,
  },
  watchlistModalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  watchlistModalCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
});

export default StockDetailsScreen;