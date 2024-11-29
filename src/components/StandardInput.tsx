import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import {TextInput} from 'react-native-paper';

type Mode = 'outlined' | 'flat';
type KeyboadType = 'default' | 'number-pad';

interface StandardInputProps {
  value: string;
  label: string;
  name: string;
  mode?: Mode;
  keyboardType?: KeyboadType;
  onChange: (input: string, text: string) => void;
}

// Obtener las dimensiones de la pantalla
const {width, height} = Dimensions.get('window');

// Función para calcular el tamaño de la fuente basado en el ancho del dispositivo
const scaleFontSize = (size: number) => (width / 375) * size;

export const StandardInput = ({
  value,
  label,
  name,
  mode,
  keyboardType,
  onChange,
}: StandardInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        allowFontScaling={false}
        value={value}
        label={label}
        onChangeText={text => onChange(name, text)}
        mode={mode}
        keyboardType={keyboardType}
        style={styles.input}
        contentStyle={{fontSize: scaleFontSize(13)}}
        ></TextInput>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    padding: 0,
    fontSize: scaleFontSize(15),
    marginBottom: 5,
  },
});
