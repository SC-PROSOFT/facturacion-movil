import React from 'react';

import {View, Text, StyleSheet} from 'react-native';

/* paper */
import {Checkbox} from 'react-native-paper';

interface NormalCheckboxProps {
  label: string;
  checkboxName: string;
  checked: boolean;
  pressNormalCheckbox: Function;
}

export const NormalCheckbox = ({
  label,
  checkboxName,
  checked,
  pressNormalCheckbox,
}: NormalCheckboxProps) => {
  return (
    <View style={styles.container}>
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        onPress={() => pressNormalCheckbox(checkboxName, !checked)}
      />
       <Text allowFontScaling={false} style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#303134',
    marginBottom: 2,
  },
});
