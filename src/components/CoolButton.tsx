import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GreenButtonProps {
  value: string;
  iconName: string;
  colorButton: string;
  colorText: string;
  iconSize: number;
  fontSize?: number;
  disabled?: boolean;
  loading?: boolean;
  pressCoolButton: Function;
}

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
}: GreenButtonProps) => {
  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    button: {
      borderRadius: 5,
    },
    textButton: {
      color: colorText,
      fontSize,
    },
    internalButton: {
      display: 'flex',
      justifyContent: 'center',
      height: 40,
    },
  });

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        buttonColor={colorButton}
        onPress={() => pressCoolButton()}
        style={styles.button}
        contentStyle={styles.internalButton}
        loading={loading}
        icon={({color, size}) => (
          <Icon name={iconName} color={color} size={iconSize} />
        )}
        disabled={disabled}>
        <Text allowFontScaling={false} style={styles.textButton}>
          {value}
        </Text>
      </Button>
    </View>
  );
};
