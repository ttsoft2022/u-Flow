import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TabView} from 'react-native-tab-view';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../contexts/AppContext';
import {Colors} from '../constants/colors';
import {Strings} from '../constants/strings';
import TopChartTab from '../components/TopChartTab';
import BottomChartTab from '../components/BottomChartTab';
import MenuIcon from '../components/icons/MenuIcon';

/**
 * Main Screen - Port of fragment_home.xml
 *
 * Layout structure:
 * - Top Title (padding 16dp vertical)
 * - Top TabLayout (42dp height, 8dp horizontal margin)
 * - Top ViewPager (45% weight)
 * - Bottom Container (55% weight, 4dp horizontal margin, 8dp bottom margin)
 *   - Bottom Title (padding 16dp vertical, #303030 background)
 *   - Bottom TabLayout (42dp height, 8dp horizontal margin)
 *   - Bottom ViewPager (fill remaining)
 */

// Top tab routes
const TOP_ROUTES = [
  {key: 'tab1', title: Strings.topTab01Title}, // Số CN
  {key: 'tab2', title: Strings.topTab02Title}, // Sản lượng
  {key: 'tab3', title: Strings.topTab03Title}, // Tồn
];

// Bottom tab routes
const BOTTOM_ROUTES = [
  {key: 'tab1', title: Strings.bottomTab01Title}, // Cắt
  {key: 'tab2', title: Strings.bottomTab02Title}, // May
  {key: 'tab3', title: Strings.bottomTab03Title}, // Là
  {key: 'tab4', title: Strings.bottomTab04Title}, // Hoàn thiện
];

export default function MainScreen() {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const {getCurrentDepartmentName, getNextDepartment, switchDepartment} =
    useApp();

  // Top tab state (start on tab 3, index 2 - matching Android)
  const [topIndex, setTopIndex] = useState(2);

  // Bottom tab state
  const [bottomIndex, setBottomIndex] = useState(0);

  /**
   * Handle switch department
   */
  const handleSwitchDepartment = () => {
    const nextDep = getNextDepartment();
    if (nextDep) {
      switchDepartment(nextDep.NO_DEP);
    }
  };

  /**
   * Open drawer menu
   */
  const openDrawer = () => {
    navigation.openDrawer();
  };

  /**
   * Render top tab scene
   */
  const renderTopScene = ({route}) => {
    const type = parseInt(route.key.replace('tab', ''), 10);
    return <TopChartTab type={type} />;
  };

  /**
   * Render bottom tab scene
   */
  const renderBottomScene = ({route}) => {
    const type = parseInt(route.key.replace('tab', ''), 10);
    return <BottomChartTab type={type} />;
  };

  /**
   * Render top tab bar
   * Background: tabHeaderUnselected (#2B2C37)
   * Selected tab: tabHeaderSelected (#3C3D49)
   */
  const renderTopTabBar = () => (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBarWrapper, {backgroundColor: Colors.tabHeaderUnselected}]}>
        {TOP_ROUTES.map((route, index) => {
          const isActive = topIndex === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabItem,
                {backgroundColor: isActive ? Colors.tabHeaderSelected : 'transparent'},
              ]}
              onPress={() => setTopIndex(index)}>
              <Text style={[styles.tabLabel, {color: isActive ? Colors.white : Colors.gray}]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  /**
   * Render bottom tab bar
   * Background: colorPrimary (#171717)
   * Selected tab: tabHeaderSelected (#3C3D49)
   */
  const renderBottomTabBar = () => (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBarWrapper, {backgroundColor: Colors.colorPrimary}]}>
        {BOTTOM_ROUTES.map((route, index) => {
          const isActive = bottomIndex === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabItem,
                {backgroundColor: isActive ? Colors.tabHeaderSelected : 'transparent'},
              ]}
              onPress={() => setBottomIndex(index)}>
              <Text style={[styles.tabLabel, {color: isActive ? Colors.white : Colors.gray}]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <MenuIcon size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={handleSwitchDepartment}
          activeOpacity={0.7}>
          <Text style={styles.headerTitle}>
            {getCurrentDepartmentName().toUpperCase()}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content - Black background */}
      <View style={styles.mainContent}>
        {/* Top Section Title - 16dp padding vertical */}
        <Text style={styles.topSectionTitle}>{Strings.topFragmentTitle}</Text>

        {/* Top TabLayout - 42dp height, 8dp margin horizontal */}
        {renderTopTabBar()}

        {/* Top ViewPager - 45% weight */}
        <View style={styles.topViewPager}>
          <TabView
            navigationState={{index: topIndex, routes: TOP_ROUTES}}
            renderScene={renderTopScene}
            renderTabBar={() => null}
            onIndexChange={setTopIndex}
            initialLayout={{width: layout.width}}
          />
        </View>

        {/* Bottom Section Container - 55% weight, margins */}
        <View style={styles.bottomContainer}>
          {/* Bottom Section Title - 16dp padding vertical */}
          <Text style={styles.bottomSectionTitle}>{Strings.bottomFragmentTitle}</Text>

          {/* Bottom TabLayout - 42dp height, 8dp margin horizontal */}
          {renderBottomTabBar()}

          {/* Bottom ViewPager - fill remaining */}
          <View style={styles.bottomViewPager}>
            <TabView
              navigationState={{index: bottomIndex, routes: BOTTOM_ROUTES}}
              renderScene={renderBottomScene}
              renderTabBar={() => null}
              onIndexChange={setBottomIndex}
              initialLayout={{width: layout.width}}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.colorPrimary,
    paddingHorizontal: 4,
    paddingVertical: 4,
    elevation: 4,
  },
  menuButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  // Top Section
  topSectionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12, // 12dp like Android
    backgroundColor: Colors.black,
  },
  topViewPager: {
    flex: 0.45, // 45% weight like Android
    backgroundColor: Colors.black,
  },
  // Bottom Section
  bottomContainer: {
    flex: 0.55, // 55% weight like Android
    marginHorizontal: 4, // 4dp margin like Android
    marginBottom: 8, // 8dp margin bottom like Android
    backgroundColor: Colors.backgroundFragmentBottom, // #303030
    borderRadius: 8,
  },
  bottomSectionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12, // 12dp like Android
    backgroundColor: Colors.backgroundFragmentBottom,
  },
  bottomViewPager: {
    flex: 1, // Fill remaining space
    backgroundColor: Colors.backgroundFragmentBottom,
  },
  // Tab Bar
  tabBarContainer: {
    paddingHorizontal: 8, // 8dp margin like Android
  },
  tabBarWrapper: {
    flexDirection: 'row',
    height: 32, // 36dp like Android
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
