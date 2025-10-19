import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useDevices } from '../../../hooks/useDevices';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Device } from '../../../types/devices';

interface PlantDevicesManagerProps {
  plantId: string;
  plantName: string;
}

export const PlantDevicesManager: React.FC<PlantDevicesManagerProps> = ({
  plantId,
  plantName,
}) => {
  const { data: allDevices, isLoading } = useDevices();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Mock data for devices assigned to this plant (in a real app, this would come from an API)
  const [assignedDevices, setAssignedDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Sensor DHT22',
      description: 'Sensor de temperatura y humedad',
      version: '1.0.0',
      category: 'sensor',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Arduino Mega',
      description: 'Microcontrolador principal',
      version: '2.1.0',
      category: 'microcontroller',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
    },
  ]);

  // Filter available devices (not assigned to this plant)
  const availableDevices = allDevices?.filter(device =>
    !assignedDevices.some(assigned => assigned.id === device.id)
  ) || [];

  const handleAssignDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowAssignModal(true);
  };

  const confirmAssignDevice = () => {
    if (selectedDevice) {
      setAssignedDevices(prev => [...prev, selectedDevice]);
      setSelectedDevice(null);
      setShowAssignModal(false);
      Alert.alert('Éxito', `Dispositivo asignado a ${plantName}`);
    }
  };

  const handleRemoveDevice = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Remover Dispositivo',
      `¿Estás seguro de que quieres remover "${deviceName}" de ${plantName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setAssignedDevices(prev => prev.filter(device => device.id !== deviceId));
            Alert.alert('Éxito', 'Dispositivo removido exitosamente');
          },
        },
      ]
    );
  };

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

  const renderAssignedDevice = ({ item }: { item: Device }) => (
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
          {item.description && (
            <Text style={styles.deviceDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveDevice(item.id, item.name)}
          style={styles.removeButton}
        >
          <Icon name="remove-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
      {item.version && (
        <Text style={styles.deviceVersion}>Versión: {item.version}</Text>
      )}
    </Card>
  );

  const renderAvailableDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.availableDevice}
      onPress={() => handleAssignDevice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.availableDeviceContent}>
        <View style={[styles.deviceIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
          <Icon name={getCategoryIcon(item.category)} size={20} color={getCategoryColor(item.category)} />
        </View>
        <View style={styles.availableDeviceInfo}>
          <Text style={styles.availableDeviceName}>{item.name}</Text>
          <Text style={styles.availableDeviceCategory}>
            {item.category === 'microcontroller' ? 'Microcontrolador' : 'Sensor'}
          </Text>
        </View>
        <Icon name="add" size={20} color="#22c55e" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text style={styles.loadingText}>Cargando dispositivos...</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Assigned Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dispositivos Asignados ({assignedDevices.length})</Text>
        {assignedDevices.length > 0 ? (
          <FlatList
            data={assignedDevices}
            renderItem={renderAssignedDevice}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Icon name="devices-other" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>No hay dispositivos asignados</Text>
            <Text style={styles.emptySubtext}>
              Asigna dispositivos para monitorear esta planta
            </Text>
          </Card>
        )}
      </View>

      {/* Assign Device Button */}
      {availableDevices.length > 0 && (
        <Button
          title={`Asignar Dispositivo (${availableDevices.length} disponibles)`}
          onPress={() => setShowAssignModal(true)}
          style={styles.assignButton}
        />
      )}

      {/* Assign Device Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asignar Dispositivo</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Selecciona un dispositivo para asignar a {plantName}
            </Text>

            {availableDevices.length > 0 ? (
              <FlatList
                data={availableDevices}
                renderItem={renderAvailableDevice}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noDevices}>
                <Icon name="info" size={32} color="#cbd5e1" />
                <Text style={styles.noDevicesText}>No hay dispositivos disponibles</Text>
              </View>
            )}

            {selectedDevice && (
              <View style={styles.selectedDevice}>
                <Text style={styles.selectedText}>
                  Dispositivo seleccionado: {selectedDevice.name}
                </Text>
                <Button
                  title="Confirmar Asignación"
                  onPress={confirmAssignDevice}
                  style={styles.confirmButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  deviceCard: {
    marginBottom: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  deviceCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  deviceDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  deviceVersion: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  removeButton: {
    padding: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  assignButton: {
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 300,
  },
  availableDevice: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  availableDeviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDeviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  availableDeviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  availableDeviceCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  noDevices: {
    alignItems: 'center',
    padding: 40,
  },
  noDevicesText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  selectedDevice: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  selectedText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#22c55e',
  },
});

