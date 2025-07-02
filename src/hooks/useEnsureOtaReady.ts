import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import OtaUpdater from 'react-native-ota-hot-update';
import RNRestart from 'react-native-restart';

export function useEnsureOtaReady() {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const checkBundle = async () => {
      const bundlePath = `${RNFS.DocumentDirectoryPath}/index.android.bundle`;
      const exists = await RNFS.exists(bundlePath);

      if (!exists) {
        console.warn('[OTA] ❌ No se encontró el bundle. Ejecutando rollback...');
        const rolledBack = await OtaUpdater.rollbackToPreviousBundle();

        if (rolledBack) {
          console.info('[OTA] ✅ Rollback exitoso. Reiniciando...');
          setTimeout(() => RNRestart.Restart(), 1000);
        } else {
          console.error('[OTA] ⚠️ Rollback fallido. La app puede quedar inutilizable.');
        }
      } else {
        console.log('[OTA] ✅ Bundle verificado correctamente.');
        setCanContinue(true);
      }
    };

    if (Platform.OS === 'android') checkBundle();
    else setCanContinue(true); // iOS por ahora continúa directo
  }, []);

  return canContinue;
}
