import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {useApp} from '../contexts/AppContext';
import {getTopChartData} from '../api/chartApi';
import {formatDateForAPI} from '../utils/dateUtils';
import {formatNumberGerman} from '../utils/numberUtils';
import {Colors} from '../constants/colors';
import {Strings} from '../constants/strings';

/**
 * Top Chart Tab Component - Port of fragment_top.xml
 *
 * Layout:
 * - Container: padding 8dp horizontal, 16dp top
 * - Title: bold white text
 * - Summary row: marginTop 16dp
 *   - Left: label + value (green)
 *   - Right: label + value (blue) + diff (red)
 * - Chart: height 150dp, marginTop 24dp
 */

export default function TopChartTab({type}) {
  const {noDep, serverIP, apiName, getDbConfig} = useApp();

  const [chartData, setChartData] = useState([]);
  const [sum01, setSum01] = useState(0);
  const [sum02, setSum02] = useState(0);
  const [sumDiff, setSumDiff] = useState(0);
  const [maxBarValue, setMaxBarValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get header texts based on type
  const getHeaderText = () => {
    switch (type) {
      case 1:
        return Strings.topTab01Header;
      case 2:
        return Strings.topTab02Header;
      case 3:
        return Strings.topTab03Header;
      default:
        return '';
    }
  };

  const getSubHeader01 = () => {
    switch (type) {
      case 1:
        return Strings.topTab01SubHeader01;
      case 2:
        return Strings.topTab02SubHeader01;
      case 3:
        return Strings.topTab03SubHeader01;
      default:
        return '';
    }
  };

  const getSubHeader02 = () => {
    switch (type) {
      case 1:
        return Strings.topTab01SubHeader02;
      case 2:
        return Strings.topTab02SubHeader02;
      case 3:
        return Strings.topTab03SubHeader02;
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

      const data = await getTopChartData(
        serverIP,
        apiName,
        noDep,
        today,
        today,
        type,
        dbConfig,
      );

      if (data && data.length > 0) {
        // Process data for grouped bar chart
        const barData = [];
        data.forEach(item => {
          // First bar (green)
          barData.push({
            value: item.QTY || 0,
            label: item.LABEL,
            frontColor: Colors.green,
            spacing: 2,
            labelWidth: 65,
            labelTextStyle: {color: Colors.white, fontSize: 9},
            topLabelComponent: () => (
              <Text style={{color: Colors.green, fontSize: 8, fontWeight: 'bold'}}>
                {formatNumberGerman(item.QTY || 0)}
              </Text>
            ),
          });
          // Second bar (blue)
          barData.push({
            value: item.QTY_WORKER || 0,
            frontColor: Colors.blue,
            spacing: 15,
            topLabelComponent: () => (
              <Text style={{color: Colors.blue, fontSize: 8, fontWeight: 'bold'}}>
                {formatNumberGerman(item.QTY_WORKER || 0)}
              </Text>
            ),
          });
        });

        setChartData(barData);

        // Calculate sums
        const total01 = data.reduce((sum, item) => sum + (item.QTY || 0), 0);
        const total02 = data.reduce((sum, item) => sum + (item.QTY_WORKER || 0), 0);
        setSum01(total01);
        setSum02(total02);

        // Calculate max bar value for chart scaling
        const allValues = data.flatMap(item => [item.QTY || 0, item.QTY_WORKER || 0]);
        const maxVal = Math.max(...allValues);
        setMaxBarValue(maxVal);

        // Calculate difference
        let diff;
        if (type === 2) {
          diff = total01 > 0 ? Math.round((total02 / total01) * 100) : 0;
        } else {
          diff = total02 - total01;
        }
        setSumDiff(diff);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Load top chart data error:', err);
      setError(err.message || Strings.errorNetwork);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format difference text
   */
  const formatDiffText = () => {
    if (type === 2) {
      return `(${formatNumberGerman(sumDiff)}%)`;
    } else {
      if (sumDiff >= 0) {
        return `(+${formatNumberGerman(sumDiff)})`;
      } else {
        return `(${formatNumberGerman(sumDiff)})`;
      }
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
      {/* Title - bold white text */}
      <Text style={styles.title}>{getHeaderText()}</Text>

      {/* Summary Row - marginTop 16dp */}
      <View style={styles.summaryRow}>
        {/* Left side: label + value (green) */}
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>{getSubHeader01()}</Text>
          <Text style={styles.summaryValueGreen}>
            {formatNumberGerman(sum01)}
          </Text>
        </View>

        {/* Right side: label + value (blue) + diff (red) */}
        <View style={styles.summaryRight}>
          <Text style={styles.summaryLabel}>{getSubHeader02()}</Text>
          <Text style={styles.summaryValueBlue}>
            {formatNumberGerman(sum02)}
          </Text>
          <Text style={styles.summaryDiff}>{formatDiffText()}</Text>
        </View>
      </View>

      {/* Chart - height 150dp, marginTop 24dp */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={32}
          spacing={4}
          height={120}
          xAxisThickness={0}
          yAxisThickness={0}
          xAxisColor={Colors.white}
          hideYAxisText
          noOfSections={3}
          maxValue={maxBarValue * 1.05 || 100}
          yAxisOffset={0}
          isAnimated
          backgroundColor={Colors.black}
          rulesType="solid"
          rulesColor={Colors.chartGridLines}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  // Center container for loading/error/empty
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
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
  // Title
  title: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  summaryValueGreen: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValueBlue: {
    color: Colors.blue,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  summaryDiff: {
    color: Colors.red,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Chart container
  chartContainer: {
    flex: 1,
    marginTop: 8,
  },
});
