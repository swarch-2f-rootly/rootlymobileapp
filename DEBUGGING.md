# 🐛 Guía de Debugging - Rootly Mobile App

## 📱 Configuración de Reactotron

Esta aplicación incluye **Reactotron** para debugging de red, estado y logs en tiempo real.

### 1️⃣ Instalar Reactotron Desktop

**Descargar desde:**
- 🌐 [https://github.com/infinitered/reactotron/releases](https://github.com/infinitered/reactotron/releases)

**Instalar para tu sistema operativo:**
- Windows: Descarga el `.exe`
- macOS: Descarga el `.dmg`
- Linux: Descarga el `.AppImage`

### 2️⃣ Iniciar Reactotron Desktop

1. Abre la aplicación Reactotron
2. Por defecto escucha en `localhost:9090`
3. Deja la aplicación abierta mientras desarrollas

### 3️⃣ Ejecutar la App

```bash
# Terminal 1 - Metro bundler
npm start

# Terminal 2 - Aplicación Android
npm run android
```

### 4️⃣ Ver los Logs en Reactotron

Una vez la app se conecte, verás:

#### 🌐 **Peticiones de Red**
- **Todas las requests HTTP** con:
  - Método (GET, POST, PUT, DELETE)
  - URL completa
  - Headers
  - Body/Data enviado
  - Duración de la petición

#### ✅ **Respuestas HTTP**
- Status code (200, 401, 404, 500, etc.)
- Response body
- Tiempo de respuesta
- Headers de respuesta

#### ❌ **Errores de Red**
- Mensajes de error completos
- Stack traces
- Respuestas del servidor con errores

#### 📊 **Estado de React Query**
- Queries activas
- Mutations en progreso
- Cache state
- Invalidaciones

---

## 🔧 Características del Debugger

### Network Logging Automático

Cada petición HTTP es registrada automáticamente con:

```typescript
// Request Log
🌐 API REQUEST
  Method: POST
  URL: http://10.0.2.2:8000/api/v1/auth/login
  Data: { email: "user@example.com", password: "***" }
  Timestamp: 2025-10-19T01:30:00.000Z

// Success Response Log
✅ API RESPONSE
  Method: POST
  URL: http://10.0.2.2:8000/api/v1/auth/login
  Status: 200
  Data: { access_token: "...", user: {...} }
  Duration: 234ms
  Timestamp: 2025-10-19T01:30:00.234Z

// Error Log
❌ API ERROR
  Method: POST
  URL: http://10.0.2.2:8000/api/v1/auth/login
  Error: Network Error
  Response: { detail: "Invalid credentials" }
  Status: 401
  Duration: 145ms
  Timestamp: 2025-10-19T01:30:00.145Z
```

### Custom Commands

Puedes ejecutar comandos personalizados desde Reactotron:

1. **Show API Gateway**: Muestra la URL del API Gateway actual

---

## 🌐 Configuración de Red

### Android Emulator

Por defecto, la app usa `http://10.0.2.2:8000` para el emulador de Android.

```typescript
// src/lib/config/api.ts
GATEWAY_URL: 'http://10.0.2.2:8000'  // Emulador Android
```

### Dispositivo Físico

Si estás usando un dispositivo físico, cambia la IP a tu máquina local:

```typescript
// src/lib/config/api.ts
GATEWAY_URL: 'http://192.168.x.x:8000'  // Reemplaza con tu IP local
```

**Para encontrar tu IP local:**
```bash
# Linux/macOS
ip addr show

# Windows
ipconfig

# Busca tu IP en la red local (generalmente 192.168.x.x o 10.0.x.x)
```

### Asegúrate que el API Gateway esté corriendo

```bash
# Verifica que el backend esté escuchando en el puerto 8000
curl http://localhost:8000/api/v1/health
```

---

## 🚨 Troubleshooting

### Reactotron no se conecta

1. **Verifica que Reactotron Desktop esté abierto**
2. **Revisa el puerto**: Por defecto es `9090`
3. **Para dispositivos físicos**: Usa la IP de tu máquina
   ```typescript
   // src/lib/config/reactotron.ts
   Reactotron.configure({
     name: 'Rootly Mobile',
     host: '192.168.x.x', // Tu IP local
   })
   ```

### Network Error en Android Emulator

Si ves "Network Error":
1. Asegúrate de usar `10.0.2.2` en lugar de `localhost`
2. Verifica que el API Gateway esté corriendo
3. Verifica el firewall no bloquee el puerto 8000

### Metro Watcher Error

Si ves errores de "ENOENT" al iniciar Metro:
```bash
# Limpia el build de Android
cd android && ./gradlew clean && cd ..

# Limpia caché de Metro
npm start -- --reset-cache
```

---

## 📝 Tips de Desarrollo

### 1. Recargar la App

En el emulador/dispositivo:
- **Android**: Presiona `R` dos veces
- **O desde Metro**: Presiona `r` en la terminal

### 2. Abrir Dev Menu

- **Android Emulator**: `Cmd/Ctrl + M`
- **Android Device**: Agita el dispositivo

### 3. Inspeccionar Logs en Terminal

```bash
# Logs de Android
npx react-native log-android

# Logs en tiempo real
adb logcat | grep ReactNativeJS
```

### 4. Ver todas las requests en Reactotron

En la pestaña "Timeline" verás todas las acciones en orden cronológico:
- API Requests
- API Responses
- API Errors
- State changes
- Console logs

---

## 🎯 Ejemplo de Debugging de Login

Cuando intentas hacer login, verás en Reactotron:

```
1. 🌐 API REQUEST
   POST http://10.0.2.2:8000/api/v1/auth/login
   Body: { email: "test@example.com" }

2. ✅ API RESPONSE
   Status: 200
   Duration: 234ms
   Body: {
     access_token: "eyJ...",
     refresh_token: "eyJ...",
     user: {
       id: 1,
       email: "test@example.com",
       first_name: "Test"
     }
   }
```

Si falla:

```
1. 🌐 API REQUEST
   POST http://10.0.2.2:8000/api/v1/auth/login

2. ❌ API ERROR
   Status: 401
   Error: Request failed with status code 401
   Response: {
     detail: "Invalid credentials"
   }
```

---

## 🔗 Links Útiles

- [Reactotron Documentation](https://github.com/infinitered/reactotron)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Android Emulator Network](https://developer.android.com/studio/run/emulator-networking)

---

## ✨ Comandos Rápidos

```bash
# Limpiar todo y reiniciar
cd android && ./gradlew clean && cd ..
rm -rf node_modules/.cache
npm start -- --reset-cache

# En otra terminal
npm run android

# Reload app rápido
# En Metro: presiona 'r'
```


