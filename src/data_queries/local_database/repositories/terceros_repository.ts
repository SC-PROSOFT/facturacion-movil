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

class TercerosRepository implements IRepository<ITerceros> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS terceros (
        codigo TEXT,
        nombre TEXT,
        direcc TEXT,
        tel TEXT,
        vendedor TEXT,
        plazo INTEGER,
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
        camaracomercio_path TEXT,
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
            const dispatch = useAppDispatch();
            const response =  dispatch(addTerceroCreado(tercero));
            console.log('response =>>>>', response);
            console.log('response =>>>>', response);
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
            const dispatch = useAppDispatch();
            const response = dispatch(addTerceroEditado(tercero));
            console.log('response =>', response);
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
              resolve(true);
            },
            (error: ResultSet) => {
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

  async getPaginated(page: number, pageSize: number): Promise<ITerceros[]> {
    const offset = (page - 1) * pageSize;
    const sqlSelectStatement = `
      SELECT * FROM terceros
      LIMIT ? OFFSET ?
    `;
    console.log('sqlSelectStatement =>>>>', sqlSelectStatement);
    console.log('pageSize =>>>>', pageSize);
    console.log('offset =>>>>', offset);
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [pageSize, offset],
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros paginados'));
          },
        );
      });
    });
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

  async getByLikeAttribute(
    atributeName: string,
    attributeValue: any,
  ): Promise<ITerceros[]> {
    if (attributeValue === '') {
      return this.getAll();
    }
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM terceros WHERE ${atributeName} LIKE ?`,
          [`%${attributeValue}%`],
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw());
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad terceros'));
          },
        );
      });
    });
  }
}

export {TercerosRepository};
