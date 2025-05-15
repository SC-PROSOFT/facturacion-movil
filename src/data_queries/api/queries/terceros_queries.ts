import {Axios} from 'axios';
import {ITerceros} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';
import {useAppSelector} from '../../../redux/hooks';

class TercerosApiServices {
  private axiosInstance;
  private direccionIp;
  private static objConfig: any;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  static setObjConfig(config: any) {
    TercerosApiServices.objConfig = config;
  }

  _constructTercero = (tercero: ITerceros, novedad: string) => {
    console.log(TercerosApiServices.objConfig);

    let directorio = TercerosApiServices.objConfig
      ? TercerosApiServices.objConfig.directorioContabilidad
      : 'COMER25';
    let datos = `00000086005264920250220112018|${directorio}|CONTROL|${novedad}|${tercero.codigo}|${tercero.nombre}|${tercero.direcc}|${tercero.tipo}|${tercero.zona}|${tercero.ruta}|${tercero.plazo}|${tercero.tel}|${tercero.vendedor}|${tercero.f_pago}|${tercero.ex_iva}|${tercero.clasificacion}|${tercero.departamento}|${tercero.ciudad}|${tercero.barrio}|${tercero.email}|${tercero.reteica}|${tercero.frecuencia}|${tercero.frecuencia2}|${tercero.frecuencia3}|${tercero.latitude}|${tercero.longitude}|${tercero.rut_pdf}|${tercero.camcom_pdf}`;
    return datos;
  };

  _getTerceros = async (): Promise<ITerceros[]> => {
    console.log('get terce');
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON802.dll`,
        {},
      );
      return response.data.data.MENSAJE.LISTADO;
    } catch (error) {
      console.error('error =>', error);
      return [];
    }
  };

  _saveTercero = async (tercero: ITerceros): Promise<boolean> => {
    const innerFormatTercero = this._constructTercero(tercero, '7');

    const datosh = innerFormatTercero;

    let body = {
      datosh: datosh,
    };
    try {
      console.log('body =>', datosh);
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON110C_1.dll`,
        body,
      );
      if (response.data.data.STATUS == '00') {
        return true;
      } else if (response.data.data.STATUS == '35') {
        throw new Error('La configuracion no es correcta');
      }

      return false;
    } catch (error) {
      throw error;
    }
  };
  _updateTercero = async (tercero: ITerceros): Promise<boolean> => {
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
        tercero.frecuencia2,
        tercero.frecuencia3,
        tercero.zona,
        tercero.ruta,
        tercero.latitude,
        tercero.longitude,
        tercero.rut_pdf,
        tercero.camcom_pdf,
      ].join('|');
    };

    try {
      const innerFormatTercero = this._constructTercero(tercero, '8');

      const datosh = innerFormatTercero;

      let body = {
        datosh: datosh,
      };
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON110C_1.dll`,
        body,
      );
      console.log('response update tercero =>', response.data.data);
      if (response.data.data.STATUS == '00') {
        return true;
      } else if (response.data.data.STATUS == '35') {
        throw new Error('La configuracion no es correcta');
      }

      return false;
    } catch (error) {
      console.log('error =>', error);
      throw error;
    }
  };
}

export {TercerosApiServices};
