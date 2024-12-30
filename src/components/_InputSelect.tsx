import React from 'react';
import {Picker} from '@react-native-picker/picker';

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

  console.log('values', values)
  return (
    <Picker
      {...props}
      mode="dropdown"
      selectedValue={value}
      onValueChange={(value: T) => setValue(value)}
      dropdownIconColor="black"
      style={{color: 'black', backgroundColor: '#ddd'}}
      itemStyle={{color: 'red'}}>
      {values.map((item, index) => (
        <Picker.Item label={item.label} value={item.value} key={index} />
      ))}
    </Picker>
  );
};

export {_InputSelect};
