// common/helpers.ts (o un lugar similar)
import {
  IOperation,
  IOperationDb,
  IOperadores,
  ITerceros,
  IProductAdded,
} from '../common/types';
import moment from 'moment';

type only = 'S' | 'N';

export const transformOperationDbToOperation = (
  dbOp: IOperationDb,
): IOperation => {
  const operador: IOperadores = {
    auto_dian: dbOp.operador_auto_dian,
    cod_vendedor: dbOp.operador_cod_vendedor,
    codigo: dbOp.operador_codigo,
    descripcion: dbOp.operador_descripcion,
    fecha_fin: dbOp.operador_fecha_fin,
    fecha_ini: dbOp.operador_fecha_ini,
    id: dbOp.operador_id,
    nro_factura: dbOp.operador_nro_factura,
    nro_fin: dbOp.operador_nro_fin,
    nro_ini: dbOp.operador_nro_ini,
    nro_pedido: dbOp.operador_nro_pedido,
    prefijo: dbOp.operador_prefijo,
    sucursal: dbOp.operador_sucursal,
    vigencia: dbOp.operador_vigencia,
  };

  const tercero: ITerceros = {
    clasificacion: dbOp.tercero_clasificacion,
    codigo: dbOp.tercero_codigo,
    direcc: dbOp.tercero_direcc,
    ex_iva: dbOp.tercero_ex_iva,
    f_pago: dbOp.tercero_f_pago,
    dv: dbOp.tercero_dv,
    nombre: dbOp.tercero_nombre,
    plazo: dbOp.tercero_plazo,
    tel: dbOp.tercero_tel,
    vendedor: dbOp.tercero_vendedor,
    tipo: dbOp.tercero_tipo,
    departamento: dbOp.tercero_departamento,
    ciudad: dbOp.tercero_ciudad,
    barrio: dbOp.tercero_barrio,
    email: dbOp.tercero_email,
    reteica: dbOp.tercero_reteica,
    frecuencia: dbOp.tercero_frecuencia,
    zona: dbOp.tercero_zona,
    ruta: dbOp.tercero_ruta,
    latitude: dbOp.tercero_latitude,
    longitude: dbOp.tercero_longitude,
    rut_pdf: dbOp.tercero_rut_pdf as only,
    camcom_pdf: dbOp.tercero_camcom_pdf as only,
  };

  let articulosAdded: IProductAdded[] = [];
  try {
    if (dbOp.articulosAdded) {
      articulosAdded = JSON.parse(dbOp.articulosAdded);
    }
  } catch (error) {
    console.error('Error parsing articulosAdded from IOperationDb:', error);
    articulosAdded = [];
  }

  return {
    id: dbOp.id,
    tipo_operacion: dbOp.tipo_operacion,
    fecha: dbOp.fecha, // YYYY-MM-DD
    hora: dbOp.hora,
    fechaTimestampUnix: dbOp.fechaTimestampUnix,
    almacen: dbOp.almacen,
    operador: operador,
    tercero: tercero,
    articulosAdded: articulosAdded,
    formaPago: dbOp.formaPago,
    fechaVencimiento: dbOp.fechaVencimiento, // YYYY-MM-DD
    valorPedido: dbOp.valorPedido,
    observaciones: dbOp.observaciones,
    ubicacion: {
      latitud: dbOp.ubicacion_latitud,
      longitud: dbOp.ubicacion_longitud,
    },
    guardadoEnServer: dbOp.guardadoEnServer,
    sincronizado: dbOp.sincronizado,
  };
};

// Funcion para convertir IOperation a IOperationDb (si es necesario para el servicio local)
// Por ahora, asumiremos que pedidosService.updatePedido puede manejar IOperation o un subconjunto.
// Si estrictamente necesita IOperationDb, esta función sería necesaria.
/*
export const transformOperationToOperationDb = (op: IOperation): IOperationDb => {
  // ... implementación inversa
};
*/
