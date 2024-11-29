import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, ICartera} from '../../../common/types';

import {db} from '../local_database_config';

class CarteraRepository implements IRepository<ICartera> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS cartera (
        nit TEXT,
        sucursal TEXT,
        nro TEXT,
        vlr TEXT,
        fecha TEXT
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
            reject(new Error('Fallo crear tabla cartera'));
          },
        );
      });
    });
  }

  async fillTable(cartera: ICartera[]): Promise<boolean> {
    const innerDeleteCartera = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `DELETE FROM cartera`,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo borrar cartera'));
            },
          );
        });
      });
    };

    const innerInsertBlockOfCartera = (cartera: ICartera[]) => {
      const placeholders = cartera.map(() => '(?, ?, ?, ?, ?)').join(', ');

      const sqlInsertStatement = `
          INSERT INTO cartera (
            nit,
            sucursal,
            nro,
            vlr,
            fecha
          ) VALUES ${placeholders}
        `;

      const values = cartera.flatMap(itemCartera => [
        itemCartera.nit,
        itemCartera.sucursal,
        itemCartera.nro,
        itemCartera.vlr,
        itemCartera.fecha,
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
              reject(new Error('Fallo guardar bloque cartera'));
            },
          );
        });
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        await innerDeleteCartera();

        let carteraTemp = [];
        let contador = 0;
        const bloques = 10;

        if (cartera.length > bloques) {
          let iteraciones = Math.floor(cartera.length / bloques);
          for (let i = 0; i < iteraciones; i++) {
            for (let j = 0; j < bloques; j++) {
              carteraTemp.push(cartera[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfCartera(carteraTemp);
            carteraTemp = [];
          }
          if (contador < cartera.length) {
            let resta = cartera.length - contador;
            for (let j = 1; j <= resta; j++) {
              carteraTemp.push(cartera[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfCartera(carteraTemp);
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          await innerInsertBlockOfCartera(cartera);
          resolve(true);
        }
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  }

  async getAll(): Promise<ICartera[]> {
    const sqlSelectStatement = `
        SELECT * FROM cartera
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
            reject(new Error('Fallo obtener cartera'));
          },
        );
      });
    });
  }

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<ICartera[]> {
    const sqlSelectStatement = `
    SELECT * FROM cartera WHERE ${attributeName}= '${attributeValue}'
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            if (response.rows.raw().length == 0) {
              reject('no hay cartera pendiente');
            } else {
              resolve(response.rows.raw());
            }
          },
          (error: Error) => {
            reject(new Error(`Fallo obtener cartera por ${attributeName}`));
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT COUNT (*) FROM cartera`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]['COUNT (*)']);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad cartera'));
          },
        );
      });
    });
  }
}

export {CarteraRepository};
