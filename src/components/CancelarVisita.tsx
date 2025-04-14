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
import {IVisita} from '../common/types';
import {visitaService} from '../data_queries/local_database/services';

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

export const CancelarVisita: React.FC<IModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const objVisita = useAppSelector(store => store.visitas.objVisita);
  const [observacion, setObservacion] = useState('');
  const animation = useRef(new Animated.Value(0)).current;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [dynamicHeight, setDynamicHeight] = useState(
    Dimensions.get('window').height * 0.3,
  );
  const modalWidth = Dimensions.get('window').width < 400 ? '90%' : '80%';

  const handleContentSizeChange = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const baseHeight = Dimensions.get('window').height * 0.5;
    const maxHeight = Dimensions.get('window').height * 0.5; // Altura máxima del modal
    const newHeight = Math.min(baseHeight + contentHeight, maxHeight);
    setDynamicHeight(newHeight);
  };

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

  const handleSubmit = async () => {
    const modifiedVisita: IVisita = {
      ...objVisita,
      status: '3', // Cambiar el estado a "cancelado"
      observation: observacion, // Agregar la observación
    };
    try {
      console.log('Cancelando visita:', objVisita);
      // Actualizar la visita
      await visitaService.updateVisita(modifiedVisita, objVisita.id_visita);
      onSubmit({observacion, status: true});
      onClose();
    } catch (error) {
      console.error('Error al cancelar la visita:', error);
    }
  };

  const modalHeight = isKeyboardVisible
    ? Dimensions.get('window').height * 0.35 // Altura cuando el teclado está visible
    : Dimensions.get('window').height * 0.35; // Altura predeterminada

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onClose}
        style={[styles.dialog, {width: modalWidth, height: modalHeight}]}>
        <View style={styles.headContainer}>
          <Text style={styles.title}>Cancelar visita</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconClose}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Dialog.Content style={styles.dialogContent}>
          <Text>
            Especifique la razón por la que se cancela esta visita.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese observación"
            onChangeText={text => setObservacion(text)}
            multiline={true}
            maxLength={100}
            onContentSizeChange={handleContentSizeChange} // Ajusta la altura del modal
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleSubmit}>
            <Text style={styles.textButton}>Guardar</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  textButton: {color: '#092254'},
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
    color: '#092254',
  },
});