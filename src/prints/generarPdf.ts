import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';

import {IConfig, IHTMLData, IOperation} from '../common/types';

import {htmlFactura} from './htmlFactura';

export const generarPDF = async (
  factPed: IOperation,
  config: IConfig,
  tipoImpresion: 'factura' | 'pedido',
) => {
  let selectedHTML: IHTMLData;

  switch (tipoImpresion) {
    case 'pedido':
      selectedHTML = await htmlFactura(factPed, config, 'PEDIDO');
      break;
    case 'factura':
      selectedHTML = await htmlFactura(factPed, config, 'FACTURA');
      break;

    default:
      return;
  }

  try {
    let file = await RNHTMLtoPDF.convert(selectedHTML);
    if (file.filePath) {
      await RNPrint.print({filePath: file.filePath});
    }
  } catch (error) {
    throw new Error('Fallo generar impresion');
  }
};
