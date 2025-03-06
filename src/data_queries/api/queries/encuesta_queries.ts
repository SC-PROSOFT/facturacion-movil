import {IEncuesta} from '../../../common/types';
import {createAxiosInstance} from '../axiosInstance';

class EncuestaApiServices {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }
}
