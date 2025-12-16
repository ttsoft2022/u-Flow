import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {useApp} from '../contexts/AppContext';
import {getBottomChartData} from '../api/chartApi';
import {formatDateForAPI} from '../utils/dateUtils';
import {Colors} from '../constants/colors';
import {Strings} from '../constants/strings';

/**
 * Bottom Chart Tab Component - Port of fragment_bottom.xml
 *
 * Layout:
 * - Container: padding 8dp horizontal, 16dp top, background #303030
 * - Header row (single line):
 *   - Left: Title (bold) + Description
 *   - Right: Max label + value (green) | Min label + value (green)
 * - Chart: marginTop 24dp, fill remaining space
 */

export default function BottomChartTab({type}) {
  const {noDep, serverIP, apiName, getDbConfig} = useApp();

  const [chartData, setChartData] = useState([]);
  const [maxQty, setMaxQty] = useState(0);
  const [minQty, setMinQty] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get title based on type
  const getTitleText = () => {
    switch (type) {
      case 1:
        return Strings.bottomTab01Title; // Cắt
      case 2:
        return Strings.bottomTab02Title; // May
      case 3:
        return Strings.bottomTab03Title; // Là
      case 4:
        return Strings.bottomTab04Title; // Hoàn thiện
      default:
        return '';
    }
  };

  // Load chart data on mount and when department changes
  useEffect(() => {
    if (noDep) {
      loadChartData();
    }
  }, [noDep, type]);

  /**
   * Load chart data from API
   */
  const loadChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = formatDateForAPI();
      const dbConfig = getDbConfig();

      const data = await getBottomChartData(
        serverIP,
        apiName,
        noDep,
        today,
        today,
        type,
        dbConfig,
      );

      if (data && data.length > 0) {
        // Process data for chart
        const barData = data.map(item => ({
          value: item.QTY || 0,
          frontColor: Colors.green,
          spacing: 4,
        }));

        setChartData(barData);

        // Calculate max and min
        const quantities = data.map(item => item.QTY || 0);
        const max = Math.max(...quantities);
        const min = Math.min(...quantities);
        setMaxQty(max);
        setMinQty(min);
      } else {
        setChartData([]);
        setMaxQty(0);
        setMinQty(0);
      }
    } catch (err) {
      console.error('Load bottom chart data error:', err);
      setError(err.message || Strings.errorNetwork);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.colorAccent} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{Strings.error404}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Row - single line */}
      <View style={styles.headerRow}>
        {/* Left: Title + Description */}
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{getTitleText()}</Text>
          <Text style={styles.description}>({Strings.textDescription})</Text>
        </View>

        {/* Right: Max + Min */}
        <View style={styles.headerRight}>
          <Text style={styles.statLabel}>{Strings.textMax}</Text>
          <Text style={styles.statValue}>{maxQty}</Text>
          <Text style={[styles.statLabel, {marginLeft: 16}]}>{Strings.textMin}</Text>
          <Text style={styles.statValue}>{minQty}</Text>
        </View>
      </View>

      {/* Chart - marginTop 24dp, fill remaining */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={16}
          spacing={6}
          height={120}
          roundedTop
          roundedBottom
          xAxisThickness={0}
          yAxisThickness={0}
          hideYAxisText
          noOfSections={3}
          maxValue={maxQty * 1.05 || 100}
          isAnimated
          backgroundColor={Colors.backgroundFragmentBottom}
          rulesType="solid"
          rulesColor={Colors.chartGridLines}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container - padding 8dp horizontal, 16dp top
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundFragmentBottom,
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  // Center container for loading/error/empty
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundFragmentBottom,
    padding: 20,
  },
  loadingText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: Colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
  },
  // Header row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    color: Colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  statLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statValue: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Chart container - marginTop 24dp, fill remaining
  chartContainer: {
    flex: 1,
    marginTop: 24,
  },
});
