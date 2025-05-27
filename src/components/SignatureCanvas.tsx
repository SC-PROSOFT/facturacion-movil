import React, {useRef, useState, useEffect} from 'react';
import {StyleSheet, View, Modal, Button} from 'react-native'; // Removido Image y Dimensions si no se usan directamente aquí
import SignatureCanvas from 'react-native-signature-canvas';
// import {CoolButton} from './CoolButton'; // Asumo que Button de react-native es suficiente o CoolButton se integra similar
import Orientation from 'react-native-orientation-locker';

const SignatureModal = ({visible, onClose, onOK, onEmpty}) => {
  // signature state no es necesario aquí si onOK lo maneja el componente padre directamente
  // const [signature, setSignature] = useState(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }

    return () => {
      Orientation.lockToPortrait();
    };
  }, [visible]);

  // handleOK y handleEmpty son pasados directamente desde las props al SignatureCanvas
  // Si necesitas hacer algo adicional aquí antes de llamar a onOK/onEmpty prop:
  const handleSignatureOK = signature => {
    // setSignature(signature); // Solo si necesitas el estado localmente
    Orientation.lockToPortrait(); // Vuelve a modo retrato al guardar la firma
    onOK(signature); // Llama al callback del padre
  };

  const handleSignatureEmpty = () => {
    // setSignature(null); // Solo si necesitas el estado localmente
    onEmpty(); // Llama al callback del padre
  };

  // CSS para el contenido del WebView
  const webStyle = `
    body, html {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    .m-signature-pad {
      width: 100%;
      height: 100%;
      margin:0;
      padding:0;
      box-shadow: none; /* Opcional: quitar sombras si las tuviera */
      border: none; /* Opcional: quitar bordes si los tuviera */
    }
    .m-signature-pad--body {
      width: 100%;
      height: 100%;
      margin:0;
      padding:0;
      border: none;
    }
    .m-signature-pad--body canvas { /* Target directo al canvas */
      width: 100% !important;
      height: 100% !important;
    }
  `;

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center', // Centra el contentContainer si no es flex:1
      alignItems: 'center', // Centra el contentContainer si no es flex:1
    },
    contentContainer: {
      // Este contenedor ahora tomará casi toda la pantalla
      flex: 1, // Para que ocupe toda la pantalla del modal
      width: '100%', // Para que ocupe todo el ancho
      backgroundColor: '#fff',
      // borderRadius: 10, // Quizás no quieras borderRadius si es pantalla completa
      // overflow: 'hidden', // Necesario si hay borderRadius y contenido absoluto
      // --- Para Opción B de botones (absolutos) y sin que el canvas quede debajo ---
      // paddingBottom: 70, // Ajustar a la altura de tu buttonContainer
    },
    signatureCanvas: {
      flex: 1, // Ocupa el espacio disponible en contentContainer
      width: '100%',
    },
    buttonContainer: {
      // --- Para Opción A (flujo normal) ---
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10, // Añadido padding vertical
      paddingHorizontal: 5,
      backgroundColor: '#f0f0f0',
      // --- Para Opción B (absoluto) descomentar lo siguiente y comentar lo de arriba ---
      /*
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
      paddingBottom: 20, // Para safe areas, etc.
      backgroundColor: 'rgba(240, 240, 240, 0.95)',
      zIndex: 1,
      // borderBottomLeftRadius: 10, // Si contentContainer tiene borderRadius
      // borderBottomRightRadius: 10, // Si contentContainer tiene borderRadius
      */
    },
    button: {
      // Si usas <CoolButton> o quieres estilizar <Button> (limitado)
      flex: 1,
      marginHorizontal: 5,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      style={{zIndex: 1000}} // zIndex en Modal style puede no ser necesario o efectivo
      supportedOrientations={['landscape']}>
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleSignatureOK} // Usar el wrapper o directamente onOK de props
            onEmpty={handleSignatureEmpty} // Usar el wrapper o directamente onEmpty de props
            autoClear={false} // Si es true, se limpia después de onOK
            descriptionText="" // Puedes quitar el texto por defecto si no lo necesitas
            clearText="Limpiar" // Texto para el botón de limpiar interno (si se usara)
            confirmText="Guardar" // Texto para el botón de confirmar interno (si se usara)
            backgroundColor="white"
            penColor="black"
            minWidth={2}
            maxWidth={4}
            style={styles.signatureCanvas}
            webStyle={webStyle} // Aplicar el CSS interno
          />

          <View style={styles.buttonContainer}>
            <Button title="Cerrar" onPress={onClose} color="red" />
            <Button
              title="Limpiar"
              onPress={() => signatureRef.current?.clearSignature()}
              color="blue"
            />
            <Button
              title="Guardar"
              onPress={() => signatureRef.current?.readSignature()}
              color="green"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export {SignatureModal};
