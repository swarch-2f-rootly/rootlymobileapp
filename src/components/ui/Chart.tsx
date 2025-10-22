import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart
} from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'progress' | 'contribution' | 'stacked';
  data: any;
  title?: string;
  height?: number;
  style?: any;
}

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  height = 220,
  style,
}) => {
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#22c55e',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={width - 40}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={width - 40}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={width - 40}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        );
      case 'progress':
        return (
          <ProgressChart
            data={data}
            width={width - 40}
            height={height}
            chartConfig={chartConfig}
            hideLegend={false}
          />
        );
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tipo de gráfico no soportado</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  placeholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
  },
});

