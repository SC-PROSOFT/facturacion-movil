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
      di_pdf,
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
    }| ${di_pdf || ''}`;

    return datos;
  };

  _getTerceros = async (): Promise<ITerceros[]> => {
    console.log('get terce');
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON802_1.dll`,
        {},
      );
      return response.data.data.MENSAJE.LISTADO;
    } catch (error) {
      console.error('error =>', error);
      return [];
    }
  };

  _saveTercero = async (tercero: ITerceros): Promise<true> => {
    // Retorna 'true' en éxito, o lanza error en fallo
    const innerFormatTercero = this._constructTercero(tercero, '7');
    const body = {
      datosh: innerFormatTercero,
    };

    try {
      console.log('body =>', body.datosh);
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON110C_1.dll`,
        body,
      );

      // Es buena idea verificar la estructura de la respuesta
      const status = response?.data?.data?.STATUS;

      if (status === '00') {
        return true;
      } else if (status === '35') {
        throw new Error(
          'La configuración para guardar el tercero no es correcta (STATUS 35).',
        );
      } else if (status === '99') {
        throw new Error(
          'Se produjo un error conocido por la API al guardar el tercero (STATUS 99).',
        );
      } else if (status === 'SC-1') {
        try {
          const lastChanceResponse = await this._updateTercero(tercero);
          if (lastChanceResponse) {
            return true;
          } else {
            throw new Error(`Error especifico SC-1: ${tercero.codigo}`);
          }
        } catch (error: any) {
          console.error('Error al crear el tercero:', error);
          throw error;
        }
      } else {
        console.error(
          'Error al guardar el tercero - Estado inesperado:',
          response?.data?.data,
        );
        throw new Error(
          `Respuesta inesperada del servidor al guardar el tercero. STATUS: ${
            status || 'desconocido'
          }`,
        );
      }
    } catch (error: any) {
      if (error.isAxiosError) {
        console.error('Error de Axios en _saveTercero:', error.toJSON());
        throw new Error(
          `Error de red o del servidor al intentar guardar el tercero: ${error.message}`,
        );
      }
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
      const status = response?.data?.data?.STATUS;

      if (status === '00') {
        return true;
      } else if (status === '35') {
        throw new Error(
          'La configuración para editar el tercero no es correcta (STATUS 35).',
        );
      } else if (status === '99') {
        throw new Error(
          'Se produjo un error conocido por la API al editar el tercero (STATUS 99).',
        );
      } else if (status === 'SC-1') {
        try {
          const lastResponse = await this._saveBeforeUpdateTercero(tercero);
          if (lastResponse) {
            return true;
          } else {
            throw new Error(`Error especifico SC-1: ${tercero.codigo}`);
          }
        } catch (error: any) {
          throw new Error(`Error al editar el tercero: ${error.message}`); // Mejor manejo de errores
        }
      } else {
        console.error(
          'Error al editar el tercero - Estado inesperado:',
          response?.data?.data,
        );
        throw new Error(
          `Respuesta inesperada del servidor al guardar el tercero. STATUS: ${
            status || 'desconocido'
          }`,
        );
      }
    } catch (error: any) {
      if (error.isAxiosError) {
        console.error('Error de Axios en _saveTercero:', error.toJSON());
        throw new Error(
          `Error de red o del servidor al intentar guardar el tercero: ${error.message}`,
        );
      }
      throw error;
    }
  };

  _saveBeforeUpdateTercero = async (tercero: ITerceros): Promise<boolean> => {
    // Guarda el tercero antes de actualizarlo
    try {
      const response = await this._saveTercero(tercero);
      if (response) {
        // Si se guarda correctamente, procede a actualizarlo
        return await this._updateTercero(tercero);
      } else {
        throw new Error('No se pudo guardar el tercero antes de actualizar.');
      }
    } catch (error: any) {
      console.error('Error al guardar el tercero antes de actualizar:', error);
      throw error;
    }
  };
}

export {TercerosApiServices};
