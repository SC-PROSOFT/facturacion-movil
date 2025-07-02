import React, {useRef, useEffect, useState} from 'react';
import {Provider as StoreProvider} from 'react-redux';
import {Alert, Linking, Platform, StatusBar, View} from 'react-native';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {visitaService} from './src/data_queries/local_database/services';
import OtaUpdater from 'react-native-ota-hot-update';
import RNBlobUtil from 'react-native-blob-util';
import DeviceInfo from 'react-native-device-info';
import SplashScreen from 'react-native-splash-screen';
import ErrorBoundary from './src/components/ErrorBoundary';

/* store */
import {store} from './src/redux/store';
/* components */
import {InfoAlert, DecisionAlert, UpdateModal} from './src/components';
/* navigation */
import Navigation from './src/navigation/Navigation';
/* icons */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/* context provider */
import GlobalProvider from './src/context/global_provider';
import {Buffer} from 'buffer';
import { useEnsureOtaReady } from './src/hooks/useEnsureOtaReady';

global.Buffer = Buffer; // Para compatibilidad con RN 0.71.0 y superior
/* toast config */
const toastConfig = {
  // ... (tu configuración de Toast se mantiene igual)
};

/* theme */
const theme = {
  // ... (tu configuración de Theme se mantiene igual)
};

const manifestUrl =
  'https://firebasestorage.googleapis.com/v0/b/facturacion-movil-prosoft-app.firebasestorage.app/o/ota%2Fupdate.json?alt=media';
const NATIVE_APP_VERSION = DeviceInfo.getVersion();
const APP_DEBUG = "PROD"
const App = () => {
  const [nativeAppVersion, setNativeAppVersion] = useState('');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      // useEnsureOtaReady(); // Aseguramos que el bundle OTA esté listo
      const appVersion = DeviceInfo.getVersion();
      setNativeAppVersion(appVersion);
      await checkForUpdate();
      SplashScreen.hide();
    };

    initializeApp();
  }, []);

  // --- 3. NUEVA FUNCIÓN PARA MANEJAR EL ROLLBACK ---

  // Dentro de tu archivo App.tsx

  const checkForUpdate = async () => {
    try {
      const response = await fetch(manifestUrl, {
        // Añadimos headers para evitar la caché del manifiesto mismo
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const remoteInfo = await response.json();
      const currentVersion = await OtaUpdater.getCurrentVersion();
      
      console.log(
        `Versión remota: ${remoteInfo.version}, Versión actual: ${currentVersion}`,
      );

      if (
        remoteInfo.name === NATIVE_APP_VERSION &&
        remoteInfo.version > currentVersion && APP_DEBUG === "PROD" // Solo comprobamos actualizaciones en producción
      ) {
        // --- INICIO DEL CAMBIO ---
        // Creamos una nueva URL con un parámetro de tiempo para que siempre sea única
        const cacheBustedUrl = `${remoteInfo.url}&cache_bust=${Date.now()}`;
        
        const newUpdateInfo = {
          ...remoteInfo,
          url: cacheBustedUrl, // Usamos la nueva URL
        };

        setIsUpdateAvailable(true);
        setUpdateInfo(newUpdateInfo); // Pasamos la información con la URL modificada
        console.log('Actualización disponible:', newUpdateInfo);
        // --- FIN DEL CAMBIO ---

      } else {
        console.log('No hay actualizaciones disponibles.');
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error al comprobar la actualización:', error);
    }
  };

  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <ErrorBoundary>
          <GlobalProvider>
            <StatusBar></StatusBar>
            <Navigation></Navigation>

            <InfoAlert />
            <DecisionAlert />
            <Toast config={toastConfig} />
            <UpdateModal
              visible={isUpdateAvailable}
              onClose={() => setIsUpdateAvailable(false)}
              updateInfo={updateInfo || {version: 0, url: ''}}
            />
          </GlobalProvider>
        </ErrorBoundary>
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;

//colors: #30313498 #DE3A45 #303134 #365AC3 #19C22A #E9ECF5 #E6C236 #504D54 #092254 #485E8A
