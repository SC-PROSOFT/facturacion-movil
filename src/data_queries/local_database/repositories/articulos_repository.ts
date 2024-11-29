import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, IProduct} from '../../../common/types';

import {db} from '../local_database_config';

class ArticulosRepository implements IRepository<IProduct> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS articulos (
        codigo TEXT,
        descrip TEXT,
        ref TEXT,
        saldo TEXT,
        unidad TEXT,
        peso TEXT,
        iva TEXT,
        iva_usu TEXT,
        ipto_consumo TEXT,
        vlr_ipto_consumo TEXT,
        vlr1 TEXT,
        vlr2 TEXT,
        vlr3 TEXT,
        vlr4 TEXT,
        vlr5 TEXT,
        vlr6 TEXT,
        vlr7 TEXT,
        vlr8 TEXT,
        vlr9 TEXT,
        vlr10 TEXT,
        vlr11 TEXT,
        vlr12 TEXT,
        vlr13 TEXT,
        vlr14 TEXT,
        vlr15 TEXT
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
            reject(new Error('Fallo crear tabla articulos'));
          },
        );
      });
    });
  }

  async fillTable(articulos: IProduct[]): Promise<boolean> {
    const innerDeleteArticulos = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `DELETE FROM articulos`,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo borrar articulos'));
            },
          );
        });
      });
    };

    const innerInsertBlockOfArticulos = (articulos: IProduct[]) => {
      const placeholders = articulos
        .map(
          () =>
            '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .join(', ');

      const sqlInsertStatement = `
        INSERT INTO articulos (
          codigo,
          descrip,
          ref,
          saldo,
          unidad,
          peso,
          iva,
          iva_usu,
          ipto_consumo,
          vlr_ipto_consumo,
          vlr1,
          vlr2,
          vlr3,
          vlr4,
          vlr5,
          vlr6,
          vlr7,
          vlr8,
          vlr9,
          vlr10,
          vlr11,
          vlr12,
          vlr13,
          vlr14,
          vlr15
        ) VALUES ${placeholders}
      `;

      const values = articulos.flatMap(articulo => [
        articulo.codigo,
        articulo.descrip,
        articulo.ref,
        articulo.saldo,
        articulo.unidad,
        articulo.peso,
        articulo.iva,
        articulo.iva_usu,
        articulo.ipto_consumo,
        articulo.vlr_ipto_consumo,
        articulo.vlr1,
        articulo.vlr2,
        articulo.vlr3,
        articulo.vlr4,
        articulo.vlr5,
        articulo.vlr6,
        articulo.vlr7,
        articulo.vlr8,
        articulo.vlr9,
        articulo.vlr10,
        articulo.vlr11,
        articulo.vlr12,
        articulo.vlr13,
        articulo.vlr14,
        articulo.vlr15,
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
              reject(new Error('Fallo guardar bloque articulos'));
            },
          );
        });
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        await innerDeleteArticulos();

        let articulosTemp = [];
        let contador = 0;
        const bloques = 10;

        if (articulos.length > bloques) {
          let iteraciones = Math.floor(articulos.length / bloques);
          for (let i = 0; i < iteraciones; i++) {
            for (let j = 0; j < bloques; j++) {
              articulosTemp.push(articulos[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfArticulos(articulosTemp);
            articulosTemp = [];
          }
          if (contador < articulos.length) {
            let resta = articulos.length - contador;
            for (let j = 1; j <= resta; j++) {
              articulosTemp.push(articulos[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfArticulos(articulosTemp);
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          await innerInsertBlockOfArticulos(articulos);
          resolve(true);
        }
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  }

  async getAll(): Promise<IProduct[]> {
    const sqlSelectStatement = `
        SELECT * FROM articulos
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
            reject(new Error('Fallo obtener articulos'));
          },
        );
      });
    });
  }

  async getArticuloByCodigo(codigo: string): Promise<IProduct> {
    const sqlGetStatement = `
      SELECT * FROM articulos WHERE codigo = '${codigo}'
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlGetStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener articulo'));
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT COUNT (*) FROM articulos`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]['COUNT (*)']);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad articulos'));
          },
        );
      });
    });
  }

  async updateSaldo(id: string, nuevoSaldo: string): Promise<boolean> {
    const sqlUpdateStatement = `
    UPDATE articulos SET
      saldo='${nuevoSaldo}'
    WHERE codigo = '${id}'
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: any) => {
            reject(
              new Error(
                `[(articulos_repository) Error actualizar articulo]: ${error}`,
              ),
            );
          },
        );
      });
    });
  }
}

export {ArticulosRepository};
