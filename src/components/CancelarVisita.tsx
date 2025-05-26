import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Keyboard,
  ScrollView,
  Alert,
  Platform, // Para KeyboardAvoidingView si es necesario
} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {IVisita} from '../common/types';
import {visitaService} from '../data_queries/local_database/services';
import {CANCEL_VISIT_REASONS, ReasonOption} from '../utils'; // Asegúrate que la ruta sea correcta
import Toast from 'react-native-toast-message';

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

// --- Constantes para el diseño ---
const screen = Dimensions.get('window');
const ITEM_HEIGHT = 50; // Altura estimada para cada opción de motivo en la lista
const VISIBLE_REASON_ITEMS = 4; // Número de ítems visibles en la lista de motivos

// --- Definición de Estilos (fuera del componente para optimización) ---
const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12, // Bordes un poco más redondeados
    alignSelf: 'center',
    padding: 0, // El padding se manejará internamente
    width: screen.width < 450 ? '90%' : '80%', // Ancho responsive
    maxWidth: 500, // Ancho máximo para tabletas pequeñas o teléfonos grandes
    maxHeight: screen.height * 0.85, // Altura máxima para evitar que ocupe toda la pantalla
    overflow: 'hidden', // Para que el borderRadius se aplique al header
  },
  headContainer: {
    backgroundColor: '#092254',
    // No necesita borderTopRadius si el dialog tiene overflow:hidden y borderRadius
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 40, // Espacio para el título si es largo y el botón de cerrar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  iconClose: {
    position: 'absolute',
    top: 0, // Ajustar para que quede bien con el padding del headContainer
    right: 0,
    padding: 12, // Área táctil más grande
  },
  // Contenedor principal del contenido del diálogo, permite scroll si el contenido excede maxHeight del Dialog
  dialogScrollableContent: {
    flexShrink: 1, // Importante para que el ScrollView no intente ocupar espacio infinito
  },
  dialogContentInternal: {
    paddingTop: 20,
    paddingHorizontal: 20, // Padding general del contenido
  },
  promptText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333333',
    fontWeight: '500',
  },
  reasonsListContainer: {
    height: ITEM_HEIGHT * VISIBLE_REASON_ITEMS, // Altura fija para N ítems visibles
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: '#f9f9f9',
  },
  reasonItem: {
    paddingVertical: 14, // Un poco más de padding vertical
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
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 15,
    color: '#092254',
    textAlignVertical: 'top',
    minHeight: 60, // Altura mínima para el input de "otro motivo"
    backgroundColor: '#ffffff',
    marginBottom: 10, // Espacio antes de los botones de acción
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Un poco más de padding para los actions
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'flex-end',
    backgroundColor: '#f5f5f5', // Un fondo sutil para la sección de acciones
  },
  cancelButtonText: {
    // Estilo para el texto del botón "Cancelar" de Paper
    color: '#555555',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#092254',
    marginLeft: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export const CancelarVisita: React.FC<IModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch(); // Mantener por si se usa en el futuro
  const objVisita = useAppSelector(store => store.visitas.objVisita);

  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Podría usarse para ajustar paddings

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setSelectedReasonId(null);
      setCustomReason('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    console.log('Entre');
    let finalObservation = '';
    const selectedReason = CANCEL_VISIT_REASONS.find(
      r => r.id === selectedReasonId,
    );

    if (selectedReasonId === 'CV999') {
      if (!customReason.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Por favor, especifique el motivo de la cancelación.',
          visibilityTime: 3000,
        });
        return;
      }
      finalObservation = customReason.trim();
    } else if (selectedReason) {
      finalObservation = selectedReason.label;
    } else {
      Toast.show({
        type: 'error',
        text1: 'Por favor, seleccione un motivo de la lista.',
        visibilityTime: 3000,
      });
      return;
    }

    if (!objVisita || !objVisita.id_visita) {
      Toast.show({
        type: 'error',
        text1: 'Error al cancelar la visita. Intente de nuevo.',
        visibilityTime: 3000,
      });
      return;
    }

    const visitaToUpdate: IVisita = {
      ...objVisita,
      status: '3',
      observation: finalObservation,
    };

    try {
      console.log('Visita a cancelar:', visitaToUpdate);
      await visitaService.updateVisita(visitaToUpdate, objVisita.id_visita);
      onSubmit({observacion: finalObservation, status: true});
      onClose();
    } catch (error) {
      console.error('Error al cancelar la visita:', error);
      Alert.alert('Error', 'No se pudo cancelar la visita. Intente de nuevo.');
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <View style={styles.headContainer}>
          <Text style={styles.title}>Cancelar visita</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconClose}>
            <Icon name="close-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Envolvemos el contenido principal en un ScrollView por si el contenido excede la altura máxima del diálogo */}
        <ScrollView style={styles.dialogScrollableContent}>
          <View style={styles.dialogContentInternal}>
            <Text style={styles.promptText}>
              Seleccione el motivo de la cancelación:
            </Text>
            <View style={styles.reasonsListContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {CANCEL_VISIT_REASONS.map((reason: ReasonOption) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReasonId === reason.id &&
                        styles.reasonItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedReasonId(reason.id);
                      if (reason.id !== 'CV999') {
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

            {selectedReasonId === 'CV999' && (
              <TextInput
                style={styles.input}
                placeholder="Especifique el otro motivo (máx. 150 caracteres)"
                placeholderTextColor="#888"
                // value={customReason}
                onChangeText={setCustomReason}
                multiline={true}
                numberOfLines={3}
                maxLength={150}
              />
            )}
          </View>
        </ScrollView>

        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onClose} labelStyle={styles.cancelButtonText}>
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}>
            Guardar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
