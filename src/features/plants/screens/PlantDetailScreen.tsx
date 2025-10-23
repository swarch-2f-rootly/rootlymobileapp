import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePlant, useDeletePlant, usePlantDevices } from '../../../hooks/usePlants';
import { usePlantChartData, useLatestMeasurement } from '../../../lib/api/analytics-hooks';
import { Card } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import { AuthenticatedImage } from '../../../components/ui/AuthenticatedImage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SensorDataCard from '../components/plantDetail/SensorDataCard';
import MetricDetailsModal from '../components/plantDetail/MetricDetailsModal';
import { getPlantImageUrl } from '../../../utils/plantUtils';

type RouteParams = {
  plantId: string;
};

// const { width } = Dimensions.get('window'); // Not used

const PlantDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plantId } = route.params as RouteParams;
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Estado para modales de métricas
  const [openModal, setOpenModal] = useState<'temperature' | 'air_humidity' | 'soil_humidity' | 'light_intensity' | null>(null);

  // Obtener la planta desde la API
  const { data: plant, isLoading, error } = usePlant(plantId);
  const { data: plantDevices = [] } = usePlantDevices(plantId);
  const deletePlantMutation = useDeletePlant();

  console.log('🌱 [PlantDetailScreen] Información de la planta:', {
    plantId,
    hasPlant: !!plant,
    plantName: plant?.name,
    devicesCount: plantDevices.length,
    devices: plantDevices.map(d => ({ id: d.id, name: d.name, category: d.category })),
  });

  // Buscar el microcontrolador asignado a esta planta
  const microcontroller = plantDevices.find(device => device.category === 'microcontroller');
  const controllerId = microcontroller?.name || ''; // Usar el nombre del microcontrolador como controllerId
  
  console.log('🎮 [PlantDetailScreen] Microcontrolador:', {
    hasMicrocontroller: !!microcontroller,
    microcontrollerId: microcontroller?.id,
    microcontrollerName: microcontroller?.name,
    controllerId,
    hasControllerId: !!controllerId,
  });

  // Obtener datos analíticos desde REST API usando el controllerId del microcontrolador
  const {
    currentData: analyticsData,
    // isLoading: analyticsLoading, // Not used
    // error: analyticsError, // Not used
    hasData,
    allMetrics,
    getMetricAverage,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight
  } = usePlantChartData(controllerId);

  console.log('📈 [PlantDetailScreen] Datos analíticos:', {
    hasData,
    analyticsData,
    metricsCount: allMetrics.length,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight,
    temperatureAvg: getMetricAverage('temperature'),
    airHumidityAvg: getMetricAverage('air_humidity'),
    soilHumidityAvg: getMetricAverage('soil_humidity'),
    lightAvg: getMetricAverage('light_intensity'),
  });

  // Hook para datos históricos y gráficas (siempre habilitado si hay controllerId para mostrar gráficas)
  // const { data: historicalChartData } = useRealtimeMonitoring( // Not implemented yet
  //   controllerId,
  //   ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
  //   !!controllerId, // Habilitado si hay controllerId
  //   24 // Últimas 24 horas
  // );

  // Hook para monitoreo en tiempo real - UNA llamada con polling cada 3 segundos
  // El backend devuelve la última medición disponible (cualquier tipo de métrica)
  const {
    data: latestMeasurementData,
    isLoading: isLoadingLatest,
    error: latestError
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
  }>({});

  const handleDeletePlant = async () => {
    if (!plant) return;

    try {
      await deletePlantMutation.mutateAsync(plant.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error eliminando planta:', error);
      Alert.alert('Error', 'Error al eliminar la planta. Por favor, intenta de nuevo.');
    }
  };

  const hasMicrocontroller = plantDevices.some(device => device.category === 'microcontroller');
  const hasSensor = plantDevices.some(device => device.category === 'sensor');

  // Determinar el mensaje de estado del sensor usando useMemo para evitar recreación
  const sensorStatus = useMemo(() => {
    if (controllerId) {
      // En modo monitoreo, mostrar el estado de la última medición
      if (isMonitoring) {
        if (latestMeasurementData) {
          const timestamp = new Date(latestMeasurementData.timestamp);
          const ageMinutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
          const status = ageMinutes < 5 ? 'online' : 'delayed';
          return `📡 ${controllerId} - ${status} (hace ${ageMinutes} min)`;
        }
        if (latestError) {
          return `⚠️ ${controllerId} - Error obteniendo datos`;
        }
        if (isLoadingLatest) {
          return `🔄 ${controllerId} - Consultando...`;
        }
        return `⚠️ ${controllerId} - Sin datos disponibles`;
      }

      // En modo normal, mostrar estado de datos analíticos
      if (hasData || hasTemperature || hasHumidity || hasSoilHumidity || hasLight) {
        return `✅ Microcontrolador: ${controllerId} - Datos obtenidos`;
      }
      return `⚠️ Microcontrolador: ${controllerId} - Esperando datos...`;
    }
    return "❌ Sin microcontrolador asignado";
  }, [
    controllerId,
    hasData,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight,
    isMonitoring,
    latestMeasurementData,
    latestError,
    isLoadingLatest
  ]);

  const [currentData, setCurrentData] = useState({
    soilHumidity: 0,
    airHumidity: 0,
    temperature: 0,
    lightLevel: 0,
    timestamp: "",
    date: "",
    location: "Ubicación no disponible",
    sensorId: "Inicializando..."
  });

  // Actualizar sensorId cuando cambie el estado del sensor
  useEffect(() => {
    setCurrentData(prev => ({
      ...prev,
      sensorId: sensorStatus
    }));
  }, [sensorStatus]);

  // Actualizar con datos analíticos (solo valores primitivos como dependencias)
  useEffect(() => {
    if (!isMonitoring && analyticsData) {
      setCurrentData(prev => ({
        ...prev,
        temperature: analyticsData.temperature || prev.temperature,
        airHumidity: analyticsData.airHumidity || prev.airHumidity,
        soilHumidity: analyticsData.temperature || prev.soilHumidity,
        lightLevel: analyticsData.lightLevel || prev.lightLevel,
      }));
    }
  }, [
    isMonitoring,
    analyticsData
  ]);

  // Limpiar métricas acumuladas cuando se detiene el monitoreo
  useEffect(() => {
    if (!isMonitoring) {
      setRealtimeMetrics({});
    }
  }, [isMonitoring]);

  // Acumular métricas recibidas del polling (REST trae todas las métricas de una vez)
  useEffect(() => {
    if (!isMonitoring || !latestMeasurementData) return;

    console.log('📊 [PlantDetailScreen] Procesando medición REST:', latestMeasurementData);

    // REST API trae TODAS las métricas de una vez, no una por una
    const updates = {
      temperature: latestMeasurementData.temperature,
      airHumidity: latestMeasurementData.air_humidity,
      soilHumidity: latestMeasurementData.soil_humidity,
      lightLevel: latestMeasurementData.light_intensity,
    };

    // Actualizar métricas en tiempo real
    setRealtimeMetrics(updates);

    // Actualizar currentData
    setCurrentData(prev => ({
      ...prev,
      temperature: updates.temperature ?? prev.temperature,
      airHumidity: updates.airHumidity ?? prev.airHumidity,
      soilHumidity: updates.soilHumidity ?? prev.soilHumidity,
      lightLevel: updates.lightLevel ?? prev.lightLevel,
      timestamp: new Date(latestMeasurementData.timestamp).toLocaleTimeString('es-ES'),
      date: new Date(latestMeasurementData.timestamp).toLocaleDateString('es-ES'),
    }));
  }, [
    isMonitoring,
    latestMeasurementData
  ]);

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setCurrentData(prev => ({
      ...prev,
      timestamp: now.toLocaleTimeString('es-ES'),
      date: now.toLocaleDateString('es-ES')
    }));
  }, []);

  const getStatusColor = (value: number, type: 'humidity' | 'temperature' | 'light') => {
    if (type === 'humidity') {
      if (value < 40) return '#ef4444';
      if (value > 80) return '#f59e0b';
      return '#22c55e';
    }
    if (type === 'temperature') {
      if (value < 20) return '#3b82f6';
      if (value > 30) return '#ef4444';
      return '#22c55e';
    }
    if (type === 'light') {
      if (value < 200) return '#64748b';
      if (value < 500) return '#f59e0b';
      if (value > 1500) return '#f59e0b';
      return '#22c55e';
    }
    return '#64748b';
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
            onPress={() => {}}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#22c55e" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle de Planta</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Eliminar Planta',
                  `¿Estás seguro de que quieres eliminar la planta "${plant.name}"? Esta acción no se puede deshacer.`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Eliminar',
                      style: 'destructive',
                      onPress: handleDeletePlant
                    },
                  ]
                );
              }}
            >
              <Icon name="delete" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Plant Status Card */}
          <Card style={styles.plantStatusCard}>
            <View style={styles.plantStatusHeader}>
              <Text style={styles.plantStatusTitle}>Estado de la Planta</Text>
            </View>
            <View style={styles.plantImageContainer}>
              <AuthenticatedImage
                uri={getPlantImageUrl(plant)}
                style={styles.plantImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.plantStatusInfo}>
              <View style={[styles.statusBadge, { backgroundColor: hasMicrocontroller ? '#dcfce7' : '#fef3c7' }]}>
                <Text style={[styles.statusBadgeText, { color: hasMicrocontroller ? '#166534' : '#92400e' }]}>
                  {hasMicrocontroller ? 'Activa' : 'Sin Hardware'}
                </Text>
              </View>
              <Text style={styles.lastUpdateText}>
                Última actualización: {isClient ? currentData.timestamp : "--:--:--"}
              </Text>
              <Text style={styles.sensorIdText}>{currentData.sensorId}</Text>
            </View>
            <TouchableOpacity
              style={[styles.monitorButton, { backgroundColor: hasMicrocontroller ? '#22c55e' : '#9ca3af' }]}
              onPress={() => setIsMonitoring(!isMonitoring)}
              disabled={!hasMicrocontroller}
            >
              <Text style={styles.monitorButtonText}>
                {isMonitoring ? 'Pausar Monitoreo' : 'Monitorear en Tiempo Real'}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Plant Info Card */}
          <Card style={styles.plantInfoCard}>
            <View style={styles.plantInfoHeader}>
              <Icon name="eco" size={20} color="#0f766e" />
              <Text style={styles.plantInfoTitle}>Información de la Planta</Text>
            </View>
            <View style={styles.plantInfoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Especie:</Text>
                <Text style={styles.infoValue}>{plant.species || 'No especificada'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estado:</Text>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Activa</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Sensor Data Cards */}
          {(hasMicrocontroller && hasSensor) || hasData || isMonitoring ? (
            <View style={styles.sensorCardsContainer}>
              <SensorDataCard
                icon={<Icon name="thermostat" size={24} color="#ef4444" />}
                title="Temperatura"
                subtitle="Ambiente"
                value={isMonitoring ? currentData.temperature : (getMetricAverage('temperature') || currentData.temperature)}
                unit="°C"
                color={getStatusColor(currentData.temperature, 'temperature')}
                hasData={isMonitoring ? (realtimeMetrics.temperature !== undefined) : hasTemperature}
                onPress={() => setOpenModal('temperature')}
              />
              <SensorDataCard
                icon={<Icon name="opacity" size={24} color="#22c55e" />}
                title="Humedad del Suelo"
                subtitle="Substrato"
                value={isMonitoring ? currentData.soilHumidity : (getMetricAverage('soil_humidity') || currentData.soilHumidity)}
                unit="%"
                color={getStatusColor(currentData.soilHumidity, 'humidity')}
                hasData={isMonitoring ? (realtimeMetrics.soilHumidity !== undefined) : hasSoilHumidity}
                onPress={() => setOpenModal('soil_humidity')}
              />
              <SensorDataCard
                icon={<Icon name="air" size={24} color="#3b82f6" />}
                title="Humedad del Aire"
                subtitle="Ambiente"
                value={isMonitoring ? currentData.airHumidity : (getMetricAverage('air_humidity') || currentData.airHumidity)}
                unit="%"
                color={getStatusColor(currentData.airHumidity, 'humidity')}
                hasData={isMonitoring ? (realtimeMetrics.airHumidity !== undefined) : hasHumidity}
                onPress={() => setOpenModal('air_humidity')}
              />
              <SensorDataCard
                icon={<Icon name="wb-sunny" size={24} color="#f59e0b" />}
                title="Luminosidad"
                subtitle="Lux"
                value={isMonitoring ? currentData.lightLevel : (getMetricAverage('light_intensity') || currentData.lightLevel)}
                unit=" lux"
                color={getStatusColor(currentData.lightLevel, 'light')}
                hasData={isMonitoring ? (realtimeMetrics.lightLevel !== undefined) : hasLight}
                onPress={() => setOpenModal('light_intensity')}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay datos para mostrar.</Text>
              <Text style={styles.noDataSubtext}>Asigna un sensor para empezar a monitorear.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modales de Métricas */}
      <MetricDetailsModal
        visible={openModal === 'temperature'}
        onClose={() => setOpenModal(null)}
        metricType="temperature"
        metrics={allMetrics as any}
        title="Temperatura"
        icon={<Icon name="thermostat" size={32} color="#fff" />}
      />
      
      <MetricDetailsModal
        visible={openModal === 'air_humidity'}
        onClose={() => setOpenModal(null)}
        metricType="air_humidity"
        metrics={allMetrics as any}
        title="Humedad del Aire"
        icon={<Icon name="air" size={32} color="#fff" />}
      />
      
      <MetricDetailsModal
        visible={openModal === 'soil_humidity'}
        onClose={() => setOpenModal(null)}
        metricType="soil_humidity"
        metrics={allMetrics as any}
        title="Humedad del Suelo"
        icon={<Icon name="opacity" size={32} color="#fff" />}
      />
      
      <MetricDetailsModal
        visible={openModal === 'light_intensity'}
        onClose={() => setOpenModal(null)}
        metricType="light_intensity"
        metrics={allMetrics as any}
        title="Luminosidad"
        icon={<Icon name="wb-sunny" size={32} color="#fff" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // emerald-50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  sensorCardsContainer: {
    marginTop: 16,
  },
  noDataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Plant Status Card
  plantStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#a7f3d0', // emerald-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  plantStatusHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
  },
  plantStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46', // emerald-800
  },
  plantImageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  plantImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  plantStatusInfo: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#64748b',
  },
  sensorIdText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
  },
  monitorButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  monitorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Plant Info Card
  plantInfoCard: {
    backgroundColor: '#ecfdf5', // teal-50
    borderWidth: 2,
    borderColor: '#5eead4', // teal-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  plantInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccfbf1',
    gap: 8,
  },
  plantInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e', // teal-800
  },
  plantInfoContent: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  statusIndicator: {
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

  // Error styles
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
});

export default PlantDetailScreen;
