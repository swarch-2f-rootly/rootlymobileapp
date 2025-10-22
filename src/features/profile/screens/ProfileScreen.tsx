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
  Image,
} from 'react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useUploadProfilePhoto, useDeleteProfilePhoto } from '../../../hooks/useFile';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const deletePhotoMutation = useDeleteProfilePhoto();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
  });
  const [editErrors, setEditErrors] = useState({
    first_name: '',
    last_name: '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  // Photo handling functions
  const selectPhotoFromGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', 'Error al seleccionar la imagen: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedPhoto(asset.uri);
          setPhotoPreview(asset.uri);
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
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', 'Error al tomar la foto: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedPhoto(asset.uri);
          setPhotoPreview(asset.uri);
        }
      }
    });
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Seleccionar Foto',
      '¿Cómo quieres agregar la foto de perfil?',
      [
        { text: 'Tomar Foto', onPress: takePhotoWithCamera },
        { text: 'Seleccionar de Galería', onPress: selectPhotoFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleUploadPhoto = async () => {
    if (selectedPhoto && user?.id) {
      try {
        await uploadPhotoMutation.mutateAsync({
          userId: user.id,
          photoUri: selectedPhoto
        });

        Alert.alert(
          'Foto subida',
          'La foto de perfil se ha subido exitosamente.',
          [{ text: 'OK', onPress: () => {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
            setPhotoPreview(null);
          }}]
        );
      } catch (error) {
        console.error('Error uploading photo:', error);
        Alert.alert('Error', 'Error al subir la foto. Inténtalo de nuevo.');
      }
    }
  };

  const handleDeletePhoto = () => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          if (user?.id) {
            try {
              await deletePhotoMutation.mutateAsync(user.id);
              Alert.alert('Foto eliminada', 'La foto de perfil se ha eliminado exitosamente.');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Error al eliminar la foto. Inténtalo de nuevo.');
            }
          }
        }},
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowPhotoModal(true)}
          >
            {user.profile_photo_url || photoPreview ? (
              <Image
                source={{
                  uri: photoPreview || user.profile_photo_url ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Icon name="person" size={48} color="#22c55e" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Icon name="camera-alt" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
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

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Foto de Perfil</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {photoPreview || user.profile_photo_url ? (
                <View style={styles.photoPreviewContainer}>
                  <Image
                    source={{ uri: photoPreview || user.profile_photo_url }}
                    style={styles.photoPreview}
                  />
                </View>
              ) : (
                <View style={styles.noPhotoContainer}>
                  <View style={styles.noPhotoIcon}>
                    <Icon name="person" size={48} color="#64748b" />
                  </View>
                  <Text style={styles.noPhotoText}>No tienes foto de perfil</Text>
                </View>
              )}

              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={showPhotoOptions}
                >
                  <Icon name="camera-alt" size={20} color="#22c55e" />
                  <Text style={styles.photoActionText}>
                    {photoPreview || user.profile_photo_url ? 'Cambiar Foto' : 'Agregar Foto'}
                  </Text>
                </TouchableOpacity>

                {(photoPreview || user.profile_photo_url) && (
                  <TouchableOpacity
                    style={[styles.photoActionButton, styles.deleteButton]}
                    onPress={handleDeletePhoto}
                  >
                    <Icon name="delete" size={20} color="#ef4444" />
                    <Text style={[styles.photoActionText, styles.deleteText]}>Eliminar Foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {selectedPhoto && (
              <View style={styles.modalFooter}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title="Subir Foto"
                  onPress={handleUploadPhoto}
                  style={styles.saveButton}
                  loading={uploadPhotoMutation.isPending}
                />
              </View>
            )}
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  noPhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noPhotoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  noPhotoText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  photoActions: {
    gap: 12,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoActionText: {
    fontSize: 16,
    color: '#22c55e',
    marginLeft: 8,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  deleteText: {
    color: '#ef4444',
  },
});

export default ProfileScreen;
