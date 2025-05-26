import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Keyboard,
  ScrollView, // Importamos ScrollView
  Alert,
  Platform,
} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks'; // useAppDispatch puede no ser necesario aquí
import {ITerceros, IVisita} from '../common/types';
import {visitaService} from '../data_queries/local_database/services';
// Importa tus razones y el tipo ReasonOption
import {NO_ORDER_AFTER_VISIT_REASONS, ReasonOption} from '../utils'; // Asegúrate que la ruta sea correcta
import Toast from 'react-native-toast-message';

interface IVisitaSinPedidoModalProps {
  // Props renombradas para claridad
  visible: boolean;
  onClose: () => void;
  tercero: ITerceros; // Mantenemos el tercero para el mensaje
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

// --- Constantes para el diseño ---
const screen = Dimensions.get('window');
const ITEM_HEIGHT = 50; // Altura estimada para cada opción de motivo en la lista
const VISIBLE_REASON_ITEMS = 4; // Número de ítems visibles en la lista de motivos

// --- Definición de Estilos (fuera del componente para optimización) ---
// Usaremos los mismos nombres de estilo que en CancelarVisita para consistencia,
// ajustando textos si es necesario.
const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    padding: 0,
    width: screen.width < 450 ? '90%' : '80%',
    maxWidth: 500,
    maxHeight: screen.height * 0.85, // Altura máxima para el diálogo
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
  },
  iconClose: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
  },
  dialogScrollableContent: {
    // ScrollView principal para el contenido del diálogo
    flexShrink: 1,
  },
  dialogContentInternal: {
    // Contenido dentro del ScrollView principal
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: 16,
    marginBottom: 8, // Un poco menos de margen
    color: '#333333',
    fontWeight: '500',
  },
  customerNameText: {
    // Estilo para el nombre del cliente
    fontSize: 15,
    color: '#092254',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reasonsListContainer: {
    height: ITEM_HEIGHT * VISIBLE_REASON_ITEMS,
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
    minHeight: 60,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'flex-end',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
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

export const VisitaSinPedidoModal: React.FC<IVisitaSinPedidoModalProps> = ({
  // Nombre del componente cambiado
  visible,
  onClose,
  tercero, // Se usa para mostrar el nombre del cliente
  onSubmit,
}) => {
  const objVisita = useAppSelector(store => store.visitas.objVisita); // Visita actual de Redux

  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Aún puede ser útil

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
    let finalObservation = '';
    const selectedReason = NO_ORDER_AFTER_VISIT_REASONS.find(
      r => r.id === selectedReasonId,
    );

    // 'NV999' es el ID para "Otro motivo" de la lista NO_ORDER_AFTER_VISIT_REASONS
    if (selectedReasonId === 'NV999') {
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
        text1: 'Por favor, seleccione un motivo.',
        visibilityTime: 3000,
      });
      return;
    }

    if (!objVisita || !objVisita.id_visita) {
      Toast.show({
        type: 'error',
        text1: 'Error al obtener la visita. Intente de nuevo.',
        visibilityTime: 3000,
      });
      return;
    }

    const visitaToUpdate: IVisita = {
      ...objVisita,
      status: '1', // Estado para "visitado sin pedido"
      observation: finalObservation,
    };

    try {
      await visitaService.updateVisita(visitaToUpdate, objVisita.id_visita);
      onSubmit({observacion: finalObservation, status: true});
      onClose();
    } catch (error) {
      console.error('Error al actualizar la visita:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al registrar la visita sin pedido.',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} style={styles.dialog}>
        <View style={styles.headContainer}>
          <Text style={styles.title}>Visita Sin Pedido</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconClose}>
            <Icon name="close-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.dialogScrollableContent}>
          <View style={styles.dialogContentInternal}>
            <Text style={styles.promptText}>
              Motivo por el que no se realizó pedido en la visita a:
            </Text>
            <Text style={styles.customerNameText}>
              {tercero?.nombre || 'Cliente no especificado'}
            </Text>

            <View style={styles.reasonsListContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {NO_ORDER_AFTER_VISIT_REASONS.map((reason: ReasonOption) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReasonId === reason.id &&
                        styles.reasonItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedReasonId(reason.id);
                      if (reason.id !== 'NV999') {
                        // Usar el ID correcto para "Otro"
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

            {selectedReasonId === 'NV999' && ( // Usar el ID correcto para "Otro"
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
            Guardar Visita
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
