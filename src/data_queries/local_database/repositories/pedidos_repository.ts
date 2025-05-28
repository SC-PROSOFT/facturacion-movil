import {ResultSet, Transaction, SQLError} from 'react-native-sqlite-storage';
import {
  IRepository,
  IOperation,
  IOperationDb,
  IOperadores,
  ITerceros,
} from '../../../common/types';
import {db} from '../local_database_config';
import {operadoresService} from '../services';

// --- Helpers (como en la respuesta anterior) ---
const operationToDbValues = (pedido: IOperation): any[] => {
  /* ... tu implementación ... */
  return [
    pedido.tipo_operacion,
    pedido.almacen,
    pedido.fecha,
    pedido.fechaVencimiento,
    pedido.formaPago,
    pedido.hora,
    pedido.fechaTimestampUnix,
    pedido.observaciones,
    pedido.valorPedido,
    pedido.ubicacion?.latitud ?? null,
    pedido.ubicacion?.longitud ?? null,
    pedido.operador?.auto_dian ?? null,
    pedido.operador?.cod_vendedor ?? null,
    pedido.operador?.codigo ?? null,
    pedido.operador?.descripcion ?? null,
    pedido.operador?.fecha_fin ?? null,
    pedido.operador?.fecha_ini ?? null,
    pedido.operador?.id ?? null,
    Number(pedido.operador?.nro_factura) || null,
    pedido.operador?.nro_fin ?? null,
    pedido.operador?.nro_ini ?? null,
    Number(pedido.operador?.nro_pedido) || null,
    pedido.operador?.prefijo ?? null,
    pedido.operador?.sucursal ?? null,
    pedido.operador?.vigencia ?? null,
    pedido.tercero?.clasificacion ?? null,
    pedido.tercero?.codigo,
    pedido.tercero?.direcc ?? null,
    pedido.tercero?.ex_iva,
    pedido.tercero?.f_pago,
    pedido.tercero?.dv ?? null,
    pedido.tercero?.nombre,
    pedido.tercero?.plazo ?? null,
    pedido.tercero?.tel ?? null,
    pedido.tercero?.vendedor ?? null,
    pedido.tercero?.tipo ?? null,
    pedido.tercero?.departamento ?? null,
    pedido.tercero?.ciudad ?? null,
    pedido.tercero?.barrio ?? null,
    pedido.tercero?.email ?? null,
    pedido.tercero?.reteica,
    pedido.tercero?.frecuencia,
    pedido.tercero?.zona ?? null,
    pedido.tercero?.ruta ?? null,
    pedido.tercero?.latitude ?? null,
    pedido.tercero?.longitude ?? null,
    pedido.tercero?.rut_pdf ?? null,
    pedido.tercero?.camcom_pdf ?? null,
    pedido.guardadoEnServer,
    pedido.sincronizado,
    JSON.stringify(pedido.articulosAdded || []),
  ];
};
const ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE = [
  'tipo_operacion',
  'almacen',
  'fecha',
  'fechaVencimiento',
  'formaPago',
  'hora',
  'fechaTimestampUnix',
  'observaciones',
  'valorPedido',
  'ubicacion_latitud',
  'ubicacion_longitud',
  'operador_auto_dian',
  'operador_cod_vendedor',
  'operador_codigo',
  'operador_descripcion',
  'operador_fecha_fin',
  'operador_fecha_ini',
  'operador_id',
  'operador_nro_factura',
  'operador_nro_fin',
  'operador_nro_ini',
  'operador_nro_pedido',
  'operador_prefijo',
  'operador_sucursal',
  'operador_vigencia',
  'tercero_clasificacion',
  'tercero_codigo',
  'tercero_direcc',
  'tercero_ex_iva',
  'tercero_f_pago',
  'tercero_dv',
  'tercero_nombre',
  'tercero_plazo',
  'tercero_tel',
  'tercero_vendedor',
  'tercero_tipo',
  'tercero_departamento',
  'tercero_ciudad',
  'tercero_barrio',
  'tercero_email',
  'tercero_reteica',
  'tercero_frecuencia',
  'tercero_zona',
  'tercero_ruta',
  'tercero_latitude',
  'tercero_longitude',
  'tercero_rut_pdf',
  'tercero_camcom_pdf',
  'guardadoEnServer',
  'sincronizado',
  'articulosAdded',
];
// --- Fin Helpers ---

class PedidosRepository implements IRepository<IOperation> {
  private mapRowToOperation(row: IOperationDb): IOperation {
    const parseNullableNumber = (
      value: number | null | undefined,
    ): number | undefined => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    // Helper to safely convert potentially null strings from DB to string or undefined
    const formatNullableString = (
      value: string | null | undefined,
    ): string | undefined => {
      return value === null || value === undefined ? undefined : value;
    };
    // ... (Implementación completa del mapeo como en la respuesta anterior, asegurando que `id` se mapea)
    // Ejemplo:
    return {
      id: row.id, // Esencial
      tipo_operacion: row.tipo_operacion as IOperation['tipo_operacion'],
      almacen: row.almacen ?? undefined,
      fecha: row.fecha,
      fechaVencimiento: row.fechaVencimiento ?? undefined,
      formaPago: row.formaPago as IOperation['formaPago'],
      hora: row.hora,
      fechaTimestampUnix: row.fechaTimestampUnix,
      observaciones: row.observaciones ?? undefined,
      valorPedido: row.valorPedido ?? 0,
      ubicacion: {
        latitud: row.ubicacion_latitud ?? '',
        longitud: row.ubicacion_longitud ?? '',
      },
      operador: {
        id: row.operador_id,
        auto_dian: formatNullableString(row.operador_auto_dian),
        cod_vendedor: formatNullableString(row.operador_cod_vendedor),
        codigo: formatNullableString(row.operador_codigo),
        descripcion: formatNullableString(row.operador_descripcion),
        fecha_fin: formatNullableString(row.operador_fecha_fin),
        fecha_ini: formatNullableString(row.operador_fecha_ini),
        nro_factura: parseNullableNumber(row.operador_nro_factura),
        nro_fin: formatNullableString(row.operador_nro_fin),
        nro_ini: formatNullableString(row.operador_nro_ini),
        nro_pedido: parseNullableNumber(row.operador_nro_pedido),
        prefijo: formatNullableString(row.operador_prefijo),
        sucursal: formatNullableString(row.operador_sucursal),
        vigencia: formatNullableString(row.operador_vigencia),
      } as IOperadores, // Asegúrate que IOperadores es el tipo correcto
      tercero: {
        clasificacion: formatNullableString(row.tercero_clasificacion),
        codigo: row.tercero_codigo, // tercero_codigo is not nullable in IOperationDb
        direcc: formatNullableString(row.tercero_direcc),
        ex_iva: row.tercero_ex_iva,
        f_pago: row.tercero_f_pago,
        dv: formatNullableString(row.tercero_dv),
        nombre: row.tercero_nombre, // tercero_nombre is not nullable in IOperationDb
        plazo: parseNullableNumber(row.tercero_plazo),
        tel: formatNullableString(row.tercero_tel),
        vendedor: formatNullableString(row.tercero_vendedor),
        tipo: row.tercero_tipo ?? undefined, // Handle optional 'tipo'
        departamento: formatNullableString(row.tercero_departamento),
        ciudad: formatNullableString(row.tercero_ciudad),
        barrio: formatNullableString(row.tercero_barrio),
        email: formatNullableString(row.tercero_email),
        reteica: row.tercero_reteica,
        frecuencia: row.tercero_frecuencia,
        zona: formatNullableString(row.tercero_zona),
        ruta: formatNullableString(row.tercero_ruta),
        latitude: formatNullableString(row.tercero_latitude),
        longitude: formatNullableString(row.tercero_longitude),
        rut_pdf: formatNullableString(row.tercero_rut_pdf),
        camcom_pdf: formatNullableString(row.tercero_camcom_pdf),
        // ...
      } as ITerceros, // Asegúrate que ITerceros es el tipo correcto
      articulosAdded: row.articulosAdded ? JSON.parse(row.articulosAdded) : [],
      guardadoEnServer:
        (row.guardadoEnServer as IOperation['guardadoEnServer']) ?? 'N',
      sincronizado: (row.sincronizado as IOperation['sincronizado']) ?? 'N',
    };
  }

  async createTable(): Promise<boolean> {
    const sqlCreatePrecise = `
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_operacion TEXT, almacen TEXT, fecha TEXT, fechaVencimiento TEXT, formaPago TEXT,
        hora TEXT, fechaTimestampUnix INTEGER, observaciones TEXT, valorPedido REAL,
        ubicacion_latitud TEXT, ubicacion_longitud TEXT, operador_auto_dian TEXT,
        operador_cod_vendedor TEXT, operador_codigo TEXT, operador_descripcion TEXT,
        operador_fecha_fin TEXT, operador_fecha_ini TEXT, operador_id TEXT,
        operador_nro_factura INTEGER, operador_nro_fin TEXT, operador_nro_ini TEXT,
        operador_nro_pedido INTEGER, operador_prefijo TEXT, operador_sucursal TEXT,
        operador_vigencia TEXT, tercero_clasificacion TEXT, tercero_codigo TEXT,
        tercero_direcc TEXT, tercero_ex_iva TEXT, tercero_f_pago TEXT, tercero_dv TEXT,
        tercero_nombre TEXT, tercero_plazo INTEGER, tercero_tel TEXT, tercero_vendedor TEXT,
        tercero_tipo TEXT, tercero_departamento TEXT, tercero_ciudad TEXT, tercero_barrio TEXT,
        tercero_email TEXT, tercero_reteica TEXT, tercero_frecuencia TEXT, tercero_zona TEXT,
        tercero_ruta TEXT, tercero_latitude TEXT, tercero_longitude TEXT,
        tercero_rut_pdf TEXT, tercero_camcom_pdf TEXT, guardadoEnServer TEXT,
        sincronizado TEXT, articulosAdded TEXT
    );`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlCreatePrecise,
          [],
          () => {
            resolve(true);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error(
              'SQLITE Error al crear tabla pedidos:',
              error.message,
            );
            reject(new Error(`Fallo crear tabla pedidos: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  // Implementación conforme a IRepository<T> que devuelve Promise<boolean>
  async create(pedido: IOperation): Promise<boolean> {
    const columns = ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE.join(', ');
    const placeholders = ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE.map(
      () => '?',
    ).join(', ');
    const sqlInsertPedidoStatement = `INSERT INTO pedidos (${columns}) VALUES (${placeholders})`;
    const valuesPedido = operationToDbValues(pedido);

    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlInsertPedidoStatement,
          valuesPedido,
          async (_tx: Transaction, result: ResultSet) => {
            const operadorUpdate = {
              ...pedido.operador,
              nro_pedido: Number(pedido.operador.nro_pedido || 0) + 1,
            };
            try {
              if (
                pedido.guardadoEnServer == 'S' &&
                pedido.sincronizado == 'S'
              ) {
                await operadoresService.updateOperador(
                  operadorUpdate.id,
                  operadorUpdate as IOperadores,
                );
              }
              resolve(true);
            } catch (error: any) {
              reject(
                new Error(`Error al actualizar consecutivo: ${error.message}`),
              );
            }
          },
          (_tx: Transaction, error: SQLError) => {
            console.error(
              'SQLITE Error al crear pedido:',
              JSON.stringify(error),
            );
            reject(new Error(`Fallo al crear pedido: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  // Nuevo método para obtener el último ID insertado (workaround)
  async getLastInsertId(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          'SELECT last_insert_rowid() as lastId;',
          [],
          (_tx: Transaction, result: ResultSet) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0).lastId);
            } else {
              resolve(null); // No se encontró el último ID
            }
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error getLastInsertId:', error.message);
            reject(
              new Error(`Fallo obtener último ID insertado: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  async update(id: string, item: IOperation): Promise<boolean> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Promise.reject(
        new Error(
          'ID inválido para actualizar. Se esperaba un string numérico.',
        ),
      );
    }
    const setClauses = ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE.map(
      col => `${col} = ?`,
    ).join(', ');
    const sqlUpdateStatement = `UPDATE pedidos SET ${setClauses} WHERE id = ?`;
    const values = [...operationToDbValues(item), numericId];
    console.log('setClauses:', setClauses);
    console.log('SQL Update Statement:', sqlUpdateStatement);
    console.log('Valores para actualizar pedido:', values);
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlUpdateStatement,
          values,
          (_tx: Transaction, result: ResultSet) => {
            resolve(result.rowsAffected > 0);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error al actualizar pedido:', error.message);
            reject(new Error(`Fallo actualizar pedido: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async getAll(): Promise<IOperation[]> {
    // IRepository dice T | T[], pero getAll usualmente es T[]
    const sqlSelectStatement = `SELECT * FROM pedidos ORDER BY fechaTimestampUnix DESC`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_tx: Transaction, result: ResultSet) => {
            const operations: IOperation[] = result.rows
              .raw()
              .map((row: IOperationDb) => this.mapRowToOperation(row));
            resolve(operations);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error getAll pedidos:', error.message);
            reject(
              new Error(`Fallo obtener todos los pedidos: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  async deleteTable(): Promise<boolean> {
    const sqlDeleteStatement = `DROP TABLE IF EXISTS pedidos`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          () => resolve(true),
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error borrar tabla pedidos:', error.message);
            reject(new Error(`Fallo borrar tabla pedidos: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperation[]> {
    // IRepository dice T | T[]
    const validColumns = ['id', ...ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE];
    if (!validColumns.includes(attributeName)) {
      return Promise.reject(
        new Error(`Nombre de atributo no válido: ${attributeName}`),
      );
    }
    const sqlQuery = `SELECT * FROM pedidos WHERE ${attributeName} = ? ORDER BY fechaTimestampUnix DESC`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlQuery,
          [attributeValue],
          (_tx: Transaction, result: ResultSet) => {
            const operations: IOperation[] = result.rows
              .raw()
              .map((row: IOperationDb) => this.mapRowToOperation(row));
            resolve(operations);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error(
              `SQLITE Error getByAttribute (${attributeName}) pedidos:`,
              error.message,
            );
            reject(
              new Error(
                `Fallo obtener pedidos por ${attributeName}: ${error.message}`,
              ),
            );
            return false;
          },
        );
      });
    });
  }

  async getById(id: string): Promise<IOperation | null> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Promise.reject(
        new Error('ID inválido para buscar. Se esperaba un string numérico.'),
      );
    }
    const sqlQuery = `SELECT * FROM pedidos WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlQuery,
          [numericId],
          (_tx: Transaction, result: ResultSet) => {
            if (result.rows.length > 0) {
              const row = result.rows.item(0);
              resolve(this.mapRowToOperation(row));
            } else {
              resolve(null); // No se encontró el pedido
            }
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error getById pedidos:', error.message);
            reject(new Error(`Fallo obtener pedido por ID: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async getPedidosDeHoy(): Promise<IOperation[]> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.getByAttribute('fecha', hoy);
  }

  async getPedidosDeEsteMes(): Promise<IOperation[]> {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anioMes = `${anio}-${mes}`;
    const sqlQuery = `SELECT * FROM pedidos WHERE strftime('%Y-%m', fecha) = ? ORDER BY fechaTimestampUnix DESC`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlQuery,
          [anioMes],
          (_tx: Transaction, result: ResultSet) => {
            resolve(
              result.rows
                .raw()
                .map((row: IOperationDb) => this.mapRowToOperation(row)),
            );
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error getPedidosDeEsteMes:', error.message);
            reject(
              new Error(`Fallo obtener pedidos de este mes: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  async delete(id: string): Promise<boolean> {
    // id es string según IRepository
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Promise.reject(
        new Error('ID inválido para eliminar. Se esperaba un string numérico.'),
      );
    }
    console.log('Eliminando pedido con ID:', numericId);
    const sqlDeleteStatement = `DELETE FROM pedidos WHERE id = ?`;
    return new Promise((resolve, reject) => {
      
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlDeleteStatement,
          [numericId],
          (_tx: Transaction, result: ResultSet) => {
            resolve(result.rowsAffected > 0);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error al eliminar pedido:', error.message);
            reject(new Error(`Fallo eliminar pedido: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    const sqlQuery = `SELECT COUNT(*) as count FROM pedidos`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlQuery,
          [],
          (_tx: Transaction, result: ResultSet) => {
            resolve(
              result.rows.length > 0
                ? result.rows.item(0).count.toString()
                : '0',
            );
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('SQLITE Error getQuantity pedidos:', error.message);
            reject(
              new Error(`Fallo obtener cantidad de pedidos: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  async fillTable(data: IOperation[]): Promise<boolean> {
    if (!data || data.length === 0) return Promise.resolve(true);

    const columns = ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE.join(', ');
    const placeholders = ALL_DB_COLUMNS_FOR_INSERT_OR_UPDATE.map(
      () => '?',
    ).join(', ');
    // Usamos INSERT OR IGNORE para el caso de que intentes re-insertar datos que ya existen
    // y que podrían tener una restricción UNIQUE (aparte del id autoincremental).
    // Si no tienes tales restricciones, INSERT INTO está bien.
    const sqlInsertStatement = `INSERT OR IGNORE INTO pedidos (${columns}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: Transaction) => {
          for (const item of data) {
            // El 'id' de 'item' (si viene de la API) no se usa para la inserción local
            // ya que la tabla 'pedidos' tiene 'id INTEGER PRIMARY KEY AUTOINCREMENT'.
            // operationToDbValues ya excluye el 'id' si no se le pasa el segundo argumento como true.
            const values = operationToDbValues(item);
            tx.executeSql(
              sqlInsertStatement,
              values,
              () => {
                /* Inserción individual exitosa (o ignorada) */
              },
              (_tx: Transaction, error: SQLError) => {
                console.error(
                  'SQLITE Error en fillTable (item individual):',
                  error.message,
                  item,
                );
                // Si un item falla, hacemos rollback y rechazamos la promesa principal.
                // El `return true` aquí es para el callback de error de executeSql,
                // indicando que no queremos que la librería maneje el error de forma diferente.
                // La transacción fallará.
                reject(
                  new Error(
                    `Fallo al insertar item en fillTable: ${error.message}`,
                  ),
                );
                return true; // Detiene más ejecuciones en esta transacción y causa rollback
              },
            );
          }
        },
        // Error de la transacción (si alguna de las inserciones falló y su callback de error devolvió true)
        (error: SQLError) => {
          console.error(
            'SQLITE Error de Transacción en fillTable:',
            error.message,
          );
          reject(
            new Error(`Error de transacción al llenar tabla: ${error.message}`),
          );
        },
        // Éxito de la transacción (todas las inserciones OK)
        () => {
          resolve(true);
        },
      );
    });
  }
}

export {PedidosRepository};
