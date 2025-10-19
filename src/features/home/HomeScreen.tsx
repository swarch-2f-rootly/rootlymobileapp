import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { usePlants } from '../../hooks/usePlants';
import { useDevices } from '../../hooks/useDevices';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data: plants, isLoading: plantsLoading } = usePlants();
  const { data: devices, isLoading: devicesLoading } = useDevices();

  const navigateToPlants = () => {
    navigation.navigate('Plants' as never);
  };

  const navigateToDevices = () => {
    navigation.navigate('Devices' as never);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  if (plantsLoading || devicesLoading) {
    return <Loading text="Cargando datos..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>¡Hola!</Text>
            <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          </View>
          <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
            <Icon name="person" size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="grass" size={32} color="#22c55e" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{plants?.length || 0}</Text>
                <Text style={styles.statLabel}>Plantas</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="devices" size={32} color="#22c55e" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{devices?.length || 0}</Text>
                <Text style={styles.statLabel}>Dispositivos</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToPlants}>
            <View style={styles.actionContent}>
              <Icon name="add" size={24} color="#fff" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Agregar Planta</Text>
                <Text style={styles.actionSubtitle}>Monitorea una nueva planta</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToDevices}>
            <View style={styles.actionContent}>
              <Icon name="add" size={24} color="#fff" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Agregar Dispositivo</Text>
                <Text style={styles.actionSubtitle}>Configura un nuevo sensor</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Placeholder */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <Card style={styles.activityCard}>
            <Text style={styles.activityText}>
              Bienvenido a ROOTLY Mobile. Comienza agregando tus primeras plantas y dispositivos para comenzar a monitorear.
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '400',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
  },
  activityContainer: {
    padding: 20,
    paddingTop: 0,
  },
  activityCard: {
    padding: 16,
  },
  activityText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default HomeScreen;

