import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const LandingScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const stats = [
    { value: "4", suffix: "", label: "Tipos de Medición", change: "Disponibles", icon: "thermostat", color: "#22c55e" },
    { value: "Auto", suffix: "", label: "Monitoreo Automático", change: "Programable", icon: "water-drop", color: "#0d9488" },
    { value: "IoT", suffix: "", label: "Tecnología", change: "Conectividad", icon: "bolt", color: "#0891b2" },
    { value: "Web", suffix: "", label: "Acceso Remoto", change: "Desde Cualquier Lugar", icon: "wifi", color: "#22c55e" }
  ];

  const features = [
    "Recopilación y procesamiento de datos de sensores en tiempo real",
    "Análisis avanzado con modelado predictivo",
    "Alertas y recomendaciones automatizadas",
    "Panel colaborativo para información del equipo",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22c55e" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={styles.badge}>
              <Icon name="bolt" size={16} color="#22c55e" />
              <Text style={styles.badgeText}>AgriTech de Próxima Generación</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              La solución completa{'\n'}para monitorear{'\n'}
              <Text style={styles.titleHighlight}>cultivos.</Text>
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              El conjunto de herramientas de tu granja para dejar de adivinar y empezar a optimizar. Recopila, analiza y escala datos agrícolas de forma segura con ROOTLY.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Iniciar Monitoreo"
                onPress={navigateToLogin}
                style={styles.primaryButton}
              />
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Explorar la Plataforma</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dashboard Preview */}
          <View style={styles.dashboardPreview}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>Monitoreo en Tiempo Real</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>En Vivo</Text>
              </View>
            </View>

            {/* Chart Placeholder */}
            <View style={styles.chartContainer}>
              {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90].map((height, i) => (
                <View
                  key={i}
                  style={[styles.chartBar, { height: (height / 100) * 120 }]}
                />
              ))}
            </View>

            {/* Status Cards */}
            <View style={styles.statusCards}>
              <View style={styles.statusCard}>
                <Icon name="storage" size={20} color="#22c55e" />
                <Text style={styles.statusCardText}>Conectado</Text>
              </View>
              <View style={styles.statusCard}>
                <Icon name="wifi" size={20} color="#0d9488" />
                <Text style={styles.statusCardText}>En Línea</Text>
              </View>
              <View style={styles.statusCard}>
                <Icon name="trending-up" size={20} color="#0891b2" />
                <Text style={styles.statusCardText}>Optimizado</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}{stat.suffix}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
            </Card>
          ))}
        </View>

        {/* Collaboration Section */}
        <View style={styles.collaborationSection}>
          <View style={styles.collaborationContent}>
            <View style={styles.collaborationText}>
              <View style={styles.collaborationBadge}>
                <Icon name="bolt" size={16} color="#22c55e" />
                <Text style={styles.collaborationBadgeText}>Colaboración</Text>
              </View>

              <Text style={styles.collaborationTitle}>
                Haz que la agricultura sea{'\n'}
                <Text style={styles.collaborationHighlight}>inteligente</Text>
              </Text>

              <Text style={styles.collaborationSubtitle}>
                Herramientas para tu equipo y partes interesadas para compartir información e iterar más rápido.
              </Text>

              {/* Features List */}
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Dashboard Mockup */}
            <Card style={styles.collaborationDashboard}>
              <Text style={styles.dashboardMockupTitle}>Panel de Control</Text>
              <View style={styles.dashboardMockup}>
                <View style={styles.mockupRow}>
                  <View style={styles.mockupCard}>
                    <Text style={styles.mockupValue}>24°C</Text>
                    <Text style={styles.mockupLabel}>Temperatura</Text>
                  </View>
                  <View style={styles.mockupCard}>
                    <Text style={styles.mockupValue}>65%</Text>
                    <Text style={styles.mockupLabel}>Humedad</Text>
                  </View>
                </View>
                <View style={styles.mockupChart}>
                  <Text style={styles.mockupChartTitle}>Tendencia 24h</Text>
                  <View style={styles.mockupChartBars}>
                    {[30, 45, 60, 35, 70, 55].map((height, i) => (
                      <View key={i} style={[styles.mockupBar, { height: height }]} />
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* About Us Section */}
        <View style={styles.aboutSection}>
          <View style={styles.aboutContent}>
            <View style={styles.aboutText}>
              <View style={styles.aboutIcon}>
                <Icon name="people" size={32} color="#fff" />
              </View>
              <Text style={styles.aboutTitle}>Acerca de Nosotros</Text>
              <Text style={styles.aboutDescription}>
                Somos un equipo comprometido con el futuro del agro colombiano. Nuestra misión es tender un puente entre la tecnología y las comunidades, llevando innovación al corazón del campo. Creemos firmemente que la transformación nace de la unión entre conocimiento, tradición y herramientas digitales.
              </Text>
            </View>
            <View style={styles.aboutImage}>
              <View style={styles.imagePlaceholder}>
                <Icon name="nature-people" size={48} color="#22c55e" />
                <Text style={styles.imageText}>Campesinos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>¿Listo para transformar tu agricultura?</Text>
          <Text style={styles.footerSubtitle}>
            Únete a los agricultores que ya están optimizando sus cultivos con la plataforma de monitoreo avanzada de ROOTLY.
          </Text>
          <View style={styles.footerButtons}>
            <Button
              title="Comenzar Ahora"
              onPress={navigateToRegister}
              style={styles.footerButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    paddingTop: 40,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  titleHighlight: {
    color: '#22c55e',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dashboardPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 20,
  },
  chartBar: {
    backgroundColor: '#22c55e',
    borderRadius: 4,
    width: 20,
  },
  statusCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  statusCardText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  collaborationSection: {
    backgroundColor: '#1e293b',
    padding: 20,
  },
  collaborationContent: {
    alignItems: 'center',
  },
  collaborationText: {
    alignItems: 'center',
    marginBottom: 40,
  },
  collaborationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  collaborationBadgeText: {
    fontSize: 12,
    color: '#22c55e',
    marginLeft: 6,
    fontWeight: '600',
  },
  collaborationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  collaborationHighlight: {
    color: '#22c55e',
  },
  collaborationSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: width * 0.9,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginTop: 6,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#e2e8f0',
    flex: 1,
    lineHeight: 20,
  },
  collaborationDashboard: {
    width: width * 0.9,
    padding: 20,
  },
  dashboardMockupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  dashboardMockup: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  mockupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mockupCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  mockupValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  mockupLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  mockupChart: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  mockupChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  mockupChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  mockupBar: {
    backgroundColor: '#22c55e',
    borderRadius: 2,
    width: 8,
  },
  aboutSection: {
    backgroundColor: '#f0fdf4',
    padding: 20,
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutText: {
    alignItems: 'center',
    marginBottom: 32,
  },
  aboutIcon: {
    backgroundColor: '#22c55e',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    backgroundColor: '#22c55e',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutDescription: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.9,
  },
  aboutImage: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    backgroundColor: '#fff',
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  imageText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  footerSection: {
    backgroundColor: '#22c55e',
    padding: 32,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerSubtitle: {
    fontSize: 16,
    color: '#dcfce7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  footerButtons: {
    width: '100%',
  },
  footerButton: {
    backgroundColor: '#fff',
  },
});

export default LandingScreen;

