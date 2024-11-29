import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import {TextInput} from 'react-native-paper';

interface PasswordInputProps {
  value: string;
  label: string;
  name: string;
  handleInputChange: Function;
}

// Obtener las dimensiones de la pantalla
const {width, height} = Dimensions.get('window');

// Función para calcular el tamaño de la fuente basado en el ancho del dispositivo
const scaleFontSize = (size: number) => (width / 375) * size;

export const PasswordInput = ({
  value,
  label,
  name,
  handleInputChange,
}: PasswordInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={value}
        label={label}
        onChangeText={text => handleInputChange(name, text)}
        mode="outlined"
        secureTextEntry={true}
        style={styles.input}></TextInput>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  input: {
    fontSize: scaleFontSize(15),
    marginBottom: 5,
  },
});
