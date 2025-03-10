import React from 'react';
import {Picker} from '@react-native-picker/picker';
import {StyleSheet} from 'react-native';

/* Tipos Genéricos */
interface InputSelectProps<T> {
  value: T;
  setValue: (value: T) => void;
  values: {
    label: string;
    value: T;
  }[];
}

const _InputSelect = <T,>({
  value,
  setValue,
  values,
  ...props
}: InputSelectProps<T>) => {
  const styles = StyleSheet.create({
    input: {
      backgroundColor: '#ddd',
      padding: 0,
      width: '100%',
      height: 50,
      fontSize: 15,
    },
  });
  return (
    <Picker
      {...props}
      mode="dropdown"
      selectedValue={value}
      onValueChange={(value: T) => setValue(value)}
      dropdownIconColor="black"
      style={styles.input}
      itemStyle={{color: 'red', fontSize:10}}>
      {values.map((item, index) => (
        <Picker.Item label={item.label} value={item.value} key={index} />
      ))}
    </Picker>
  );

  
};

export {_InputSelect};
