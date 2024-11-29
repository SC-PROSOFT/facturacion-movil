import React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton as PaperIconButton} from 'react-native-paper';

interface IconButtonProps {
  iconName: string;
  iconColor: string;
  iconSize: number;
  pressIconButton: Function;
}

export const IconButton = ({
  iconName,
  iconColor,
  iconSize,
  pressIconButton,
}: IconButtonProps) => {
  return (
    <PaperIconButton
      icon={iconName}
      iconColor={iconColor}
      onPress={() => pressIconButton()}
      size={iconSize}
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
  },
});
