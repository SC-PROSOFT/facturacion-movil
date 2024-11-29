import React from 'react';

import {StyleSheet, View} from 'react-native';

/* components mui */
import {Button, Dialog, Text} from 'react-native-paper';

/* hooks redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';

/* slices redux */
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';

export const InfoAlert = () => {
  const dispatch = useAppDispatch();

  const objShowInfoAlert = useAppSelector(
    store => store.infoAlert.objInfoAlert,
  );

  const {type} = objShowInfoAlert;

  const hideDialog = () => {
    dispatch(
      setObjInfoAlert({
        ...objShowInfoAlert,
        visible: false,
      }),
    );
  };

  const titleAlert = () => {
    type type = 'error' | 'success' | 'info';

    const {type}: {type: type} = objShowInfoAlert;

    switch (type) {
      case 'success':
        return '¡Bien hecho!';

      case 'error':
        return 'Algo salio mal :(';

      case 'info':
        return '¡Atencion!';

      default:
        return '¡Atencion!';
    }
  };

  const contentAlert = () => {
    const {description} = objShowInfoAlert;

    return description;
  };

  const textButton = () => {
    type type = 'error' | 'success' | 'info';

    const {type}: {type: type} = objShowInfoAlert;

    switch (type) {
      case 'error':
      case 'info':
        return 'Intentar de nuevo';

      case 'success':
        return 'Continuar';

      default:
        break;
    }
  };

  const styles = StyleSheet.create({
    textButton: {
      color:
        type == 'success' ? '#19C22A' : type == 'error' ? '#DE3A45' : '#365AC3',
    },
  });

  return (
    <Dialog visible={objShowInfoAlert.visible} onDismiss={hideDialog}>
      <Dialog.Title>{titleAlert()}</Dialog.Title>

      <Dialog.Content>
         <Text allowFontScaling={false} variant="bodyMedium">{contentAlert()}</Text>
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={hideDialog}>
           <Text allowFontScaling={false} style={styles.textButton}>{textButton()}</Text>
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
