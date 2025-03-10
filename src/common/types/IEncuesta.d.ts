type ActivarFlag = 'S' | 'N';

export interface IEncuesta {
  codigo: string;
  nro_preguntas: string;
  activar: ActivarFlag | string; // ACTIVAR-ENCU (podríamos restringirlo a 'S' o 'N')
  preguntas: IPregunta[];
  admin_creacion: string;
  fecha_creacion: string; // Formato 'YYYY-MM-DD'
  admin_modificacion: string;
  fecha_modificacion: string; // Formato 'YYYY-MM-DD'
}

export interface IPregunta {
  tipo: string;
  pregunta_texto: string;
  numero_resp_cerrada: number;
  opciones_respuesta_cerrada: string[];
}
