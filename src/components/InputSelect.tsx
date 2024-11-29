import React from 'react';

import {Picker} from '@react-native-picker/picker';

/* redux hooks */
import {useAppSelector} from '../redux/hooks';

/* types */
import {IAlmacen} from '../common/types';

interface InputSelectProps {
  value: string;
  values: IAlmacen[];
  selectValue: (value: string) => void;
}

const InputSelect: React.FC<InputSelectProps> = ({
  value,
  values,
  selectValue,
}) => {
  const objConfig = useAppSelector(store => store.config.objConfig);

  const {seleccionarAlmacen} = objConfig;

  return (
    <Picker
      mode="dropdown"
      selectedValue={value}
      onValueChange={(value: string) => selectValue(value)}
      enabled={seleccionarAlmacen ? true : true}
      dropdownIconColor="black"
      style={{color: 'black'}}
      itemStyle={{color: 'red'}}>
      {seleccionarAlmacen ? (
        values.map((value, index) => (
          <Picker.Item
            label={`${value.codigo} - ${value.nombre}`}
            value={`${value.codigo} - ${value.nombre}`}
            key={index}
          />
        ))
      ) : (
        <Picker.Item label="ALM01" value="ALM01" />
      )}
    </Picker>
  );
};

export {InputSelect};
