import React from 'react';
import {StyleSheet, View, Button} from 'react-native';
import {TextInput} from 'react-native-paper';

type Mode = 'outlined' | 'flat';
type KeyboardType = 'default' | 'number-pad';

interface IconRightInputProps {
  value: string;
  name: string;
  mode: Mode;
  keyboardType: KeyboardType;
  handleInputChange: (name: string, text: string) => void;
  buttonAction: () => void;
  buttonText: string;
}

const IconRightInput = ({
  value,
  name,
  mode,
  keyboardType,
  handleInputChange,
  buttonAction,
  buttonText,
}: IconRightInputProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        placeholder="Buscar"
        onChangeText={text => handleInputChange(name, text)}
        mode={mode}
        keyboardType={keyboardType}
        style={styles.input}
      />
      <Button title={buttonText} onPress={buttonAction} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 18,
  },
  button: {
    height: 40,
  },
});

export {IconRightInput};