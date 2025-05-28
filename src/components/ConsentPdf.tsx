import React, {useEffect, useState, useRef} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  InteractionManager, // Importar InteractionManager
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Pdf from 'react-native-pdf';
import {SignatureModal} from './SignatureCanvas';
// import {embedSignatureInPdfFromAssets} from '../utils/pdfUtils'; // No se usa directamente
import RNFS from 'react-native-fs';
import {PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import {Buffer} from 'buffer';
import {Loader} from './Loader';
import Toast from 'react-native-toast-message';
import Orientation from 'react-native-orientation-locker'; // Para controlar la orientación aquí también

export default function ConsentPdfView({
  visible,
  onClose,
  onFirmar, // Se podría renombrar a onSignatureApplied o similar
  onGuardar,
  nombre,
  codigo,
  celular,
  email,
  ciudad,
  representanteLegal,
  documentoRepresentante,
}) {
  const originalPdf = 'consentimiento.pdf';
  const [signature, setSignature] = useState(null);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState({
    uri: `bundle-assets://${originalPdf}`, // Inicialmente puede ser el original
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Cargando consentimiento');
  // const [saveDisabled, setSaveDisabled] = useState(false); // No se usa, signature controla el botón
  const [pdfKey, setPdfKey] = useState(0);

  // Almacenar el PDF con los datos de texto ya incrustados (como Uint8Array)
  const pdfWithDataBytes = useRef(null);
  const modifiedPdfPathRef = useRef(null); // Para la ruta del PDF modificado

  useEffect(() => {
    if (visible) {
      setSignature(null);
      // Forzar retrato al abrir el ConsentPdfView por si acaso
      Orientation.lockToPortrait();
      // Modificar el PDF con los datos de texto al hacerse visible
      addTextDataToPdf();
    } else {
      // Limpiar cuando el modal principal se cierra
      pdfWithDataBytes.current = null;
      modifiedPdfPathRef.current = null;
      setPdfSource({uri: `bundle-assets://${originalPdf}`});
      setPdfKey(prevKey => prevKey + 1);
    }
  }, [visible]);

  // Función para agregar solo los datos de texto al PDF
  const addTextDataToPdf = async () => {
    setIsLoading(true);
    setLoaderMessage('Preparando documento...');
    try {
      const pdfBytesAsset = await RNFS.readFileAssets(originalPdf, 'base64');
      const pdfDoc = await PDFDocument.load(
        Buffer.from(pdfBytesAsset, 'base64'),
      );
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      // Dibujar todos los textos (como ya lo tienes)
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
      firstPage.drawText(`${representanteLegal || nombre || ''}`, {
        x: 200,
        y: 147,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${celular || ''}`, {
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
      firstPage.drawText(`${documentoRepresentante || codigo || ''}`, {
        x: 108,
        y: 75,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      pdfWithDataBytes.current = await pdfDoc.save(); // Guardar como Uint8Array

      // Guardar este PDF con datos en un archivo temporal para visualización
      const tempPath = `${
        RNFS.DocumentDirectoryPath
      }/consent_with_data_${Date.now()}.pdf`;
      const base64PdfWithData = Buffer.from(pdfWithDataBytes.current).toString(
        'base64',
      );
      await RNFS.writeFile(tempPath, base64PdfWithData, 'base64');

      modifiedPdfPathRef.current = `file://${tempPath}`;
      setPdfSource({uri: modifiedPdfPathRef.current});
      setPdfKey(prevKey => prevKey + 1);
    } catch (e) {
      console.error('Error al modificar PDF con datos:', e);
      Alert.alert('Error', 'No se pudo modificar el PDF con los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para agregar la firma al PDF que ya tiene los datos de texto
  const addSignatureToPdf = async firmaBase64 => {
    if (!pdfWithDataBytes.current) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El PDF base no está listo.',
      });
      setIsLoading(false); // Asegúrate de quitar el loader
      return;
    }
    setIsLoading(true); // Ya debería estar true desde handleSignature
    setLoaderMessage('Insertando firma en el PDF...');

    try {
      const pdfDoc = await PDFDocument.load(pdfWithDataBytes.current);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const pngImage = await pdfDoc.embedPng(firmaBase64);
      const pngDims = pngImage.scale(0.05); // Ajusta la escala según sea necesario

      firstPage.drawImage(pngImage, {
        x: 120, // Ajusta estas coordenadas según tu PDF
        y: 91, // Ajusta estas coordenadas
        width: pngDims.width,
        height: pngDims.height * 0.6, // Ajusta la proporción si es necesario
      });

      const finalPdfBytes = await pdfDoc.save();
      const base64FinalPdf = Buffer.from(finalPdfBytes).toString('base64');

      // Sobrescribir o usar nueva ruta. Usar nueva ruta evita problemas de caché.
      const finalPdfPath = `${
        RNFS.DocumentDirectoryPath
      }/consentimiento_firmado_${Date.now()}.pdf`;
      await RNFS.writeFile(finalPdfPath, base64FinalPdf, 'base64');

      modifiedPdfPathRef.current = `file://${finalPdfPath}`; // Actualizar la referencia a la ruta actual
      setPdfSource({uri: modifiedPdfPathRef.current});
      setPdfKey(prevKey => prevKey + 1);

      pdfWithDataBytes.current = finalPdfBytes; // Actualizar los bytes por si se firma de nuevo sin cerrar

      Toast.show({
        type: 'success',
        text1: 'Firma registrada correctamente.',
      });
      onFirmar(firmaBase64); // Notifica al componente padre que la firma se aplicó
    } catch (e) {
      console.error('Error al insertar firma en el PDF:', e);
      Toast.show({
        type: 'error',
        text1: 'No se pudo insertar la firma en el PDF.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSignatureModal = () => {
    setIsSignatureModalVisible(true);
    // La orientación a landscape se maneja dentro de SignatureModal
  };

  const handleCloseSignatureModal = () => {
    setIsSignatureModalVisible(false);
    // La orientación a portrait se maneja dentro de SignatureModal al cerrar
  };

  const handleSignature = async firmaBase64 => {
    setSignature(firmaBase64); // Guardar la firma en el estado
    setIsSignatureModalVisible(false); // Cierra el modal de firma primero

    // Iniciar cambio a portrait y luego procesar el PDF
    Orientation.lockToPortrait();
    setIsLoading(true); // Mostrar loader
    setLoaderMessage('Procesando firma...');

    InteractionManager.runAfterInteractions(async () => {
      await addSignatureToPdf(firmaBase64); // Llama a la función optimizada
      // setIsLoading(false) se maneja dentro de addSignatureToPdf
    });
  };

  const handleEmpty = () => {
    // Cuando se limpia la firma
    setSignature(null);
    setIsSignatureModalVisible(false); // Cierra el modal de firma
    Orientation.lockToPortrait(); // Asegura portrait

    // Volver a cargar el PDF solo con datos (sin firma)
    if (modifiedPdfPathRef.current && pdfWithDataBytes.current) {
      const pathWithDataOnly = `${
        RNFS.DocumentDirectoryPath
      }/consent_with_data_temp_for_clear_${Date.now()}.pdf`;
      const base64PdfWithData = Buffer.from(pdfWithDataBytes.current).toString(
        'base64',
      );

      RNFS.writeFile(pathWithDataOnly, base64PdfWithData, 'base64')
        .then(() => {
          setPdfSource({uri: `file://${pathWithDataOnly}`});
          setPdfKey(prevKey => prevKey + 1);
          // Aquí podrías querer actualizar modifiedPdfPathRef.current a esta nueva ruta temporal
          // o mejor aún, si addTextDataToPdf guarda su resultado en una ruta estable y la usas aquí.
          // Por simplicidad, si solo tienes texto y luego texto+firma,
          // podrías tener una referencia a los bytes del PDF con solo texto.
          // Para el escenario más simple de "limpiar": recargar el PDF con solo datos.
          // Lo más robusto sería recargar el `pdfWithDataBytes.current` en el visor.
          // Re-utilizamos la lógica de `addTextDataToPdf` para asegurar el estado correcto.
          addTextDataToPdf(); // Esto recargará el PDF con solo los datos.
        })
        .catch(e => console.error('Error al limpiar firma y recargar PDF', e));
    } else {
      addTextDataToPdf(); // Si no hay nada, prepara el documento base con datos.
    }
    onFirmar(null); // Notifica que la firma fue removida
  };

  const handleGuardar = async () => {
    if (!signature || !modifiedPdfPathRef.current) {
      Toast.show({
        type: 'info',
        text1: 'Acción requerida',
        text2: 'Por favor, firme el documento antes de guardar.',
      });
      return;
    }
    setIsLoading(true);
    setLoaderMessage('Guardando consentimiento 💿');

    InteractionManager.runAfterInteractions(async () => {
      try {
        const destinationPath = `${
          RNFS.TemporaryDirectoryPath // O DocumentDirectoryPath si prefieres
        }/consentimiento_firmado_final_${Date.now()}.pdf`;

        // Copia el archivo que ya tiene la firma
        await RNFS.copyFile(
          modifiedPdfPathRef.current.replace('file://', ''),
          destinationPath,
        );

        onGuardar(`file://${destinationPath}`);
        Toast.show({
          type: 'success',
          text1: 'Guardado',
          text2: 'Consentimiento guardado con éxito.',
        });
        // onClose(); // Opcionalmente cerrar el modal principal después de guardar
      } catch (e) {
        console.error('Error al guardar el archivo final:', e);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudo guardar el consentimiento.',
        });
      } finally {
        setIsLoading(false);
      }
    });
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <Pdf
          key={pdfKey}
          source={pdfSource}
          style={styles.pdf}
          onError={error => {
            console.log('Error al cargar PDF:', error);
            Alert.alert(
              'Error PDF',
              'No se pudo cargar el documento PDF. Intente de nuevo.',
            );
            // Podrías intentar recargar el original o el de solo datos
            setPdfSource({uri: `bundle-assets://${originalPdf}`});
            setPdfKey(k => k + 1);
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            // console.log(`Number of pages: ${numberOfPages}, Path: ${filePath}`);
          }}
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
            <Text style={styles.botonTexto}>
              {signature ? 'Modificar Firma' : 'Firmar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!signature}
            style={[
              styles.botonGuardar,
              {backgroundColor: signature ? 'green' : '#ccc'},
            ]}
            onPress={handleGuardar}>
            <Icon name="content-save" size={36} color={'#FFF'} />
            <Text style={styles.botonTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SignatureModal
        visible={isSignatureModalVisible}
        onClose={handleCloseSignatureModal} // Usa el wrapper para asegurar orientación
        onOK={handleSignature}
        onEmpty={handleEmpty} // Usa el wrapper para asegurar orientación y recarga de PDF
      />
      <Loader visible={isLoading} message={loaderMessage} />
    </Modal>
  );
}
