# 🚨 TAREAS PENDIENTES DE INTEGRACIÓN

## Estado Actual
- ✅ Los iconos están configurados correctamente (`react-native-vector-icons`)
- ✅ El archivo de mocks fue eliminado
- ✅ La autenticación funciona correctamente con el API Gateway
- ✅ Los endpoints de plantas y dispositivos funcionan
- ⚠️ **PROBLEMA CRÍTICO**: Las gráficas y métricas usan datos mockeados

## Problemas Identificados por el Usuario

### 1. Iconos no se muestran
**SOLUCIÓN APLICADA:**
- Se agregó `apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")` en `android/app/build.gradle`
- Se hizo un rebuild completo de la app
- **ACCIÓN REQUERIDA**: Verificar que los iconos ahora se muestran correctamente después del rebuild

### 2. Tipografía inconsistente
**PROBLEMA**: "¡Hola!" aparece pequeño y gris, luego nombre grande en negro
**SOLUCIÓN REQUERIDA**:
```typescript
// src/features/home/HomeScreen.tsx - líneas 135-143
welcomeText: {
  fontSize: 14,  // <- DEMASIADO PEQUEÑO, debe ser 16-18
  color: '#64748b',  // <- GRIS, está bien para saludo
},
userName: {
  fontSize: 24,  // <- ESTÁ BIEN
  fontWeight: 'bold',
  color: '#1e293b',
},
```

**RECOMENDACIÓN**:
```typescript
welcomeText: {
  fontSize: 18,  // Más grande
  color: '#94a3b8',  // Gris más suave
  fontWeight: '400',
},
userName: {
  fontSize: 28,  // Más prominente
  fontWeight: '700',  // Más bold
  color: '#0f172a',  // Negro más oscuro
  marginTop: 4,
},
```

### 3. Datos Mockeados en PlantDetail
**PROBLEMA CRÍTICO**: `PlantDetailScreen.tsx` usa datos falsos en:
- `mockSensorReadings` - línea 22
- `mockPlantAlerts` - línea 23
- `mockCurrentMetrics` - línea 24
- Funciones de generación de datos mock - líneas 25-27

**ARCHIVOS A MODIFICAR**:
1. `/home/srestrepo/Documentos/Universidad Nacional/Decimo Semestre/Arquitectura de software/Prototipo2_v1.1/rootly-mobile-app/rootlymobileapp/src/features/plants/screens/PlantDetailScreen.tsx`

**SOLUCIÓN REQUERIDA**:
El frontend web (`rootly-frontend`) usa:
- GraphQL para obtener métricas en tiempo real
- Hook `usePlantChartData(controllerId)` para obtener datos analíticos
- Hook `useRealtimeMonitoring(controllerId, ...)` para datos históricos
- Hook `useLatestMeasurement(controllerId, ...)` para polling en tiempo real

**PASOS PARA IMPLEMENTAR**:

#### A. Crear cliente GraphQL en React Native:
```bash
cd /home/srestrepo/Documentos/Universidad\ Nacional/Decimo\ Semestre/Arquitectura\ de\ software/Prototipo2_v1.1/rootly-mobile-app/rootlymobileapp
npm install @apollo/client graphql
```

#### B. Crear archivo `src/lib/graphql/client.ts`:
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuthStore } from '../../stores/authStore';
import { getApiUrl } from '../config/api';

const httpLink = createHttpLink({
  uri: `${getApiUrl()}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const { tokens } = useAuthStore.getState();
  return {
    headers: {
      ...headers,
      authorization: tokens?.access_token ? `Bearer ${tokens.access_token}` : "",
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

#### C. Copiar queries de GraphQL del frontend web:
- Copiar `/home/srestrepo/Documentos/Universidad Nacional/Decimo Semestre/Arquitectura de software/Prototipo2_v1.1/rootly-frontend/src/lib/graphql/hooks.ts` 
- Adaptar para React Native (sin `useEffect` de Next.js)

#### D. Modificar `PlantDetailScreen.tsx`:
```typescript
// ELIMINAR TODAS estas líneas (aproximadamente líneas 22-27):
// import { mockSensorReadings, mockPlantAlerts, mockCurrentMetrics, ... } from '../../../data/plantMetricsMock';

// AGREGAR:
import { usePlantChartData, useRealtimeMonitoring, useLatestMeasurement } from '../../../lib/graphql/hooks';

// Luego en el componente:
const { data: plantDevices } = usePlantDevices(plantId);
const microcontroller = plantDevices?.find(d => d.category === 'microcontroller');
const controllerId = microcontroller?.name || '';

const { 
  currentData, 
  allMetrics,
  hasTemperature,
  hasHumidity,
  hasSoilHumidity,
  hasLight
} = usePlantChartData(controllerId);

const { chartData } = useRealtimeMonitoring(
  controllerId,
  ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
  !!controllerId,
  24
);

// Usar estos datos reales en lugar de los mocks
```

### 4. Analytics Screen - ELIMINADO
**DECISIÓN**: `AnalyticsScreen.tsx` fue eliminado ya que no debe ser accesible desde el menú principal. Los analytics se muestran únicamente desde el detalle de una planta específica (PlantDetailScreen).

**MOTIVO**: Para acceder a analytics se debe seleccionar primero una planta específica, no mostrar datos globales de todas las plantas.

**ACTUALMENTE**: Los datos analíticos se muestran en PlantDetailScreen usando hooks como `usePlantChartData`, `useRealtimeMonitoring`, etc.

### 5. HomeScreen - Verificar datos reales
**ESTADO**: ✅ YA USA DATOS REALES
- Usa `usePlants()` para obtener plantas del API
- Usa `useDevices()` para obtener dispositivos del API
- Muestra contadores reales

**ACCIÓN**: Solo verificar que los estilos sean consistentes con el diseño original

---

## ⚠️ CONFIGURACIÓN CRÍTICA

### API Gateway URL
**ARCHIVO**: `src/lib/config/api.ts`
```typescript
GATEWAY_URL: 'http://192.168.1.10:8080'  // Tu IP local
```

**IMPORTANTE**: Cambiar `192.168.1.10` a tu IP real si es diferente.

### Headers de Autenticación
**ARCHIVO**: `src/lib/api/client.ts` (línea 30)
```typescript
config.headers.authorization = `Bearer ${token}`;
```

**VERIFICADO**: El servidor acepta el header `authorization` en minúsculas.

---

## 📋 CHECKLIST FINAL

### Antes de entregar:
- [ ] Rebuild completo de Android para incluir fuentes de iconos
- [ ] Verificar que TODOS los iconos se muestran correctamente
- [ ] Ajustar tipografía en HomeScreen (tamaños y pesos)
- [ ] Implementar cliente GraphQL en React Native
- [ ] Copiar y adaptar hooks de GraphQL del frontend web
- [ ] Eliminar TODOS los datos mock de PlantDetailScreen
- [ ] Implementar gráficas reales con datos del API en PlantDetail
- [x] ~~Implementar gráficas reales con datos del API en Analytics~~ (AnalyticsScreen eliminado)
- [ ] Probar autenticación end-to-end
- [ ] Probar navegación entre todas las pantallas
- [ ] Verificar que NO HAY datos mockeados en ningún lado

### Pruebas de integración:
- [ ] Login funciona y guarda tokens
- [ ] Home muestra contadores reales de plantas y dispositivos
- [ ] Lista de plantas carga datos del API
- [ ] Detalle de planta muestra métricas reales (NO MOCK)
- [ ] Gráficas muestran datos históricos reales
- [x] ~~Analytics muestra 4 gráficas con datos reales~~ (eliminado - ahora en PlantDetail)
- [ ] Profile muestra datos del usuario autenticado
- [ ] Logout funciona y limpia tokens

---

## 🚀 COMANDOS ÚTILES

```bash
# Limpiar build completo
cd android && ./gradlew clean && cd ..

# Rebuild con cache limpio
npm start -- --reset-cache

# Rebuild e instalar
npm run android

# Ver logs
npx react-native log-android
```

---

## 📚 REFERENCIAS

- Frontend Web Original: `/home/srestrepo/Documentos/Universidad Nacional/Decimo Semestre/Arquitectura de software/Prototipo2_v1.1/rootly-frontend`
- Componente de gráficas original: `rootly-frontend/src/features/plantDetail/PlantCharts.tsx`
- Hooks de GraphQL originales: `rootly-frontend/src/lib/graphql/hooks.ts`
- Queries de GraphQL: `rootly-frontend/src/lib/graphql/realtime-queries.ts`

---

## ⏰ ESTIMACIÓN DE TIEMPO

- Implementar cliente GraphQL: **30 min**
- Copiar y adaptar hooks: **1 hora**
- Modificar PlantDetailScreen: **1 hora**
- Implementar Analytics con gráficas: **1.5 horas**
- Ajustar tipografía y estilos: **30 min**
- Pruebas end-to-end: **1 hora**

**TOTAL ESTIMADO**: **5.5 horas de trabajo**

---

## 🎯 PRIORIDADES

1. **CRÍTICO**: Eliminar datos mock y usar API real en PlantDetail
2. **CRÍTICO**: Implementar gráficas con datos reales en Analytics
3. **ALTO**: Ajustar tipografía en HomeScreen
4. **MEDIO**: Verificar que iconos se muestran correctamente

---

**Última actualización**: 2025-10-19 23:55 UTC


