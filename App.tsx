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
// --- 1. IMPORTACIONES AÑADIDAS PARA EL ROLLBACK ---
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

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

const App = () => {
  const [nativeAppVersion, setNativeAppVersion] = useState('');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      // --- 2. LÓGICA DE VERIFICACIÓN DE ARRANQUE ---
      // Esta función revisará si la app ha crasheado repetidamente.
      // Si es así, intentará un rollback y detendrá la ejecución.
      const canContinue = await handleStartupChecks();

      // Si se disparó un rollback (y la app no se reinició por algún motivo),
      // detenemos la inicialización para evitar más problemas.
      if (!canContinue) return;

      // --- FIN DE LA LÓGICA DE ROLLBACK ---

      // Si todo está bien, continuamos con el flujo normal.
      const appVersion = DeviceInfo.getVersion();
      setNativeAppVersion(appVersion);
      await checkForUpdate();
      SplashScreen.hide();
    };

    initializeApp();
  }, []);

  // --- 3. NUEVA FUNCIÓN PARA MANEJAR EL ROLLBACK ---
  const handleStartupChecks = async (): Promise<boolean> => {
    const ATTEMPTS_KEY = 'startupAttempts';
    const MAX_ATTEMPTS = 3; // La app puede fallar 3 veces antes de hacer rollback
    const SUCCESS_TIMEOUT = 10000; // 10 segundos para considerar un arranque exitoso

    try {
      let attempts = parseInt(
        (await AsyncStorage.getItem(ATTEMPTS_KEY)) || '0',
        10,
      );
      attempts += 1;
      console.log(`[OTA Rollback] Intento de arranque N°: ${attempts}`);
      await AsyncStorage.setItem(ATTEMPTS_KEY, attempts.toString());

      if (attempts >= MAX_ATTEMPTS) {
        console.warn(
          `[OTA Rollback] Se detectaron ${attempts} arranques fallidos. Iniciando rollback...`,
        );
        // Reseteamos el contador ANTES del rollback para no quedar en un bucle si el rollback falla.
        await AsyncStorage.setItem(ATTEMPTS_KEY, '0');

        const rolledBack = await OtaUpdater.rollbackToPreviousBundle();
        if (rolledBack) {
          Alert.alert(
            'Restaurando Versión Anterior',
            'La última actualización causó un problema. La aplicación se reiniciará a la versión estable anterior.',
          );
          console.log(
            '[OTA Rollback] Rollback exitoso. Reiniciando la aplicación.',
          );
          RNRestart.Restart(); // Forzamos el reinicio
        } else {
          Alert.alert(
            'Error Crítico',
            'No se pudo restaurar la versión anterior. Por favor, reinstale la aplicación desde la tienda.',
          );
          console.error(
            '[OTA Rollback] El rollback falló. No había una versión anterior a la cual volver.',
          );
        }
        return false; // Indicamos que la app no debe continuar.
      }

      // Si la app sobrevive X segundos, consideramos el arranque exitoso y reseteamos el contador.
      setTimeout(() => {
        console.log(
          '[OTA Rollback] Arranque considerado exitoso. Reseteando contador.',
        );
        AsyncStorage.setItem(ATTEMPTS_KEY, '0');
      }, SUCCESS_TIMEOUT);

      return true; // Indicamos que la app puede continuar con su flujo normal.
    } catch (error) {
      console.error(
        '[OTA Rollback] Error en el sistema de verificación de arranque:',
        error,
      );
      // En caso de que AsyncStorage falle, continuamos para no bloquear la app innecesariamente.
      return true;
    }
  };

  const checkForUpdate = async () => {
    try {
      // await OtaUpdater.setCurrentVersion(1)
      const response = await fetch(manifestUrl);
      const remoteInfo = await response.json();
      const currentVersion = await OtaUpdater.getCurrentVersion();
      console.log(NATIVE_APP_VERSION);
      console.log(
        `Versión remota: ${remoteInfo.version}, Versión actual: ${currentVersion}`,
      );
      if (
        remoteInfo.name === NATIVE_APP_VERSION &&
        remoteInfo.version > currentVersion
      ) {
        setIsUpdateAvailable(true);
        setUpdateInfo(remoteInfo);
        console.log('Actualización disponible:', remoteInfo);
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
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;

//colors: #30313498 #DE3A45 #303134 #365AC3 #19C22A #E9ECF5 #E6C236 #504D54 #092254 #485E8A
