import React, {useRef, useState, useEffect} from 'react';
import {StyleSheet, View, Image, Modal, Button, Dimensions} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import {CoolButton} from './CoolButton';
import Orientation from 'react-native-orientation-locker';


const SignatureModal = ({visible, onClose, onOK, onEmpty}) => {
  const [signature, setSignature] = useState(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait(); // O Orientation.unlockAllOrientations();
    }

    return () => {
      Orientation.lockToPortrait(); // Asegura que se restaure al desmontar
    };
  }, [visible]);


  const handleOK = signature => {
    setSignature(signature);
    onOK(signature);
  };

  const handleEmpty = () => {
    setSignature(null);
    onEmpty();
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    },
    contentContainer: {
      width: '95%',
      height: '95%',
      backgroundColor: '#fff',
      borderRadius: 10,
      overflow: 'hidden',
    },
    signatureCanvas: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      style={{zIndex: 1000}}
      supportedOrientations={['landscape']}>
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK}
            onEmpty={handleEmpty}
            autoClear={false}
            backgroundColor="white"
            penColor="black"
            minWidth={2}
            maxWidth={4}
            style={styles.signatureCanvas}
          />

          <View style={styles.buttonContainer}>
            <Button title="Cerrar" onPress={onClose} color="red" />
            <Button
              title="Limpiar"
              onPress={() => signatureRef.current.clearSignature()}
              color="blue"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export {SignatureModal};
