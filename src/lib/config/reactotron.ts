import Reactotron from 'reactotron-react-native';
import { QueryClientManager, reactotronReactQuery } from 'reactotron-react-query';
import { queryClient } from './queryClient';

const queryClientManager = new QueryClientManager({
  queryClient,
});

Reactotron.configure({
  name: 'Rootly Mobile',
  host: __DEV__ ? '10.0.2.2' : 'localhost', // 10.0.2.2 for Android emulator, localhost for physical device
})
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate/,
    },
  })
  .use(reactotronReactQuery(queryClientManager))
  .connect();

// Log connection status
console.log('🔌 Reactotron configured for host:', __DEV__ ? '10.0.2.2' : 'localhost');

// Test Reactotron connection
Reactotron.log('🚀 Reactotron connected successfully!');
Reactotron.display({
  name: 'APP_START',
  value: 'Rootly Mobile app started',
  preview: 'App initialized',
});

// Add custom commands for network debugging
Reactotron.onCustomCommand({
  command: 'Log Current API Gateway',
  handler: () => {
    Reactotron.log('API Gateway URL:', process.env.API_GATEWAY_URL || 'http://localhost:8000');
  },
  title: 'Show API Gateway',
  description: 'Display current API Gateway URL',
});

// Helper function to log API requests
export const logApiRequest = (method: string, url: string, data?: any) => {
  Reactotron.display({
    name: '🌐 API REQUEST',
    value: {
      method,
      url,
      data,
      timestamp: new Date().toISOString(),
    },
    preview: `${method} ${url}`,
  });
};

// Helper function to log API responses
export const logApiResponse = (method: string, url: string, response: any, duration: number) => {
  Reactotron.display({
    name: '✅ API RESPONSE',
    value: {
      method,
      url,
      status: response.status,
      data: response.data,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    },
    preview: `${method} ${url} - ${response.status}`,
  });
};

// Helper function to log API errors
export const logApiError = (method: string, url: string, error: any, duration: number) => {
  Reactotron.display({
    name: '❌ API ERROR',
    value: {
      method,
      url,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    },
    preview: `${method} ${url} - ERROR`,
    important: true,
  });
};

export default Reactotron;


