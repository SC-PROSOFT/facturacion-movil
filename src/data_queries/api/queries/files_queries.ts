import {createAxiosInstance} from '../axiosInstance';
import {useAppSelector} from '../../../redux/hooks';
import {ISurvey, ITerceros} from '../../../common/types';
import {calcularDigitoVerificacion} from '../../../utils';
import {DocumentPickerResponse} from 'react-native-document-picker';

class FilesApiServices {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _uploadFiles = async (
    file: DocumentPickerResponse,
    tercero: ITerceros,
  ): Promise<boolean> => {
    try {
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
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      // Aseguramos que la ruta esté bien construida
      const ruta = `D:\\WEB\\ANEXOS\\${terceroModificado.tipo}-${terceroModificado.codigo}`;
      console.log('ruta =>>>>', ruta);

      const response = await this.axiosInstance.post(
        `/v1/contabilidad/guardar-archivo?ruta=${ruta}`, // Encode para evitar problemas con los backslashes
        formData, // FormData debe ir como cuerpo directamente
        {
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        },
      );

      console.log('Respuesta del servidor:', response.data);
      return true;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      return false;
    }
  };
}

export {FilesApiServices};
