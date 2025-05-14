import {PDFDocument, rgb} from 'pdf-lib';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer'; // Importa el polyfill de Buffer

/**
 * Inserta una firma en la primera página del PDF.
 * @param pdfAssetPath Ruta al PDF dentro de assets.
 * @param base64Signature Imagen base64 (data:image/png;base64,...)
 * @returns Ruta absoluta del nuevo PDF con la firma incrustada.
 */
export async function embedSignatureInPdfFromAssets(
  pdfAssetPath: string,
  base64Signature: string,
): Promise<string> {
  if (
    typeof base64Signature !== 'string' ||
    !base64Signature.startsWith('data:image/png;base64,')
  ) {
    throw new Error('base64Signature no es una cadena Base64 válida');
  }

  const pdfBytes = await RNFS.readFileAssets(pdfAssetPath, 'base64');

  if (typeof pdfBytes !== 'string') {
    throw new Error('pdfBytes no es una cadena válida');
  }

  const pdfDoc = await PDFDocument.load(Buffer.from(pdfBytes, 'base64'));
  const pngImage = await pdfDoc.embedPng(base64Signature);

  const pngDims = pngImage.scale(0.05);

  const page = pdfDoc.getPage(0);
  page.drawImage(pngImage, {
    x: 120,
    y: 91,
    width: pngDims.width * 1.8 ,
    height: pngDims.height * 0.6,
  });

  const modifiedPdfBytes = await pdfDoc.save();

  // Generar un nombre único para el archivo firmado
  const timestamp = Date.now();
  const outputPath = `${RNFS.DocumentDirectoryPath}/consentimiento_firmado_${timestamp}.pdf`;

  await RNFS.writeFile(
    outputPath,
    Buffer.from(modifiedPdfBytes).toString('base64'),
    'base64',
  );

  console.log('PDF firmado guardado en:', outputPath);
  return `file://${outputPath}`;
}