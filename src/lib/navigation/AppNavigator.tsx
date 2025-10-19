import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../stores/authStore';

// Import screens
import LandingScreen from '../../features/landing/LandingScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';
import HomeScreen from '../../features/home/HomeScreen';
import PlantsListScreen from '../../features/plants/screens/PlantsListScreen';
import PlantDetailScreen from '../../features/plants/screens/PlantDetailScreen';
import AddPlantScreen from '../../features/plants/screens/AddPlantScreen';
import DevicesListScreen from '../../features/devices/screens/DevicesListScreen';
import AddDeviceScreen from '../../features/devices/screens/AddDeviceScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import AnalyticsScreen from '../../features/analytics/AnalyticsScreen';

// Import icons (we'll use react-native-vector-icons)
import Icon from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Plants') {
            iconName = 'grass';
          } else if (route.name === 'Devices') {
            iconName = 'devices';
          } else if (route.name === 'Analytics') {
            iconName = 'analytics';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Plants"
        component={PlantsListScreen}
        options={{ tabBarLabel: 'Plantas' }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesListScreen}
        options={{ tabBarLabel: 'Dispositivos' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated stack
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
            <Stack.Screen name="AddPlant" component={AddPlantScreen} />
            <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
          </>
        ) : (
          // Unauthenticated stack
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
