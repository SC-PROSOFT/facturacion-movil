import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Dimensions,
  Keyboard,
} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {ITerceros} from '../common/types';
import {useNavigation} from '@react-navigation/native';
import {checkLocation} from '../utils/checkLocation';
import {visitaService} from '../data_queries/local_database/services';

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  tercero: ITerceros;
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

export const AwayFromUbication: React.FC<IModalProps> = ({
  visible,
  onClose,
  tercero,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();
  const objVisita = useAppSelector(store => store.visitas.objVisita);
  const [observacion, setObservacion] = useState('');
  const [locationStatus, setLocationStatus] = useState<number | null>(null);
  const [showText, setShowText] = useState(false); // Controla cuándo mostrar el texto
  const pulseAnim = useRef(new Animated.Value(1)).current; // Animación de escala para el ícono
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [dynamicHeight, setDynamicHeight] = useState(
    Dimensions.get('window').height * 0.3,
  ); // Altura dinámica del modal

  const modalWidth = Dimensions.get('window').width < 400 ? '90%' : '80%';

  const adjustScreenSize = () => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  };

  useEffect(() => {
    adjustScreenSize();
  }, []);

  useEffect(() => {
    const handleCheckLocation = async () => {
      if (visible) {
        // Inicia la animación de "pulse"
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ).start();

        const status = await checkLocation(tercero.latitude, tercero.longitude);
        setLocationStatus(status);

        // Asegura que el texto se muestre después de 2 segundos
        setTimeout(() => {
          setShowText(true);
        }, 2000);

        // Si el estado es 0, cierra el modal automáticamente
        if (status === 0) {
          onClose();
        }
      }
    };

    handleCheckLocation();
  }, [visible]);

  const handleAccept = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
        onClose();
      } else if (navigation.canGoBack('TabNavPrincipal')) {
        navigation.navigate('TabNavPrincipal');
        onClose();
      }
    } catch (error) {
      console.error('Error al navegar:', error);
    }
  };

  const handleSubmit = () => {
    const modifiedVisita = {
      ...objVisita,
      status: '1' as '1',
      observation: observacion,
    };
    visitaService.updateVisita(modifiedVisita, objVisita.id_tercero);
    console.log('modifiedVisita', modifiedVisita);
    onSubmit({observacion, status: true});
    onClose();
  };

  const handleContentSizeChange = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const baseHeight = Dimensions.get('window').height * 0.5;
    const maxHeight = Dimensions.get('window').height * 0.5; // Altura máxima del modal
    const newHeight = Math.min(baseHeight + contentHeight, maxHeight);
    setDynamicHeight(newHeight);
  };

  const modalHeight = Math.min(
    isKeyboardVisible
      ? dynamicHeight // Usa la altura dinámica incluso con el teclado activado
      : dynamicHeight, // Usa la altura dinámica cuando el teclado está desactivado
    Dimensions.get('window').height * 0.5, // Limita la altura máxima al 50% de la pantalla
  );
  const renderContent = () => {
    if (!showText) {
      return (
        <Animated.View
          style={[
            styles.iconContainer,
            {transform: [{scale: pulseAnim}]}, // Aplica la animación de escala
          ]}>
          <Icon name="map-marker-radius" size={40} color="#092254" />
        </Animated.View>
      );
    }

    switch (locationStatus) {
      case 1:
        return (
          <Text style={styles.text}>
            Coordenadas del cliente no son válidas. Asegúrese de registrar la
            ubicación del cliente con anterioridad e intente de nuevo.
          </Text>
        );
      case 2:
        return (
          <Text style={styles.text}>
            No se pudo obtener la ubicación del vendedor. Asegúrese de tener la
            ubicación activada y los permisos correspondientes e intente de
            nuevo.
          </Text>
        );
      case 3:
        return (
          <>
            <Text style={styles.text}>
              Usted no se encuentra en la zona de georeferencia, especifique el
              motivo por el cual el pedido se realiza por fuera del punto del
              cliente {tercero.nombre}.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese observación"
              onChangeText={text => setObservacion(text)}
              multiline={true}
              maxLength={100}
              onContentSizeChange={handleContentSizeChange} // Ajusta la altura del modal
            />
          </>
        );
      case 99:
        return <Text style={styles.text}>Error verificando la ubicación.</Text>;
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (!showText) {
      return null; // No mostrar botones hasta que el texto esté visible
    }

    if (locationStatus === 3) {
      return (
        <Dialog.Actions>
          <Button onPress={handleSubmit}>
            <Text style={styles.textButton}>Guardar</Text>
          </Button>
        </Dialog.Actions>
      );
    } else if (
      locationStatus === 1 ||
      locationStatus === 2 ||
      locationStatus === 99
    ) {
      return (
        <Dialog.Actions>
          <Button onPress={handleAccept}>
            <Text style={styles.textButton}>Aceptar</Text>
          </Button>
        </Dialog.Actions>
      );
    }
    return null;
  };

  return (
    <Portal>
      <Dialog
        visible={visible && locationStatus !== 0}
        onDismiss={onClose}
        dismissable={false}
        style={[styles.dialog, {width: modalWidth, height: modalHeight}]}>
        <View style={[styles.headContainer, styles.row]}>
          <Icon name="map-marker" size={25} color="#fff" style={styles.icon} />
          <Text style={styles.title}>Ubicación del vendedor</Text>
        </View>
        <Dialog.Content style={styles.dialogContent}>
          {renderContent()}
        </Dialog.Content>
        {renderActions()}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  textButton: {
    color: '#fff',
    backgroundColor: '#092254',
    padding: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  headContainer: {
    backgroundColor: '#092254',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    marginTop: 0,
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 2, // Espacio entre el icono y el texto
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  iconClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dialogContent: {
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    color: '#092254', // Color del texto
    fontWeight: '600', // Semibold
    fontSize: 14, // Tamaño de fuente
    textAlign: 'center', // Centra el texto
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    padding: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 10,
    width: '90%',
    maxHeight: 80,
    color: '#092254',
    
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default AwayFromUbication;
