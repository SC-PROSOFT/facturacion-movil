import {IEncuesta, IRespEncuesta, IRespuestas} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';


class EncuestaApiServices {
  private axiosInstance;
  private direccionIp;

  
  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;

  }

  _constructRespEncuesta = (respuesta: IRespEncuesta) => {
    let datos: {[key: string]: string} = {
      datosh: `00000086005264920250220112018|COMER24|CONTROL`,
      cod_resp_encu: respuesta.codigo,
      cod_terce_resp_encu: respuesta.codigo_tercero,
      cod_ven_resp_encu: respuesta.codigo_opera,
      fecha_cre_encu: respuesta.fecha_creacion,
    };

    // Convertimos la respuesta en un array
    const respuestas: IRespuestas[] =
      JSON.parse(respuesta.respuesta as unknown as string) || [];

    // Llenamos las respuestas y completamos hasta 5 con "|"
    respuestas.slice(0, 5).forEach((resp, i) => {
      datos[
        `tabla_resp_encu${String(i + 1).padStart(3, '0')}`
      ] = `${resp.preg_abierta}|${resp.preg_cerrada}`;
    });

    // Completamos los campos restantes con "|"
    for (let i = respuestas.length; i < 5; i++) {
      datos[`tabla_resp_encu${String(i + 1).padStart(3, '0')}`] = '|';
    }

    return datos;
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

  _saveRespEncuesta = async (respuesta: IRespEncuesta): Promise<boolean> => {
    let body = this._constructRespEncuesta(respuesta);
    try {
      // const response = await this.axiosInstance.post(
      //   `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/INV126.dll`,
      //   {body},
      // );
      console.log('body =>', body);
      return true;
    } catch (error: any) {
      console.error('error =>', error);
      return false;
    }
  };
}

export {EncuestaApiServices};
