import {Axios} from 'axios';
import {createAxiosInstance} from '../axiosInstance';
import {useAppSelector} from '../../../redux/hooks';
import {ISurvey} from '../../../common/types';
import AxiosInstance from 'axios';

class SurveyApiServices {
  private AxiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.AxiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  //   _getSurveys = async (): Promise<ISurvey[]> => {
  //     try {
  //       const response = await this.AxiosInstance.get(
  //         `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/CON110C_1.dll`,
  //       );
  //       return response.data;
  //     } catch (error) {
  //       console.error('error =>', error);
  //       return [];
  //     }
  //   };

  
}

export {SurveyApiServices};
