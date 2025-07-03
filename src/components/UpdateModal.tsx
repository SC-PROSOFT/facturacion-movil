import React, {useEffect, useState} from 'react';
// El import principal ahora es OtaUpdater
import OtaUpdater from 'react-native-ota-hot-update';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';
// Importamos unzip para manejar archivos ZIP
// RNBlobUtil solo se pasa como parámetro, pero es bueno mantener el import
import RNBlobUtil from 'react-native-blob-util';
import {Alert, TouchableOpacity, View, StyleSheet} from 'react-native';
// Mantenemos ProgressBar, pero lo usaremos en modo indeterminado
import {Dialog, Portal, Text, ProgressBar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import hotUpdate from 'react-native-ota-hot-update';
import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {hideUpdateModal, showUpdateModal} from '../redux/slices';
import DeviceInfo from 'react-native-device-info';
import {checkForUpdate} from '../utils';
import {FIREBASE_STORAGE_BUCKET} from '@env';
const NATIVE_APP_VERSION = DeviceInfo.getVersion();
const APP_DEBUG = 'PROD';
// Los estilos no cambian, se mantienen igual.
const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    padding: 0,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  headContainer: {
    backgroundColor: '#092254',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    flexDirection: 'row',
  },
  iconClose: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
  },
  bodyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginVertical: 20,
  },
  actualizarButton: {
    backgroundColor: '#0B2863',
    paddingVertical: 4,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffff',
    paddingHorizontal: 18,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    padding: 24,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
});

export const UpdateModal: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const check = async () => {
      console.log(
        '[OTA] Ejecutando comprobación de actualizaciones desde el helper...',
      );
      const updateData = await checkForUpdate();
      if (updateData) {
        dispatch(showUpdateModal(updateData));
      }
    };

    check();
  }, [dispatch]);

  const {visible, updateInfo} = useAppSelector(store => store.updateModal);
  type UpdatePhase = 'prompt' | 'downloading' | 'error';
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>('prompt');

  const downloadAndInstallOfExactlyFolder = () => {
    setUpdatePhase('downloading');
    if (!updateInfo?.url) {
      Alert.alert('Error', 'La URL de actualización no está definida.');
      return;
    }
    const zipFilePath = `${RNFS.DocumentDirectoryPath}/bundle_${updateInfo.version}.zip`;
    const extractedFolderPath = `${RNFS.DocumentDirectoryPath}/bundle_${updateInfo.version}`;
    RNFS.downloadFile({
      fromUrl: updateInfo.url,
      toFile: zipFilePath,
      progressDivider: 1,
    })
      .promise.then(async () => {
        try {
          await unzip(zipFilePath, extractedFolderPath, 'utf-8');
          const exactedFolderBundle = `${extractedFolderPath}/index.android.bundle`;
          const success = await OtaUpdater.setupExactBundlePath(
            `${exactedFolderBundle}`,
          );
          if (success) {
            await OtaUpdater.setCurrentVersion(updateInfo.version);
            await RNFS.unlink(zipFilePath);
            await deleteMoreOfThreeVersions();
            dispatch(hideUpdateModal());
            await OtaUpdater.resetApp();
          } else {
            throw new Error('Error al configurar el bundle exacto.');
          }
        } catch (error) {
          console.error('Error al extraer o configurar el bundle:', error);
          setUpdatePhase('error');
          Alert.alert('Error de Actualización', error.message, [
            {text: 'OK', onPress: handleClose},
          ]);
        }
      })
      .catch(error => {
        console.error('Error durante la descarga:', error);
        setUpdatePhase('error');
        Alert.alert('Error de Actualización', error.message, [
          {text: 'OK', onPress: handleClose},
        ]);
      });
  };
  const deleteMoreOfThreeVersions = async () => {
    try {
      const dir = RNFS.DocumentDirectoryPath;
      const files = await RNFS.readDir(dir);
      const versions = files
        .filter(file => file.isDirectory() && file.name.startsWith('bundle_'))
        .sort((a, b) => {
          const versionA = parseInt(a.name.replace('bundle_', ''), 10);
          const versionB = parseInt(b.name.replace('bundle_', ''), 10);
          return versionA - versionB;
        });

      if (versions.length > 3) {
        const toDelete = versions.slice(0, versions.length - 3);
        await Promise.all(toDelete.map(file => RNFS.unlink(file.path)));
        console.log('Versiones antiguas eliminadas:', toDelete);
      }
    } catch (error) {
      console.error('Error al eliminar versiones antiguas:', error);
    }
  };

  const handleClose = () => {
    setUpdatePhase('prompt');
    dispatch(hideUpdateModal());
  };

  const renderContent = () => {
    switch (updatePhase) {
      case 'prompt':
        return (
          <>
            <View style={styles.headContainer}>
              <View style={styles.titleContainer}>
                <Icon
                  name="new-box"
                  size={28}
                  style={styles.icon}
                  color="#fff"
                />
                <Text style={styles.title}>Actualización disponible</Text>
              </View>
            </View>
            <Dialog.Content>
              <Text style={styles.bodyText}>
                Hay una nueva versión {updateInfo?.version} de la aplicación
                disponible. Es necesaria para seguir usando la aplicación.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <TouchableOpacity
                style={styles.actualizarButton}
                onPress={downloadAndInstallOfExactlyFolder}>
                <Text style={styles.buttonText}>Actualizar ahora</Text>
              </TouchableOpacity>
            </Dialog.Actions>
          </>
        );

      case 'downloading':
        return (
          <>
            <View style={styles.headContainer}>
              <View style={styles.titleContainer}>
                <Icon
                  name="download"
                  size={28}
                  style={styles.icon}
                  color="#fff"
                />
                <Text style={styles.title}>Descargando actualización</Text>
              </View>
            </View>
            <Dialog.Content style={styles.progressContainer}>
              {/* Se elimina el texto del porcentaje */}
              <Text style={styles.progressText}>
                Instalando nueva versión...
              </Text>
              {/* La ProgressBar de Paper puede ser indeterminada si no se le pasa la prop 'progress' */}
              <ProgressBar indeterminate color="#0B2863" style={{width: 200}} />
              <Text style={[styles.bodyText, {marginTop: 20}]}>
                Por favor, no cierres la aplicación. El reinicio será
                automático.
              </Text>
            </Dialog.Content>
          </>
        );

      // El caso 'success' se ha eliminado porque el reinicio es automático.
      // El modal simplemente desaparecerá cuando la app se reinicie.

      default:
        return null;
    }
  };

  return (
    <Portal>
      <Dialog
        style={styles.dialog}
        visible={visible}
        dismissable={false}
        onDismiss={handleClose}>
        {renderContent()}
      </Dialog>
    </Portal>
  );
};
