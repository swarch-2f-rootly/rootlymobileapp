import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SensorDataCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  color: string;
  hasData: boolean;
}

const SensorDataCard: React.FC<SensorDataCardProps> = ({
  icon,
  title,
  subtitle,
  value,
  unit,
  color,
  hasData,
}) => {
  return (
    <View style={[styles.card, { borderColor: color, opacity: hasData ? 1 : 0.6 }]}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          {hasData ? (
            <Text style={[styles.value, { color }]}>
              {value.toFixed(title === 'Temperatura' ? 1 : 0)}{unit}
            </Text>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Sin información</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SensorDataCard;
