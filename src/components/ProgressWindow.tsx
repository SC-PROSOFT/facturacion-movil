import React from 'react';

import {View, StyleSheet} from 'react-native';
import {Dialog, ActivityIndicator, Button, Text} from 'react-native-paper';

/* context */
import {progressWindowContext} from '../context';

const ProgressWindow: React.FC = () => {
  const {progressWindowConfig, hideProgressWindow} = progressWindowContext();

  const toggleCancelButton = (): void => {
    progressWindowConfig.cancelSyncQueries();

    hideProgressWindow();
  };

  const styles = StyleSheet.create({
    container: {
      paddingBottom: 15,
    },
    dialogContent: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <Dialog
      visible={progressWindowConfig.visible}
      dismissable={false}
      style={{marginTop: -10}}>
      <Dialog.Title>{progressWindowConfig.title}</Dialog.Title>
      <Dialog.Content>
        <View style={styles.dialogContent}>
          <ActivityIndicator animating={true} color="black" size={10} />
          <Text
            allowFontScaling={false}
            variant="bodyMedium"
            style={{marginLeft: 5}}>
            {progressWindowConfig.dialogContent}...
          </Text>
        </View>
        {progressWindowConfig.disabledCancel && (
          <Text allowFontScaling={false} style={{marginLeft: 15, marginTop: 5}}>
            Por favor, no cierre la aplicación ni apague el dispositivo.
          </Text>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          onPress={toggleCancelButton}
          disabled={progressWindowConfig.disabledCancel}>
          Cancelar
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export {ProgressWindow};
