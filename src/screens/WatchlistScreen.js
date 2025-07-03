// src/screens/WatchlistScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS } from '../constants/config';
import {
  createWatchlist,
  deleteWatchlist,
  getWatchlists,
  removeStockFromWatchlist
} from '../utils/watchlistManager';

const WatchlistScreen = ({ navigation }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  const loadWatchlists = async () => {
    try {
      const data = await getWatchlists();
      setWatchlists(data);
    } catch (error) {
      console.error('Error loading watchlists:', error);
      Alert.alert('Error', 'Failed to load watchlists');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWatchlists();
  };

  const removeStock = async (watchlistId, stockTicker) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${stockTicker} from watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeStockFromWatchlist(watchlistId, stockTicker);
            if (success) {
              loadWatchlists(); // Reload data
            }
          },
        },
      ]
    );
  };

  const navigateToStock = (stock) => {
    navigation.navigate('StockDetails', { stock });
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }
    
    const newWatchlist = await createWatchlist(newWatchlistName.trim());
    if (newWatchlist) {
      setNewWatchlistName('');
      setShowCreateModal(false);
      loadWatchlists();
      Alert.alert('Success', 'Watchlist created successfully!');
    } else {
      Alert.alert('Error', 'Failed to create watchlist');
    }
  };

  const handleDeleteWatchlist = (watchlistId, watchlistName) => {
    Alert.alert(
      'Delete Watchlist',
      `Are you sure you want to delete "${watchlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteWatchlist(watchlistId);
            if (success) {
              loadWatchlists();
              Alert.alert('Success', 'Watchlist deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete watchlist');
            }
          },
        },
      ]
    );
  };

  // Reload watchlists when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWatchlists();
    }, [])
  );

  const renderStockItem = ({ item: stock, watchlistId }) => {
    const isPositive = parseFloat(stock.change_percentage.replace('%', '')) >= 0;
    
    return (
      <TouchableOpacity 
        style={styles.stockItem}
        onPress={() => navigateToStock(stock)}
      >
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.ticker}</Text>
          <Text style={styles.stockPrice}>${parseFloat(stock.price).toFixed(2)}</Text>
        </View>
        
        <View style={styles.stockRight}>
          <View style={styles.changeInfo}>
            <Text style={[styles.changeAmount, { color: isPositive ? COLORS.secondary : COLORS.danger }]}>
              {isPositive ? '+' : ''}${parseFloat(stock.change_amount).toFixed(2)}
            </Text>
            <Text style={[styles.changePercent, { color: isPositive ? COLORS.secondary : COLORS.danger }]}>
              {stock.change_percentage}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeStock(watchlistId, stock.ticker)}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWatchlist = ({ item: watchlist }) => (
    <View style={styles.watchlistContainer}>
      <View style={styles.watchlistHeader}>
        <Text style={styles.watchlistTitle}>{watchlist.name}</Text>
        <View style={styles.watchlistActions}>
          <Text style={styles.stockCount}>
            {watchlist.stocks.length} stock{watchlist.stocks.length !== 1 ? 's' : ''}
          </Text>
          {watchlist.id !== '1' && ( // Don't allow deleting default watchlist
            <TouchableOpacity 
              onPress={() => handleDeleteWatchlist(watchlist.id, watchlist.name)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {watchlist.stocks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={32} color={COLORS.gray} />
          <Text style={styles.emptyText}>No stocks added yet</Text>
          <Text style={styles.emptySubtext}>
            Add stocks from the Explore tab
          </Text>
        </View>
      ) : (
        watchlist.stocks.map((stock, index) => (
          <View key={`${watchlist.id}_${stock.ticker}_${index}`}>
            {renderStockItem({ item: stock, watchlistId: watchlist.id })}
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading watchlists..." />;
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlists</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.container}
        data={watchlists}
        renderItem={renderWatchlist}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={watchlists.every(w => w.stocks.length === 0) ? styles.emptyContainer : null}
      />

      {/* Create Watchlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Watchlist</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter watchlist name"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewWatchlistName('');
                  setShowCreateModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateWatchlist}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  watchlistContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  watchlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  watchlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  stockPrice: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  stockRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  changeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  changePercent: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
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
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default WatchlistScreen;