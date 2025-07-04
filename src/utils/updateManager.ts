import OtaUpdater from 'react-native-ota-hot-update';
import DeviceInfo from 'react-native-device-info';
import {config} from '../config/config';
import Toast from 'react-native-toast-message';

const NATIVE_APP_VERSION = DeviceInfo.getVersion();
const APP_DEBUG = 'PROD';
export type UpdateInfo = {
  name: string;
  version: number;
  url: string;
  // Agrega cualquier otra propiedad que venga en tu JSON
};

type response = {
  updateInfo: UpdateInfo | null;
  isUpdateAvailable: boolean;
};
/**
 * Comprueba si hay una nueva actualización OTA disponible.
 * @returns {Response type <UpdateInfo & isUpdateAvailable>} La información de la actualización o null si no hay ninguna.
 */
export const checkForUpdate = async (): Promise<response> => {
  try {
    const firebaseStorageBucket =
      APP_DEBUG === 'PROD'
        ? config.firebase.storageBucket
        : config.firebase.storageBucketDebug;
    console.log(firebaseStorageBucket);
    const response = await fetch(`${firebaseStorageBucket}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const remoteInfo: UpdateInfo = await response.json();
    const currentVersion = await OtaUpdater.getCurrentVersion();
    console.log(remoteInfo);
    // La lógica de comparación es la misma
    if (
      remoteInfo.name === NATIVE_APP_VERSION &&
      remoteInfo.version > currentVersion
    ) {
      return {
        updateInfo: remoteInfo,
        isUpdateAvailable: true,
      };
    } else {
      console.log(remoteInfo.version);
      console.log(
        `[OTA] No hay actualizaciones disponibles. Versión actual: ${currentVersion}, versión remota: ${remoteInfo?.version}`,
      );
      console.log(
        '[OTA] No hay actualizaciones disponibles o la versión es la misma.',
      );
      return {
        updateInfo: remoteInfo,
        isUpdateAvailable: false,
      };
    }
  } catch (error) {
    console.error('[OTA] Error al comprobar la actualización:', error);
    // En caso de error, también devuelve null
    return {
      updateInfo: null,
      isUpdateAvailable: false,
    };
  }
};
