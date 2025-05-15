import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Pdf from 'react-native-pdf';
import {SignatureModal} from './SignatureCanvas';
import {embedSignatureInPdfFromAssets} from '../utils/pdfUtils';
import RNFS from 'react-native-fs';
import {PDFDocument, rgb, StandardFonts} from 'pdf-lib'; // Importa pdf-lib
import {Buffer} from 'buffer';
import {Loader} from './Loader';
import Toast from 'react-native-toast-message';
export default function ConsentPdfView({
  visible,
  onClose,
  onFirmar,
  onGuardar,
  nombre,
  codigo,
  celular,
  email,
  ciudad,
}) {
  const originalPdf = 'consentimiento.pdf';
  const [signature, setSignature] = useState(null);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState({
    uri: `bundle-assets://${originalPdf}`,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Cargando consentimiento');
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [pdfKey, setPdfKey] = useState(0); // Clave para forzar la recarga del PDF

  useEffect(() => {
    if (visible) {
      // Si el modal se vuelve visible, carga el PDF original

      setSignature(null);
      modifyPdf(); // Modifica el PDF con los datos
    }
  }, [visible]);

  const modifyPdf = async (firmaBase64 = null) => {
    setIsLoading(true);
    try {
      // Carga el PDF original desde los assets
      const pdfBytes = await RNFS.readFileAssets(originalPdf, 'base64');
      const pdfDoc = await PDFDocument.load(Buffer.from(pdfBytes, 'base64'));

      // Obtén la primera página del PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Define las posiciones y estilos para los textos
      const {width, height} = firstPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      // Agrega los valores al PDF
      firstPage.drawText(`${nombre || ''}`, {
        x: 220,
        y: 178,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${codigo || ''}`, {
        x: 130,
        y: 162,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${nombre || ''}`, {
        // ESTO CAMBIA POR REPRESENTANTE LEGAL
        x: 200,
        y: 147,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${celular || ''}`, {
        // ESTO SE VA A CAMBIAR POR TELEFONO ( TELEFONO Y CELULAR SON DOS CAMPOS DIFERENTES)
        x: 108,
        y: 133,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${celular || ''}`, {
        x: 228,
        y: 133,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${email || ''}`, {
        x: 398,
        y: 133,
        size: fontSize - 3,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${ciudad || ''}`, {
        // ESTO SE CAMBIA POR CIUDAD
        x: 128,
        y: 118,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${new Date().toLocaleDateString()}`, {
        x: 292,
        y: 118,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${codigo || ''}`, {
        x: 108,
        y: 75,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      if (firmaBase64) {
        const pngImage = await pdfDoc.embedPng(firmaBase64);
        const pngDims = pngImage.scale(0.05);

        firstPage.drawImage(pngImage, {
          x: 120,
          y: 91,
          width: pngDims.width * 1.8,
          height: pngDims.height * 0.6,
        });
      }
      // Guarda el PDF modificado en un archivo temporal
      const modifiedPdfBytes = await pdfDoc.save();
      const base64Pdf = Buffer.from(modifiedPdfBytes).toString('base64'); // Convierte a Base64
      const modifiedPdfPath = `${RNFS.DocumentDirectoryPath}/consentimiento_modificado.pdf`;
      await RNFS.writeFile(modifiedPdfPath, base64Pdf, 'base64');
      // Actualiza la fuente del PDF en el visor
      setPdfSource({uri: `file://${modifiedPdfPath}`});
      setPdfKey(prevKey => prevKey + 1); // Cambia la clave para forzar la recarga
    } catch (e) {
      console.error('Error al modificar el PDF:', e);
      Alert.alert('Error', 'No se pudo modificar el PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSignatureModal = () => {
    setIsSignatureModalVisible(true);
  };

  const handleCloseSignatureModal = () => {
    setIsSignatureModalVisible(false);
  };

  const handleSignature = async (firmaBase64: string) => {
    setSignature(firmaBase64);
    setIsSignatureModalVisible(false);
    setLoaderMessage('Insertando firma en el PDF...');
    setIsLoading(true);
    try {
      // Modifica el PDF con la firma
      await modifyPdf(firmaBase64);
      Toast.show({
        type: 'success',
        text1: 'Se registró la firma correctamente.',
      });
      onFirmar(firmaBase64);
      setIsLoading(false);
    } catch (e) {
      console.error('Error al insertar firma en el PDF:', e);
      Toast.show({
        type: 'error',
        text1: 'No se pudo insertar la firma en el PDF.',
      });
      setIsLoading(false);
    }
  };

  const handleEmpty = () => {
    setSignature(null);
    setIsSignatureModalVisible(false);
    setPdfSource({uri: `bundle-assets://${originalPdf}`});
    setPdfKey(prevKey => prevKey + 1); // Cambia la clave para forzar la recarga
    onFirmar(null);
  };

  const handleGuardar = async () => {
    try {
      const destinationPath = `${
        RNFS.TemporaryDirectoryPath
      }/consentimiento_guardado_${Date.now()}.pdf`;

      // Copia el archivo a la ubicación temporal
      await RNFS.copyFile(
        pdfSource.uri.replace('file://', ''), // Asegúrate de eliminar el esquema si ya existe
        destinationPath,
      );

      // Llama al método `onGuardar` con la nueva ruta
      onGuardar(`file://${destinationPath}`); // Asegúrate de incluir el esquema `file://`
     
    } catch (e) {
      console.error('Error al guardar el archivo:', e);
     
    }
  };
  const styles = StyleSheet.create({
    container: {flex: 1},
    pdf: {flex: 1},
    botonFirmar: {
      backgroundColor: '#092254',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      maxWidth: '100%',
      minWidth: 130,
      flexDirection: 'row',
      alignItems: 'center',
    },
    botonGuardar: {
      backgroundColor: signature ? 'green' : '#ccc',
      paddingHorizontal: 10,
      maxWidth: '100%',
      minWidth: 130,
      paddingVertical: 6,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    botones: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    botonesContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 10,
    },
    botonTexto: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 10,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Pdf
          key={pdfKey} // Cambia la clave para forzar la recarga
          source={pdfSource}
          style={styles.pdf}
          onError={error => console.log('Error al cargar PDF:', error)}
        />

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 30,
            right: 20,
            zIndex: 1,
          }}
          onPress={onClose}>
          <Icon name="close" size={36} color={'#092254'} />
        </TouchableOpacity>

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonFirmar}
            onPress={handleOpenSignatureModal}>
            <Icon name="signature-freehand" size={36} color={'#FFF'} />
            <Text style={styles.botonTexto}>Firmar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={signature ? false : true}
            style={styles.botonGuardar}
            onPress={handleGuardar}>
            <Icon name="content-save" size={36} color={'#FFF'} />
            <Text style={styles.botonTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SignatureModal
        visible={isSignatureModalVisible}
        onClose={handleCloseSignatureModal}
        onOK={handleSignature}
        onEmpty={handleEmpty}
      />
      <Loader visible={isLoading} message={loaderMessage} />
    </Modal>
  );
}
