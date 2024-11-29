import React from 'react';

import {View, Text, StyleSheet, Dimensions} from 'react-native';

import {Button} from 'react-native-paper';

interface NormalButtonProps {
  value: string;
  backgroundColor?: string;
  textColor?: string;
  pressNormalButton: Function;
}

// Obtener las dimensiones de la pantalla
const {width, height} = Dimensions.get('window');

// Función para calcular el tamaño de la fuente basado en el ancho del dispositivo
const scaleFontSize = (size: number) => (width / 375) * size;

export const NormalButton = ({
  value,
  backgroundColor,
  textColor,
  pressNormalButton,
}: NormalButtonProps) => {
  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    button: {
      fontSize: scaleFontSize(13)
    },
    internalButton: {
      display: 'flex',
      justifyContent: 'center',
      height: scaleFontSize(50),
      color: textColor,
      backgroundColor: backgroundColor,
    },
  });

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => pressNormalButton()}
        labelStyle={styles.button}
        contentStyle={styles.internalButton}>
        {value}
      </Button>
    </View>
  );
};
