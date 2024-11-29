import React from 'react';
import {View, StyleSheet} from 'react-native';

import {TextInput} from 'react-native-paper';

type Mode = 'outlined' | 'flat';
type KeyboadType = 'default' | 'number-pad';
type Icon = 'magnify' | 'account-search';

interface IconLeftInputProps {
  value: string;
  label: string;
  name: string;
  mode: Mode;
  keyboardType: KeyboadType;
  handleInputChange: Function;
  icon: Icon;
}

export const IconLeftInput = ({
  value,
  label,
  name,
  mode,
  keyboardType,
  handleInputChange,
  icon,
}: IconLeftInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={value}
        //label={label}
        placeholder="Buscar"
        onChangeText={text => handleInputChange(name, text)}
        mode={mode}
        keyboardType={keyboardType}
        left={<TextInput.Icon icon={icon} />}
        style={styles.input}></TextInput>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    height: 40,
    fontSize: 18,
    marginBottom: 5,
    borderRadius: 10,
  },
});
