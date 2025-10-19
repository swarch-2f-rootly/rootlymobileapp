import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreatePlant } from '../../../hooks/usePlants';
import { useUploadPlantPhoto } from '../../../hooks/usePlantMetrics';
import { useAuthStore } from '../../../stores/authStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddPlantScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const createPlantMutation = useCreatePlant();
  const uploadPhotoMutation = useUploadPlantPhoto();

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    species: '',
    description: '',
  });

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Photo selection functions
  const selectPhotoFromGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        setPhotoError('Error al seleccionar la imagen: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedPhoto(asset.uri);
          setPhotoError(null);
        }
      }
    });
  };

  const takePhotoWithCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        setPhotoError('Error al tomar la foto: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedPhoto(asset.uri);
          setPhotoError(null);
        }
      }
    });
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Seleccionar Foto',
      '¿Cómo quieres agregar la foto de la planta?',
      [
        {
          text: 'Tomar Foto',
          onPress: takePhotoWithCamera,
        },
        {
          text: 'Seleccionar de Galería',
          onPress: selectPhotoFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoError(null);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      species: '',
      description: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.species.trim()) {
      newErrors.species = 'La especie es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      // Create the plant first
      const createdPlant = await createPlantMutation.mutateAsync({
        name: formData.name.trim(),
        species: formData.species.trim(),
        description: formData.description.trim() || undefined,
        user_id: user.id,
      });

      console.log('Plant created successfully:', createdPlant);

      // Upload photo if selected
      if (selectedPhoto && createdPlant.id) {
        try {
          console.log('Uploading photo for plant:', createdPlant.id);
          await uploadPhotoMutation.mutateAsync({
            plantId: createdPlant.id,
            photoUri: selectedPhoto
          });
          console.log('Photo uploaded successfully');
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          // Don't fail the entire operation if photo upload fails
          Alert.alert(
            'Planta Creada',
            'La planta se creó exitosamente, pero hubo un error al subir la foto. Puedes subirla después desde la pantalla de detalles.',
            [{ text: 'OK' }]
          );
        }
      }

      Alert.alert(
        '¡Éxito!',
        'Planta creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating plant:', error);
      let errorMessage = 'Error al crear la planta. Inténtalo de nuevo.';

      if (error?.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Error en los datos proporcionados.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  if (createPlantMutation.isPending || uploadPhotoMutation.isPending) {
    return <Loading text={createPlantMutation.isPending ? "Creando planta..." : "Subiendo foto..."} fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="arrow-back" size={24} color="#22c55e" onPress={() => navigation.goBack()} />
            <Text style={styles.headerTitle}>Nueva Planta</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Icon name="grass" size={48} color="#22c55e" />
            </View>
            <Text style={styles.iconText}>Agrega una nueva planta</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre de la planta"
              value={formData.name}
              onChangeText={handleInputChange('name')}
              placeholder="Ej: Mi Planta de Tomate"
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="Especie"
              value={formData.species}
              onChangeText={handleInputChange('species')}
              placeholder="Ej: Solanum lycopersicum"
              error={errors.species}
              autoCapitalize="words"
            />

            <Input
              label="Descripción (opcional)"
              value={formData.description}
              onChangeText={handleInputChange('description')}
              placeholder="Información adicional sobre la planta..."
              multiline
              numberOfLines={3}
              error={errors.description}
              style={{ height: 80 }}
            />

            {/* Photo Upload Section */}
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Foto de la Planta (Opcional)</Text>

              {selectedPhoto ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: selectedPhoto }} style={styles.photoPreview} />
                  <View style={styles.photoActions}>
                    <TouchableOpacity style={styles.photoActionButton} onPress={showPhotoOptions}>
                      <Icon name="edit" size={20} color="#22c55e" />
                      <Text style={styles.photoActionText}>Cambiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoActionButton} onPress={removePhoto}>
                      <Icon name="delete" size={20} color="#ef4444" />
                      <Text style={[styles.photoActionText, { color: '#ef4444' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.photoUploadArea} onPress={showPhotoOptions}>
                  <View style={styles.photoUploadIcon}>
                    <Icon name="camera-alt" size={32} color="#22c55e" />
                  </View>
                  <Text style={styles.photoUploadText}>Toca para agregar una foto</Text>
                  <Text style={styles.photoUploadSubtext}>Puedes tomar una foto o seleccionar de la galería</Text>
                </TouchableOpacity>
              )}

              {photoError ? (
                <Text style={styles.photoError}>{photoError}</Text>
              ) : null}
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color="#22c55e" />
              <Text style={styles.infoText}>
                La descripción es opcional pero te ayudará a recordar detalles importantes sobre tu planta.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Crear Planta"
              onPress={handleSubmit}
              loading={createPlantMutation.isPending}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
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
    marginBottom: 32,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  submitButton: {
    marginBottom: 12,
  },
  // Photo upload styles
  photoSection: {
    marginTop: 16,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
    marginLeft: 4,
  },
  photoUploadArea: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  photoUploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  photoError: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AddPlantScreen;

