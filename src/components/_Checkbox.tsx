import React from 'react';

import {View, Text, StyleSheet} from 'react-native';

/* paper */
import {Checkbox} from 'react-native-paper';

interface NormalCheckboxProps {
  label: string;
  status: boolean;
  onPress: (status: boolean) => void;
}

export const _Checkbox = ({label, status, onPress}: NormalCheckboxProps) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Text
        allowFontScaling={false}
        style={{
          color: '#365AC3',
          fontSize: 16,
          marginBottom: -5,
        }}>
        {label}
      </Text>
      <Checkbox
        status={status ? 'checked' : 'unchecked'}
        onPress={() => onPress(!status)}
      />
    </View>
  );
};
