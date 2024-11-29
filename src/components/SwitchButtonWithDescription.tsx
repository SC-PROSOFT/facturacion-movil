import React from 'react';

import {View, StyleSheet} from 'react-native';

import {Switch, Text} from 'react-native-paper';

interface SwitchButtonProps {
  switchMode: boolean;
  switchName: string;
  description: string;
  onToggleSwitch: any;
}

export const SwitchButton = ({
  switchMode,
  switchName,
  description,
  onToggleSwitch,
}: SwitchButtonProps) => {
  const switchState = () => {
    switch (switchMode) {
      case true:
        return 'Si';
      case false:
        return 'No';
      default:
        return 'No';
    }
  };

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.descripcion}>
        {description}
      </Text>
      <View style={styles.container2}>
        <Text allowFontScaling={false} style={styles.estado}>
          {switchState()}
        </Text>
        <Switch
          value={switchMode}
          onValueChange={() => onToggleSwitch(switchName, !switchMode)}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  container2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '22%',
  },
  descripcion: {
    color: 'black',
    fontSize: 18,
  },
  estado: {
    color: '#7B7B7B',
    fontSize: 18,
    marginTop: 1,
  },
  switch: {
    transform: [{scaleX: 1.5}, {scaleY: 1.5}],
  },
});
