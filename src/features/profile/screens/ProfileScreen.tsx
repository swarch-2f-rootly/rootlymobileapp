import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
  });
  const [editErrors, setEditErrors] = useState({
    first_name: '',
    last_name: '',
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name,
        last_name: user.last_name,
      });
      setShowEditModal(true);
    }
  };

  const handleEditInputChange = (field: keyof typeof editForm) => (value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {
      first_name: '',
      last_name: '',
    };
    let isValid = true;

    if (!editForm.first_name.trim()) {
      errors.first_name = 'El nombre es requerido';
      isValid = false;
    }

    if (!editForm.last_name.trim()) {
      errors.last_name = 'El apellido es requerido';
      isValid = false;
    }

    setEditErrors(errors);
    return isValid;
  };

  const handleSaveProfile = () => {
    if (!validateEditForm()) return;

    // In a real app, this would call an API to update the profile
    // For now, just show a success message
    Alert.alert(
      'Perfil actualizado',
      'Los cambios han sido guardados exitosamente.',
      [
        {
          text: 'OK',
          onPress: () => setShowEditModal(false),
        },
      ]
    );
  };

  if (!user) {
    return <Loading text="Cargando perfil..." fullScreen />;
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#22c55e' : '#ef4444';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysActive = () => {
    const createdDate = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoggingOut) {
    return <Loading text="Cerrando sesión..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color="#22c55e" />
          </View>
          <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="person" size={24} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>{user.first_name} {user.last_name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="email" size={24} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="verified-user" size={24} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Estado de la cuenta</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(user.is_active) },
                    ]}
                  />
                  <Text style={styles.infoValue}>{getStatusText(user.is_active)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="group" size={24} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Roles</Text>
                <Text style={styles.infoValue}>
                  {user.roles.length > 0 ? user.roles.join(', ') : 'Usuario estándar'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{getDaysActive()}</Text>
              <Text style={styles.statLabel}>Días activo</Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>
                {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short' })}
              </Text>
              <Text style={styles.statLabel}>Miembro desde</Text>
            </Card>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountContainer}>
          <Text style={styles.sectionTitle}>Información de la cuenta</Text>
          <Card style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>ID de usuario:</Text>
              <Text style={styles.accountValue}>{user.id.slice(0, 8)}...</Text>
            </View>

            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Fecha de creación:</Text>
              <Text style={styles.accountValue}>{formatDate(user.created_at)}</Text>
            </View>

            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Última actualización:</Text>
              <Text style={styles.accountValue}>{formatDate(user.updated_at)}</Text>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Editar Perfil"
            onPress={handleEditProfile}
            variant="outline"
            style={styles.editButton}
          />
          <Button
            title="Cerrar sesión"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Input
                label="Nombre"
                value={editForm.first_name}
                onChangeText={handleEditInputChange('first_name')}
                placeholder="Tu nombre"
                autoCapitalize="words"
                error={editErrors.first_name}
              />

              <Input
                label="Apellido"
                value={editForm.last_name}
                onChangeText={handleEditInputChange('last_name')}
                placeholder="Tu apellido"
                autoCapitalize="words"
                error={editErrors.last_name}
              />

              <View style={styles.emailInfo}>
                <Text style={styles.emailInfoText}>
                  El email no se puede modificar desde aquí.
                </Text>
                <Text style={styles.currentEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                onPress={() => setShowEditModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Guardar Cambios"
                onPress={handleSaveProfile}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
  },
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  accountContainer: {
    padding: 20,
    paddingTop: 0,
  },
  accountCard: {
    padding: 16,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  accountValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  editButton: {
    marginBottom: 0,
  },
  logoutButton: {
    marginBottom: 0,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    marginBottom: 20,
  },
  emailInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  emailInfoText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  currentEmail: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ProfileScreen;
