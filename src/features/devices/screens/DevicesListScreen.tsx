import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDevices } from '../../../hooks/useDevices';
import { Card } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Device } from '../../../types/devices';

const DevicesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: devices, isLoading, error, refetch } = useDevices();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'microcontroller':
        return 'memory';
      case 'sensor':
        return 'sensors';
      default:
        return 'devices';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'microcontroller':
        return '#3b82f6';
      case 'sensor':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <Card style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={[styles.deviceIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
          <Icon name={getCategoryIcon(item.category)} size={24} color={getCategoryColor(item.category)} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceCategory}>
            {item.category === 'microcontroller' ? 'Microcontrolador' : 'Sensor'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.deviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.version && (
        <Text style={styles.deviceVersion}>Versión: {item.version}</Text>
      )}

      <View style={styles.deviceFooter}>
        <Text style={styles.deviceDate}>
          Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="devices" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No hay dispositivos</Text>
      <Text style={styles.emptyText}>
        Comienza agregando tu primer dispositivo para conectar sensores
      </Text>
      <Button
        title="Agregar dispositivo"
        onPress={() => navigation.navigate('AddDevice' as never)}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="error" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Error al cargar dispositivos</Text>
      <Text style={styles.errorText}>
        Ocurrió un error al cargar la lista de dispositivos
      </Text>
      <Button
        title="Reintentar"
        onPress={() => refetch()}
        style={styles.errorButton}
      />
    </View>
  );

  if (isLoading) {
    return <Loading text="Cargando dispositivos..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="devices" size={28} color="#22c55e" />
          <Text style={styles.headerTitle}>Dispositivos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDevice' as never)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsNumber}>{devices?.length || 0}</Text>
          <Text style={styles.statsLabel}>Dispositivos conectados</Text>
        </Card>
      </View>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={devices || []}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading}
          onRefresh={() => refetch()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    padding: 20,
    paddingTop: 0,
  },
  statsCard: {
    alignItems: 'center',
    padding: 20,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  deviceCard: {
    marginBottom: 12,
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  deviceCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  deviceDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  deviceVersion: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  deviceFooter: {
    alignItems: 'flex-end',
  },
  deviceDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 200,
  },
  errorState: {
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
  errorButton: {
    minWidth: 150,
  },
});

export default DevicesListScreen;

