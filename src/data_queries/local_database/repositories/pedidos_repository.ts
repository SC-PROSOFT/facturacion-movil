import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, IOperation, IOperationDb} from '../../../common/types';

import {db} from '../local_database_config';

/* local database services */
import {operadoresService} from '../services';

class PedidosRepository implements IRepository<IOperation | IOperationDb> {
  async createTable(): Promise<boolean> {
    const sqlCreatePedidosStatement = `
    CREATE TABLE IF NOT EXISTS pedidos (
        tipo_operacion VARCHAR(15),
        almacen VARCHAR(255),
        fecha DATE,
        fechaVencimiento DATE,
        formaPago VARCHAR(255),
        hora TIME,
        fechaTimestampUnix BIGINT,
        observaciones TEXT, 
        valorPedido DECIMAL(10, 2),
        ubicacion_latitud VARCHAR(255),
        ubicacion_longitud VARCHAR(255),
        operador_auto_dian VARCHAR(255),
        operador_cod_vendedor VARCHAR(255),
        operador_codigo VARCHAR(255),
        operador_descripcion TEXT,
        operador_fecha_fin VARCHAR(255),
        operador_fecha_ini VARCHAR(255),
        operador_id VARCHAR(255),
        operador_nro_factura INT,
        operador_nro_fin VARCHAR(255),
        operador_nro_ini VARCHAR(255),
        operador_nro_pedido INT,
        operador_prefijo VARCHAR(255),
        operador_sucursal VARCHAR(255),
        operador_vigencia VARCHAR(255),
        tercero_clasificacion VARCHAR(255),
        tercero_codigo VARCHAR(255),
        tercero_direcc TEXT,
        tercero_ex_iva VARCHAR(1),
        tercero_f_pago VARCHAR(255),
        tercero_nombre VARCHAR(255),
        tercero_plazo INT,
        tercero_tel VARCHAR(255),
        tercero_vendedor VARCHAR(255),
        guardadoEnServer VARCHAR(1),
        sincronizado VARCHAR(1),
        articulosAdded VARCHAR
      )
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreatePedidosStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error(error);
            reject(new Error('Fallo crear tabla pedidos'));
          },
        );
      });
    });
  }
  async create(pedido: IOperation): Promise<boolean> {
    const sqlInsertpedidoStatement = `
    INSERT INTO pedidos (
        tipo_operacion,
        almacen,
        fecha,
        fechaVencimiento,
        formaPago,
        hora,
        fechaTimestampUnix,
        observaciones,
        valorPedido,
        ubicacion_latitud,
        ubicacion_longitud,
        operador_auto_dian,
        operador_cod_vendedor,
        operador_codigo,
        operador_descripcion,
        operador_fecha_fin,
        operador_fecha_ini,
        operador_id,
        operador_nro_factura,
        operador_nro_fin,
        operador_nro_ini,
        operador_nro_pedido,
        operador_prefijo,
        operador_sucursal,
        operador_vigencia,
        tercero_clasificacion,
        tercero_codigo,
        tercero_direcc,
        tercero_ex_iva,
        tercero_f_pago,
        tercero_nombre,
        tercero_plazo,
        tercero_tel,
        tercero_vendedor,        
        guardadoEnServer,
        sincronizado,
        articulosAdded
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

    const valuesPedido = [
      pedido.tipo_operacion,
      pedido.almacen,
      pedido.fecha,
      pedido.fechaVencimiento,
      pedido.formaPago,
      pedido.hora,
      pedido.fechaTimestampUnix,
      pedido.observaciones,
      pedido.valorPedido,
      pedido.ubicacion.latitud,
      pedido.ubicacion.longitud,
      pedido.operador.auto_dian,
      pedido.operador.cod_vendedor,
      pedido.operador.codigo,
      pedido.operador.descripcion,
      pedido.operador.fecha_fin,
      pedido.operador.fecha_ini,
      pedido.operador.id,
      Number(pedido.operador.nro_factura), // lo hago porque se estaban guardando ceros a la izquierda
      pedido.operador.nro_fin,
      pedido.operador.nro_ini,
      Number(pedido.operador.nro_pedido), // lo hago porque se estaban guardando ceros a la izquierda
      pedido.operador.prefijo,
      pedido.operador.sucursal,
      pedido.operador.vigencia,
      pedido.tercero.clasificacion,
      pedido.tercero.codigo,
      pedido.tercero.direcc,
      pedido.tercero.ex_iva,
      pedido.tercero.f_pago,
      pedido.tercero.nombre,
      pedido.tercero.plazo,
      pedido.tercero.tel,
      pedido.tercero.vendedor,
      pedido.guardadoEnServer,
      pedido.sincronizado,
      JSON.stringify(pedido.articulosAdded),
    ];

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlInsertpedidoStatement,
          valuesPedido,
          async (_: ResultSet, result: ResultSet) => {
            const operadorUpdate = {
              ...pedido.operador,
              nro_pedido: Number(pedido.operador.nro_pedido) + 1,
            };

            try {
              await operadoresService.updateOperador(
                operadorUpdate.id,
                operadorUpdate,
              );

              resolve(true);
            } catch (error) {
              reject(
                new Error(
                  `[Error al actualizar consecutivo o guardar orderHistory]: ${error}`,
                ),
              );
            }
          },
          (error: Error) => {
            console.log('error =>', JSON.stringify(error));
            reject(new Error(`[Error al crear orderHistory]: ${error}`));
          },
        );
      });
    });
  }
  async update(id: string, item: IOperation): Promise<boolean> {
    const sqlUpdateStatement = `
    UPDATE pedidos SET
      tipo_operacion='${item.tipo_operacion}',
      almacen='${item.almacen}',
      fecha='${item.fecha}',
      fechaVencimiento='${item.fechaVencimiento}',
      formaPago='${item.formaPago}',
      hora='${item.hora}',
      fechaTimestampUnix='${item.fechaTimestampUnix}',
      observaciones='${item.observaciones}',
      valorPedido='${item.valorPedido}',
      ubicacion_latitud='${item.ubicacion.latitud}',
      ubicacion_longitud='${item.ubicacion.longitud}',
      operador_auto_dian='${item.operador.auto_dian}',
      operador_cod_vendedor='${item.operador.cod_vendedor}',
      operador_codigo='${item.operador.codigo}',
      operador_descripcion='${item.operador.descripcion}',
      operador_fecha_fin='${item.operador.fecha_fin}',
      operador_fecha_ini='${item.operador.fecha_ini}',
      operador_id='${item.operador.id}',
      operador_nro_factura='${item.operador.nro_factura}',
      operador_nro_fin='${item.operador.nro_fin}',
      operador_nro_ini='${item.operador.nro_ini}',
      operador_nro_pedido='${item.operador.nro_pedido}',
      operador_prefijo='${item.operador.prefijo}',
      operador_sucursal='${item.operador.sucursal}',
      operador_vigencia='${item.operador.vigencia}',
      tercero_clasificacion='${item.tercero.clasificacion}',
      tercero_codigo='${item.tercero.codigo}',
      tercero_direcc='${item.tercero.direcc}',
      tercero_ex_iva='${item.tercero.ex_iva}',
      tercero_f_pago='${item.tercero.f_pago}',
      tercero_nombre='${item.tercero.nombre}',
      tercero_plazo='${item.tercero.plazo}',
      tercero_tel='${item.tercero.tel}',
      tercero_vendedor='${item.tercero.vendedor}',      
      guardadoEnServer='${item.guardadoEnServer}',
      sincronizado='${item.sincronizado}',
      articulosAdded='${JSON.stringify(item.articulosAdded)}'
      WHERE operador_nro_pedido = ${id} AND operador_sucursal = '${
      item.operador.sucursal
    }'
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo actualizar pedido'));
          },
        );
      });
    });
  }
  async getAll(): Promise<IOperation[]> {
    const sqlSelectPedidosStatement = `
      SELECT * FROM pedidos
      ORDER BY fechaTimestampUnix DESC
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectPedidosStatement,
          null,
          (_: ResultSet, resultPedidos: ResultSet) => {
            const pedidos = resultPedidos.rows
              .raw()
              .map((pedido: IOperationDb) => {
                return {
                  tipo_operacion: pedido.tipo_operacion,
                  fecha: pedido.fecha,
                  hora: pedido.hora,
                  fechaTimestampUnix: pedido.fechaTimestampUnix,
                  almacen: pedido.almacen,
                  ubicacion: {
                    latitud: pedido.ubicacion_latitud,
                    longitud: pedido.ubicacion_longitud,
                  },
                  operador: {
                    codigo: pedido.operador_codigo,
                    descripcion: pedido.operador_descripcion,
                    id: pedido.operador_id,
                    cod_vendedor: pedido.operador_cod_vendedor,
                    sucursal: pedido.operador_sucursal,
                    nro_pedido: pedido.operador_nro_pedido,
                    nro_factura: pedido.operador_nro_factura,
                    auto_dian: pedido.operador_auto_dian,
                    fecha_ini: pedido.operador_fecha_ini,
                    fecha_fin: pedido.operador_fecha_fin,
                    nro_ini: pedido.operador_nro_ini,
                    nro_fin: pedido.operador_nro_fin,
                    prefijo: pedido.operador_prefijo,
                    vigencia: pedido.operador_vigencia,
                  },
                  tercero: {
                    clasificacion: pedido.tercero_clasificacion,
                    codigo: pedido.tercero_codigo,
                    direcc: pedido.tercero_direcc,
                    ex_iva: pedido.tercero_ex_iva,
                    f_pago: pedido.tercero_f_pago,
                    nombre: pedido.tercero_nombre,
                    plazo: pedido.tercero_plazo,
                    tel: pedido.tercero_tel,
                    vendedor: pedido.tercero_vendedor,
                    departamento: pedido.tercero_departamento,
                    ciudad: pedido.tercero_ciudad,
                    barrio: pedido.tercero_barrio,
                    email: pedido.tercero_email,
                    reteica: pedido.tercero_reteica,
                    frecuencia: pedido.tercero_frecuencia,
                    zona: pedido.tercero_zona,
                    ruta: pedido.tercero_ruta,
                    latitude: pedido.tercero_latitude,
                    longitude: pedido.tercero_longitude,
                    rut_pdf: pedido.tercero_rut_pdf,
                    camcom_pdf: pedido.tercero_camcom_pdf,
                    dv: pedido.tercero_dv,
                  },
                  articulosAdded: JSON.parse(pedido.articulosAdded),

                  formaPago: pedido.formaPago,
                  fechaVencimiento: pedido.fechaVencimiento,
                  valorPedido: pedido.valorPedido,
                  observaciones: pedido.observaciones,
                  guardadoEnServer: pedido.guardadoEnServer,
                  sincronizado: pedido.sincronizado,
                };
              });

            resolve(pedidos);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener pedidos [articulosAdded]'));
          },
        );
      });
    });
  }
  async deleteTable(): Promise<boolean> {
    const sqlDeletePedidosStatement = `DELETE FROM pedidos`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeletePedidosStatement,
          null,
          (_: ResultSet, result: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('Fallo borrar tabla pedidos'));
          },
        );
      });
    });
  }
  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperation[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM pedidos WHERE ${attributeName} = ?`,
          [attributeValue],
          (_: ResultSet, response: ResultSet) => {
            const result =
              response.rows.length > 0
                ? response.rows.raw().map((factura: IOperationDb) => {
                    return {
                      tipo_operacion: factura.tipo_operacion,
                      fecha: factura.fecha,
                      hora: factura.hora,
                      fechaTimestampUnix: factura.fechaTimestampUnix,
                      almacen: factura.almacen,
                      ubicacion: {
                        latitud: factura.ubicacion_latitud,
                        longitud: factura.ubicacion_longitud,
                      },
                      operador: {
                        codigo: factura.operador_codigo,
                        descripcion: factura.operador_descripcion,
                        id: factura.operador_id,
                        cod_vendedor: factura.operador_cod_vendedor,
                        sucursal: factura.operador_sucursal,
                        nro_pedido: factura.operador_nro_pedido,
                        nro_factura: factura.operador_nro_factura,
                        auto_dian: factura.operador_auto_dian,
                        fecha_ini: factura.operador_fecha_ini,
                        fecha_fin: factura.operador_fecha_fin,
                        nro_ini: factura.operador_nro_ini,
                        nro_fin: factura.operador_nro_fin,
                        prefijo: factura.operador_prefijo,
                        vigencia: factura.operador_vigencia,
                      },
                      tercero: {
                        clasificacion: factura.tercero_clasificacion,
                        codigo: factura.tercero_codigo,
                        direcc: factura.tercero_direcc,
                        ex_iva: factura.tercero_ex_iva,
                        f_pago: factura.tercero_f_pago,
                        nombre: factura.tercero_nombre,
                        plazo: factura.tercero_plazo,
                        tel: factura.tercero_tel,
                        vendedor: factura.tercero_vendedor,
                        departamento: factura.tercero_departamento,
                        ciudad: factura.tercero_ciudad,
                        barrio: factura.tercero_barrio,
                        email: factura.tercero_email,
                        reteica: factura.tercero_reteica,
                        frecuencia: factura.tercero_frecuencia,
                        zona: factura.tercero_zona,
                        ruta: factura.tercero_ruta,
                        latitude: factura.tercero_latitude,
                        longitude: factura.tercero_longitude,
                        rut_pdf: factura.tercero_rut_pdf,
                        camcom_pdf:
                          factura.tercero_camcom_pdf,
                        dv: factura.tercero_dv,
                      },
                      articulosAdded: JSON.parse(factura.articulosAdded),

                      formaPago: factura.formaPago,
                      fechaVencimiento: factura.fechaVencimiento,
                      valorPedido: factura.valorPedido,
                      observaciones: factura.observaciones,
                      guardadoEnServer: factura.guardadoEnServer,
                      sincronizado: factura.sincronizado,
                    };
                  })
                : null;

            if (result) {
              resolve(result);
            } else {
              resolve([]);
            }
          },
          (error: Error) => {
            reject(
              new Error('Fallo al obtener pedido por codigo proporcionado'),
            );
          },
        );
      });
    });
  }
  async getPedidosDeHoy(): Promise<IOperation[]> {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const sqlQuery = `
      SELECT * FROM pedidos
      WHERE fecha = ?
      ORDER BY fechaTimestampUnix DESC
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlQuery,
          [hoy],
          (_: ResultSet, result: ResultSet) => {
            const pedidos = result.rows
              .raw()
              .map((pedido: IOperationDb) => this.mapPedido(pedido));
            resolve(pedidos);
          },
          (error: Error) => {
            reject(new Error('Fallo al obtener pedidos de hoy'));
          },
        );
      });
    });
  }

  async getPedidosDeEsteMes(): Promise<IOperation[]> {
    const fechaActual = new Date();
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato MM
    const anio = fechaActual.getFullYear(); // Año en formato YYYY
    const sqlQuery = `
      SELECT * FROM pedidos
      WHERE strftime('%Y-%m', fecha) = ?
      ORDER BY fechaTimestampUnix DESC
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlQuery,
          [`${anio}-${mes}`],
          (_: ResultSet, result: ResultSet) => {
            const pedidos = result.rows
              .raw()
              .map((pedido: IOperationDb) => this.mapPedido(pedido));
            resolve(pedidos);
          },
          (error: Error) => {
            reject(new Error('Fallo al obtener pedidos de este mes'));
          },
        );
      });
    });
  }

  // Método auxiliar para mapear un pedido desde la base de datos al formato IOperation
  private mapPedido(pedido: IOperationDb): IOperation {
    return {
      tipo_operacion: pedido.tipo_operacion,
      fecha: pedido.fecha,
      hora: pedido.hora,
      fechaTimestampUnix: pedido.fechaTimestampUnix,
      almacen: pedido.almacen,
      ubicacion: {
        latitud: pedido.ubicacion_latitud,
        longitud: pedido.ubicacion_longitud,
      },
      operador: {
        codigo: pedido.operador_codigo,
        descripcion: pedido.operador_descripcion,
        id: pedido.operador_id,
        cod_vendedor: pedido.operador_cod_vendedor,
        sucursal: pedido.operador_sucursal,
        nro_pedido: pedido.operador_nro_pedido,
        nro_factura: pedido.operador_nro_factura,
        auto_dian: pedido.operador_auto_dian,
        fecha_ini: pedido.operador_fecha_ini,
        fecha_fin: pedido.operador_fecha_fin,
        nro_ini: pedido.operador_nro_ini,
        nro_fin: pedido.operador_nro_fin,
        prefijo: pedido.operador_prefijo,
        vigencia: pedido.operador_vigencia,
      },
      tercero: {
        clasificacion: pedido.tercero_clasificacion,
        codigo: pedido.tercero_codigo,
        direcc: pedido.tercero_direcc,
        ex_iva: pedido.tercero_ex_iva,
        f_pago: pedido.tercero_f_pago,
        nombre: pedido.tercero_nombre,
        plazo: pedido.tercero_plazo,
        tel: pedido.tercero_tel,
        vendedor: pedido.tercero_vendedor,
        departamento: pedido.tercero_departamento,
        ciudad: pedido.tercero_ciudad,
        barrio: pedido.tercero_barrio,
        email: pedido.tercero_email,
        reteica: pedido.tercero_reteica,
        frecuencia: pedido.tercero_frecuencia,
        zona: pedido.tercero_zona,
        ruta: pedido.tercero_ruta,
        latitude: pedido.tercero_latitude,
        longitude: pedido.tercero_longitude,
        rut_pdf: pedido.tercero_rut_pdf,
        camcom_pdf: pedido.tercero_camcom_pdf,
        dv: pedido.tercero_dv,
      },
      articulosAdded: JSON.parse(pedido.articulosAdded),
      formaPago: pedido.formaPago,
      fechaVencimiento: pedido.fechaVencimiento,
      valorPedido: pedido.valorPedido,
      observaciones: pedido.observaciones,
      guardadoEnServer: pedido.guardadoEnServer,
      sincronizado: pedido.sincronizado,
    };
  }
}

export {PedidosRepository};
