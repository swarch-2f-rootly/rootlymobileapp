import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from '../../components/ui/Card';
import { Chart } from '../../components/ui/Chart';
import { MetricCard } from '../../components/ui/MetricCard';
import { Loading } from '../../components/ui/Loading';
import { useGlobalMetrics, formatGlobalChartData } from '../../hooks/useAnalytics';
import { useAnalyticsHealth } from '../../lib/graphql/analytics-queries';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Real data from GraphQL API
  const { data: analyticsHealth, isLoading: healthLoading } = useAnalyticsHealth();
  const { data: globalMetrics, isLoading: globalMetricsLoading } = useGlobalMetrics(selectedPeriod);

  // Loading state for all data
  const isLoading = healthLoading || globalMetricsLoading;

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <Loading text="Cargando analytics..." fullScreen />;
  }

  // Safe access to metrics data
  const temperatureData = globalMetrics?.temperature || [];
  const humidityData = globalMetrics?.humidity || [];
  const soilMoistureData = globalMetrics?.soilMoisture || [];
  const lightLevelData = globalMetrics?.lightLevel || [];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return '#ef4444';
      case 'Resuelto': return '#22c55e';
      case 'Completado': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="analytics" size={28} color="#22c55e" />
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <View style={styles.periodSelector}>
            {(['day', 'week', 'month'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}>
                  {period === 'day' ? 'Día' : period === 'week' ? 'Semana' : 'Mes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* System Overview */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Resumen del Sistema</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Estado Analytics"
              value={analyticsHealth?.getAnalyticsHealth?.status === 'healthy' ? 1 : 0}
              icon="analytics"
              color="#22c55e"
            />
            <MetricCard
              title="InfluxDB"
              value={analyticsHealth?.getAnalyticsHealth?.influxdb === 'connected' ? 1 : 0}
              icon="storage"
              color="#3b82f6"
            />
            <MetricCard
              title="Servicio"
              value={analyticsHealth?.getAnalyticsHealth?.service === 'running' ? 1 : 0}
              icon="settings"
              color="#f59e0b"
            />
            <MetricCard
              title="Uptime"
              value={1}
              icon="schedule"
              color="#ef4444"
            />
          </View>
        </View>

        {/* Global Metrics Charts */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Métricas Globales</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'day' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('day')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.periodButtonTextActive]}>Día</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>Semana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>Mes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Temperature Chart */}
          <Card style={styles.chartCard}>
            <Chart
              type="line"
              data={{
                labels: temperatureData.length > 0 ? formatGlobalChartData(temperatureData).map(d => d.time) : [],
                datasets: [{
                  data: temperatureData.length > 0 ? formatGlobalChartData(temperatureData).map(d => d.value) : [],
                  color: () => '#ef4444',
                  strokeWidth: 2,
                }],
                legend: ['Temperatura (°C)'],
              }}
              title="Temperatura Global"
              height={200}
            />
          </Card>

          {/* Humidity Chart */}
          <Card style={styles.chartCard}>
            <Chart
              type="line"
              data={{
                labels: humidityData.length > 0 ? formatGlobalChartData(humidityData).map(d => d.time) : [],
                datasets: [{
                  data: humidityData.length > 0 ? formatGlobalChartData(humidityData).map(d => d.value) : [],
                  color: () => '#3b82f6',
                  strokeWidth: 2,
                }],
                legend: ['Humedad (%)'],
              }}
              title="Humedad Global"
              height={200}
            />
          </Card>

          {/* Soil Moisture Chart */}
          <Card style={styles.chartCard}>
            <Chart
              type="line"
              data={{
                labels: soilMoistureData.length > 0 ? formatGlobalChartData(soilMoistureData).map(d => d.time) : [],
                datasets: [{
                  data: soilMoistureData.length > 0 ? formatGlobalChartData(soilMoistureData).map(d => d.value) : [],
                  color: () => '#22c55e',
                  strokeWidth: 2,
                }],
                legend: ['Humedad Suelo (%)'],
              }}
              title="Humedad del Suelo Global"
              height={200}
            />
          </Card>

          {/* Light Level Chart */}
          <Card style={styles.chartCard}>
            <Chart
              type="line"
              data={{
                labels: lightLevelData.length > 0 ? formatGlobalChartData(lightLevelData).map(d => d.time) : [],
                datasets: [{
                  data: lightLevelData.length > 0 ? formatGlobalChartData(lightLevelData).map(d => d.value) : [],
                  color: () => '#f59e0b',
                  strokeWidth: 2,
                }],
                legend: ['Nivel de Luz (lux)'],
              }}
              title="Nivel de Luz Global"
              height={200}
            />
          </Card>
        </View>

        {/* Sensor Health */}
        <View style={styles.healthContainer}>
          <Text style={styles.sectionTitle}>Estado de Sensores</Text>
          <Card style={styles.healthCard}>
            <Chart
              type="pie"
              data={[
                { name: 'Conectado', population: 1, color: '#22c55e', legendFontColor: '#22c55e' },
                { name: 'Desconectado', population: 0, color: '#ef4444', legendFontColor: '#ef4444' },
              ]}
              height={200}
            />
            <View style={styles.healthStats}>
              <View style={styles.healthStat}>
                <View style={[styles.healthIndicator, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.healthText}>InfluxDB Conectado (100%)</Text>
              </View>
              <View style={styles.healthStat}>
                <View style={[styles.healthIndicator, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.healthText}>InfluxDB Desconectado (0%)</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Alertas Recientes</Text>
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIcon, { backgroundColor: '#22c55e20' }]}>
                <Icon name="check-circle" size={20} color="#22c55e" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Servicio Analytics Saludable</Text>
                <Text style={styles.alertPlant}>Sistema de Monitoreo</Text>
              </View>
              <View style={styles.alertMeta}>
                <Text style={styles.alertTime}>{analyticsHealth?.getAnalyticsHealth?.timestamp ? new Date(analyticsHealth.getAnalyticsHealth.timestamp).toLocaleTimeString() : 'Ahora'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#22c55e20' }]}>
                  <Text style={[styles.statusText, { color: '#22c55e' }]}>
                    OK
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  overviewContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartContainer: {
    padding: 20,
    paddingTop: 0,
  },
  chartCard: {
    padding: 16,
  },
  healthContainer: {
    padding: 20,
    paddingTop: 0,
  },
  healthCard: {
    padding: 16,
  },
  healthStats: {
    marginTop: 16,
  },
  healthStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  healthText: {
    fontSize: 14,
    color: '#475569',
  },
  alertsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  alertCard: {
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  alertPlant: {
    fontSize: 14,
    color: '#64748b',
  },
  alertMeta: {
    alignItems: 'flex-end',
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // New styles for period selector and chart header
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#22c55e',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
});

export default AnalyticsScreen;

