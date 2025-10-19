import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  trend,
  onPress,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'trending-flat';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#22c55e';
      case 'down':
        return '#ef4444';
      case 'stable':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          {trend && (
            <Icon name={getTrendIcon()} size={20} color={getTrendColor()} />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.value}>
            {value}
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </Card>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#64748b',
  },
  title: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

