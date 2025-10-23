/**
 * Rootly Mobile App
 * React Native version of the Rootly frontend
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/config/queryClient';
import { useAuthStore } from './src/stores/authStore';
import AppNavigator from './src/lib/navigation/AppNavigator';

// Initialize Reactotron in development mode
if (__DEV__) {
  import('./src/lib/config/reactotron').then(() => console.log('Reactotron Configured'));
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
