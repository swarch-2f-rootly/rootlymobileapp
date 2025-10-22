import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
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
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      version: '',
      category: 'sensor' as DeviceCategory,
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('Submitting device data:', value);

        // Prepare data for validation (convert empty strings to undefined for optional fields)
        const dataToValidate = {
          ...value,
          description: value.description || undefined,
          version: value.version || undefined,
        };

        console.log('Validated data:', dataToValidate);

        // Create the device
        const createdDevice = await createDeviceMutation.mutateAsync(dataToValidate);
        console.log('Device created successfully:', createdDevice);

        // Show success message
        setShowSuccess(true);

        // Reset form after short delay
        setTimeout(() => {
          form.reset();
          setShowSuccess(false);
        }, 2000);

      } catch (error) {
        console.error('Error creating device:', error);
        Alert.alert(
          'Error',
          'Error al crear el dispositivo. Por favor, verifica los datos e intenta de nuevo.'
        );
      }
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'microcontroller':
        return 'memory';
      case 'sensor':
        return 'sensors';
      default:
        return 'sensors';
    }
  };

  const getCategoryColor = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return category === 'microcontroller' ? '#3b82f6' : '#22c55e';
    }
    return '#64748b';
  };

  const categoryOptions = [
    {
      value: 'microcontroller' as DeviceCategory,
      label: 'Microcontrolador',
      desc: 'Arduino, ESP32, Raspberry Pi'
    },
    {
      value: 'sensor' as DeviceCategory,
      label: 'Sensor',
      desc: 'DHT11, Soil Moisture, Light'
    }
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Icon name="memory" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Nuevo Dispositivo</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Form */}
          <View style={styles.formContainer}>
            <form.Field
              name="name"
              children={(field) => (
                <View style={styles.field}>
                  <Input
                    label="Nombre del Dispositivo *"
                    value={field.state.value}
                    onChangeText={(value) => field.handleChange(value)}
                    placeholder="Ej: Sensor DHT11, Arduino Uno"
                    autoCapitalize="words"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Text style={styles.errorText}>
                      {String(field.state.meta.errors[0])}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Category Field */}
            <form.Field
              name="category"
              children={(field) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Categoría *</Text>
                  <View style={styles.categoryGrid}>
                    {categoryOptions.map((option) => {
                      const isSelected = field.state.value === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.categoryOption,
                            isSelected && styles.categorySelected,
                          ]}
                          onPress={() => field.handleChange(option.value)}
                        >
                          <View style={styles.categoryContent}>
                            <View style={[styles.categoryIcon, isSelected && styles.categoryIconSelected]}>
                              <Icon
                                name={getCategoryIcon(option.value)}
                                size={20}
                                color={isSelected ? '#fff' : getCategoryColor(option.value, isSelected)}
                              />
                            </View>
                            <View style={styles.categoryText}>
                              <Text style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}>
                                {option.label}
                              </Text>
                              <Text style={[styles.categoryDesc, isSelected && styles.categoryDescSelected]}>
                                {option.desc}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {field.state.meta.errors.length > 0 && (
                    <Text style={styles.errorText}>
                      {String(field.state.meta.errors[0])}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Description Field */}
            <form.Field
              name="description"
              children={(field) => (
                <View style={styles.field}>
                  <Input
                    label="Descripción (Opcional)"
                    value={field.state.value || ''}
                    onChangeText={(value) => field.handleChange(value)}
                    placeholder="Describe las características del dispositivo..."
                    multiline
                    numberOfLines={3}
                    style={{ height: 80 }}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Text style={styles.errorText}>
                      {String(field.state.meta.errors[0])}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Version Field */}
            <form.Field
              name="version"
              children={(field) => (
                <View style={styles.field}>
                  <Input
                    label="Versión (Opcional)"
                    value={field.state.value || ''}
                    onChangeText={(value) => field.handleChange(value)}
                    placeholder="Ej: v1.0, Rev A"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Text style={styles.errorText}>
                      {String(field.state.meta.errors[0])}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon name="info" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Los dispositivos se utilizan para conectar sensores y recopilar datos de tus plantas.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  title={isSubmitting ? "Creando..." : "Crear Dispositivo"}
                  onPress={() => form.handleSubmit()}
                  disabled={!canSubmit || !!isSubmitting || createDeviceMutation.isPending}
                  loading={isSubmitting || createDeviceMutation.isPending}
                  style={styles.submitButton}
                />
              )}
            />
          </View>

          {/* Success Message */}
          {showSuccess && (
            <View style={styles.successMessage}>
              <Icon name="check-circle" size={20} color="#22c55e" />
              <View style={styles.messageContent}>
                <Text style={styles.successTitle}>¡Dispositivo creado exitosamente!</Text>
                <Text style={styles.successText}>
                  El dispositivo ha sido registrado y está listo para ser asignado a una planta.
                </Text>
              </View>
            </View>
          )}

          {/* Error Message */}
          {createDeviceMutation.isError && (
            <View style={styles.errorMessage}>
              <Icon name="error" size={20} color="#ef4444" />
              <View style={styles.messageContent}>
                <Text style={styles.errorTitle}>Error al crear el dispositivo</Text>
                <Text style={styles.errorText}>
                  {createDeviceMutation.error?.message || 'Por favor, verifica los datos e intenta de nuevo.'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // blue-50 equivalent
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
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
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categorySelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  categoryContent: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconSelected: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  categoryTitleSelected: {
    color: '#3b82f6',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  categoryDescSelected: {
    color: '#1e40af',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
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
  successMessage: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'flex-start',
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
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
});

export default AddDeviceScreen;

