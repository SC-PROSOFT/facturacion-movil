export interface IRespEncuesta {
codigo: string;
codigo_tercero: string;
codigo_opera: string;
respuesta: IRespuestas[];
admin_creacion: string;
fecha_creacion: string;
admin_modificacion: string;
fecha_modificacion: string;
}

export interface IRespuestas {
preg_abierta: string;
preg_cerrada: string;
}

