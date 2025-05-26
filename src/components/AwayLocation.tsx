import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Dimensions,
  Keyboard,
  ScrollView, // Importado
  Platform,
} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native'; // Mantener si handleAccept lo usa
import Toast from 'react-native-toast-message'; // Importar Toast

import {useAppSelector} from '../redux/hooks'; // useAppDispatch no se usa directamente aquí
import {ITerceros, IVisita} from '../common/types';
import {checkLocation} from '../utils/checkLocation'; // Asumiendo que está en utils
import {visitaService} from '../data_queries/local_database/services';
import {NOT_NEAR_CLIENT_REASONS, ReasonOption} from '../utils'; // Asegúrate que la ruta sea correcta

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  tercero: ITerceros;
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

// --- Constantes para el diseño ---
const screen = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_REASON_ITEMS = 3; // Puede ser menor ya que hay más texto introductorio

// --- Definición de Estilos (fuera del componente) ---
const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    padding: 0,
    width: screen.width < 450 ? '92%' : '85%', // Ligeramente más ancho
    maxWidth: 550,
    maxHeight: screen.height * 0.9, // Puede necesitar más altura para el caso 3
    overflow: 'hidden',
  },
  headContainer: {
    backgroundColor: '#092254',
    flexDirection: 'row', // Para alinear ícono y título
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20, // Espacio para el título
    position: 'relative',
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18, // Ligeramente más pequeño para acomodar ícono
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flexShrink: 1, // Para que el texto se ajuste si es muy largo
  },
  // iconClose no se usa en este modal según el código original, pero se puede añadir si se desea
  dialogScrollableContent: {
    flexShrink: 1,
  },
  dialogContentInternal: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center', // Centrar contenido como el ícono de carga
  },
  loadingIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30, // Espacio para el ícono y texto de carga
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#092254',
    fontWeight: '500',
  },
  statusText: {
    // Para mensajes de locationStatus 1, 2, 99
    color: '#092254',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  case3MainPromptText: {
    // Texto principal para el caso 3
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  customerNameText: {
    fontSize: 15,
    color: '#092254',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  reasonsPromptText: {
    // Texto antes de la lista de motivos
    fontSize: 15,
    color: '#444444',
    marginBottom: 10,
    textAlign: 'left', // Alinear a la izquierda
    width: '100%', // Ocupar ancho
  },
  reasonsListContainer: {
    height: ITEM_HEIGHT * VISIBLE_REASON_ITEMS,
    width: '100%', // Ocupar ancho
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: '#f9f9f9',
  },
  reasonItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  reasonItemSelected: {
    backgroundColor: '#e0eafc',
  },
  reasonItemText: {
    fontSize: 15,
    color: '#092254',
  },
  reasonItemTextSelected: {
    fontWeight: 'bold',
    color: '#071a40',
  },
  inputForCustomReason: {
    // Estilo específico para el input de "otro motivo"
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 15,
    color: '#092254',
    textAlignVertical: 'top',
    minHeight: 60,
    width: '100%',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'flex-end', // Default para Cancelar / Guardar
    backgroundColor: '#f5f5f5',
  },
  actionsContainerCentered: {
    // Para centrar el botón "Aceptar"
    justifyContent: 'center',
  },
  actionButtonText: {
    // Estilo común para el texto de los botones de acción
    fontWeight: 'bold',
    fontSize: 15,
  },
  acceptButton: {
    // Para el botón Aceptar
    backgroundColor: '#092254',
    minWidth: 120, // Ancho mínimo para el botón Aceptar
  },
  acceptButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#555555',
  },
  submitButton: {
    // Para el botón Guardar
    backgroundColor: '#092254',
    marginLeft: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

export const AwayFromUbication: React.FC<IModalProps> = ({
  visible,
  onClose,
  tercero,
  onSubmit,
}) => {
  const navigation: any = useNavigation();
  const objVisita = useAppSelector(store => store.visitas.objVisita);

  const [locationStatus, setLocationStatus] = useState<number | null>(null); // null para estado inicial de carga
  const [showText, setShowText] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Mantener si se usa para ajustes finos

  // Estados para la lógica de selección de motivos (solo para locationStatus === 3)
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>('');

  // Listener del teclado (opcional, para ajustes finos si es necesario)
  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsKeyboardVisible(true));
  //   const keyboardDidHideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsKeyboardVisible(false));
  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  useEffect(() => {
    const handleCheckLocation = async () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      try {
        const status = await checkLocation(tercero.latitude, tercero.longitude);
        setLocationStatus(status);
        if (status === 0) {
          Toast.show({
            type: 'success',
            text1: 'Ubicación verificada',
            text2: 'Estás en la zona del cliente.',
          });
          onSubmit({observacion: '', status: true}); // status: false porque no se está guardando una "excepción"
          onClose(); // Cierra si está en zona
        }
      } catch (error) {
        console.error('Error en checkLocation:', error);
        setLocationStatus(99); // Error genérico
      } finally {
        // Detener la animación de pulso cuando la verificación termina (si no es status 0)
        // Si es status 0, el modal se cierra, por lo que la animación se detiene.
        if (locationStatus !== 0) {
          // locationStatus aquí es el valor *antes* del último setLocationStatus
          pulseAnim.stopAnimation(); // Detener loop
          pulseAnim.setValue(1); // Resetear escala
        }
        setTimeout(() => {
          setShowText(true); // Mostrar contenido después de un breve retraso
        }, 1000); // Reducido el tiempo de espera
      }
    };

    if (visible) {
      // Resetear estados al abrir el modal
      setLocationStatus(null);
      setShowText(false);
      setSelectedReasonId(null);
      setCustomReason('');
      pulseAnim.setValue(1); // Resetear animación inicial

      handleCheckLocation();
    } else {
      pulseAnim.stopAnimation(); // Asegurarse de detener la animación al cerrar
    }

    // Limpieza de la animación
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [visible, tercero.latitude, tercero.longitude]); // No incluir pulseAnim en deps si se modifica dentro

  const handleAcceptAndClose = () => {
    // Para los casos 1, 2, 99
    onSubmit({observacion: renderContent(true) as string, status: false}); // Enviar el mensaje de error como observación, status false
    onClose();
    // La navegación original se puede manejar fuera del modal después de que onSubmit y onClose se resuelvan
    // if (navigation.canGoBack()) {
    //   navigation.goBack();
    // } else {
    //   navigation.navigate('TabNavPrincipal');
    // }
  };

  const handleSubmitForStatus3 = async () => {
    let finalObservation = '';
    const selectedReason = NOT_NEAR_CLIENT_REASONS.find(
      r => r.id === selectedReasonId,
    );

    if (selectedReasonId === 'NC999') {
      if (!customReason.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Atención',
          text2: 'Por favor, especifique el otro motivo.',
        });
        return;
      }
      finalObservation = customReason.trim();
    } else if (selectedReason) {
      finalObservation = selectedReason.label;
    } else {
      Toast.show({
        type: 'error',
        text1: 'Atención',
        text2: 'Por favor, seleccione un motivo.',
      });
      return;
    }

    if (!objVisita || !objVisita.id_visita) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo identificar la visita actual.',
      });
      return;
    }

    const visitaToUpdate: IVisita = {
      ...objVisita,
      status: '1', // O el status que signifique "visitado, pedido tomado fuera de zona con justificación"
      observation: `Fuera de Ubicación: ${finalObservation}`, // Prefijo para claridad
    };

    try {
      await visitaService.updateVisita(visitaToUpdate, objVisita.id_visita);
      onSubmit({observacion: visitaToUpdate.observation!, status: true});
      onClose();
    } catch (error) {
      console.error('Error al guardar visita (fuera de ubicación):', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo guardar la visita.',
      });
    }
  };

  const renderContent = (getTextForSubmit: boolean = false) => {
    if (!showText || locationStatus === null) {
      return (
        <Animated.View
          style={[
            styles.loadingIconContainer,
            {transform: [{scale: pulseAnim}]},
          ]}>
          <Icon name="map-marker-radius-outline" size={60} color="#092254" />
          <Text style={styles.loadingText}>Verificando ubicación...</Text>
        </Animated.View>
      );
    }
    let message = '';
    switch (locationStatus) {
      case 1:
        message = `Coordenadas del cliente (${tercero.nombre}) no son válidas. Asegúrese de registrar la ubicación del cliente e intente de nuevo.`;
        if (getTextForSubmit) return message;
        return <Text style={styles.statusText}>{message}</Text>;
      case 2:
        message =
          'No se pudo obtener la ubicación del vendedor. Asegúrese de tener la ubicación activada y los permisos correspondientes.';
        if (getTextForSubmit) return message;
        return <Text style={styles.statusText}>{message}</Text>;
      case 3:
        if (getTextForSubmit) return ''; // Para el caso 3, la observación se construye diferente
        return (
          <>
            <Text style={styles.case3MainPromptText}>
              Usted no se encuentra en la zona de georeferencia del cliente:
            </Text>
            <Text style={styles.customerNameText}>{tercero.nombre}</Text>
            <Text style={styles.reasonsPromptText}>
              Por favor, especifique el motivo:
            </Text>
            <View style={styles.reasonsListContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {NOT_NEAR_CLIENT_REASONS.map((reason: ReasonOption) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReasonId === reason.id &&
                        styles.reasonItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedReasonId(reason.id);
                      if (reason.id !== 'NC999') {
                        setCustomReason('');
                      }
                    }}>
                    <Text
                      style={[
                        styles.reasonItemText,
                        selectedReasonId === reason.id &&
                          styles.reasonItemTextSelected,
                      ]}>
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {selectedReasonId === 'NC999' && (
              <TextInput
                style={styles.inputForCustomReason}
                placeholder="Especifique el otro motivo (máx. 150)"
                placeholderTextColor="#888"
                // value={customReason}
                onChangeText={setCustomReason}
                multiline={true}
                numberOfLines={3}
                maxLength={150}
              />
            )}
          </>
        );
      case 99:
        message = 'Error crítico verificando la ubicación. Contacte a soporte.';
        if (getTextForSubmit) return message;
        return <Text style={styles.statusText}>{message}</Text>;
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (!showText || locationStatus === null) {
      return null;
    }

    if (locationStatus === 3) {
      return (
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onClose} labelStyle={styles.cancelButtonText}>
            Cancelar
          </Button>
          <Button
            onPress={handleSubmitForStatus3}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}>
            Guardar
          </Button>
        </Dialog.Actions>
      );
    } else if ([1, 2, 99].includes(locationStatus)) {
      return (
        <Dialog.Actions
          style={[styles.dialogActions, styles.actionsContainerCentered]}>
          <Button
            onPress={handleAcceptAndClose}
            style={styles.acceptButton}
            labelStyle={[styles.actionButtonText, styles.acceptButtonText]}>
            Aceptar
          </Button>
        </Dialog.Actions>
      );
    }
    return null;
  };

  return (
    <Portal>
      <Dialog
        visible={visible && locationStatus !== 0} // No mostrar si status es 0 (ya se cerró)
        onDismiss={locationStatus === 3 ? onClose : handleAcceptAndClose} // Permitir cerrar solo en caso 3, otros casos se cierran con Aceptar
        dismissable={locationStatus === 3} // Solo caso 3 es cancelable por el usuario
        style={styles.dialog}>
        <View style={styles.headContainer}>
          <Icon
            name="map-marker-alert-outline"
            size={24}
            color="#fff"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Verificación de Ubicación</Text>
        </View>

        <ScrollView style={styles.dialogScrollableContent}>
          <View style={styles.dialogContentInternal}>{renderContent()}</View>
        </ScrollView>

        {renderActions()}
      </Dialog>
    </Portal>
  );
};

// export default AwayFromUbication; // Si es el export por defecto del archivo
