import React, {useRef, useEffect} from 'react';
import {StyleSheet, View, Modal, Button, TouchableOpacity} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import Orientation from 'react-native-orientation-locker';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SignatureModal = ({visible, onClose, onOK, onEmpty}) => {
  const signatureRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Orientation.lockToLandscape();
    } else {
      // No es estrictamente necesario aquí si el padre lo gestiona al cerrar,
      // pero es una buena práctica para asegurar el estado deseado al desmontar o esconder.
      Orientation.lockToPortrait();
    }

    // Opcional: Al desmontar el componente, asegurar portrait.
    // return () => {
    //   Orientation.lockToPortrait();
    // };
  }, [visible]);

  const handleOK = signature => {
    // Aquí no es necesario volver a portrait, el padre (ConsentPdfView) lo hará
    // después de que este modal se cierre y antes de procesar la firma.
    onOK(signature);
    // onClose(); // El padre (ConsentPdfView) se encarga de cerrar este modal (setIsSignatureModalVisible(false))
    // lo cual disparará el useEffect de este modal para volver a portrait si es necesario.
  };

  const handleEmpty = () => {
    // Similar a handleOK, el padre gestionará la orientación.
    onEmpty();
    // onClose(); // El padre se encarga.
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleClose = () => {
    // Asegurar portrait al cerrar manualmente
    Orientation.lockToPortrait();
    onClose();
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
      backgroundColor: '#0B2863',
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
    buttonStyle: {
      width: 'auto', // Si quieres que el botón ocupe un ancho específico y centrar el contenido en ese espacio, cambia 'auto' por un valor numérico o '100%'
      backgroundColor: '#FFFF',
      alignItems: 'center', // Centra los hijos (Icon y Text) verticalmente en el contenedor
      justifyContent: 'center', // Centra los hijos (Icon y Text) horizontalmente en el contenedor
      borderRadius: 8,
      padding: 8, // Añade un espaciado interno
      marginVertical: 'auto', // Nota: 'auto' para márgenes verticales no es el método estándar de centrado de componentes en React Native; usualmente se maneja desde el contenedor padre.
      flexDirection: 'row',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose} // Manejar el botón "atrás" de Android
      supportedOrientations={['landscape']} // Importante
      hardwareAccelerated // Puede ayudar un poco en Android
    >
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK} // Pasa la firma al padre
            onEmpty={handleEmpty} // Notifica al padre que está vacío
            autoClear={false} // Para que la firma no se borre automáticamente
            descriptionText=""
            clearText="Limpiar" // Puedes ocultar los botones por defecto si usas los tuyos
            confirmText="Guardar" // Puedes ocultar los botones por defecto si usas los tuyos
            backgroundColor="white"
            penColor="black"
            minWidth={2}
            maxWidth={4}
            style={styles.signatureCanvas}
            webStyle={webStyle}
          />
          <View style={styles.buttonContainer}>
            {/* <Button title="Cerrar" onPress={handleClose} color="#0B2863" />
            <Button title="Limpiar" onPress={handleClear} color="#0B2863" />
            <Button title="Guardar" onPress={handleConfirm} color="#0B2863" /> */}
            <TouchableOpacity onPress={handleClose} style={styles.buttonStyle}>
              <Icon
                name="arrow-left-bold"
                color="#0B2863"
                size={16}
                style={{marginRight: 4}}
              />
              <Text
                style={{
                  color: '#0B2863',
                  fontSize: 16,
                  fontWeight: 'semibold',
                }}>
                Volver
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.buttonStyle}>
              <Icon
                name="eraser"
                color="#0B2863"
                size={16}
                style={{marginRight: 4}}
              />
              <Text
                style={{
                  color: '#0B2863',
                  fontSize: 16,
                  fontWeight: 'semibold',
                }}>
                Limpiar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.buttonStyle}>
              <Icon
                name="content-save"
                color="#0B2863"
                size={16}
                style={{marginRight: 4}}
              />
              <Text
                style={{
                  color: '#0B2863',
                  fontSize: 16,
                  fontWeight: 'semibold',
                }}>
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export {SignatureModal};
