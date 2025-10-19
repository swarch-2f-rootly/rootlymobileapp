import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, isRegistering } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    };
    let isValid = true;

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      });

      Alert.alert(
        'Cuenta creada',
        'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';

      if (error?.response?.status === 400) {
        errorMessage = 'El email ya está registrado. Intenta con otro email.';
      } else if (error?.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  if (isRegistering) {
    return <Loading text="Creando cuenta..." fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Únete a ROOTLY</Text>
            <Text style={styles.subtitle}>Crea tu cuenta y comienza a monitorear</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre"
              value={formData.first_name}
              onChangeText={handleInputChange('first_name')}
              placeholder="Tu nombre"
              autoCapitalize="words"
              error={errors.first_name}
            />

            <Input
              label="Apellido"
              value={formData.last_name}
              onChangeText={handleInputChange('last_name')}
              placeholder="Tu apellido"
              autoCapitalize="words"
              error={errors.last_name}
            />

            <Input
              label="Correo electrónico"
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Crear cuenta"
              onPress={handleSubmit}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <Text style={styles.loginLink} onPress={navigateToLogin}>
                Inicia sesión aquí
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
});

export default RegisterScreen;

