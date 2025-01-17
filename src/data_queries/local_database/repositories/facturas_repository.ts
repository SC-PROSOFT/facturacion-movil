import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, IOperation, IOperationDb} from '../../../common/types';

import {db} from '../local_database_config';

/* local database services */
import {operadoresService} from '../services';

class FacturasRepository implements IRepository<IOperation | IOperationDb> {
  async createTable(): Promise<boolean> {
    const sqlCreateFacturasStatement = `
    CREATE TABLE IF NOT EXISTS facturas (
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
        operador_nro_factura VARCHAR(255),
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
        tercero_tipo VARCHAR(255),
        tercero_departamento VARCHAR(255),
        tercero_ciudad VARCHAR(255),
        tercero_barrio VARCHAR(255),
        tercero_email VARCHAR(255),
        tercero_reteica VARCHAR(1),
        tercero_frecuencia VARCHAR(255),
        tercero_zona VARCHAR(255),
        tercero_ruta VARCHAR(255),
        tercero_latitude VARCHAR(255),
        tercero_longitude VARCHAR(255),
        tercero_rut_pat VARCHAR(255),
        tercero_camaracomercio_path VARCHAR(255),
        
        guardadoEnServer VARCHAR(1),
        sincronizado VARCHAR(1),
        articulosAdded VARCHAR
      )
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateFacturasStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error(error);
            reject(new Error('Fallo crear tabla facturas'));
          },
        );
      });
    });
  }
  async create(factura: IOperation): Promise<boolean> {
    const sqlInsertfacturaStatement = `
    INSERT INTO facturas (
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
        tercero_tipo,
        tercero_departamento,
        tercero_ciudad,
        tercero_barrio,
        tercero_email,
        tercero_reteica,
        tercero_frecuencia,
        tercero_zona,
        tercero_ruta,
        tercero_latitude,
        tercero_longitude,
        tercero_rut_pat,
        tercero_camaracomercio_path,
        
        guardadoEnServer,
        sincronizado,
        articulosAdded
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

    const valuesFactura = [
      factura.tipo_operacion,
      factura.almacen,
      factura.fecha,
      factura.fechaVencimiento,
      factura.formaPago,
      factura.hora,
      factura.fechaTimestampUnix,
      factura.observaciones,
      factura.valorPedido,
      factura.ubicacion.latitud,
      factura.ubicacion.longitud,

      factura.operador.auto_dian,
      factura.operador.cod_vendedor,
      factura.operador.codigo,
      factura.operador.descripcion,
      factura.operador.fecha_fin,
      factura.operador.fecha_ini,
      factura.operador.id,
      Number(factura.operador.nro_factura), // lo hago porque se estaban guardando ceros a la izquierda
      factura.operador.nro_fin,
      factura.operador.nro_ini,
      Number(factura.operador.nro_pedido), // lo hago porque se estaban guardando ceros a la izquierda
      factura.operador.prefijo,
      factura.operador.sucursal,
      factura.operador.vigencia,

      factura.tercero.clasificacion,
      factura.tercero.codigo,
      factura.tercero.direcc,
      factura.tercero.ex_iva,
      factura.tercero.f_pago,
      factura.tercero.nombre,
      factura.tercero.plazo,
      factura.tercero.tel,
      factura.tercero.vendedor,
      factura.tercero.tipo,
      factura.tercero.departamento,
      factura.tercero.ciudad,
      factura.tercero.barrio,
      factura.tercero.email,
      factura.tercero.reteica,
      factura.tercero.frecuencia,
      factura.tercero.zona,
      factura.tercero.ruta,
      factura.tercero.latitude,
      factura.tercero.longitude,
      factura.tercero.rut_path,
      factura.tercero.camaracomercio_path,

      factura.guardadoEnServer,
      factura.sincronizado,
      JSON.stringify(factura.articulosAdded),
    ];

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlInsertfacturaStatement,
          valuesFactura,
          async (_: ResultSet, result: ResultSet) => {
            const operadorUpdate = {
              ...factura.operador,
              nro_factura: Number(factura.operador.nro_factura) + 1,
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
                  `[Error al actualizar consecutivo o guardar invoiceHistory]: ${error}`,
                ),
              );
            }
          },
          (error: Error) => {
            reject(new Error(`[Error al crear invoiceHistory]: ${error}`));
          },
        );
      });
    });
  }
  async update(id: string, item: IOperation): Promise<boolean> {
    const sqlUpdateStatement = `
    UPDATE facturas SET
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
      tercero_tipo='${item.tercero.tipo}',
      tercero_departamento='${item.tercero.departamento}',
      tercero_ciudad='${item.tercero.ciudad}',
      tercero_barrio='${item.tercero.barrio}',
      tercero_email='${item.tercero.email}',
      tercero_reteica='${item.tercero.reteica}',
      tercero_frecuencia='${item.tercero.frecuencia}',
      tercero_zona='${item.tercero.zona}',
      tercero_ruta='${item.tercero.ruta}',
      tercero_latitude='${item.tercero.latitude}',
      tercero_longitude='${item.tercero.longitude}',
      tercero_rut_path='${item.tercero.rut_path}',
      tercero_camaracomercio_path='${item.tercero.camaracomercio_path}',

      guardadoEnServer='${item.guardadoEnServer}',
      sincronizado='${item.sincronizado}',
      articulosAdded='${JSON.stringify(item.articulosAdded)}'
      WHERE operador_nro_factura = ${id} AND operador_sucursal = '${
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
            reject(new Error('Fallo actualizar factura'));
          },
        );
      });
    });
  }
  async getAll(): Promise<IOperation[]> {
    const sqlSelectFacturasStatement = `
      SELECT * FROM facturas
      ORDER BY fechaTimestampUnix DESC
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectFacturasStatement,
          null,
          (_: ResultSet, resultFacturas: ResultSet) => {
            const facturas = resultFacturas.rows
              .raw()
              .map((factura: IOperationDb) => {
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
                    tipo: factura.tercero_tipo,
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
                    rut_path: factura.tercero_rut_path,
                    camaracomercio_path: factura.tercero_camaracomercio_path,
                  },
                  articulosAdded: JSON.parse(factura.articulosAdded),

                  formaPago: factura.formaPago,
                  fechaVencimiento: factura.fechaVencimiento,
                  valorPedido: factura.valorPedido,
                  observaciones: factura.observaciones,
                  guardadoEnServer: factura.guardadoEnServer,
                  sincronizado: factura.sincronizado,
                };
              });

            resolve(facturas);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener facturas [articulosAdded]'));
          },
        );
      });
    });
  }
  async deleteTable(): Promise<boolean> {
    const sqlDeletePedidosStatement = `DELETE FROM facturas`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeletePedidosStatement,
          null,
          (_: ResultSet, result: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('Fallo borrar tabla facturas'));
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
          `SELECT * FROM facturas WHERE ${attributeName} = ?`,
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
                        tipo: factura.tercero_tipo,
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
                        rut_path: factura.tercero_rut_path,
                        camaracomercio_path:
                          factura.tercero_camaracomercio_path,
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
              // reject(
              //   new Error(
              //     'No se encontró el registro con el código proporcionado',
              //   ),
              // );
              resolve([]);
            }
          },
          (error: Error) => {
            reject(
              new Error('Fallo al obtener factura por codigo proporcionado'),
            );
          },
        );
      });
    });
  }
}

export {FacturasRepository};
