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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateDevice } from '../../../hooks/useDevices';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DeviceCategory } from '../../../types/devices';

const AddDeviceScreen: React.FC = () => {
  const navigation = useNavigation();
  const createDeviceMutation = useCreateDevice();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    category: 'sensor' as DeviceCategory,
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    version: '',
    category: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      version: '',
      category: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
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

  const handleCategorySelect = (category: DeviceCategory) => {
    setFormData(prev => ({ ...prev, category }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createDeviceMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        version: formData.version.trim() || undefined,
        category: formData.category,
      });

      Alert.alert(
        '¡Éxito!',
        'Dispositivo creado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating device:', error);
      let errorMessage = 'Error al crear el dispositivo. Inténtalo de nuevo.';

      if (error?.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Error en los datos proporcionados.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const categoryOptions = [
    {
      value: 'sensor' as DeviceCategory,
      label: 'Sensor',
      icon: 'sensors',
      description: 'Dispositivo para medir variables ambientales',
    },
    {
      value: 'microcontroller' as DeviceCategory,
      label: 'Microcontrolador',
      icon: 'memory',
      description: 'Dispositivo de control y procesamiento',
    },
  ];

  if (createDeviceMutation.isPending) {
    return <Loading text="Creando dispositivo..." fullScreen />;
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
            <Text style={styles.headerTitle}>Nuevo Dispositivo</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Icon name="devices" size={48} color="#22c55e" />
            </View>
            <Text style={styles.iconText}>Agrega un nuevo dispositivo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre del dispositivo"
              value={formData.name}
              onChangeText={handleInputChange('name')}
              placeholder="Ej: Sensor de Humedad DHT22"
              error={errors.name}
              autoCapitalize="words"
            />

            <View style={styles.categorySection}>
              <Text style={styles.categoryLabel}>Categoría</Text>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryOption,
                    formData.category === option.value && styles.categorySelected,
                  ]}
                  onPress={() => handleCategorySelect(option.value)}
                >
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryIcon}>
                      <Icon
                        name={option.icon}
                        size={24}
                        color={formData.category === option.value ? '#22c55e' : '#64748b'}
                      />
                    </View>
                    <View style={styles.categoryText}>
                      <Text style={[
                        styles.categoryTitle,
                        formData.category === option.value && styles.categoryTitleSelected,
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.categoryDescription,
                        formData.category === option.value && styles.categoryDescriptionSelected,
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {formData.category === option.value && (
                    <Icon name="check-circle" size={24} color="#22c55e" />
                  )}
                </TouchableOpacity>
              ))}
              {errors.category ? (
                <Text style={styles.categoryError}>{errors.category}</Text>
              ) : null}
            </View>

            <Input
              label="Versión (opcional)"
              value={formData.version}
              onChangeText={handleInputChange('version')}
              placeholder="Ej: v1.0.0"
              error={errors.version}
            />

            <Input
              label="Descripción (opcional)"
              value={formData.description}
              onChangeText={handleInputChange('description')}
              placeholder="Información adicional sobre el dispositivo..."
              multiline
              numberOfLines={3}
              error={errors.description}
              style={{ height: 80 }}
            />

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color="#22c55e" />
              <Text style={styles.infoText}>
                Los dispositivos se utilizan para conectar sensores y recopilar datos de tus plantas.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Crear Dispositivo"
              onPress={handleSubmit}
              loading={createDeviceMutation.isPending}
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
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  categorySelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryTitleSelected: {
    color: '#22c55e',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  categoryDescriptionSelected: {
    color: '#166534',
  },
  categoryError: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
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
});

export default AddDeviceScreen;

