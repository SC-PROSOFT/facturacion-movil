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
import {useAppDispatch} from '../redux/hooks';
import {ITerceros} from '../common/types';
import {_Input} from './_Input';

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  tercero: ITerceros;
  onSubmit: (data: {observacion: string; status: boolean}) => void;
}

export const TercerosModal: React.FC<IModalProps> = ({
  visible,
  onClose,
  tercero,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const [observacion, setObservacion] = useState('');
  const animation = useRef(new Animated.Value(0)).current;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  const handleSubmit = () => {
    onSubmit({observacion, status: true});
    onClose();
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
          <Text style={styles.title}>Realizar visita sin pedido</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconClose}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Dialog.Content style={styles.dialogContent}>
          <Text>
            Especifique la razón por la que no se realizará pedido en la visita
            de {tercero.nombre}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese observación"
            value={observacion}
            onChangeText={text => setObservacion(text)} // Actualización directa del estado
            multiline={true}
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
  },
});
