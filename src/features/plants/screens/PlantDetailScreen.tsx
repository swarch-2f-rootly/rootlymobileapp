import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePlant, useDeletePlant, usePlantDevices } from '../../../hooks/usePlants';
import { usePlantChartData, useRealtimeMonitoring, useLatestMeasurement } from '../../../lib/graphql/hooks';
import { Card } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import { Chart } from '../../../components/ui/Chart';
import { MetricCard } from '../../../components/ui/MetricCard';
import { AlertCard } from '../../../components/ui/AlertCard';
import { PlantDevicesManager } from '../components/PlantDevicesManager';
import Icon from 'react-native-vector-icons/MaterialIcons';

type RouteParams = {
  plantId: string;
};

const PlantDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plantId } = route.params as RouteParams;

  const { data: plant, isLoading, error, refetch } = usePlant(plantId);
  const deletePlantMutation = useDeletePlant();
  const { data: plantDevices = [] } = usePlantDevices(plantId);

  // Buscar el microcontrolador asignado a esta planta
  const microcontroller = plantDevices.find(device => device.category === 'microcontroller');
  const controllerId = microcontroller?.name || ''; // Usar el nombre del microcontrolador como controllerId

  // Hook para datos analíticos desde GraphQL usando el controllerId del microcontrolador
  const {
    chartData: analyticsChartData,
    currentData: analyticsCurrentData,
    isLoading: analyticsLoading,
    error: analyticsError,
    hasData: hasAnalyticsData,
    allMetrics,
    getMetricAverage,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight
  } = usePlantChartData(controllerId);

  // Hook para monitoreo en tiempo real - UNA llamada con polling cada 3 segundos
  const {
    data: realtimeData,
    isLoading: realtimeLoading
  } = useRealtimeMonitoring(
    controllerId,
    ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
    !!controllerId, // Habilitado si hay controllerId
    24 // Últimas 24 horas
  );

  // Hook para monitoreo en tiempo real - polling cada 3 segundos para última medición
  const {
    data: latestMeasurementData,
    isLoading: isLoadingLatest,
  } = useLatestMeasurement(
    controllerId,
    isMonitoring && !!controllerId,
    3000 // Polling cada 3 segundos
  );

  // Estado para acumular las métricas recibidas del polling
  const [realtimeMetrics, setRealtimeMetrics] = useState<{
    temperature?: number;
    airHumidity?: number;
    soilHumidity?: number;
    lightLevel?: number;
  }>({
    temperature: analyticsCurrentData?.temperature || 0,
    airHumidity: analyticsCurrentData?.airHumidity || 0,
    soilHumidity: analyticsCurrentData?.soilHumidity || 0,
    lightLevel: analyticsCurrentData?.lightLevel || 0,
  });

  // Determinar el mensaje de estado del sensor usando useMemo para evitar recreación
  const sensorStatus = useMemo(() => {
    if (controllerId) {
      // En modo monitoreo, mostrar el estado de la última medición
      if (isMonitoring) {
        if (latestMeasurementData?.measurement) {
          const status = latestMeasurementData.status;
          const ageMinutes = latestMeasurementData.dataAgeMinutes;
          const metricName = latestMeasurementData.measurement.metricName;
          return `📡 ${controllerId} - ${status} (${metricName}, hace ${ageMinutes} min)`;
        }
        if (isLoadingLatest) {
          return `🔄 ${controllerId} - Consultando...`;
        }
        return `⚠️ ${controllerId} - Sin datos disponibles`;
      }

      // En modo normal, mostrar estado de datos analíticos
      if (hasAnalyticsData || hasTemperature || hasHumidity || hasSoilHumidity || hasLight) {
        return `✅ Microcontrolador: ${controllerId} - Datos obtenidos`;
      }
      return `⚠️ Microcontrolador: ${controllerId} - Esperando datos...`;
    }
    return "❌ Sin microcontrolador asignado";
  }, [
    controllerId,
    hasAnalyticsData,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight,
    isMonitoring,
    latestMeasurementData,
    isLoadingLatest
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'soilMoisture' | null>(null);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Planta',
      '¿Estás seguro de que quieres eliminar esta planta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await deletePlantMutation.mutateAsync(plantId);
      Alert.alert('Éxito', 'Planta eliminada exitosamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error deleting plant:', error);
      Alert.alert('Error', 'No se pudo eliminar la planta. Inténtalo de nuevo.');
    }
  };

  const handleMetricPress = (metric: 'temperature' | 'humidity' | 'soilMoisture') => {
    setSelectedMetric(metric);
  };

  const getChartData = () => {
    if (!analyticsChartData || analyticsChartData.length === 0) return [];

    // Usar los datos transformados del hook GraphQL
    return analyticsChartData.map(dataPoint => ({
      time: dataPoint.time,
      value: selectedMetric === 'temperature' ? dataPoint.temperature || 0 :
             selectedMetric === 'humidity' ? dataPoint.humidity || 0 :
             selectedMetric === 'soilMoisture' ? dataPoint.soilHumidity || 0 :
             dataPoint.temperature || 0,
    }));
  };

  const getMetricDetails = () => {
    switch (selectedMetric) {
      case 'temperature':
        return {
          title: 'Temperatura',
          unit: '°C',
          optimal: '20-30°C',
          current: realtimeMetrics.temperature ?? analyticsCurrentData?.temperature ?? 0,
        };
      case 'humidity':
        return {
          title: 'Humedad del Aire',
          unit: '%',
          optimal: '50-70%',
          current: realtimeMetrics.airHumidity ?? analyticsCurrentData?.airHumidity ?? 0,
        };
      case 'soilMoisture':
        return {
          title: 'Humedad del Suelo',
          unit: '%',
          optimal: '40-60%',
          current: realtimeMetrics.soilHumidity ?? analyticsCurrentData?.soilHumidity ?? 0,
        };
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <Loading text="Cargando planta..." fullScreen />;
  }

  if (error || !plant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Error al cargar la planta</Text>
          <Text style={styles.errorText}>
            No se pudo cargar la información de la planta
          </Text>
          <Button
            title="Reintentar"
            onPress={() => refetch()}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon
            name="arrow-back"
            size={24}
            color="#22c55e"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Detalle de Planta</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Monitoring Status */}
        <View style={styles.monitoringContainer}>
          <Card style={styles.monitoringCard}>
            <View style={styles.monitoringHeader}>
              <Text style={styles.monitoringTitle}>Monitoreo en Tiempo Real</Text>
              <TouchableOpacity
                onPress={() => setIsMonitoring(!isMonitoring)}
                style={styles.monitoringToggle}
              >
                <Icon
                  name={isMonitoring ? "pause" : "play-arrow"}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.monitoringStatus}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isMonitoring ? '#22c55e' : '#ef4444' }]} />
                <Text style={styles.statusText}>{isMonitoring ? 'En Vivo' : 'Pausado'}</Text>
              </View>
              <Text style={styles.lastUpdateText}>Última actualización: hace 2 min</Text>
            </View>
          </Card>
        </View>

        {/* Plant Info */}
        <View style={styles.infoContainer}>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{plant.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Especie:</Text>
              <Text style={styles.infoValue}>{plant.species}</Text>
            </View>

            {plant.description && (
              <View style={styles.descriptionRow}>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.descriptionValue}>{plant.description}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Activa</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Current Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Métricas Actuales</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Temperatura"
              value={realtimeMetrics.temperature ?? analyticsCurrentData?.temperature ?? 0}
              unit="°C"
              icon="thermostat"
              color="#ef4444"
              trend="stable"
              onPress={() => handleMetricPress('temperature')}
            />
            <MetricCard
              title="Humedad Aire"
              value={realtimeMetrics.airHumidity ?? analyticsCurrentData?.airHumidity ?? 0}
              unit="%"
              icon="water-drop"
              color="#3b82f6"
              trend="up"
              onPress={() => handleMetricPress('humidity')}
            />
            <MetricCard
              title="Humedad Suelo"
              value={realtimeMetrics.soilHumidity ?? analyticsCurrentData?.soilHumidity ?? 0}
              unit="%"
              icon="grass"
              color="#22c55e"
              trend="down"
              onPress={() => handleMetricPress('soilMoisture')}
            />
            <MetricCard
              title="Nivel Luz"
              value={realtimeMetrics.lightLevel ?? analyticsCurrentData?.lightLevel ?? 0}
              unit="lux"
              icon="wb-sunny"
              color="#f59e0b"
              trend="stable"
            />
          </View>
        </View>

        {/* Alerts - TODO: Implementar con GraphQL cuando esté disponible */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Alertas Recientes</Text>
          <Text style={styles.noDataText}>No hay alertas recientes</Text>
        </View>

        {/* Device Manager */}
        <View style={styles.deviceManagerContainer}>
          <Text style={styles.sectionTitle}>Dispositivos Conectados</Text>
          <PlantDevicesManager plantId={plantId} plantName={plant.name} />
        </View>

        {/* Charts */}
        {selectedMetric && (
          <View style={styles.chartsContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                Tendencia de {getMetricDetails()?.title} - Últimas 24 horas
              </Text>
              <TouchableOpacity onPress={() => setSelectedMetric(null)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Chart
              type="line"
              data={getChartData()}
              height={200}
            />
            <View style={styles.metricDetails}>
              <Text style={styles.metricDetailText}>
                Valor actual: {getMetricDetails()?.current}{getMetricDetails()?.unit}
              </Text>
              <Text style={styles.metricDetailText}>
                Rango óptimo: {getMetricDetails()?.optimal}
              </Text>
            </View>
          </View>
        )}

        {/* Dates */}
        <View style={styles.datesContainer}>
          <Text style={styles.sectionTitle}>Información de fechas</Text>
          <Card style={styles.datesCard}>
            <View style={styles.dateRow}>
              <Icon name="calendar-today" size={20} color="#64748b" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Creada</Text>
                <Text style={styles.dateValue}>{formatDate(plant.created_at)}</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Icon name="update" size={20} color="#64748b" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Última actualización</Text>
                <Text style={styles.dateValue}>{formatDate(plant.updated_at)}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <View style={styles.actionButtons}>
            <Button
              title="Editar Planta"
              onPress={() => {
                Alert.alert('Próximamente', 'La función de editar estará disponible pronto.');
              }}
              variant="outline"
              style={styles.editButton}
            />

            <Button
              title="Eliminar Planta"
              onPress={handleDelete}
              variant="danger"
              loading={deletePlantMutation.isPending}
              style={styles.deleteButton}
            />
          </View>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoCard: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  descriptionRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  descriptionValue: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  datesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  datesCard: {
    padding: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 2,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
  sensorsContainer: {
    marginBottom: 24,
  },
  sensorsCard: {
    padding: 24,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 150,
  },
  monitoringContainer: {
    padding: 20,
  },
  monitoringCard: {
    backgroundColor: '#22c55e',
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monitoringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  monitoringToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monitoringStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#dcfce7',
  },
  metricsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  alertsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  deviceManagerContainer: {
    padding: 20,
    paddingTop: 0,
  },
  chartsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  metricDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  metricDetailText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
});

export default PlantDetailScreen;
