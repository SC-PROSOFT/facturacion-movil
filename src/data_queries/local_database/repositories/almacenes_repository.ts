import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, IAlmacen} from '../../../common/types';

import {db} from '../local_database_config';

class AlmacenesRepository implements IRepository<IAlmacen> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS almacenes (
        codigo TEXT,
        nombre TEXT
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
            reject(new Error('Fallo crear tabla almacenes'));
          },
        );
      });
    });
  }

  async fillTable(almacenes: IAlmacen[]): Promise<boolean> {
    const innerDeleteAlmacenes = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `DELETE FROM almacenes`,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo borrar almacenes'));
            },
          );
        });
      });
    };

    const innerInsertBlockOfAlmacenes = (almacenes: IAlmacen[]) => {
      const placeholders = almacenes.map(() => '(?, ?)').join(', ');

      const sqlInsertStatement = `
          INSERT INTO almacenes (
            codigo,
            nombre
          ) VALUES ${placeholders}
        `;

      const values = almacenes.flatMap(almacen => [
        almacen.codigo,
        almacen.nombre,
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
              reject(new Error('Fallo guardar bloque almacenes'));
            },
          );
        });
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        await innerDeleteAlmacenes();

        let almacenesTemp = [];
        let contador = 0;
        const bloques = 10;

        if (almacenes.length > bloques) {
          let iteraciones = Math.floor(almacenes.length / bloques);
          for (let i = 0; i < iteraciones; i++) {
            for (let j = 0; j < bloques; j++) {
              almacenesTemp.push(almacenes[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfAlmacenes(almacenesTemp);
            almacenesTemp = [];
          }
          if (contador < almacenes.length) {
            let resta = almacenes.length - contador;
            for (let j = 1; j <= resta; j++) {
              almacenesTemp.push(almacenes[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfAlmacenes(almacenesTemp);
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          await innerInsertBlockOfAlmacenes(almacenes);
          resolve(true);
        }
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  }

  async getAll(): Promise<IAlmacen[]> {
    const sqlSelectStatement = `
        SELECT * FROM almacenes
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
            reject(new Error('Fallo obtener almacenes'));
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT COUNT (*) FROM almacenes`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]['COUNT (*)']);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad almacenes'));
          },
        );
      });
    });
  }
}

export {AlmacenesRepository};
