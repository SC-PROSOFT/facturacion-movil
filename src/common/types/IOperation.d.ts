import {IOperadores, ITerceros} from '.';
import {IProductAdded} from '../../types';

export interface IOperation {
  tipo_operacion: 'factura' | 'pedido';
  fecha: string;
  hora: string;
  fechaTimestampUnix: number;
  almacen: string;

  operador: IOperadores;
  tercero: ITerceros;
  articulosAdded: IProductAdded[];

  formaPago: '01' | '02'; // 01 contado, 02 credito
  fechaVencimiento: string;
  valorPedido: number;
  observaciones: string;
  ubicacion: {
    latitud: string;
    longitud: string;
  };
  guardadoEnServer: 'S' | 'N';
  sincronizado: 'S' | 'N';
}

export interface IOperationDb {
  tipo_operacion: 'factura' | 'pedido';
  almacen: string;
  fecha: string;
  fechaVencimiento: string;
  formaPago: '01' | '02';
  hora: string;
  fechaTimestampUnix: number;
  observaciones: string;
  ubicacion_latitud: string;
  ubicacion_longitud: string;
  valorPedido: number;

  operador_auto_dian: string;
  operador_cod_vendedor: string;
  operador_codigo: string;
  operador_descripcion: string;
  operador_fecha_fin: string;
  operador_fecha_ini: string;
  operador_id: string;
  operador_nro_factura: number;
  operador_nro_fin: string;
  operador_nro_ini: string;
  operador_nro_pedido: number;
  operador_prefijo: string;
  operador_sucursal: string;
  operador_vigencia: string;

  tercero_clasificacion: string;
  tercero_codigo: string;
  tercero_direcc: string;
  tercero_ex_iva: 'S' | 'N';
  tercero_f_pago: '01' | '02';
  tercero_dv: string;
  tercero_nombre: string;
  tercero_plazo: number;
  tercero_tel: string;
  tercero_vendedor: string;
  tercero_tipo?: 'CC' | 'TI';
  tercero_departamento: string;
  tercero_ciudad: string;
  tercero_barrio: string;
  tercero_email: string;
  tercero_reteica: 'S' | 'N'; // S = true, N = false
  tercero_frecuencia: 'semanal' | 'mensual';
  tercero_zona: string;
  tercero_ruta: string;
  tercero_latitude: string;
  tercero_longitude: string;
  tercero_rut_path: string;
  tercero_camaracomercio_path: string;

  guardadoEnServer: 'S' | 'N'; // fue guardado almenos una ves en el servidor, sirve para saber si debo guardar o actualizar en la vista ActualizarPedidos
  sincronizado: 'S' | 'N'; // Pedido sincronizado en servidor
  articulosAdded: string;
}
