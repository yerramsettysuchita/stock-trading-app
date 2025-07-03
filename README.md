# Stock Trading App - React Native

A comprehensive stock trading application built with React Native and Expo, featuring real-time stock data, watchlists, and detailed stock analysis.

## 🚀 Features

### Core Features
- ✅ **Real-time Stock Data** - Live prices with gains/losses indicators
- ✅ **Grid Layout Display** - Professional 2-column stock cards layout
- ✅ **Stock Details** - Detailed view with price charts and company information
- ✅ **Multiple Watchlists** - Create and manage multiple stock watchlists
- ✅ **Stock Search** - Search functionality with real-time price display
- ✅ **View All Stocks** - Comprehensive list of top gainers and losers

### Advanced Features
- 📊 **Interactive Charts** - 7-day price charts using react-native-chart-kit
- 🔍 **Smart Search** - Search by symbol or company name with autocomplete
- 📚 **Watchlist Management** - Add/remove stocks with selection modal
- 🎯 **Demo Mode** - Fallback demo data when API limits are reached
- 🔄 **Pull-to-Refresh** - Refresh data across all screens
- 💾 **Smart Caching** - API response caching for better performance

## 📱 Screenshots

### Main Screens
- **Explore Screen** - Grid layout with top gainers and losers
- **Search Screen** - Real-time stock search with price data
- **Watchlist Screen** - Multiple watchlists management
- **Stock Details** - Comprehensive stock information with charts

## 🛠️ Technology Stack

### Framework & Core
- **React Native** with **Expo**
- **JavaScript** (ES6+)
- **React Navigation** v6 for navigation
- **AsyncStorage** for local data persistence

### UI & Styling
- **React Native Paper** components
- **Expo Vector Icons** for iconography
- **Custom styling** with responsive design
- **Pull-to-refresh** functionality

### Data & API
- **Alpha Vantage API** for real-time stock data
- **Axios** for HTTP requests
- **Smart caching system** with expiration
- **Demo data fallback** for reliability

### Charts & Visualization
- **react-native-chart-kit** for price charts
- **React Native SVG** for chart rendering
- **Interactive line charts** with 7-day data

## 📋 Requirements

- **Node.js** (v14 or higher)
- **Expo CLI** (latest version)
- **Android Studio** or **Xcode** (for device testing)
- **Alpha Vantage API Key** (free registration)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/stock-trading-app.git
cd stock-trading-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key
1. Get your free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Open `src/constants/config.js`
3. Replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://www.alphavantage.co/query',
  API_KEY: 'your_actual_api_key_here', // Replace with your API key
  TIMEOUT: 10000,
};
```

### 4. Start the Development Server
```bash
npx expo start
```

### 5. Run on Device
- **Android**: Scan QR code with Expo Go app
- **iOS**: Scan QR code with Camera app or Expo Go
- **Simulator**: Press `a` for Android or `i` for iOS

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── StockCard.js    # Individual stock card component
│   └── LoadingSpinner.js # Loading indicator component
├── screens/            # Screen components
│   ├── ExploreScreen.js     # Main stocks screen with grid layout
│   ├── SearchScreen.js      # Stock search functionality
│   ├── WatchlistScreen.js   # Watchlist management
│   ├── StockDetailsScreen.js # Detailed stock view with charts
│   └── ViewAllStocksScreen.js # Complete stock listings
├── navigation/         # Navigation configuration
│   └── AppNavigator.js # Tab and stack navigation setup
├── services/          # API services
│   └── stockApi.js    # Alpha Vantage API integration
├── utils/             # Utility functions
│   ├── storage.js     # AsyncStorage helpers
│   └── watchlistManager.js # Watchlist management logic
└── constants/         # App constants
    └── config.js      # API configuration and colors
```

## 🎯 Key Components

### ExploreScreen
- Displays top gainers and losers in grid layout
- Pull-to-refresh functionality
- Navigation to detailed stock views
- Demo mode with fallback data

### SearchScreen
- Real-time stock search with price display
- Popular stock quick-access tags
- Smart search with company name support
- Color-coded price changes (green/red)

### WatchlistScreen
- Multiple watchlist support
- Create, delete, and manage watchlists
- Add/remove stocks with confirmation
- Empty state handling

### StockDetailsScreen
- Interactive price charts (7-day data)
- Company information and metrics
- Watchlist selection modal
- Real-time price updates

## 📊 API Integration

### Alpha Vantage Endpoints Used
- **TOP_GAINERS_LOSERS** - For main screen data
- **SYMBOL_SEARCH** - For stock search functionality
- **OVERVIEW** - For company information
- **TIME_SERIES_DAILY** - For price chart data

### Caching Strategy
- **5 minutes** for stock prices
- **30 minutes** for search results
- **60 minutes** for company data
- **Demo data fallback** when API limits reached

## 🔧 Configuration

### Colors (src/constants/config.js)
```javascript
export const COLORS = {
  primary: '#007AFF',      // Blue for primary actions
  secondary: '#34C759',    // Green for positive changes
  danger: '#FF3B30',       // Red for negative changes
  warning: '#FF9500',      // Orange for warnings
  background: '#F2F2F7',   // Light gray background
  white: '#FFFFFF',        // White for cards
  black: '#000000',        // Black for text
  gray: '#8E8E93',         // Gray for secondary text
};
```

## 🚢 Building for Production

### Create APK
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build APK
eas build --platform android --profile preview
```

### Export for Web
```bash
npx expo export --platform web
```

## 🐛 Troubleshooting

### Common Issues

**API Key Issues:**
- Ensure API key is correctly set in `config.js`
- Check Alpha Vantage dashboard for usage limits
- App automatically falls back to demo data if API fails

**Navigation Issues:**
- Clear Expo cache: `npx expo start --clear`
- Restart Metro bundler
- Check React Navigation dependencies

**Chart Display Issues:**
- Ensure react-native-svg is properly installed
- Charts use demo data when API data unavailable
- Check device compatibility with SVG rendering

## 📈 Demo Mode

The app includes comprehensive demo data that activates when:
- API key is missing or invalid
- API rate limits are exceeded
- Network connectivity issues occur

Demo data includes:
- 15+ popular stocks with realistic prices
- Company information for major tech stocks
- Interactive charts with generated price data
- Full watchlist functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Alpha Vantage** for providing free stock market API
- **Expo** for excellent React Native development platform
- **React Navigation** for smooth navigation experience
- **React Native Chart Kit** for beautiful chart components

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review Alpha Vantage API documentation

---

**Built with ❤️ using React Native and Expo**

*Last updated: July 2025*
