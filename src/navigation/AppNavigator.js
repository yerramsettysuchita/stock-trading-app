// src/navigation/AppNavigator.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/config';
import ExploreScreen from '../screens/ExploreScreen';
import SearchScreen from '../screens/SearchScreen';
import StockDetailsScreen from '../screens/StockDetailsScreen';
import ViewAllStocksScreen from '../screens/ViewAllStocksScreen';
import WatchlistScreen from '../screens/WatchlistScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Stocks tab
const StocksStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ExploreScreen" 
        component={ExploreScreen}
        options={{ 
          title: 'Explore',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
      <Stack.Screen 
        name="StockDetails" 
        component={StockDetailsScreen}
        options={{ 
          title: 'Stock Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
      <Stack.Screen 
        name="ViewAllStocks" 
        component={ViewAllStocksScreen}
        options={{ 
          title: 'All Stocks',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Search tab
const SearchStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchScreen" 
        component={SearchScreen}
        options={{ 
          title: 'Search',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
      <Stack.Screen 
        name="StockDetails" 
        component={StockDetailsScreen}
        options={{ 
          title: 'Stock Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Watchlist tab
const WatchlistStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WatchlistScreen" 
        component={WatchlistScreen}
        options={{ 
          title: 'Watchlist',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
      <Stack.Screen 
        name="StockDetails" 
        component={StockDetailsScreen}
        options={{ 
          title: 'Stock Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Stocks') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Watchlist') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          headerShown: false, // Hide tab navigator header since stack has its own
        })}
      >
        <Tab.Screen 
          name="Stocks" 
          component={StocksStackNavigator}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchStackNavigator}
        />
        <Tab.Screen 
          name="Watchlist" 
          component={WatchlistStackNavigator}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;