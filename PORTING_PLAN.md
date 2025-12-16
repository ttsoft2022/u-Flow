# React Native Porting Plan: uFlow App

## Overview

Port Android app **uFlow** (production flow monitoring dashboard) từ Java/Android sang React Native với đầy đủ tính năng.

**App Features:**
- Login với multi-database support (Firebird remote DBs)
- Dashboard với 7 chart tabs (3 top + 4 bottom)
- Department/Factory switching
- Real-time data visualization từ REST APIs
- Dark theme UI

## Tech Stack Decisions

| Aspect | Android | React Native | Rationale |
|--------|---------|--------------|-----------|
| **Framework** | Native Android | React Native CLI | Cross-platform, không dùng Expo |
| **Charts** | MPAndroidChart | Victory Native | Cần grouped bar charts, Victory hỗ trợ tốt |
| **Storage** | SQLite | AsyncStorage | Đơn giản hơn cho DB configs (key-value đủ dùng) |
| **HTTP** | AsyncHttpClient | Axios | Modern, promise-based |
| **Navigation** | Fragments + Drawer | React Navigation | Stack + Drawer + MaterialTopTabs |
| **State** | MyApplication singleton | Context API | Không cần Redux cho app này |
| **Crypto** | Java MD5 | crypto-js | MD5 hashing cho login password |

## Project Structure

```
uflowRN/
├── src/
│   ├── api/                    # HTTP layer
│   │   ├── client.js          # Axios config
│   │   ├── authApi.js         # Login, getDepartments
│   │   └── chartApi.js        # Chart data APIs
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── TopChart.js    # Grouped bar (2 datasets)
│   │   │   └── BottomChart.js # Single bar + max/min
│   │   ├── common/
│   │   │   ├── CustomSpinner.js
│   │   │   └── LoadingIndicator.js
│   │   └── tabs/
│   │       ├── TopTabView.js      # 3 tabs
│   │       └── BottomTabView.js   # 4 tabs
│   │
│   ├── contexts/
│   │   ├── AppContext.js      # Global state (user, DB configs, departments)
│   │   └── AuthContext.js     # Auth state + Remember Me
│   │
│   ├── screens/
│   │   ├── LoginScreen.js     # DB dropdown + login form
│   │   └── MainScreen.js      # Dashboard với 2 tab sections
│   │
│   ├── navigation/
│   │   ├── AppNavigator.js    # Stack: Login ↔ Main
│   │   └── DrawerNavigator.js # Drawer với logout
│   │
│   ├── services/
│   │   ├── storageService.js  # AsyncStorage wrapper (thay SQLite)
│   │   └── databaseService.js # DB configs CRUD
│   │
│   ├── utils/
│   │   ├── crypto.js          # MD5, dbEncrypt
│   │   ├── dateUtils.js       # yyyy-MM-dd formatting
│   │   └── numberUtils.js     # German locale (358,xx)
│   │
│   ├── constants/
│   │   ├── colors.js          # Dark theme colors
│   │   └── testCredentials.js # Test DB constants
│   │
│   └── models/
│       ├── Database.js
│       └── Department.js
│
├── App.js                      # Entry: Providers + Navigator
└── package.json
```

## Key Component Mappings

| Android Component | React Native | Notes |
|------------------|--------------|-------|
| `LoginActivity.java` | `LoginScreen.js` | Dropdown + form + Remember Me |
| `MainActivity.java` | `MainScreen.js` | Custom header + 2 ViewPagers |
| `TopFragment.java` (3 instances) | `TopChart.js` | Grouped bars, sum_01/sum_02/diff |
| `BottomFragment.java` (4 instances) | `BottomChart.js` | Single bars, max/min |
| `MyApplication.java` | `AppContext.js` | Global: userNo, noDep, dbConfig, listDep |
| `MySQLiteOpenHelper.java` | `storageService.js` | AsyncStorage cho DB configs array |
| `Utility.java` | `crypto.js` | MD5 hash, dbEncrypt (hex encoding) |
| `TopPagerAdapter` | `TopTabView` + MaterialTopTabs | 3 tabs pass type={1,2,3} |
| `BottomPagerAdapter` | `BottomTabView` + MaterialTopTabs | 4 tabs pass type={1,2,3,4} |
| Navigation Drawer | `DrawerNavigator` | User info + Logout button |

## Dependencies to Install

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/drawer @react-navigation/material-top-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-pager-view @react-native-community/masked-view

# Charts (Victory Native cho grouped bars)
npm install victory-native react-native-svg

# HTTP & Storage
npm install axios @react-native-async-storage/async-storage

# Utilities
npm install crypto-js date-fns react-native-vector-icons
```

**Important:** Add `react-native-reanimated/plugin` to `babel.config.js`

## API Endpoints (Keep Unchanged)

Base URL: `http://{serverIP}/{apiName}`

1. **POST** `/general/login` - Authentication
   - Params: `name_usl`, `password_usl` (MD5), `dbIP`, `dbName`, `dbUsername`, `dbPassword`

2. **GET** `/general/stats/getdepfactory` - Get departments list
   - Params: `type=11`, DB credentials

3. **GET** `/general/flow/getflowcharttoday` - Top charts data
   - Params: `noDep`, `fdate`, `tdate`, `type` (1/2/3), DB credentials

4. **GET** `/general/flow/getflowchart15` - Bottom charts data (15 phút)
   - Params: `noDep`, `fdate`, `tdate`, `type` (1/2/3/4), DB credentials

## Implementation Phases

### Phase 1: Foundation (Days 1-2)

**1.1 Initialize Project**
```bash
npx react-native init uflowRN --version 0.72.0
cd uflowRN
npm install [all dependencies above]
```

**1.2 Setup Structure**
- Create folder structure: `src/api`, `src/components`, `src/screens`, etc.
- Create `src/constants/colors.js`:
  ```javascript
  export const Colors = {
    background: '#000000',
    cardBackground: '#1a1a1a',
    white: '#FFFFFF',
    green: '#4CAF50',
    blue: '#2196F3',
    red: '#F44336',
    gray: '#9E9E9E',
  };
  ```
- Create `src/constants/testCredentials.js` từ `Constants.java`

**1.3 Test Basic Build**
- Run `npx react-native run-android`
- Verify app starts trên emulator

---

### Phase 2: Core Services (Days 2-3)

**2.1 Utilities** (`src/utils/crypto.js`)
```javascript
import CryptoJS from 'crypto-js';

export function md5(text) {
  return CryptoJS.MD5(text).toString();
}

export function dbEncrypt(text) {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join('');
}
```

**2.2 Storage Service** (`src/services/storageService.js`)
- Implement AsyncStorage wrapper
- Methods:
  - `getAllDatabases()` - Load array of DB configs
  - `addDatabase(config)` - Insert new config
  - `updateDatabase(id, updates)` - Update config
  - `deleteDatabase(id)` - Remove config
  - `initializeDefaultDatabases()` - Load 2 default DBs từ Android's `loadData()`
  - `saveRememberMe(credentials)` - Save login info
  - `getRememberMe()` - Retrieve saved credentials
  - `clearRememberMe()` - Clear on logout

**Key:** Store DB configs as JSON array:
```javascript
[
  {
    _id: 1,
    serverIP: '192.168.181.6:8081',
    apiName: 'SewmanTD',
    dbIP: '192.168.181.5',
    dbName: 'sewman_thieudo',
    dbAlias: 'sewman_thieudo',
    dbUsername: 'SYSDBA',
    dbPassword: 'Md@Fb@24',
    isVisible: 1
  },
  // ... more DBs
]
```

**2.3 Models**
- `src/models/Database.js` - POJO với 8 fields
- `src/models/Department.js` - `{ NO_DEP, NAME_DEP }`

---

### Phase 3: State Management (Day 3)

**3.1 AppContext** (`src/contexts/AppContext.js`)
```javascript
const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState({
    userNo: null,
    noDep: null,
    dbName: null,
    dbAlias: null,
    dbUsername: null,
    dbPassword: null,
    dbIP: null,
    serverIP: null,
    apiName: null,
    listDep: [],  // Array of Department objects
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ ...state, updateState }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
```

**3.2 AuthContext** (`src/contexts/AuthContext.js`)
- State: `isAuthenticated`, `rememberMe`
- Methods: `login()`, `logout()`, `checkSavedCredentials()`

**3.3 Wire Up in App.js**
```javascript
import { AppProvider } from './src/contexts/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </AppProvider>
  );
}
```

---

### Phase 4: API Layer (Days 4-5)

**4.1 API Client** (`src/api/client.js`)
```javascript
import axios from 'axios';

export const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Add interceptors cho logging + error handling

  return client;
};
```

**4.2 Auth API** (`src/api/authApi.js`)
```javascript
export const authApi = {
  async login(serverIP, apiName, username, password, dbConfig) {
    const client = createApiClient(`http://${serverIP}/${apiName}`);
    const params = new URLSearchParams({
      name_usl: username,
      password_usl: md5(password),
      dbIP: dbConfig.dbIP,
      dbName: dbConfig.dbName,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbConfig.dbPassword,
    });
    return client.get('/general/login', { params });
  },

  async getDepartments(serverIP, apiName, dbConfig, type = 11) {
    // Similar với dbEncrypt for password
  }
};
```

**4.3 Chart API** (`src/api/chartApi.js`)
- `getTopChartData(serverIP, apiName, noDep, fdate, tdate, type, dbConfig)`
- `getBottomChartData(serverIP, apiName, noDep, fdate, tdate, type, dbConfig)`

**4.4 Testing**
- Test API calls với real server (dùng Postman hoặc direct fetch)
- Verify MD5 hash matches Android output

---

### Phase 5: Navigation (Day 5)

**5.1 AppNavigator** (`src/navigation/AppNavigator.js`)
- Stack Navigator: Login ↔ Main (based on `isAuthenticated`)

**5.2 DrawerNavigator** (`src/navigation/DrawerNavigator.js`)
- Drawer với custom content:
  - Header: Username + DB info (green text)
  - Menu: Logout button
- Contains MainScreen

**5.3 Placeholder Screens**
- Empty `LoginScreen.js`
- Empty `MainScreen.js`
- Test navigation flow

---

### Phase 6: Login Screen (Days 6-7)

**6.1 UI Components** (`src/screens/LoginScreen.js`)
- Database Spinner (dropdown)
  - Load từ `storageService.getAllDatabases()`
  - Filter `isVisible === 1`
  - Display `dbAlias`
- Username TextInput
- Password TextInput (secureTextEntry)
- Remember Me Checkbox
- Login Button

**6.2 Login Logic**
```javascript
const handleLogin = async () => {
  try {
    // 1. Check if username === 'myapp' → test mode
    // 2. Call authApi.login()
    // 3. Parse response, check success
    // 4. Call authApi.getDepartments(type=11)
    // 5. Store in AppContext: updateState({ listDep, noDep, ... })
    // 6. Save credentials if rememberMe
    // 7. Navigate to Main
  } catch (error) {
    Alert.alert('Login Failed', error.message);
  }
};
```

**6.3 Remember Me**
- Load saved credentials on mount: `useEffect(() => checkSavedCredentials())`
- Auto-populate form nếu có saved
- Save on successful login

**6.4 Styling**
- Dark theme (black background)
- Green accents cho inputs
- Match Android layout

---

### Phase 7: Main Screen Structure (Days 7-8)

**7.1 Custom Header** (`src/screens/MainScreen.js`)
```javascript
<View style={styles.header}>
  <TouchableOpacity onPress={toggleDrawer}>
    <Icon name="menu" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>{currentDepName}</Text>
  <TouchableOpacity onPress={handleSwitchDepartment}>
    <Icon name="refresh" />
  </TouchableOpacity>
</View>
```

**7.2 Switch Department Logic**
```javascript
const handleSwitchDepartment = () => {
  const { listDep, noDep } = useApp();
  const currentIndex = listDep.findIndex(d => d.NO_DEP === noDep);
  const nextIndex = (currentIndex + 1) % listDep.length;
  updateState({ noDep: listDep[nextIndex].NO_DEP });
  // Charts sẽ tự động re-fetch vì noDep changed
};
```

**7.3 Layout Structure**
```javascript
<View style={styles.container}>
  <CustomHeader />
  <View style={styles.topSection}>  {/* 45% height */}
    <Text style={styles.sectionTitle}>Top Fragment</Text>
    <TopTabView />
  </View>
  <View style={styles.bottomSection}>  {/* 55% height */}
    <Text style={styles.sectionTitle}>Bottom Fragment</Text>
    <BottomTabView />
  </View>
</View>
```

---

### Phase 8: Top Charts (Days 8-10)

**8.1 TopTabView** (`src/components/tabs/TopTabView.js`)
```javascript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TopChart from '../charts/TopChart';

const Tab = createMaterialTopTabNavigator();

export default function TopTabView() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.cardBackground },
        tabBarIndicatorStyle: { backgroundColor: Colors.green },
        tabBarLabelStyle: { color: Colors.white },
      }}
      initialRouteName="Tab3"  // Default to tab 3
    >
      <Tab.Screen name="Tab1">
        {() => <TopChart type={1} />}
      </Tab.Screen>
      <Tab.Screen name="Tab2">
        {() => <TopChart type={2} />}
      </Tab.Screen>
      <Tab.Screen name="Tab3">
        {() => <TopChart type={3} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
```

**8.2 TopChart Component** (`src/components/charts/TopChart.js`)

**Features:**
- Fetch data từ `chartApi.getTopChartData()`
- Parse JSON: `QTY`, `QTY_WORKER`, `ORDINAL`, `LABEL`
- Calculate:
  - `sum_01 = sum(QTY)`
  - `sum_02 = sum(QTY_WORKER)`
  - `diff = type === 2 ? (sum_02/sum_01)*100 : sum_02 - sum_01`
- Render grouped bar chart (Victory Native):
  ```javascript
  <VictoryChart>
    <VictoryGroup offset={15}>
      <VictoryBar data={data1} style={{ data: { fill: Colors.green } }} />
      <VictoryBar data={data2} style={{ data: { fill: Colors.blue } }} />
    </VictoryGroup>
  </VictoryChart>
  ```
- Display sum labels (green: sum_01, blue: sum_02, red: diff)
- Show progress indicator cho type 3 (loading state)

**Data Format:**
```javascript
data1 = [{ x: 1, y: 358 }, { x: 2, y: 420 }, ...];
data2 = [{ x: 1, y: 400 }, { x: 2, y: 450 }, ...];
labels = ['Line 1', 'Line 2', ...];
```

**8.3 Styling**
- German number format: `value.toLocaleString('de-DE')`
- Chart height: 150dp
- Value labels above bars
- White text on dark background

---

### Phase 9: Bottom Charts (Days 10-12)

**9.1 BottomTabView** (`src/components/tabs/BottomTabView.js`)
- MaterialTopTabNavigator với 4 tabs
- Pass `type={1,2,3,4}` to BottomChart

**9.2 BottomChart Component** (`src/components/charts/BottomChart.js`)

**Features:**
- Fetch data từ `chartApi.getBottomChartData()`
- Parse JSON: `QTY`, `ORDINAL`
- Calculate:
  - `maxQty = Math.max(...quantities)`
  - `minQty = Math.min(...quantities)`
- Render single bar chart:
  ```javascript
  <VictoryChart>
    <VictoryBar
      data={data}
      style={{ data: { fill: Colors.green } }}
      cornerRadius={8}  // Rounded bars
    />
  </VictoryChart>
  ```
- Display max/min labels (green text)

**Data Format:**
```javascript
data = [{ x: 1, y: 125 }, { x: 2, y: 138 }, ...];
```

**9.3 Custom Bar Styling**
- Rounded corners (8dp cornerRadius)
- No x-axis labels
- Grid lines

---

### Phase 10: Chart Polish (Days 12-13)

**10.1 Victory Native Configuration**
- Custom themes cho consistent colors
- Proper axis formatting
- Value label positioning
- Touch interactions (optional)

**10.2 Performance Optimization**
- Memoize chart components: `React.memo(TopChart)`
- Debounce department switching
- Cache API responses (short TTL)
- Lazy load tabs: `<Tab.Navigator lazy={true}>`

**10.3 Error Handling**
- Network errors → Show toast
- Empty data → Show "No data available"
- Timeout → Retry button

---

### Phase 11: Testing & Bug Fixes (Days 13-15)

**11.1 Complete User Flows**
- [ ] Login với Remember Me → View charts → Logout
- [ ] Login → Switch department → Charts update
- [ ] Login với invalid credentials → Error message
- [ ] Network offline → Graceful error

**11.2 Edge Cases**
- Empty chart data (API returns empty list)
- API timeout (15s for bottom, 30s for top)
- Rapid department switching
- Multiple concurrent API calls

**11.3 Platform Testing**
- Android testing (physical device + emulator)
- iOS testing (simulator + device)
- Different screen sizes (phones + tablets)

---

### Phase 12: Polish & Deploy (Days 15-17)

**12.1 UI Polish**
- Add splash screen
- Add app icon
- Smooth transitions
- Loading skeletons

**12.2 Code Cleanup**
- Remove console.logs
- Add comments cho complex logic
- Format code consistently
- Update README

**12.3 Build Production**
- Android: `cd android && ./gradlew assembleRelease`
- iOS: Archive với Xcode
- Test production builds

---

## Critical Files to Implement First

**Priority Order:**

1. **`src/contexts/AppContext.js`** - Foundation cho global state
2. **`src/services/storageService.js`** - Essential cho DB configs + Remember Me
3. **`src/api/client.js` + `src/api/authApi.js`** - Core API layer
4. **`src/screens/LoginScreen.js`** - Entry point, user's first interaction
5. **`src/components/charts/TopChart.js`** - Most complex component, defines pattern

These 5 files establish:
- Architecture patterns (Context, Storage, API)
- Main user flow (Login → Dashboard)
- Core business logic (Chart data fetching + rendering)

---

## Potential Challenges & Solutions

### Challenge 1: Grouped Bar Charts
**Problem:** react-native-chart-kit doesn't support grouped bars
**Solution:** Use Victory Native's `<VictoryGroup>` component

### Challenge 2: Chart Performance
**Problem:** SVG rendering can be slow với large datasets
**Solution:**
- Limit data points (Android đã limit rồi)
- Use `react-native-charts-wrapper` nếu performance critical (wraps native MPAndroidChart)
- Enable hardware acceleration

### Challenge 3: AsyncStorage vs SQLite
**Problem:** Không có SQL queries
**Solution:**
- Store DB configs as JSON array
- Filter trong JS: `dbConfigs.filter(db => db.isVisible === 1)`
- Performance ok vì chỉ có vài DB configs (<10 items)

### Challenge 4: German Number Formatting
**Problem:** `toLocaleString('de-DE')` produces `358,xx` format
**Solution:** Use `Intl.NumberFormat`:
```javascript
new Intl.NumberFormat('de-DE').format(value);
```

### Challenge 5: Custom Header với Department Name
**Problem:** React Navigation header khác ActionBar
**Solution:**
- Disable default header: `headerShown: false`
- Create custom header component trong MainScreen
- Access department name từ AppContext

### Challenge 6: Victory Native Bundle Size
**Problem:** Victory Native adds ~300KB to bundle
**Solution:**
- Accept trade-off (flexibility > size)
- Or migrate to react-native-charts-wrapper later nếu cần

---

## Success Criteria

- [x] Login flow hoạt động (multi-DB, Remember Me)
- [x] Department switching updates all charts
- [x] All 7 chart tabs display correctly (3 top + 4 bottom)
- [x] Charts match Android appearance (colors, layout, data format)
- [x] Logout clears session (credentials cleared on logout)
- [ ] App runs on both Android & iOS
- [x] Dark theme consistent throughout
- [x] Performance: Charts render <2s, no jank

---

## Estimated Timeline

- **Total:** 15-17 working days
- **Foundation (Phases 1-5):** 5 days
- **Core Features (Phases 6-9):** 7 days
- **Polish & Testing (Phases 10-12):** 3-5 days

**Note:** Timeline assumes 1 developer working full-time.

---

## Key Reference Files (Android)

- `old_android_src/java/com/ttsoft/uflow/LoginActivity.java` - Login flow logic
- `old_android_src/java/com/ttsoft/uflow/MainActivity.java` - Main screen structure
- `old_android_src/java/com/ttsoft/uflow/TopFragment.java` - Top charts implementation
- `old_android_src/java/com/ttsoft/uflow/BottomFragment.java` - Bottom charts implementation
- `old_android_src/java/com/ttsoft/uflow/common/MyApplication.java` - Global state pattern
- `old_android_src/java/com/ttsoft/uflow/common/MySQLiteOpenHelper.java` - Database schema
- `old_android_src/java/com/ttsoft/uflow/common/Utility.java` - Crypto functions

---

## Implementation Progress (Updated: 2025-12-16)

### ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| Project Setup | ✅ Done | React Native 0.83.0, all dependencies installed |
| Storage Service | ✅ Done | AsyncStorage for DB configs + Remember Me |
| API Layer | ✅ Done | Axios client, authApi, chartApi |
| AppContext | ✅ Done | Global state: user, DB, departments |
| AuthContext | ✅ Done | Authentication + Remember Me |
| Login Screen | ✅ Done | Multi-DB dropdown, form, test mode |
| Main Screen | ✅ Done | Custom header, 2 tab sections |
| Top Charts (3 tabs) | ✅ Done | Grouped bar charts, grid lines, proper scaling |
| Bottom Charts (4 tabs) | ✅ Done | Single bar charts, grid lines, max/min display |
| Department Switching | ✅ Done | Tap header to switch, no alert popup |
| Drawer Menu | ✅ Done | User info, DB name, logout button |
| Logout | ✅ Done | Clears credentials, returns to blank login form |
| Dark Theme | ✅ Done | Consistent colors throughout |
| App Icons | ✅ Done | Generated for Android |

### 🔧 Recent Fixes (2025-12-16)

1. **Top Chart Grid Lines** - Added `rulesType="solid"` + `rulesColor`
2. **Bottom Chart Grid Lines** - Same as above
3. **Chart Scaling** - Fixed maxValue to use actual bar values (not sums)
4. **Chart Bar Ratio** - Added `yAxisOffset={0}` for correct proportions
5. **Label Colors** - Changed from gray to white
6. **Label Width** - Increased to 65 for "Hoàn thiện"
7. **Logout** - Changed `logout(false)` to `logout(true)` to clear credentials
8. **Switch Department** - Removed Alert popup

### 📁 Final Project Structure

```
uflowRN/src/
├── api/
│   ├── authApi.js          # Login, getDepartments
│   ├── chartApi.js         # getTopChartData, getBottomChartData
│   └── client.js           # Axios config
├── components/
│   ├── icons/              # SVG icons (Menu, User, Password, Database, Logout)
│   ├── BottomChartTab.js   # Single bar chart component
│   ├── CustomDrawerContent.js # Drawer menu
│   └── TopChartTab.js      # Grouped bar chart component
├── constants/
│   ├── colors.js           # Theme colors
│   ├── strings.js          # UI strings (Vietnamese)
│   └── testCredentials.js  # Test mode data
├── contexts/
│   ├── AppContext.js       # Global state
│   └── AuthContext.js      # Auth state
├── models/
│   ├── Database.js         # DB config model
│   └── Department.js       # Department model
├── navigation/
│   └── AppNavigator.js     # Stack + Drawer navigation
├── screens/
│   ├── LoginScreen.js      # Login page
│   └── MainScreen.js       # Dashboard page
├── services/
│   ├── databaseService.js  # DB CRUD operations
│   └── storageService.js   # AsyncStorage wrapper
└── utils/
    ├── crypto.js           # MD5, dbEncrypt
    ├── dateUtils.js        # Date formatting
    └── numberUtils.js      # German number format
```

### ⏳ Remaining Tasks

- [ ] Test on iOS simulator/device
- [ ] Production build optimization
- [ ] Code signing for release
