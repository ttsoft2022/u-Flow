# uFlow React Native

Production flow monitoring dashboard - Ported from Android to React Native.

## 📱 Overview

This is a complete port of the uFlow Android application to React Native. The app provides real-time production flow monitoring with charts and statistics for factory departments.

### Features

- ✅ Multi-database login system with Remember Me
- ✅ Department switching capability
- ✅ Today's data charts (3 tabs): Workers, Production, Inventory
- ✅ 15-day productivity charts (4 tabs): Cutting, Sewing, Ironing, Finishing
- ✅ Test mode for development (username: "myapp")
- ✅ Dark theme UI matching Android version

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.4 (recommended)
- React Native development environment configured
- Android SDK or Xcode installed

### Installation & Running

```bash
# Install dependencies
npm install

# Run on Android
npm run android

# Run on iOS (macOS only)
cd ios && pod install && cd ..
npm run ios

# Start Metro bundler
npm start
```

## 🏗️ Tech Stack

- **React Native**: 0.83.0
- **Navigation**: React Navigation (Stack + Tab View)
- **Charts**: Victory Native (grouped bar charts)
- **Storage**: AsyncStorage (replaces Android SQLite)
- **HTTP**: Axios
- **State**: React Context API
- **Crypto**: CryptoJS (MD5 hashing, hex encoding)

## 📁 Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components (TopChartTab, BottomChartTab)
├── constants/        # Colors, strings, test data
├── contexts/         # Global state (AppContext, AuthContext)
├── models/           # Data models (Database, Department)
├── navigation/       # Navigation setup
├── screens/          # App screens (LoginScreen, MainScreen)
├── services/         # Business logic (storage, database)
└── utils/            # Utilities (crypto, date, number formatting)
```

## 🧪 Testing

### Test Mode
Enter `myapp` as username to skip API calls and use test credentials from `src/constants/testCredentials.js`.

### API Endpoints
- **Login**: `GET /general/login`
- **Departments**: `GET /general/stats/getdepfactory`
- **Top Charts**: `GET /general/flow/getflowcharttoday`
- **Bottom Charts**: `GET /general/flow/getflowchart15`

## 📋 Key Changes from Android

| Feature | Android | React Native |
|---------|---------|--------------|
| Database | SQLite | AsyncStorage |
| Navigation | ViewPager2 + Drawer | React Navigation |
| Charts | MPAndroidChart | Victory Native |
| State | Singleton class | Context API |
| HTTP | AsyncHttpClient | Axios |

## ⚠️ Security Notes

This app stores credentials in AsyncStorage for "Remember Me". For production:
- Encrypt stored credentials
- Use secure storage (react-native-keychain)
- Implement token-based auth
- Use HTTPS only

## 🐛 Known Issues

1. **Node Version**: Requires Node.js >= 20.19.4 (current: 20.18.1 works with warnings)
2. **Chart Labels**: Victory Native labels may differ slightly from MPAndroidChart

## 📝 Next Steps

- [ ] Test on real devices with live API
- [ ] Fine-tune chart styling
- [ ] Add offline caching
- [ ] Improve error handling
- [ ] Add accessibility labels

## 📄 Version

**Version**: 2025.01  
**Ported**: 2025-12-12
