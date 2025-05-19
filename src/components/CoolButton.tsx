import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper'; // No necesitas importar Text de paper si usas el hijo directo o labelStyle
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CoolButtonProps {
  value: string;
  iconName: string;
  colorButton: string; // Color del botón cuando está habilitado
  colorText: string; // Color del texto cuando está habilitado
  iconSize: number;
  fontSize?: number;
  disabled?: boolean;
  loading?: boolean;
  pressCoolButton: () => void; // Más específico que Function
}

// Estilos que no dependen de las props pueden definirse fuera para optimización
const staticStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    borderRadius: 5,
  },
  internalButton: {
    display: 'flex',
    justifyContent: 'center',
    height: 40,
  },
});

export const CoolButton = ({
  value,
  iconName,
  colorButton,
  colorText,
  iconSize,
  fontSize = 18,
  disabled = false,
  loading = false,
  pressCoolButton,
}: CoolButtonProps) => {
  // react-native-paper Button maneja el estado 'disabled' internamente:
  // 1. Aplica opacidad/cambia el color del botón (buttonColor).
  // 2. Aplica opacidad/cambia el color del texto y del ícono.
  // 3. Previene la ejecución de onPress.

  // Estilo para el texto del botón, usando las props.
  // Paper Button ajustará la apariencia de este estilo cuando esté deshabilitado.
  const labelStyle = {
    color: colorText,
    fontSize,
  };

  // Si el botón está cargando, también debería estar efectivamente deshabilitado para la interacción.
  const isDisabled = disabled || loading;

  return (
    <View style={staticStyles.container}>
      <Button
        mode="contained"
        buttonColor={colorButton} // Paper Button aplicará su propia transformación de opacidad a este color cuando esté deshabilitado.
        onPress={() => {
          // No es necesario verificar `if (!isDisabled)` aquí,
          // el componente Button de Paper ya lo hace si `disabled` es true.
          pressCoolButton();
        }}
        style={staticStyles.button}
        contentStyle={staticStyles.internalButton}
        loading={loading}
        disabled={isDisabled} // Pasamos el estado de deshabilitado
        icon={({color, size}) => (
          <Icon name={iconName} color={color} size={iconSize} />
        )}
        labelStyle={labelStyle} // Aplicamos el estilo al texto del botón
      >
        {/* El texto se pasa como hijo al Button. Paper lo manejará con labelStyle. */}
        {value}
      </Button>
    </View>
  );
};
