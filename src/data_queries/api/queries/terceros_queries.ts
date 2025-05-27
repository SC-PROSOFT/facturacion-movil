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

  _constructTercero = (tercero: ITerceros, novedad: string): string => {
    // Added return type
    console.log(TercerosApiServices.objConfig);

    const directorio =
      TercerosApiServices.objConfig?.directorioContabilidad || 'COMER25';

    // Destructure tercero for easier access and readability
    const {
      codigo,
      nombre,
      dv,
      direcc,
      tipo,
      zona,
      ruta,
      plazo,
      tel,
      vendedor,
      f_pago,
      ex_iva,
      clasificacion,
      departamento,
      ciudad,
      barrio,
      email,
      reteica,
      frecuencia,
      frecuencia2,
      frecuencia3,
      latitude,
      longitude,
      rut_pdf,
      camcom_pdf,
    } = tercero;
    // Use a template literal for cleaner string construction
    const datos = `00000086005264920250220112018|${directorio}|CONTROL|${novedad}|${
      codigo || ''
    }|${nombre || ''}|${direcc || ''}|${dv || ''}|${zona || ''}|${ruta || ''}|${
      plazo || ''
    }|${tel || ''}|${vendedor || ''}|${f_pago || ''}|${ex_iva || ''}|${
      clasificacion || ''
    }|${''}|${''}|${''}|${frecuencia || ''}|${frecuencia2 || ''}|${
      frecuencia3 || ''
    }|${latitude || ''}|${longitude || ''}|${rut_pdf || ''}|${
      camcom_pdf || ''
    }`;

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
        return false;
      } else if (response.data.data.STATUS == '99') {
        return false;
      } else {
        console.error('Error al guardar el tercero:', response.data.data);
        return false;
      }
    } catch (error) {
      throw error;
    }
  };
  _updateTercero = async (tercero: ITerceros): Promise<boolean> => {
    try {
      const innerFormatTercero = this._constructTercero(tercero, '8');
      const datosh = innerFormatTercero;
      console.log('update datosh =>', datosh);
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
        return false;
      } else if (response.data.data.STATUS == '99') {
        return false;
      } else {
        console.error('Error al guardar el tercero:', response.data.data);
        return false;
      }
    } catch (error) {
      console.log('error =>', error);
      throw error;
    }
  };
}

export {TercerosApiServices};
