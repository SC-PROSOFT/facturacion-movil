import React, {useState} from 'react';
// El import principal ahora es OtaUpdater
import OtaUpdater from 'react-native-ota-hot-update';

// RNBlobUtil solo se pasa como parámetro, pero es bueno mantener el import
import RNBlobUtil from 'react-native-blob-util';
import {Alert, TouchableOpacity, View, StyleSheet} from 'react-native';
// Mantenemos ProgressBar, pero lo usaremos en modo indeterminado
import {Dialog, Portal, Text, ProgressBar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import hotUpdate from 'react-native-ota-hot-update';

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
    // 2. Usamos OtaUpdater.downloadBundleUri
    hotUpdate.downloadBundleUri(
      RNBlobUtil, // El manejador de descargas
      updateInfo.url,
      updateInfo.version,
      {
        // 3. Callback de éxito
        updateSuccess: () => {
          console.log(
            'Actualización exitosa. La aplicación se reiniciará automáticamente.',
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
                Hay una nueva versión {updateInfo.version} de la aplicación disponible. Es necesaria
                para seguir usando la aplicación.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <TouchableOpacity
                style={styles.actualizarButton}
                onPress={downloadAndInstall}>
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