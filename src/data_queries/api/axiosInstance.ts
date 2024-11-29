import axios, {CancelTokenSource, AxiosInstance} from 'axios';

interface CustomAxiosInstance extends AxiosInstance {
  cancelRequest?(message?: string): void;
}

export const createAxiosInstance = (direccionIp: string, puerto: string) => {
  const axiosInstance: CustomAxiosInstance = axios.create({
    baseURL: `http://${direccionIp}:${puerto}/api/`,
    headers: {
      'Content-Type': 'application/json',
      // Otros encabezados comunes
    },
  });

  // Crear una instancia de CancelToken y source
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  // Agregar la propiedad cancelToken a la configuración de la solicitud
  axiosInstance.interceptors.request.use((config: any) => {
    config.cancelToken = cancelTokenSource.token;
    return config;
  });

  // Función para cancelar la solicitud
  axiosInstance.cancelRequest = (message = 'La solicitud fue cancelada') => {
    cancelTokenSource.cancel(message);
  };

  return axiosInstance;
};
