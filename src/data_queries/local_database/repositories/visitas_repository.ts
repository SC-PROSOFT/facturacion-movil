import {ResultSet, Transaction, SQLError} from 'react-native-sqlite-storage';
import {IRepository, IVisita} from '../../../common/types'; // Asegúrate que IVisita esté actualizada
import {db} from '../local_database_config';

// Helper para mapear fila de DB a objeto IVisita
const mapRowToVisita = (row: any): IVisita => {
  return {
    id_visita: row.id_visita,
    id_tercero: row.id_tercero, // Corregido para que coincida con el nombre de columna en DB
    client: row.client,
    adress: row.adress ?? '', // Default si es null
    status: row.status,
    observation: row.observation ?? '', // Default si es null
    saleValue: row.saleValue ?? 0, // Default si es null
    appointmentDate: row.appointmentDate,
    location: {
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
    },
    zona: row.zona ?? '',
    ruta: row.ruta ?? '',
    frecuencia: row.frecuencia ?? '',
    frecuencia_2: row.frecuencia_2 ?? undefined, // Mantener undefined si es opcional
    frecuencia_3: row.frecuencia_3 ?? undefined,
    vendedor: row.vendedor ?? '',
  };
};
const UPDATABLE_VISITA_DB_COLUMNS: Array<
  Exclude<keyof IVisita, 'id_visita' | 'id_tercero' | 'location'>
> = [
  'client',
  'adress',
  'status',
  'observation',
  'saleValue',
  'appointmentDate',
  'zona',
  'ruta',
  'frecuencia',
  'frecuencia_2',
  'frecuencia_3',
  'vendedor',
  // 'latitude' y 'longitude' se manejan por separado si 'location' está en 'data'
];
class VisitasRepository implements IRepository<IVisita> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
      CREATE TABLE IF NOT EXISTS visitas (
        id_visita INTEGER PRIMARY KEY AUTOINCREMENT,
        id_tercero TEXT NOT NULL, 
        client TEXT NOT NULL,
        adress TEXT,
        status TEXT NOT NULL,
        observation TEXT,
        saleValue REAL DEFAULT 0,
        appointmentDate TEXT NOT NULL,
        latitude TEXT,
        longitude TEXT,
        zona TEXT,
        frecuencia TEXT,
        ruta TEXT,
        frecuencia_2 TEXT,
        frecuencia_3 TEXT,
        vendedor TEXT
      );
    `;
    const sqlCreateIndexDate = `CREATE INDEX IF NOT EXISTS idx_visitas_appointmentDate ON visitas(appointmentDate);`;
    const sqlCreateIndexTerceroDate = `CREATE UNIQUE INDEX IF NOT EXISTS idx_visitas_tercero_date ON visitas(id_tercero, appointmentDate);`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlCreateStatement,
          [],
          () => {
            tx.executeSql(
              sqlCreateIndexDate,
              [],
              () => {
                tx.executeSql(
                  sqlCreateIndexTerceroDate,
                  [],
                  () => resolve(true),
                  (_t, error: SQLError) => {
                    console.error(
                      'Error creando índice idx_visitas_tercero_date:',
                      error.message,
                    );
                    reject(
                      new Error(
                        `Fallo crear índice idx_visitas_tercero_date: ${error.message}`,
                      ),
                    );
                    return false;
                  },
                );
              },
              (_t, error: SQLError) => {
                console.error(
                  'Error creando índice idx_visitas_appointmentDate:',
                  error.message,
                );
                reject(
                  new Error(
                    `Fallo crear índice idx_visitas_appointmentDate: ${error.message}`,
                  ),
                );
                return false;
              },
            );
          },
          (_t, error: SQLError) => {
            console.error('Error creando tabla visitas:', error.message);
            reject(new Error(`Fallo crear tabla visitas: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async createVisita(
    item: Omit<IVisita, 'id_visita'>,
  ): Promise<IVisita | null> {
    const sqlInsertStatement = `
      INSERT INTO visitas (
        id_tercero, client, adress, status, observation, saleValue, appointmentDate,
        latitude, longitude, zona, frecuencia, ruta, frecuencia_2, frecuencia_3, vendedor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      item.id_tercero,
      item.client,
      item.adress ?? null,
      item.status,
      item.observation ?? null,
      item.saleValue ?? 0,
      item.appointmentDate,
      item.location?.latitude ?? null,
      item.location?.longitude ?? null,
      item.zona ?? null,
      item.frecuencia ?? null,
      item.ruta ?? null,
      item.frecuencia_2 ?? null,
      item.frecuencia_3 ?? null,
      item.vendedor ?? null,
    ];
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlInsertStatement,
          params,
          (_tx: Transaction, result: ResultSet) => {
            if (result.insertId !== undefined) {
              resolve({...item, id_visita: result.insertId});
            } else {
              console.error('Error en createVisita: insertId es undefined.');
              resolve(null);
            }
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('Error al insertar visita:', error.message);
            if (error.message.includes('UNIQUE constraint failed')) {
              console.warn(
                `Visita duplicada (tercero ${item.id_tercero}, fecha ${item.appointmentDate}) no insertada.`,
              );
              resolve(null);
            } else {
              reject(new Error(`Fallo insertar visita: ${error.message}`));
            }
            return false;
          },
        );
      });
    });
  }

  async create(item: IVisita): Promise<boolean> {
    const {id_visita, ...visitaData} = item;
    try {
      const createdVisita = await this.createVisita(visitaData);
      return !!createdVisita;
    } catch (error) {
      console.error('Error en VisitasRepository.create:', error);
      return false;
    }
  }

  async update(
    id_visita_str: string,
    data: Partial<Omit<IVisita, 'id_visita' | 'id_tercero'>>, // Las claves aquí son de IVisita
  ): Promise<boolean> {
    const id_visita = parseInt(id_visita_str, 10);
    if (isNaN(id_visita)) {
      console.error(
        'VisitasRepository.update: ID de visita inválido:',
        id_visita_str,
      );
      return Promise.reject(new Error('ID de visita inválido.'));
    }

    console.log(
      '[VisitasRepo.update] Iniciando para id_visita:',
      id_visita,
      'con data:',
      JSON.stringify(data),
    );

    const updateFieldsSQL: string[] = [];
    const updateValues: any[] = [];

    // Iterar sobre las claves permitidas del objeto 'data' que se pasó
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Castear 'key' a una clave válida de 'data'
        const typedKey = key as keyof typeof data;
        const value = data[typedKey];

        if (value === undefined) {
          // No procesar si el valor es explícitamente undefined
          continue;
        }

        if (typedKey === 'location') {
          const locationValue = value as IVisita['location']; // value es data.location
          if (locationValue) {
            if (locationValue.latitude !== undefined) {
              updateFieldsSQL.push('latitude = ?'); // Nombre de columna en DB
              updateValues.push(locationValue.latitude);
            }
            if (locationValue.longitude !== undefined) {
              updateFieldsSQL.push('longitude = ?'); // Nombre de columna en DB
              updateValues.push(locationValue.longitude);
            }
          }
        } else if (UPDATABLE_VISITA_DB_COLUMNS.includes(typedKey as any)) {
          // Asegurarse que la clave (que es una propiedad de IVisita)
          // es una de las columnas que definimos como actualizables.
          // El nombre de la clave en IVisita y en DB_COLUMNS debe coincidir.
          updateFieldsSQL.push(`${typedKey} = ?`);
          updateValues.push(value);
        } else {
          // Esta advertencia te ayudará a ver si 'data' contiene claves inesperadas
          console.warn(
            `[VisitasRepo.update] Clave ignorada: ${typedKey} no está en UPDATABLE_VISITA_DB_COLUMNS o es 'location' manejada incorrectamente.`,
          );
        }
      }
    }

    if (updateFieldsSQL.length === 0) {
      console.log(
        '[VisitasRepo.update] No hay campos válidos para actualizar para id_visita:',
        id_visita,
      );
      return Promise.resolve(false); // O true si se considera éxito no cambiar nada
    }

    const sqlUpdateStatement = `UPDATE visitas SET ${updateFieldsSQL.join(
      ', ',
    )} WHERE id_visita = ?;`;
    const finalValues = [...updateValues, id_visita];

    console.log('[VisitasRepo.update] SQL:', sqlUpdateStatement);
    console.log('[VisitasRepo.update] Valores:', JSON.stringify(finalValues));

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: Transaction) => {
          console.log('[VisitasRepo.update] Dentro de db.transaction');
          tx.executeSql(
            sqlUpdateStatement,
            finalValues,
            (_tx: Transaction, result: ResultSet) => {
              console.log(
                '[VisitasRepo.update] executeSql ÉXITO - Filas afectadas:',
                result.rowsAffected,
              );
              resolve(result.rowsAffected > 0);
            },
            (_tx: Transaction, error: SQLError) => {
              console.error(
                '[VisitasRepo.update] executeSql ERROR:',
                error.message,
                '(Código:',
                error.code,
                ')',
              );
              reject(
                new Error(`Fallo actualizar visita SQL: ${error.message}`),
              );
              return false;
            },
          );
        },
        (transactionError: SQLError) => {
          console.error(
            '[VisitasRepo.update] Error DE TRANSACCIÓN:',
            transactionError.message,
          );
          reject(
            new Error(
              `Error de transacción al actualizar visita: ${transactionError.message}`,
            ),
          );
        },
        () => {
          console.log(
            '[VisitasRepo.update] Transacción de actualización COMMIT.',
          );
        },
      );
    });
  }

  // ... resto de tus métodos (getAll, getVisitasByDate, delete, etc.) con el tipado correcto para los callbacks ...
  // Asegúrate que todos usen (tx: Transaction) y (_tx: Transaction, error: SQLError)
  async getAll(): Promise<IVisita[]> {
    const sqlSelectStatement = `SELECT * FROM visitas ORDER BY appointmentDate DESC, client ASC;`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_tx: Transaction, response: ResultSet) => {
            const visitas: IVisita[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              visitas.push(mapRowToVisita(response.rows.item(i)));
            }
            resolve(visitas);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error('Error al obtener todas las visitas:', error.message);
            reject(
              new Error(`Fallo obtener todas las visitas: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  async getVisitasByDate(appointmentDate: string): Promise<IVisita[]> {
    const sqlSelectStatement = `SELECT * FROM visitas WHERE appointmentDate = ?;`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlSelectStatement,
          [appointmentDate],
          (_tx: Transaction, response: ResultSet) => {
            const visitas: IVisita[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              visitas.push(mapRowToVisita(response.rows.item(i)));
            }
            resolve(visitas);
          },
          (_tx: Transaction, error: SQLError) => {
            console.error(
              `Error al obtener visitas por fecha ${appointmentDate}:`,
              error.message,
            );
            reject(
              new Error(`Fallo obtener visitas por fecha: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  // getAll (antes get) para cumplir con IRepository

  // getByAttribute (ejemplo, adáptalo a los atributos que necesites buscar)
  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IVisita[]> {
    // Validar attributeName para prevenir inyección SQL
    const validColumns = [
      'id_visita',
      'id_tercero_fk',
      'status',
      'appointmentDate',
      'vendedor',
    ]; // Añade columnas válidas
    if (!validColumns.includes(attributeName)) {
      return Promise.reject(
        new Error(
          `Búsqueda por atributo no válido o no permitido: ${attributeName}`,
        ),
      );
    }
    const sqlSelectStatement = `SELECT * FROM visitas WHERE ${attributeName} = ?;`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlSelectStatement,
          [attributeValue],
          (_tx: Transaction, response: ResultSet) => {
            const visitas: IVisita[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              visitas.push(mapRowToVisita(response.rows.item(i)));
            }
            resolve(visitas);
          },
          (_tx: Transaction, error: SQLError) => {
            reject(
              new Error(
                `Fallo obtener visitas por atributo ${attributeName}: ${error.message}`,
              ),
            );
            return false;
          },
        );
      });
    });
  }

  async fillTable(data: IVisita[]): Promise<boolean> {
    if (!data || data.length === 0) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: Transaction) => {
          const insertPromises = data.map(visita => {
            const {id_visita, ...visitaData} = visita; // Excluir id_visita
            const params = [
              visitaData.id_tercero,
              visitaData.client,
              visitaData.adress ?? null,
              visitaData.status,
              visitaData.observation ?? null,
              visitaData.saleValue ?? 0,
              visitaData.appointmentDate,
              visitaData.location?.latitude ?? null,
              visitaData.location?.longitude ?? null,
              visitaData.zona ?? null,
              visitaData.frecuencia ?? null,
              visitaData.ruta ?? null,
              visitaData.frecuencia_2 ?? null,
              visitaData.frecuencia_3 ?? null,
              visitaData.vendedor ?? null,
            ];
            const sql = `INSERT OR IGNORE INTO visitas (
              id_tercero, client, adress, status, observation, saleValue, appointmentDate,
              latitude, longitude, zona, frecuencia, ruta, frecuencia_2, frecuencia_3, vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            return new Promise<void>((pRes, pRej) => {
              tx.executeSql(
                sql,
                params,
                () => pRes(),
                (_t, err) => {
                  console.error(
                    `Error al insertar visita (id_tercero: ${visitaData.id_tercero}, fecha: ${visitaData.appointmentDate}):`,
                    err.message,
                  );
                  pRej(err);
                  return false;
                },
              );
            });
          });

          Promise.all(insertPromises)
            .then(() => resolve(true))
            .catch(error => {
              console.error(
                'Error en una de las inserciones de fillTable:',
                error,
              );
              reject(
                new Error(
                  'Fallo al llenar la tabla de visitas debido a un error en una inserción.',
                ),
              );
            });
        },
        (txError: SQLError) => {
          console.error(
            'Error de transacción en fillTable (VisitasRepository):',
            txError.message,
          );
          reject(
            new Error('Error de transacción al llenar la tabla de visitas.'),
          );
        },
      );
    });
  }

  async deleteTable(): Promise<boolean> {
    /* ... (como lo tenías, con tipos Transaction y SQLError) ... */
    const sqlDeleteStatement = `DROP TABLE IF EXISTS visitas;`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          () => resolve(true),
          (_t, error: SQLError) => {
            console.error('Error al borrar tabla visitas:', error.message);
            reject(new Error(`Fallo borrar tabla visitas: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  // delete(id: string) según tu IRepository (asume que id es id_visita)
  async delete(idVisitaStr: string): Promise<boolean> {
    const id_visita = parseInt(idVisitaStr, 10);
    if (isNaN(id_visita)) {
      return Promise.reject(new Error('ID de visita inválido para eliminar'));
    }
    const sql = `DELETE FROM visitas WHERE id_visita = ?`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sql,
          [id_visita],
          (_t, result) => resolve(result.rowsAffected > 0),
          (_t, error: SQLError) => {
            console.error('Error al eliminar visita:', error.message);
            reject(new Error(`Fallo al eliminar visita: ${error.message}`));
            return false;
          },
        );
      });
    });
  }

  async deleteData(): Promise<boolean> {
    const sql = `DELETE FROM visitas`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sql,
          [],
          (_t, result) => resolve(result.rowsAffected > 0),
          (_t, error: SQLError) => {
            console.error('Error al eliminar datos de visitas:', error.message);
            reject(
              new Error(`Fallo al eliminar datos de visitas: ${error.message}`),
            );
            return false;
          },
        );
      });
    });
  }

  // getQuantity según tu IRepository
  async getQuantity(): Promise<string> {
    const sql = `SELECT COUNT(*) as count FROM visitas`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          sql,
          [],
          (_t, result) =>
            resolve(
              result.rows.length > 0
                ? result.rows.item(0).count.toString()
                : '0',
            ),
          (_t, error: SQLError) => {
            console.error(
              'Error al obtener cantidad de visitas:',
              error.message,
            );
            reject(
              new Error(
                `Fallo al obtener cantidad de visitas: ${error.message}`,
              ),
            );
            return false;
          },
        );
      });
    });
  }

  // getAllByApi no se implementa aquí ya que es específico de la fuente de datos externa.
  // Debería estar en un servicio de API, no en un repositorio de BD local.
  // Si insistes, necesitaría una implementación con fetch como en PedidosRepository.
}

export {VisitasRepository};
