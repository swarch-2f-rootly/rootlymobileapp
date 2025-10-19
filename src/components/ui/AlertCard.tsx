import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AlertCardProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  timestamp,
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'warning',
          color: '#f59e0b',
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
        };
      case 'error':
        return {
          icon: 'error',
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
        };
      case 'info':
        return {
          icon: 'info',
          color: '#3b82f6',
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
        };
      case 'success':
        return {
          icon: 'check-circle',
          color: '#22c55e',
          backgroundColor: '#f0fdf4',
          borderColor: '#22c55e',
        };
      default:
        return {
          icon: 'info',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderColor: '#64748b',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Card style={[styles.container, { borderLeftColor: config.borderColor, borderLeftWidth: 4 }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {timestamp && (
            <Text style={styles.timestamp}>{timestamp}</Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

