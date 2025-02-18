import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';

import {TextInput} from 'react-native-paper';

// Obtener las dimensiones de la pantalla
const {width} = Dimensions.get('window');

// Función para calcular el tamaño de la fuente basado en el ancho del dispositivo
const scaleFontSize = (size: number) => (width / 375) * size;

export const _Input = ({...props}) => {
  return (
    <TextInput
      {...props}
      allowFontScaling={false}
      style={styles.input}
      contentStyle={{fontSize: scaleFontSize(13)}}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ddd',
    padding: 0,
    width: '100%',
    height: 40,
    fontSize: scaleFontSize(15),
  },
});
