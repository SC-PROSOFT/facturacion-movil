import {ITerceros} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';
import AxiosInstance from 'axios';

class TercerosQueries {
  private AxiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.AxiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _saveTercero = async (tercero: ITerceros): Promise<boolean> => {
    const body = {};
    const innerFormatTercero = (tercero: ITerceros) => {
      return [
        tercero.codigo,
        tercero.nombre,
        tercero.direcc,
        tercero.tel,
        tercero.vendedor,
        tercero.plazo,
        tercero.f_pago,
        tercero.ex_iva,
        tercero.clasificacion,
        tercero.tipo,
        tercero.departamento,
        tercero.ciudad,
        tercero.barrio,
        tercero.email,
        tercero.reteica,
        tercero.frecuencia,
        tercero.zona,
        tercero.ruta,
        tercero.latitude,
        tercero.longitude,
        tercero.rut_path,
        tercero.camaracomercio_path,
      ].join('|');
    };

    try {
      const response = console.log('response =>', innerFormatTercero(tercero));

      console.log('response =>', response);
      return true;
    } catch (error) {
      console.error('error =>', error);
      return false;
    }
  };
  _updateTercero = async (tercero: ITerceros): Promise<boolean> => {
    const body = {};
    const innerFormatTercero = (tercero: ITerceros) => {
      return [
        tercero.codigo,
        tercero.nombre,
        tercero.direcc,
        tercero.tel,
        tercero.vendedor,
        tercero.plazo,
        tercero.f_pago,
        tercero.ex_iva,
        tercero.clasificacion,
        tercero.tipo,
        tercero.departamento,
        tercero.ciudad,
        tercero.barrio,
        tercero.email,
        tercero.reteica,
        tercero.frecuencia,
        tercero.zona,
        tercero.ruta,
        tercero.latitude,
        tercero.longitude,
        tercero.rut_path,
        tercero.camaracomercio_path,
      ].join('|');
    };

    try {
      const response = console.log('response =>', innerFormatTercero(tercero));

      console.log('response =>', response);
      return true;
    } catch (error) {
      console.error('error =>', error);
      return false;
    }
  };
}

export default {TercerosQueries};
