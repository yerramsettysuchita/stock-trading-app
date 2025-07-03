// src/screens/ViewAllStocksScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import StockCard from '../components/StockCard';
import { COLORS } from '../constants/config';

const ViewAllStocksScreen = ({ route, navigation }) => {
  const { type, data, title } = route.params; // type: 'gainers' or 'losers'
  const [stocks, setStocks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (data) {
      setStocks(data);
    }
  }, [data]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const onStockPress = (stock) => {
    navigation.navigate('StockDetails', { stock, usingDemoData: true });
  };

  const renderStockCard = ({ item, index }) => (
    <View style={styles.cardContainer}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.cardWrapper}>
        <StockCard stock={item} onPress={onStockPress} />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>
        {stocks.length} stocks • Pull down to refresh
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={type === 'gainers' ? 'trending-up' : 'trending-down'} 
        size={64} 
        color={COLORS.gray} 
      />
      <Text style={styles.emptyTitle}>No {type} found</Text>
      <Text style={styles.emptySubtitle}>
        Pull down to refresh and get the latest data
      </Text>
    </View>
  );

  if (!stocks || stocks.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={renderStockCard}
        keyExtractor={(item, index) => `${type}_${item.ticker}_${index}`}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 8,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  rankContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  rankText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardWrapper: {
    paddingTop: 16, // Make space for rank badge
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ViewAllStocksScreen;