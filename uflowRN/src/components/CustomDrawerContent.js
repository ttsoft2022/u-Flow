import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useApp} from '../contexts/AppContext';
import {useAuth} from '../contexts/AuthContext';
import {Colors} from '../constants/colors';
import {Strings} from '../constants/strings';
import DatabaseIcon from './icons/DatabaseIcon';
import LogoutIcon from './icons/LogoutIcon';

/**
 * Custom Drawer Content
 * Left side menu matching Android drawer design
 *
 * Layout:
 * - Header: "Xin chào, <username>"
 * - Database name with icon
 * - "Đổi người dùng" button
 * - Footer: App name and version
 */
export default function CustomDrawerContent({navigation}) {
  const {userNo, dbAlias} = useApp();
  const {logout} = useAuth();

  /**
   * Handle logout / switch user
   */
  const handleSwitchUser = () => {
    navigation.closeDrawer();
    logout(true); // Clear saved credentials
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {userNo || 'User'}</Text>

        {/* Database info */}
        <View style={styles.dbInfo}>
          <DatabaseIcon size={18} color={Colors.gray} />
          <Text style={styles.dbName}>{dbAlias || 'Database'}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* Switch User Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSwitchUser}>
          <LogoutIcon size={22} color={Colors.white} />
          <Text style={styles.menuText}>{Strings.drawerUser}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.appName}>Sewman u@Flow</Text>
        <Text style={styles.version}>Phiên bản 1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + '30',
  },
  greeting: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dbInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dbName: {
    color: Colors.gray,
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuText: {
    color: Colors.white,
    fontSize: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray + '30',
  },
  appName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  version: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
});
