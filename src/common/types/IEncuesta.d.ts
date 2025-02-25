// Si el campo 'activar' solo acepta ciertos valores, podríamos definir un tipo literal:
type ActivarFlag = 'S' | 'N';

export interface IEncuesta {
  codigo: number;
  numero_preguntas: number;
  activar: ActivarFlag | string; // ACTIVAR-ENCU (podríamos restringirlo a 'S' o 'N')
  preguntas: Pregunta[];
  admin_creacion: string;
  fecha_creacion: Fecha;
  admin_modificacion: string;
  fecha_modificacion: Fecha;
}

export interface IPregunta {
  tipo: string;
  pregunta_texto: string;
  numero_resp_cerrada: number;
  opciones_respuesta_cerrada: string[];
}

export interface IFecha {
  anio: number;
  mes: number;
  dia: number;
}
