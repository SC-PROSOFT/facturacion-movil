import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Modal, Portal, Text, Button, Provider} from 'react-native-paper';

interface ModalButton {
  text: string;
  onPress: () => void;
  color?: string;
}

interface ModalProps {
  visible: boolean;
  title: string;
  description: string;
  buttons: ModalButton[];
  onDismiss: () => void;
}

const _Modal: React.FC<ModalProps> = ({
  visible,
  title,
  description,
  buttons,
  onDismiss,
}) => {
  return (
    <Provider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                mode="contained"
                onPress={button.onPress}
                style={[
                  styles.button,
                  {backgroundColor: button.color || '#6200ee'},
                ]}>
                {button.text}
              </Button>
            ))}
          </View>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 10,
  },
});

export default _Modal;
