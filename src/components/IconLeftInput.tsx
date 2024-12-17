import React from 'react';
import {StyleSheet} from 'react-native';

import {TextInput} from 'react-native-paper';

type Mode = 'outlined' | 'flat';
type KeyboadType = 'default' | 'number-pad';
type Icon = 'magnify' | 'account-search';

interface IconLeftInputProps {
  value: string;
  name: string;
  mode: Mode;
  keyboardType: KeyboadType;
  handleInputChange: Function;
  icon: Icon;
}

export const IconLeftInput = ({
  value,
  name,
  mode,
  keyboardType,
  handleInputChange,
  icon,
}: IconLeftInputProps) => {
  return (
    <TextInput
      value={value}
      placeholder="Buscar"
      onChangeText={text => handleInputChange(name, text)}
      mode={mode}
      keyboardType={keyboardType}
      left={<TextInput.Icon icon={icon} />}
      style={styles.input}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    height: 40,
    fontSize: 18,
    borderRadius: 10,
  },
});
