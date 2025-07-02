import React, {useState} from 'react';
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

interface IUpdateProps {
  visible: boolean;
  onClose: () => void;
  updateInfo: {
    version: number;
    url: string;
  };
}

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

export const UpdateModal: React.FC<IUpdateProps> = ({
  visible,
  onClose,
  updateInfo,
}) => {
  // El estado 'success' ya no es necesario, porque el reinicio es automático.
  type UpdatePhase = 'prompt' | 'downloading' | 'error';
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>('prompt');

  // El estado de progreso ya no es necesario.
  // const [downloadProgress, setDownloadProgress] = useState(0);

  // ========= INICIO DE LA SECCIÓN MODIFICADA =========
  const downloadAndInstall = () => {
    // 1. Cambiamos a la fase de descarga para mostrar la UI de progreso.
    setUpdatePhase('downloading');

    console.log(
      `Iniciando actualización a v${updateInfo.version} con downloadBundleUri`,
    );
    console.log(`URL de descarga: ${updateInfo.url}`);

    // Verificamos que la URL de actualización esté definida

    // 2. Usamos OtaUpdater.downloadBundleUri
    hotUpdate.downloadBundleUri(
      RNBlobUtil, // El manejador de descargas
      updateInfo.url,
      updateInfo.version,
      {
        // 3. Callback de éxito
        updateSuccess: () => {
          console.log(
            `Carpeta de descargas: ${RNBlobUtil.fs.dirs.DownloadDir}`,
          );
          console.log(
            `Actualización a v${updateInfo.version} descargada correctamente.`,
          );
          // No necesitamos cambiar de estado a 'success' porque la app
          // se reiniciará en este punto, cerrando el modal y todo lo demás.
        },

        // 4. Callback de fallo
        updateFail: message => {
          console.error('Falló la actualización:', message);
          setUpdatePhase('error'); // Cambiamos al estado de error
          Alert.alert('Error de Actualización', message, [
            {text: 'OK', onPress: handleClose}, // Cerramos el modal al presionar OK
          ]);
        },

        // 5. La librería se encarga del reinicio
        restartAfterInstall: true,
      },
    );
  };

  const downloadAndInstallOfExactlyFolder = () => {
    setUpdatePhase('downloading');
    console.log(
      `Iniciando actualización a v${updateInfo.version} con setupExactBundlePath`,
    );
    console.log(`URL de descarga: ${updateInfo.url}`);
    // Verificamos que la URL de actualización esté definida
    if (!updateInfo.url) {
      Alert.alert('Error', 'La URL de actualización no está definida.');
      return;
    }
    // Usamos RNB fecth para descargar el archivo

    const zipFilePath = `${RNFS.DocumentDirectoryPath}/bundle_${updateInfo.version}.zip`;
    const extractedFolderPath = `${RNFS.DocumentDirectoryPath}/bundle_${updateInfo.version}`;

    console.log(`Descargando archivo ZIP a: ${zipFilePath}`);
    RNFS.downloadFile({
      fromUrl: updateInfo.url,
      toFile: zipFilePath,
      progressDivider: 1, // Actualiza el progreso cada 1%
      progress: res => {
        const progress = res.bytesWritten / res.contentLength;
        console.log(`Descargando... ${Math.floor(progress * 100)}%`);
      },
    })
      .promise.then(async () => {
        console.log('Descarga completa. Extrayendo archivo ZIP...');
        try {
          // Extraemos el archivo ZIP
          await unzip(zipFilePath, extractedFolderPath, 'utf-8');

          // Configuramos el bundle exacto

          const listaDeTodasLasCarpetas = await RNFS.readDir(
            RNFS.DocumentDirectoryPath,
          );
          console.log(
            `Lista de carpetas en el directorio extraído: ${JSON.stringify(
              listaDeTodasLasCarpetas,
            )}`,
          );
          const exactedFolderBundle = `${extractedFolderPath}/index.android.bundle`;
          const success = await OtaUpdater.setupExactBundlePath(
            `${exactedFolderBundle}`,
          );
          console.log(
            `Configurando bundle exacto desde: ${extractedFolderPath}`,
          );
          console.log(`Succes?: ${success}`);
          

          // Verificamos si el bundle JS existe
          console.log(`Configuración del bundle: ${success}`);
          if (success) {
            const bundlePath = `${extractedFolderPath}/index.android.bundle`;
            const exists = await RNFS.exists(bundlePath);
            console.log(`¿Existe el bundle JS?: ${exists}`);
            console.log(
              `Actualización a v${updateInfo.version} instalada correctamente.`,
            );
            await OtaUpdater.setCurrentVersion(updateInfo.version);
            // Eliminamos el archivo ZIP descargado
            await RNFS.unlink(zipFilePath);
            // Reiniciamos la aplicación
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
  // ========= FIN DE LA SECCIÓN MODIFICADA =========

  const handleClose = () => {
    // Reiniciamos el estado al cerrar
    setUpdatePhase('prompt');
    onClose();
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
                Hay una nueva versión {updateInfo.version} de la aplicación
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
        // El usuario no puede cerrar el modal durante la descarga
        dismissable={updatePhase === 'prompt'}
        onDismiss={handleClose}>
        {renderContent()}
      </Dialog>
    </Portal>
  );
};
