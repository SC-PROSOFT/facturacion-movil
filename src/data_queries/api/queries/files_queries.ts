import {createAxiosInstance} from '../axiosInstance';
import {useAppSelector} from '../../../redux/hooks';
import {ISurvey, ITerceros} from '../../../common/types';
import {calcularDigitoVerificacion, padLeftCodigo} from '../../../utils';
import {DocumentPickerResponse} from 'react-native-document-picker';

class FilesApiServices {
  private axiosInstance;
  private direccionIp;
  private static objConfig: any;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }
  static setObjConfig(config: any) {
    FilesApiServices.objConfig = config;
  }
  _uploadFiles = async (
    file: DocumentPickerResponse,
    tercero: ITerceros,
  ): Promise<boolean> => {
    try {
      console.log(file);
      const terceroModificado = {...tercero};
      terceroModificado.tipo =
        /^\d{9,10}$/.test(tercero.codigo) &&
        tercero.codigo.slice(-1) ===
          calcularDigitoVerificacion(tercero.codigo.slice(0, -1)).toString()
          ? 'NIT'
          : 'CC';

      console.log('file =>>>>', file);
      console.log('tercero =>>>>', terceroModificado.tipo);

      const formData = new FormData();
      formData.append('archivo', {
        uri: file.fileCopyUri || file.uri, // Usar fileCopyUri si está disponible
        type: file.type,
        name: file.name,
      });
      const isComercializadoraLlanos =
        FilesApiServices.objConfig?.nit === '0860052649' ? true : false;
      const parsialRute = `D:\\WEB\\comercial\\DATOS\\ANEXOS\\`;
      const parsialRute2 = `D:\\psc\\prog\\DATOS\\ANEXOS\\`;

      const definitiveRute = isComercializadoraLlanos
        ? parsialRute
        : parsialRute2;

      const ruta = `${definitiveRute}${terceroModificado.tipo}-${padLeftCodigo(
        terceroModificado.codigo,
      )}`;
      console.log(ruta);
      console.log(this.axiosInstance.defaults.baseURL);
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/guardar-archivo?ruta=${ruta}`, // Encode para evitar problemas con los backslashes
        formData, // FormData debe ir como cuerpo directamente
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log(response);
      if (response.data.success) {
        if (isComercializadoraLlanos) {
          console.log('Archivo subido exitosamente a:', parsialRute);
        }
        return true;
      } else {
        console.log('error =>>>>', response.data);
        return false;
      }
    } catch (error) {
      console.log('Error al subir el archivo:', error);
      return false;
    }
  };
}

export {FilesApiServices};
