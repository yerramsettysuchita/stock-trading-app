// src/components/StockCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/config';

const StockCard = ({ stock, onPress }) => {
  const isPositive = parseFloat(stock.change_percentage.replace('%', '')) >= 0;
  
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(stock)}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{stock.ticker}</Text>
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? COLORS.secondary : COLORS.danger }]}>
          <Text style={styles.changeText}>{stock.change_percentage}</Text>
        </View>
      </View>
      
      <Text style={styles.price}>${parseFloat(stock.price).toFixed(2)}</Text>
      <Text style={styles.change}>
        {isPositive ? '+' : ''}${parseFloat(stock.change_amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 110,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  changeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 4,
  },
  changeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default StockCard;