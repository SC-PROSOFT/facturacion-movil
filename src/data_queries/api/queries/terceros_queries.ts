import {Axios} from 'axios';
import {ITerceros} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';
import {useAppSelector} from '../../../redux/hooks';

class TercerosApiServices {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _constructTercero = (tercero: ITerceros) => {
    let datos = `COMER24|7|${tercero.codigo}|${tercero.nombre}|${tercero.direcc}|${tercero.tipo}|${tercero.zona}|${tercero.ruta}|${tercero.plazo}|${tercero.tel}|${tercero.vendedor}|${tercero.f_pago}|${tercero.ex_iva}|${tercero.clasificacion}`;
    return datos;
  };

  _saveTercero = async (tercero: ITerceros): Promise<boolean> => {
    const innerFormatTercero = this._constructTercero(tercero);

    const datosh = innerFormatTercero;

    let body = {
      datosh: datosh,
    };
    try {
      console.log('body =>', datosh);
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON110C_1.dll`,
        {body},
      );
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

export {TercerosApiServices};
