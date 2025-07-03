import OtaUpdater from 'react-native-ota-hot-update';
import DeviceInfo from 'react-native-device-info';
import {FIREBASE_STORAGE_BUCKET} from '@env';

const NATIVE_APP_VERSION = DeviceInfo.getVersion();
const APP_DEBUG = 'PROD';
export type UpdateInfo = {
  name: string;
  version: number;
  url: string;
  // Agrega cualquier otra propiedad que venga en tu JSON
};
/**
 * Comprueba si hay una nueva actualización OTA disponible.
 * @returns {Promise<UpdateInfo | null>} La información de la actualización o null si no hay ninguna.
 */
export const checkForUpdate = async (): Promise<UpdateInfo | null> => {
  try {
    // Usamos un parámetro para evitar el cacheo de la petición
    const response = await fetch(
      `${FIREBASE_STORAGE_BUCKET}?cache_bust=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const remoteInfo: UpdateInfo = await response.json();
    const currentVersion = await OtaUpdater.getCurrentVersion();

    // La lógica de comparación es la misma
    if (
      remoteInfo.name === NATIVE_APP_VERSION &&
      remoteInfo.version > currentVersion &&
      APP_DEBUG === 'PROD'
    ) {
      console.log(
        `[OTA] Nueva actualización encontrada: v${remoteInfo.version}`,
      );
      // La función ahora devuelve el objeto de la actualización
      return remoteInfo;
    } else {
      console.log(
        '[OTA] No hay actualizaciones disponibles o la versión es la misma.',
      );
      // Si no hay actualización, devuelve null
      return null;
    }
  } catch (error) {
    console.error('[OTA] Error al comprobar la actualización:', error);
    // En caso de error, también devuelve null
    return null;
  }
};
