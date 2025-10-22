import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlants } from '../../../hooks/usePlants';
import { Card } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import { AuthenticatedImage } from '../../../components/ui/AuthenticatedImage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Plant } from '../../../types/plants';
import { getPlantImageUrl } from '../../../utils/plantUtils';

const PlantsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: plants, isLoading, error, refetch } = usePlants();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plants?.filter((plant) => {
    const matchesSearch = searchTerm === '' ||
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  }) || [];

  const handlePlantPress = (plant: Plant) => {
    navigation.navigate('PlantDetail' as never, { plantId: plant.id } as never);
  };

  const handleAddPlant = () => {
    navigation.navigate('AddPlant' as never);
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={styles.plantItem}
      onPress={() => handlePlantPress(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.plantCard}>
        {/* Plant Image Background */}
        <View style={styles.plantImageSection}>
          <AuthenticatedImage
            uri={getPlantImageUrl(item)}
            style={styles.plantBackgroundImage}
            resizeMode="cover"
          />
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Activa</Text>
          </View>
        </View>

        {/* Plant Info Section */}
        <View style={styles.plantContent}>
          <View style={styles.plantHeader}>
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{item.name}</Text>
              <Text style={styles.plantSpecies}>{item.species}</Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.plantDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.plantFooter}>
            <Text style={styles.plantDate}>
              Creada: {new Date(item.created_at).toLocaleDateString('es-ES')}
            </Text>
            {item.photo_filename && (
              <Text style={styles.photoIndicator}>📷 Con foto</Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="grass" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No hay plantas</Text>
      <Text style={styles.emptyText}>
        Comienza agregando tu primera planta para monitorearla
      </Text>
      <Button
        title="Agregar primera planta"
        onPress={handleAddPlant}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="error" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Error al cargar plantas</Text>
      <Text style={styles.errorText}>
        Ocurrió un error al cargar la lista de plantas
      </Text>
      <Button
        title="Reintentar"
        onPress={() => refetch()}
        style={styles.errorButton}
      />
    </View>
  );

  if (isLoading) {
    return <Loading text="Cargando plantas..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="grass" size={28} color="#22c55e" />
          <Text style={styles.headerTitle}>Plantas</Text>
        </View>
        <TouchableOpacity onPress={handleAddPlant} style={styles.addButton}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsNumber}>{plants?.length || 0}</Text>
          <Text style={styles.statsLabel}>Plantas monitoreadas</Text>
        </Card>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar plantas..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#64748b"
          />
          {searchTerm !== '' && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Icon name="clear" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantItem}
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
  searchContainer: {
    padding: 20,
    paddingTop: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  plantItem: {
    marginBottom: 16,
  },
  plantCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
  },
  plantImageSection: {
    position: 'relative',
    width: '100%',
    height: 144,
    backgroundColor: '#f0fdf4',
  },
  plantBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  plantContent: {
    padding: 16,
  },
  plantHeader: {
    marginBottom: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: 12,
    color: '#64748b',
  },
  plantDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  plantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.3)',
  },
  plantDate: {
    fontSize: 12,
    color: '#64748b',
  },
  photoIndicator: {
    fontSize: 12,
    color: '#22c55e',
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

export default PlantsListScreen;

