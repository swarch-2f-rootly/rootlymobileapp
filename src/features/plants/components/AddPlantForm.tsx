import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import { useCreatePlant } from '../../../hooks/usePlants';
import { useUploadPlantPhoto } from '../../../hooks/usePlantMetrics';
import { useAuthStore } from '../../../stores/authStore';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddPlantForm: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const createPlantMutation = useCreatePlant();
  const uploadPhotoMutation = useUploadPlantPhoto();

  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string; size: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
        setUploadError('Error al seleccionar la imagen: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri && asset.fileName && asset.type && asset.fileSize) {
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName,
            type: asset.type,
            size: asset.fileSize,
          });
          setPreviewUrl(asset.uri);
          setUploadError(null);
        }
      }
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de Cámara',
            message: 'La aplicación necesita acceso a tu cámara para tomar fotos de las plantas.',
            buttonNeutral: 'Preguntar Luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Permiso Denegado',
        'Necesitas otorgar permiso de cámara para tomar fotos. Ve a Configuración > Aplicaciones > Rootly > Permisos y activa el permiso de cámara.',
        [{ text: 'OK' }]
      );
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      saveToPhotos: false,
      cameraType: 'back' as 'back' | 'front',
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        setUploadError('Error al tomar la foto: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri && asset.fileName && asset.type && asset.fileSize) {
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName,
            type: asset.type,
            size: asset.fileSize,
          });
          setPreviewUrl(asset.uri);
          setUploadError(null);
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
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const form = useForm({
    defaultValues: {
      name: '',
      species: '',
      description: '',
      user_id: user?.id || '',
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('Submitting plant data:', value);

        // Validate that user_id exists
        if (!user?.id) {
          throw new Error('Usuario no autenticado');
        }

        // Update user_id in case it changed
        const plantData = {
          ...value,
          user_id: user.id
        };

        // Create the plant first
        const createdPlant = await createPlantMutation.mutateAsync(plantData);
        console.log('Plant created successfully:', createdPlant);

        // Upload photo if selected
        if (selectedFile && createdPlant.id) {
          try {
            console.log('Uploading photo for plant:', createdPlant.id);
            await uploadPhotoMutation.mutateAsync({
              plantId: createdPlant.id,
              photoUri: selectedFile.uri
            });
            console.log('Photo uploaded successfully');
          } catch (photoError) {
            console.error('Error uploading photo:', photoError);
            setUploadError('La planta se creó pero hubo un error al subir la foto');
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
      } catch (error) {
        console.error('Error creating plant:', error);
        Alert.alert('Error', 'Error al crear la planta. Por favor, verifica los datos e intenta de nuevo.');
      }
    },
  });

  const handleFileChange = () => {
    showPhotoOptions();
  };

  if (createPlantMutation.isPending || uploadPhotoMutation.isPending) {
    return <Loading text={createPlantMutation.isPending ? "Creando planta..." : "Subiendo foto..."} fullScreen />;
  }

  return (
    <>
      {/* Form */}
      <View style={styles.form}>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              console.log('🔍 Validating name:', value);
              return value && value.length < 1 ? 'El nombre es requerido' : undefined;
            },
          }}
          children={(field) => (
            <View style={styles.field}>
              <Input
                label="Nombre de la Planta *"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={(value) => field.handleChange(value)}
                placeholder="Ej: Tomate Cherry"
                error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
                autoCapitalize="words"
              />
            </View>
          )}
        />

        <form.Field
          name="species"
          validators={{
            onChange: ({ value }) => {
              console.log('🔍 Validating species:', value);
              return value && value.length < 1 ? 'La especie es requerida' : undefined;
            },
          }}
          children={(field) => (
            <View style={styles.field}>
              <Text style={styles.label}>Especie *</Text>
              <TouchableOpacity
                style={[styles.selectContainer, field.state.meta.errors.length > 0 && styles.selectError]}
                onPress={() => {
                  Alert.alert(
                    'Seleccionar Especie',
                    'Elige la especie de tu planta',
                    [
                      { text: 'Tomate', onPress: () => field.handleChange('Tomate') },
                      { text: 'Lechuga', onPress: () => field.handleChange('Lechuga') },
                      { text: 'Pimiento', onPress: () => field.handleChange('Pimiento') },
                      { text: 'Zanahoria', onPress: () => field.handleChange('Zanahoria') },
                      { text: 'Cebolla', onPress: () => field.handleChange('Cebolla') },
                      { text: 'Ajo', onPress: () => field.handleChange('Ajo') },
                      { text: 'Perejil', onPress: () => field.handleChange('Perejil') },
                      { text: 'Albahaca', onPress: () => field.handleChange('Albahaca') },
                      { text: 'Otra', onPress: () => field.handleChange('Otra') },
                      { text: 'Cancelar', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={[styles.selectText, !field.state.value && styles.selectPlaceholder]}>
                  {field.state.value || 'Seleccionar especie'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#64748b" />
              </TouchableOpacity>
              {field.state.meta.errors.length > 0 && (
                <Text style={styles.errorText}>{String(field.state.meta.errors[0])}</Text>
              )}
            </View>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <View style={styles.field}>
              <Input
                label="Descripción (Opcional)"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={(value) => field.handleChange(value)}
                placeholder="Describe las características especiales de tu planta..."
                multiline
                numberOfLines={3}
                style={{ height: 80 }}
              />
            </View>
          )}
        />

        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Foto de la Planta (Opcional)</Text>

          {previewUrl ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: previewUrl }} style={styles.photoPreview} />
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
            <TouchableOpacity style={styles.photoUploadArea} onPress={handleFileChange}>
              <View style={styles.photoUploadIcon}>
                <Icon name="camera-alt" size={32} color="#22c55e" />
              </View>
              <Text style={styles.photoUploadText}>Toca para agregar una foto</Text>
              <Text style={styles.photoUploadSubtext}>
                Puedes tomar una foto o seleccionar de la galería
              </Text>
            </TouchableOpacity>
          )}

          {/* File Info */}
          {selectedFile && (
            <View style={styles.fileInfo}>
              <Icon name="image" size={16} color="#22c55e" />
              <Text style={styles.fileInfoText}>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Text>
            </View>
          )}

          {/* Upload Error */}
          {uploadError && (
            <Text style={styles.photoError}>{uploadError}</Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="info" size={20} color="#22c55e" />
          <Text style={styles.infoText}>
            La descripción es opcional pero te ayudará a recordar detalles importantes sobre tu planta.
          </Text>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
            children={({ canSubmit, isSubmitting }) => (
              <Button
                title={isSubmitting ? "Creando..." : "Crear Planta"}
                onPress={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            )}
          />
        </View>
      </View>

      {/* Success/Error Messages */}
      {createPlantMutation.isError && (
        <View style={styles.errorMessage}>
          <Icon name="error" size={20} color="#ef4444" />
          <View style={styles.messageContent}>
            <Text style={styles.errorTitle}>Error al crear la planta</Text>
            <Text style={styles.errorText}>
              {createPlantMutation.error?.message || 'Por favor, verifica los datos e intenta de nuevo.'}
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  selectError: {
    borderColor: '#ef4444',
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
  },
  selectPlaceholder: {
    color: '#64748b',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  photoSection: {
    marginTop: 8,
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
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  fileInfoText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
  photoError: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
  },
  errorMessage: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  messageContent: {
    marginLeft: 12,
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
});

export default AddPlantForm;
