import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, ITerceros} from '../../../common/types';

import {db} from '../local_database_config';

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
        clasificacion TEXT
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
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)')
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
          clasificacion
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
}

export {TercerosRepository};
