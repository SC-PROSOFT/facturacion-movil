import React from 'react';

import {StyleSheet} from 'react-native';

/* components mui */
import {Button, Dialog, Text} from 'react-native-paper';

/* decisionAlert context */
import {decisionAlertContext} from '../context/decision_alert_context';

/* procedure */
export const DecisionAlert = () => {
  const {decisionAlertConfig, hideDecisionAlert} = decisionAlertContext();

  const {visible, type, description, textButton, executeFunction} =
    decisionAlertConfig;

  const titleAlert = () => {
    type type = 'error' | 'success' | 'info';

    const {type}: {type: type} = decisionAlertConfig;

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

  const styles = StyleSheet.create({
    textButton: {
      color:
        type == 'success' ? '#19C22A' : type == 'error' ? '#DE3A45' : '#DE3A45',
    },
  });

  return (
    <Dialog
      visible={visible}
      onDismiss={hideDecisionAlert}
      style={{marginTop: -10}}>
      <Dialog.Title>{titleAlert()}</Dialog.Title>

      <Dialog.Content>
        <Text allowFontScaling={false} variant="bodyMedium">
          {description}
        </Text>
      </Dialog.Content>

      <Dialog.Actions>
        <Button
          onPress={() => {
            hideDecisionAlert();
            executeFunction();
          }}>
          <Text allowFontScaling={false} style={styles.textButton}>
            {textButton}
          </Text>
        </Button>
        <Button onPress={hideDecisionAlert}>
          <Text allowFontScaling={false} style={{}}>
            Cancelar
          </Text>
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
