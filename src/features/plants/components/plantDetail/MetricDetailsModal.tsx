import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MetricData {
  metric_name: string;
  value: number;
  unit: string;
  calculated_at: string;
  controller_id: string;
  description?: string | null;
}

interface MetricDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  metricType: 'temperature' | 'air_humidity' | 'soil_humidity' | 'light_intensity';
  metrics: MetricData[];
  title: string;
  icon: React.ReactNode;
}

const MetricDetailsModal: React.FC<MetricDetailsModalProps> = ({
  visible,
  onClose,
  metricType,
  metrics,
  title,
  icon,
}) => {
  // Filtrar métricas por tipo (usando metric_name con snake_case)
  const relevantMetrics = metrics.filter(m => m.metric_name?.includes(metricType));

  // Extraer métricas específicas (usando metric_name)
  const average = relevantMetrics.find(m => m.metric_name?.includes('average'));
  const minimum = relevantMetrics.find(m => m.metric_name?.includes('minimum'));
  const maximum = relevantMetrics.find(m => m.metric_name?.includes('maximum'));
  const stdDev = relevantMetrics.find(m => m.metric_name?.includes('std_deviation'));
  const trend = relevantMetrics.find(m => m.metric_name?.includes('trend'));

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'temperature':
        return { start: '#f97316', end: '#ef4444' }; // orange to red
      case 'air_humidity':
        return { start: '#3b82f6', end: '#06b6d4' }; // blue to cyan
      case 'soil_humidity':
        return { start: '#ef4444', end: '#f97316' }; // red to orange
      case 'light_intensity':
        return { start: '#eab308', end: '#f97316' }; // yellow to orange
      default:
        return { start: '#6b7280', end: '#4b5563' }; // gray
    }
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(2)} ${unit}`;
  };

  const colors = getMetricColor(metricType);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.start }]}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                {icon}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>Análisis Detallado</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Métricas principales en grid 2x2 */}
            <View style={styles.metricsGrid}>
              {/* Promedio */}
              {average && (
                <View style={[styles.metricCard, styles.averageCard]}>
                  <View style={styles.metricHeader}>
                    <Icon name="show-chart" size={20} color="#3b82f6" />
                    <Text style={styles.metricLabel}>Promedio</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
                    {formatValue(average.value, average.unit)}
                  </Text>
                </View>
              )}

              {/* Mínimo */}
              {minimum && (
                <View style={[styles.metricCard, styles.minimumCard]}>
                  <View style={styles.metricHeader}>
                    <Icon name="trending-down" size={20} color="#22c55e" />
                    <Text style={styles.metricLabel}>Mínimo</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: '#22c55e' }]}>
                    {formatValue(minimum.value, minimum.unit)}
                  </Text>
                </View>
              )}

              {/* Máximo */}
              {maximum && (
                <View style={[styles.metricCard, styles.maximumCard]}>
                  <View style={styles.metricHeader}>
                    <Icon name="trending-up" size={20} color="#ef4444" />
                    <Text style={styles.metricLabel}>Máximo</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: '#ef4444' }]}>
                    {formatValue(maximum.value, maximum.unit)}
                  </Text>
                </View>
              )}

              {/* Desviación Estándar */}
              {stdDev && (
                <View style={[styles.metricCard, styles.stdDevCard]}>
                  <View style={styles.metricHeader}>
                    <Icon name="equalizer" size={20} color="#a855f7" />
                    <Text style={styles.metricLabel}>Desviación</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: '#a855f7' }]}>
                    {formatValue(stdDev.value, stdDev.unit)}
                  </Text>
                </View>
              )}
            </View>

            {/* Tendencia */}
            {trend && (
              <View style={styles.trendCard}>
                <Text style={styles.trendLabel}>Tendencia</Text>
                <View style={styles.trendContent}>
                  {trend.value > 0 ? (
                    <>
                      <Icon name="trending-up" size={28} color="#22c55e" />
                      <Text style={[styles.trendText, { color: '#22c55e' }]}>Ascendente</Text>
                    </>
                  ) : trend.value < 0 ? (
                    <>
                      <Icon name="trending-down" size={28} color="#ef4444" />
                      <Text style={[styles.trendText, { color: '#ef4444' }]}>Descendente</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="trending-flat" size={28} color="#6b7280" />
                      <Text style={[styles.trendText, { color: '#6b7280' }]}>Estable</Text>
                    </>
                  )}
                  <Text style={styles.trendValue}>
                    ({formatValue(Math.abs(trend.value), trend.unit)})
                  </Text>
                </View>
              </View>
            )}

            {/* Todas las métricas */}
            <View style={styles.allMetricsSection}>
              <Text style={styles.sectionTitle}>
                Todas las métricas ({relevantMetrics.length})
              </Text>
              {relevantMetrics.map((metric, index) => (
                <View key={index} style={styles.metricItem}>
                  <View style={styles.metricItemContent}>
                    <Text style={styles.metricItemName}>
                      {metric.metric_name.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.metricItemValue}>
                      {formatValue(metric.value, metric.unit)}
                    </Text>
                  </View>
                  <Text style={styles.metricItemDate}>
                    {new Date(metric.calculated_at).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  averageCard: {
    backgroundColor: '#eff6ff', // blue-50
  },
  minimumCard: {
    backgroundColor: '#f0fdf4', // green-50
  },
  maximumCard: {
    backgroundColor: '#fef2f2', // red-50
  },
  stdDevCard: {
    backgroundColor: '#faf5ff', // purple-50
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trendCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendText: {
    fontSize: 18,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  allMetricsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  metricItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  metricItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricItemName: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
    flex: 1,
  },
  metricItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  metricItemDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
});

export default MetricDetailsModal;

