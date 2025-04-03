import {
  IAlmacen,
  IProduct,
  ICartera,
  IOperadores,
  ITerceros,
  IEncuesta,
} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';

class SyncQueries {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _getOperadores = async (): Promise<IOperadores[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON982.dll`,
        {},
      );
      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      return response.data.data.MENSAJE.usuarios;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener operadores');
      }
    }
  };

  _getArticulos = async (): Promise<IProduct[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/INV803.dll`,
        {},
      );

      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      return response.data.data.MENSAJE.Articulos;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener articulos');
      }
    }
  };

  _getAlmacenes = async (): Promise<IAlmacen[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/INV801.dll`,
        {},
      );

      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      return response.data.data.MENSAJE.datos;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener almacenes');
      }
    }
  };

  _getCartera = async (): Promise<ICartera[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/COMER001.dll`,
        {},
      );

      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      return response.data.data.MENSAJE.facturas;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener cartera');
      }
    }
  };

  _getTerceros = async (): Promise<ITerceros[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON802.dll`,
        {},
      );
      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      const normalizedData = response.data.data.MENSAJE.LISTADO.map(
        (tercero: any) => ({
          ...tercero,
          frecuencia: tercero.frecuencia || tercero.frecuencia_1 || '',
          frecuencia2: tercero.frecuencia2 || tercero.frecuencia_2 || '',
          frecuencia3: tercero.frecuencia3 || tercero.frecuencia_3 || '',
        }),
      );

      return normalizedData;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener terceros');
      }
    }
  };

  _getEncuesta = async (): Promise<IEncuesta[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/INV125.dll`,
        {},
      );

      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }
      return response.data.data.MENSAJE.ENCUESTA;
    } catch (error: any) {
      console.log('error =>', error);
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener cartera');
      }
    }
  };

  _getEncuestaRespuestas = async (
    encuesta: IEncuesta,
  ): Promise<IEncuesta[]> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/INV126.dll`,
        {},
      );

      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }
      return response.data.data.MENSAJE.ENCUESTA;
    } catch (error: any) {
      console.log('error =>', error);
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error('La sincronizacion fue cancelada');
      } else {
        throw new Error('Error al obtener cartera');
      }
    }
  };

  _getFrecuencias = async (): Promise<any> => {
    try {
      let datos = {
        llave: '3',
      };
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON810.dll`,
        datos,
      );
      return response.data.data.MENSAJE.ZONAS;
    } catch (error) {
      console.error('error =>', error);
      return [];
    }
  };

  _getZonas = async (): Promise<any> => {
    try {
      let datos = {
        llave: '1',
      };
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON810.dll`,
        datos,
      );
      return response.data.data.MENSAJE.ZONAS;
    } catch (error) {
      console.error('error =>', error);
      return [];
    }
  };

  _getRutas = async (): Promise<any> => {
    try {
      let datos = {
        llave: '2',
      };
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON810.dll`,
        datos,
      );
      return response.data.data.MENSAJE.ZONAS;
    } catch (error) {
      console.error('error =>', error);
      return [];
    }
  };

  _cancelSyncQueries = () => {
    if (this.axiosInstance.cancelRequest) {
      this.axiosInstance.cancelRequest();
    }
  };
}

export {SyncQueries};
