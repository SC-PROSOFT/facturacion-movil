import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, ITerceros} from '../../../common/types';

import {db} from '../local_database_config';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {
  setObjInfoAlert,
  setObjTercero,
  addTerceroCreado,
  addTerceroEditado,
  setIsShowTercerosFinder,
} from '../../../redux/slices';
import {store} from '../../../redux/store';

class TercerosRepository implements IRepository<ITerceros> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS terceros (
        codigo TEXT,
        nombre TEXT,
        direcc TEXT,
        tel TEXT,
        vendedor TEXT,
        plazo TEXT,
        f_pago TEXT,
        ex_iva TEXT,
        clasificacion TEXT,

        tipo TEXT,
        departamento TEXT,
        ciudad TEXT,
        barrio TEXT,
        email TEXT,
        reteica TEXT, 
        frecuencia TEXT,
        zona TEXT, 
        ruta TEXT,
        latitude TEXT,
        longitude TEXT,
        rut_path TEXT,
        camaracomercio_path TEXT
    )
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo crear tabla terceros'));
          },
        );
      });
    });
  }

  async createTableCreates(): Promise<boolean> {
    const sqlCreateTercer = `CREATE TABLE IF NOT EXISTS terceros_creados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT,
        nombre TEXT,
        direcc TEXT,
        tel TEXT,
        vendedor TEXT,
        plazo INTEGER,
        f_pago TEXT,
        ex_iva INTEGER,
        clasificacion TEXT,
        tipo TEXT,
        departamento TEXT,
        ciudad TEXT,
        barrio TEXT,
        email TEXT,
        reteica INTEGER,
        frecuencia TEXT,
        zona TEXT,
        ruta TEXT,
        latitude REAL,
        longitude REAL,
        rut_path TEXT,
        camaracomercio_path TEXT
      )`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateTercer,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo crear tabla terceros creados'));
          },
        );
      });
    });
  }

  async createTableEdits(): Promise<boolean> {
    const sqlEditTercer = `CREATE
    TABLE IF NOT EXISTS terceros_editados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT,
        nombre TEXT,
        direcc TEXT,
        tel TEXT,
        vendedor TEXT,
        plazo INTEGER,
        f_pago TEXT,
        ex_iva INTEGER,
        clasificacion TEXT,
        tipo TEXT,
        departamento TEXT,
        ciudad TEXT,
        barrio TEXT,
        email TEXT,
        reteica INTEGER,
        frecuencia TEXT,
        zona TEXT,
        ruta TEXT,
        latitude REAL,
        longitude REAL,
        rut_path TEXT,
        camaracomercio_path TEXT
      )`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlEditTercer,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo crear tabla terceros editados'));
          },
        );
      });
    });
  }

  async create(tercero: ITerceros): Promise<boolean> {
    const sqlInsertTerceroStatement = `
    INSERT INTO terceros (
        codigo,
        nombre,
        direcc,
        tel,
        vendedor,
        plazo,
        f_pago,
        ex_iva,
        clasificacion,
        tipo,
        departamento,
        ciudad,
        barrio,
        email,
        reteica,
        frecuencia,
        zona,
        ruta,
        latitude,
        longitude,
        rut_path,
        camaracomercio_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

    const valuesTercero = [
      tercero.codigo,
      tercero.nombre,
      tercero.direcc,
      tercero.tel,
      tercero.vendedor,
      tercero.plazo,
      tercero.f_pago,
      tercero.ex_iva,
      tercero.clasificacion,
      tercero.tipo,
      tercero.departamento,
      tercero.ciudad,
      tercero.barrio,
      tercero.email,
      tercero.reteica,
      tercero.frecuencia,
      tercero.zona,
      tercero.ruta,
      tercero.latitude,
      tercero.longitude,
      tercero.rut_path,
      tercero.camaracomercio_path,
    ];

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlInsertTerceroStatement,
          valuesTercero,
          async (_: ResultSet, result: ResultSet) => {
            store.dispatch(addTerceroCreado(tercero));
            this.saveCreatedTerceroToDB(tercero);
            resolve(true);
          },
          (error: ResultSet) => {
            console.log('error', error);
            reject(new Error(`[Error al crear tercero]: ${error}`));
          },
        );
      });
    });
  }

  async update(id: string, tercero: ITerceros): Promise<boolean> {
    const sqlUpdateTerceroStatement = `
    UPDATE terceros SET
        nombre = ?,
        direcc = ?,
        tel = ?,
        vendedor = ?,
        plazo = ?,
        f_pago = ?,
        ex_iva = ?,
        clasificacion = ?,
        tipo = ?,
        departamento = ?,
        ciudad = ?,
        barrio = ?,
        email = ?,
        reteica = ?,
        frecuencia = ?,
        zona = ?,
        ruta = ?,
        latitude = ?,
        longitude = ?,
        rut_path = ?,
        camaracomercio_path = ?
    WHERE codigo = ?
   `;

    const valuesTercero = [
      tercero.nombre,
      tercero.direcc,
      tercero.tel,
      tercero.vendedor,
      tercero.plazo,
      tercero.f_pago,
      tercero.ex_iva,
      tercero.clasificacion,
      tercero.tipo,
      tercero.departamento,
      tercero.ciudad,
      tercero.barrio,
      tercero.email,
      tercero.reteica,
      tercero.frecuencia,
      tercero.zona,
      tercero.ruta,
      tercero.latitude,
      tercero.longitude,
      tercero.rut_path,
      tercero.camaracomercio_path,
      id,
    ];

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateTerceroStatement,
          valuesTercero,
          async (_: ResultSet, result: ResultSet) => {
            store.dispatch(addTerceroEditado(tercero));
            this.saveEditedTerceroToDB(tercero);
            resolve(true);
          },
          (error: any) => {
            console.log('error', error);
            reject(new Error(`[Error al actualizar tercero]: ${error}`));
          },
        );
      });
    });
  }

  async getModified(): Promise<ITerceros[]> {
    const sqlSelectStatement = `
        SELECT * FROM terceros WHERE estado IN ('1', '2')
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros modificados'));
          },
        );
      });
    });
  }

  async fillTable(terceros: ITerceros[]): Promise<boolean> {
    const innerDeleteTerceros = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `DELETE FROM terceros`,
            null,
            (_: ResultSet, response: ResultSet) => {
              console.log('response =>', response);
              resolve(true);
            },
            (error: ResultSet) => {
              console.log(error);
              reject(new Error('Fallo borrar terceros'));
            },
          );
        });
      });
    };

    const innerInsertBlockOfTerceros = (terceros: ITerceros[]) => {
      const placeholders = terceros
        .map(
          () =>
            '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .join(', ');

      const sqlInsertStatement = `
        INSERT INTO terceros (
          codigo,
          nombre,
          direcc,
          tel,
          vendedor,
          plazo,
          f_pago,
          ex_iva,
          clasificacion,

          tipo,
          departamento,
          ciudad,
          barrio,
          email,
          reteica, 
          frecuencia,
          zona, 
          ruta,
          latitude,
          longitude,
          rut_path,
          camaracomercio_path
        ) VALUES ${placeholders}
      `;

      const values = terceros.flatMap(tercero => [
        tercero.codigo,
        tercero.nombre,
        tercero.direcc,
        tercero.tel,
        tercero.vendedor,
        tercero.plazo,
        tercero.f_pago,
        tercero.ex_iva,
        tercero.clasificacion,

        tercero.tipo,
        tercero.departamento,
        tercero.ciudad,
        tercero.barrio,
        tercero.email,
        tercero.reteica,
        tercero.frecuencia,
        tercero.zona,
        tercero.ruta,
        tercero.latitude,
        tercero.longitude,
        tercero.rut_path,
        tercero.camaracomercio_path,
      ]);

      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            sqlInsertStatement,
            values,
            (_: ResultSet, result: ResultSet) => {
              console.log('values', values);
              console.log('result', result);
              resolve(result.rows.raw());
            },
            (error: Error) => {
              console.log('error', error);
              reject(new Error('Fallo guardar bloque terceros'));
            },
          );
        });
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        await innerDeleteTerceros();

        let tercerosTemp = [];
        let contador = 0;
        const bloques = 10;

        if (terceros.length > bloques) {
          let iteraciones = Math.floor(terceros.length / bloques);
          for (let i = 0; i < iteraciones; i++) {
            for (let j = 0; j < bloques; j++) {
              tercerosTemp.push(terceros[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfTerceros(tercerosTemp);
            tercerosTemp = [];
          }
          if (contador < terceros.length) {
            let resta = terceros.length - contador;
            for (let j = 1; j <= resta; j++) {
              tercerosTemp.push(terceros[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfTerceros(tercerosTemp);
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          await innerInsertBlockOfTerceros(terceros);
          resolve(true);
        }
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  }

  async getAll(): Promise<ITerceros[]> {
    const sqlSelectStatement = `
        SELECT * FROM terceros
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros'));
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT COUNT (*) FROM terceros`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]['COUNT (*)']);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad terceros'));
          },
        );
      });
    });
  }

  async getPaginatedByTable(
    table: 'terceros' | 'terceros_nuevos',
    page: number,
    pageSize: number,
  ): Promise<ITerceros[]> {
    const offset = (page - 1) * pageSize;

    if (table === 'terceros_nuevos') {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT * FROM terceros_creados LIMIT ? OFFSET ?`,
            [pageSize, offset],
            (_: ResultSet, responseCreated: ResultSet) => {
              const createdTerceros = responseCreated.rows.raw();

              tx.executeSql(
                `SELECT * FROM terceros_editados LIMIT ? OFFSET ?`,
                [pageSize, offset],
                (_: ResultSet, responseEdited: ResultSet) => {
                  const editedTerceros = responseEdited.rows.raw();
                  const combinedTerceros = [
                    ...createdTerceros,
                    ...editedTerceros,
                  ];
                  resolve(combinedTerceros);
                },
                (error: Error) => {
                  reject(
                    new Error(
                      `Fallo obtener terceros editados: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (error: Error) => {
              reject(
                new Error(`Fallo obtener terceros creados: ${error.message}`),
              );
            },
          );
        });
      });
    } else {
      const sqlSelectStatement = `SELECT * FROM ${table} LIMIT ? OFFSET ?`;

      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            sqlSelectStatement,
            [pageSize, offset],
            (_: ResultSet, response: ResultSet) => {
              resolve(response.rows.raw());
            },
            (error: ResultSet) => {
              reject(new Error(`Fallo obtener terceros de ${table}`));
            },
          );
        });
      });
    }
  }

  async getByAttribute(
    atributeName: string,
    attributeValue: any,
  ): Promise<ITerceros> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM terceros WHERE ${atributeName} = ?`,
          [attributeValue],
          (_: ResultSet, response: ResultSet) => {
            const result =
              response.rows.length > 0 ? response.rows.raw()[0] : null;
            if (result) {
              resolve(result);
            } else {
              reject(
                new Error(
                  'No se encontró el registro con el código proporcionado',
                ),
              );
            }
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad terceros'));
          },
        );
      });
    });
  }
  async getAllByTable(
    table: 'terceros' | 'terceros_nuevos',
  ): Promise<ITerceros[]> {
    if (table === 'terceros_nuevos') {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT * FROM terceros_creados`,
            null,
            (_: ResultSet, responseCreated: ResultSet) => {
              const createdTerceros = responseCreated.rows.raw();

              tx.executeSql(
                `SELECT * FROM terceros_editados`,
                null,
                (_: ResultSet, responseEdited: ResultSet) => {
                  const editedTerceros = responseEdited.rows.raw();
                  const combinedTerceros = [
                    ...createdTerceros,
                    ...editedTerceros,
                  ];
                  resolve(combinedTerceros);
                },
                (error: Error) => {
                  reject(
                    new Error(
                      `Fallo obtener terceros editados: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (error: Error) => {
              reject(
                new Error(`Fallo obtener terceros creados: ${error.message}`),
              );
            },
          );
        });
      });
    } else {
      const sqlSelectStatement = `SELECT * FROM ${table}`;

      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            sqlSelectStatement,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(response.rows.raw());
            },
            (error: ResultSet) => {
              reject(new Error(`Fallo obtener terceros de ${table}`));
            },
          );
        });
      });
    }
  }

  async getQuantityByTable(
    table: 'terceros' | 'terceros_nuevos',
  ): Promise<string> {
    if (table === 'terceros_nuevos') {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT COUNT (*) FROM terceros_creados`,
            null,
            (_: ResultSet, responseCreated: ResultSet) => {
              const countCreated = responseCreated.rows.raw()[0]['COUNT (*)'];

              tx.executeSql(
                `SELECT COUNT (*) FROM terceros_editados`,
                null,
                (_: ResultSet, responseEdited: ResultSet) => {
                  const countEdited = responseEdited.rows.raw()[0]['COUNT (*)'];
                  const totalCount =
                    parseInt(countCreated) + parseInt(countEdited);
                  resolve(totalCount.toString());
                },
                (error: Error) => {
                  console.log('error 1', error);
                  reject(
                    new Error(
                      `Fallo obtener cantidad de terceros editados: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (error: Error) => {
              console.log('error 2', error);
              reject(
                new Error(
                  `Fallo obtener cantidad de terceros creados: ${error.message}`,
                ),
              );
            },
          );
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT COUNT (*) FROM ${table}`,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(response.rows.raw()[0]['COUNT (*)']);
            },
            (error: Error) => {
              console.log('error 3', error);
              reject(
                new Error(`Fallo obtener cantidad de terceros de ${table}`),
              );
            },
          );
        });
      });
    }
  }
  async getByLikeAttribute(
    atributeName: string,
    attributeValue: any,
    table: 'terceros' | 'terceros_nuevos',
  ): Promise<ITerceros[]> {
    console.log('atribute search like', atributeName);
    console.log('value', attributeValue);
    console.log('table', table);
    if (attributeValue === '') {
      return this.getAllByTable(table);
    }

    if (table === 'terceros_nuevos') {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT * FROM terceros_creados WHERE ${atributeName} LIKE ?`,
            [`%${attributeValue}%`],
            (_: ResultSet, responseCreated: ResultSet) => {
              const createdTerceros = responseCreated.rows.raw();

              tx.executeSql(
                `SELECT * FROM terceros_editados WHERE ${atributeName} LIKE ?`,
                [`%${attributeValue}%`],
                (_: ResultSet, responseEdited: ResultSet) => {
                  const editedTerceros = responseEdited.rows.raw();
                  const combinedTerceros = [
                    ...createdTerceros,
                    ...editedTerceros,
                  ];
                  resolve(combinedTerceros);
                },
                (error: Error) => {
                  reject(
                    new Error(
                      `Fallo obtener terceros editados: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (error: Error) => {
              reject(
                new Error(`Fallo obtener terceros creados: ${error.message}`),
              );
            },
          );
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `SELECT * FROM ${table} WHERE ${atributeName} LIKE ?`,
            [`%${attributeValue}%`],
            (_: ResultSet, response: ResultSet) => {
              resolve(response.rows.raw());
            },
            (error: Error) => {
              reject(new Error(`Fallo obtener cantidad terceros de ${table}`));
            },
          );
        });
      });
    }
  }
  private saveCreatedTerceroToDB(tercero: ITerceros) {
    const sqlInsertCreatedTerceroStatement = `
    INSERT INTO terceros_creados (
        codigo,
        nombre,
        direcc,
        tel,
        vendedor,
        plazo,
        f_pago,
        ex_iva,
        clasificacion,
        tipo,
        departamento,
        ciudad,
        barrio,
        email,
        reteica,
        frecuencia,
        zona,
        ruta,
        latitude,
        longitude,
        rut_path,
        camaracomercio_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

    const valuesTercero = [
      tercero.codigo,
      tercero.nombre,
      tercero.direcc,
      tercero.tel,
      tercero.vendedor,
      tercero.plazo,
      tercero.f_pago,
      tercero.ex_iva,
      tercero.clasificacion,
      tercero.tipo,
      tercero.departamento,
      tercero.ciudad,
      tercero.barrio,
      tercero.email,
      tercero.reteica,
      tercero.frecuencia,
      tercero.zona,
      tercero.ruta,
      tercero.latitude,
      tercero.longitude,
      tercero.rut_path,
      tercero.camaracomercio_path,
    ];

    db.transaction((tx: any) => {
      tx.executeSql(
        sqlInsertCreatedTerceroStatement,
        valuesTercero,
        (_: ResultSet, result: ResultSet) => {
          console.log('Tercero creado guardado en la base de datos');
        },
        (error: ResultSet) => {
          console.log(
            'Error al guardar tercero creado en la base de datos',
            error,
          );
        },
      );
    });
  }

  private saveEditedTerceroToDB(tercero: ITerceros) {
    const sqlInsertEditedTerceroStatement = `
    INSERT INTO terceros_editados (
        codigo,
        nombre,
        direcc,
        tel,
        vendedor,
        plazo,
        f_pago,
        ex_iva,
        clasificacion,
        tipo,
        departamento,
        ciudad,
        barrio,
        email,
        reteica,
        frecuencia,
        zona,
        ruta,
        latitude,
        longitude,
        rut_path,
        camaracomercio_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

    const valuesTercero = [
      tercero.codigo,
      tercero.nombre,
      tercero.direcc,
      tercero.tel,
      tercero.vendedor,
      tercero.plazo,
      tercero.f_pago,
      tercero.ex_iva,
      tercero.clasificacion,
      tercero.tipo,
      tercero.departamento,
      tercero.ciudad,
      tercero.barrio,
      tercero.email,
      tercero.reteica,
      tercero.frecuencia,
      tercero.zona,
      tercero.ruta,
      tercero.latitude,
      tercero.longitude,
      tercero.rut_path,
      tercero.camaracomercio_path,
    ];

    db.transaction((tx: any) => {
      tx.executeSql(
        sqlInsertEditedTerceroStatement,
        valuesTercero,
        (_: ResultSet, result: ResultSet) => {
          console.log('Tercero editado guardado en la base de datos');
        },
        (error: ResultSet) => {
          console.log(
            'Error al guardar tercero editado en la base de datos',
            error,
          );
        },
      );
    });
  }
  async getCreatedTerceros(): Promise<ITerceros[]> {
    const sqlSelectStatement = `
      SELECT * FROM terceros_creados
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros creados'));
          },
        );
      });
    });
  }

  async getEditedTerceros(): Promise<ITerceros[]> {
    const sqlSelectStatement = `
      SELECT * FROM terceros_editados
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros editados'));
          },
        );
      });
    });
  }
}

export {TercerosRepository};
