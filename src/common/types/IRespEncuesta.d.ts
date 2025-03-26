type guardadoServidor = 'S' | 'N';

export interface IRespEncuesta {
  codigo: string;
  codigo_tercero: string;
  codigo_vende: string;
  respuesta: IRespuestas[];
  admin_creacion: string;
  fecha_creacion: string;
  admin_modificacion: string;
  fecha_modificacion: string;
  guardado: guardadoServidor;
}

export interface IRespuestas {
  preg_abierta: string;
  preg_cerrada: string;
}
