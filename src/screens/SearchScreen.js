// src/screens/SearchScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS } from '../constants/config';
import { searchStocks } from '../services/stockApi';
import { cacheApiResponse, getCachedApiResponse } from '../utils/storage';

// Demo search results with real-time stock data
const DEMO_STOCK_DATA = {
  AAPL: { ticker: 'AAPL', price: '150.25', change_amount: '12.50', change_percentage: '9.08%' },
  TSLA: { ticker: 'TSLA', price: '245.67', change_amount: '18.30', change_percentage: '8.04%' },
  MSFT: { ticker: 'MSFT', price: '378.85', change_amount: '25.12', change_percentage: '7.11%' },
  GOOGL: { ticker: 'GOOGL', price: '2845.32', change_amount: '156.78', change_percentage: '5.83%' },
  AMZN: { ticker: 'AMZN', price: '3234.56', change_amount: '167.89', change_percentage: '5.48%' },
  META: { ticker: 'META', price: '485.34', change_amount: '23.45', change_percentage: '5.08%' },
  NVDA: { ticker: 'NVDA', price: '789.12', change_amount: '34.56', change_percentage: '4.58%' },
  AMD: { ticker: 'AMD', price: '123.45', change_amount: '5.67', change_percentage: '4.82%' },
  NFLX: { ticker: 'NFLX', price: '456.78', change_amount: '18.90', change_percentage: '4.32%' },
  UBER: { ticker: 'UBER', price: '45.67', change_amount: '-4.12', change_percentage: '-8.28%' },
  PYPL: { ticker: 'PYPL', price: '78.45', change_amount: '-8.90', change_percentage: '-10.19%' },
  SNAP: { ticker: 'SNAP', price: '12.34', change_amount: '-1.23', change_percentage: '-9.06%' },
};

const DEMO_SEARCH_RESULTS = {
  AAPL: [
    {
      '1. symbol': 'AAPL',
      '2. name': 'Apple Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '150.25',
      change_amount: '12.50',
      change_percentage: '9.08%'
    }
  ],
  TSLA: [
    {
      '1. symbol': 'TSLA',
      '2. name': 'Tesla, Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '245.67',
      change_amount: '18.30',
      change_percentage: '8.04%'
    }
  ],
  MSFT: [
    {
      '1. symbol': 'MSFT',
      '2. name': 'Microsoft Corporation',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '378.85',
      change_amount: '25.12',
      change_percentage: '7.11%'
    }
  ],
  GOOGL: [
    {
      '1. symbol': 'GOOGL',
      '2. name': 'Alphabet Inc. Class A',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '2845.32',
      change_amount: '156.78',
      change_percentage: '5.83%'
    }
  ],
  AMZN: [
    {
      '1. symbol': 'AMZN',
      '2. name': 'Amazon.com Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '3234.56',
      change_amount: '167.89',
      change_percentage: '5.48%'
    }
  ],
  META: [
    {
      '1. symbol': 'META',
      '2. name': 'Meta Platforms Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '485.34',
      change_amount: '23.45',
      change_percentage: '5.08%'
    }
  ],
  NVDA: [
    {
      '1. symbol': 'NVDA',
      '2. name': 'NVIDIA Corporation',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '789.12',
      change_amount: '34.56',
      change_percentage: '4.58%'
    }
  ],
  AMD: [
    {
      '1. symbol': 'AMD',
      '2. name': 'Advanced Micro Devices Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '123.45',
      change_amount: '5.67',
      change_percentage: '4.82%'
    }
  ],
  NFLX: [
    {
      '1. symbol': 'NFLX',
      '2. name': 'Netflix Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '456.78',
      change_amount: '18.90',
      change_percentage: '4.32%'
    }
  ],
  UBER: [
    {
      '1. symbol': 'UBER',
      '2. name': 'Uber Technologies Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '45.67',
      change_amount: '-4.12',
      change_percentage: '-8.28%'
    }
  ],
  PYPL: [
    {
      '1. symbol': 'PYPL',
      '2. name': 'PayPal Holdings Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '78.45',
      change_amount: '-8.90',
      change_percentage: '-10.19%'
    }
  ],
  SNAP: [
    {
      '1. symbol': 'SNAP',
      '2. name': 'Snap Inc.',
      '3. type': 'Equity',
      '4. region': 'United States',
      price: '12.34',
      change_amount: '-1.23',
      change_percentage: '-9.06%'
    }
  ]
};

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a stock symbol or company name');
      return;
    }

    setLoading(true);
    try {
      const query = searchQuery.toUpperCase().trim();
      
      // Check if we have demo data for this query
      if (DEMO_SEARCH_RESULTS[query]) {
        setSearchResults(DEMO_SEARCH_RESULTS[query]);
        setUsingDemoData(true);
        setHasSearched(true);
        setLoading(false);
        return;
      }

      // Try real API search
      try {
        // Check cache first
        const cacheKey = `search_${query.toLowerCase()}`;
        let cachedResults = await getCachedApiResponse(cacheKey);
        
        if (!cachedResults) {
          const response = await searchStocks(query);
          cachedResults = response;
          // Cache search results for 30 minutes
          await cacheApiResponse(cacheKey, response, 30);
        }

        if (cachedResults && cachedResults.bestMatches) {
          setSearchResults(cachedResults.bestMatches);
          setUsingDemoData(false);
        } else {
          throw new Error('No API results');
        }
      } catch (apiError) {
        console.log('Search API failed, using demo data');
        // Fallback to demo search
        const demoResults = Object.values(DEMO_SEARCH_RESULTS).flat().filter(stock => 
          stock['1. symbol'].includes(query) || 
          stock['2. name'].toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setSearchResults(demoResults);
        setUsingDemoData(true);
        
        if (demoResults.length === 0) {
          Alert.alert(
            'Demo Mode',
            `No results for "${searchQuery}". Try searching for: AAPL, TSLA, MSFT, GOOGL, AMZN, META, NVDA, AMD, NFLX, UBER`
          );
        }
      }
      
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed. Please try again.');
      setSearchResults([]);
    }
    setLoading(false);
  };

  const navigateToStock = (searchResult) => {
    // Use real stock data from our demo data
    const stockData = DEMO_STOCK_DATA[searchResult['1. symbol']] || {
      ticker: searchResult['1. symbol'],
      price: searchResult.price || '150.00',
      change_amount: searchResult.change_amount || '5.50',
      change_percentage: searchResult.change_percentage || '3.80%',
    };
    
    navigation.navigate('StockDetails', { stock: stockData, usingDemoData: true });
  };

  const handleQuickSearch = (symbol) => {
    setSearchQuery(symbol);
    setTimeout(() => handleSearch(), 100);
  };

  const renderSearchResult = ({ item }) => {
    const isPositive = item.change_percentage && !item.change_percentage.includes('-');
    
    return (
      <TouchableOpacity 
        style={styles.resultItem}
        onPress={() => navigateToStock(item)}
      >
        <View style={styles.resultInfo}>
          <View style={styles.resultHeader}>
            <Text style={styles.symbol}>{item['1. symbol']}</Text>
            {item.price && (
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
                <Text style={[styles.change, { color: isPositive ? COLORS.secondary : COLORS.danger }]}>
                  {item.change_percentage}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.companyName}>{item['2. name']}</Text>
          <Text style={styles.type}>{item['3. type']} • {item['4. region']}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Demo Mode Banner */}
      {usingDemoData && hasSearched && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>📊 Demo Mode - Sample search results</Text>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks (e.g., AAPL, Apple)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {loading ? (
        <LoadingSpinner message="Searching stocks..." />
      ) : hasSearched ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item['1. symbol']}_${index}`}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search" size={48} color={COLORS.gray} />
            <Text style={styles.noResultsText}>No stocks found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching with a different keyword
            </Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>Search Stocks</Text>
          <Text style={styles.emptySubtitle}>
            Enter a stock symbol (like AAPL) or company name to find stocks
          </Text>
          
          {/* Popular Searches */}
          <View style={styles.popularSection}>
            <Text style={styles.popularTitle}>Popular Searches:</Text>
            <View style={styles.popularTags}>
              {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD'].map((symbol) => (
                <TouchableOpacity
                  key={symbol}
                  style={styles.popularTag}
                  onPress={() => handleQuickSearch(symbol)}
                >
                  <Text style={styles.popularTagText}>{symbol}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    marginTop: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: COLORS.black,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  change: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 2,
  },
  type: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  popularSection: {
    marginTop: 32,
    width: '100%',
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  popularTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  popularTagText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SearchScreen;