/* common types */
import {IConfig} from '../../../common/types';

import {createAxiosInstance} from '../axiosInstance';

interface ConfigServer {
  dir_ip: string;

  nombre: string;
  nit: string;
  direcc: string;
  iva1: string;
  iva2: string;
  iva3: string;

  directorio: string;
  ip_datos: string;
}

export function api_saveConfig(
  configData: ConfigServer,
  direccionIp: string,
  puerto: string,
) {
  const axiosInstance = createAxiosInstance(direccionIp, puerto);

  return new Promise(async (resolve, reject) => {
    try {
      const requestBody = {
        nombre: configData.nombre,
        nit: configData.nit,
        direcc: configData.direcc,
        iva1: configData.iva1,
        iva2: configData.iva2,
        iva3: configData.iva3,
        directorio: configData.directorio,
        ip_datos: configData.ip_datos,
      };

      const response: any = await axiosInstance.post(
        `/v1/contabilidad/dll?ip=${direccionIp}&directorio=comercial/inc/app/index-config.dll`,
        requestBody,
      );

      resolve(response.data);
    } catch (error: any) {
      reject(new Error('Fallo guardado config en api'));
    }
  });
}

class ConfigQueriesService {
  private axiosInstance;
  private direccionIp;
  private puerto;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
    this.puerto = puerto;
  }

  _saveConfig = async (config: IConfig): Promise<boolean> => {
    try {
      const requestBody = {
        nombre: config.empresa,
        nit: config.nit,
        direcc: config.direccion,
        iva1: config.tarifaIva1,
        iva2: config.tarifaIva2,
        iva3: config.tarifaIva3,
        directorio: config.directorioContabilidad,
        ip_datos: config.datosIp,
      };

      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/index-config.dll`,
        requestBody,
      );

      return true;
    } catch (error) {
      throw new Error('Fallo guardado config en api');
    }
  };

  _getConfig = async (): Promise<IConfig> => {
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/sc-usunet.dll`,
        {},
      );

      const responseClear = {
        direccionIp: this.direccionIp,
        puerto: this.puerto,
        facturarSinExistencias: false,
        seleccionarAlmacen: false,
        localizacionGps: false,
        filtrarTercerosPorVendedor: false,
        modificarPrecio: false,

        descargasIp: this.direccionIp,
        datosIp: response.data.data.MENSAJE.ip_datos,
        directorioContabilidad: response.data.data.MENSAJE.directorio,

        empresa: response.data.data.MENSAJE.nombre,
        nit: response.data.data.MENSAJE.nit,
        direccion: response.data.data.MENSAJE.direcc,
        ciudad: '',
        tarifaIva1: response.data.data.MENSAJE.iva1,
        tarifaIva2: response.data.data.MENSAJE.iva2,
        tarifaIva3: response.data.data.MENSAJE.iva3,
      };

      return responseClear;
    } catch (error) {
      throw new Error('Fallo obtener configuracion de servidor');
    }
  };
}

export {ConfigQueriesService};