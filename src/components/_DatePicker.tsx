import React, {useState, FC} from 'react';
import {Button, TouchableOpacity, Pressable} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Text} from 'react-native-paper';

interface DatePickerProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const _DatePicker: FC<DatePickerProps> = ({date, setDate, ...props}) => {
  //const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        //title={date.toISOString().slice(0, 10)}
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: '#ddd',
          height: 52,
          paddingHorizontal: 15,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
        }}>
        <Text style={{fontSize: 15}}>{date.toISOString().slice(0, 10)}</Text>
      </TouchableOpacity>
      <DatePicker
        {...props}
        title="Fecha de visita"
        confirmText="Aceptar"
        cancelText="Cancelar"
        modal
        mode="date"
        open={open}
        date={date}
        onConfirm={date => {
          setOpen(false);
          setDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export {_DatePicker};
