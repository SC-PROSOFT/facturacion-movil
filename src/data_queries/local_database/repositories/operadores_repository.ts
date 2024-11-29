import {ResultSet} from 'react-native-sqlite-storage';

import {IRepository, IOperadores} from '../../../common/types';

import {db} from '../local_database_config';

class OperadoresRepository implements IRepository<IOperadores> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS operadores (
      codigo TEXT,
      descripcion TEXT,
      clave TEXT,
      id TEXT,
      cod_vendedor TEXT,
      sucursal TEXT,
      nro_pedido TEXT,
      nro_factura TEXT,
      auto_dian TEXT,
      fecha_ini TEXT,
      fecha_fin TEXT,
      nro_ini TEXT,
      nro_fin TEXT,
      prefijo TEXT,
      vigencia TEXT
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
            reject(new Error('Fallo crear tabla operadores'));
          },
        );
      });
    });
  }

  async fillTable(operadores: IOperadores[]): Promise<boolean> {
    const innerDeleteOperadores = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `DELETE FROM operadores`,
            null,
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo borrar operadores'));
            },
          );
        });
      });
    };

    const innerInsertBlockOfOperadores = (operadores: IOperadores[]) => {
      const placeholders = operadores
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .join(', ');

      const sqlInsertStatement = `
        INSERT INTO operadores (
            codigo,
            descripcion,
            clave,
            id,
            cod_vendedor,
            sucursal,
            nro_pedido,
            nro_factura,
            auto_dian,
            fecha_ini,
            fecha_fin,
            nro_ini,
            nro_fin,
            prefijo,
            vigencia
        ) VALUES ${placeholders}
      `;

      const values = operadores.flatMap(operador => [
        operador.codigo,
        operador.descripcion,
        operador.clave,
        operador.id,
        operador.cod_vendedor,
        operador.sucursal,
        operador.nro_pedido,
        operador.nro_factura,
        operador.auto_dian,
        operador.fecha_ini,
        operador.fecha_fin,
        operador.nro_ini,
        operador.nro_fin,
        operador.prefijo,
        operador.vigencia,
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
              reject(new Error('Fallo guardar bloque operadores'));
            },
          );
        });
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        await innerDeleteOperadores();

        let operadoresTemp = [];
        let contador = 0;
        const bloques = 10;

        if (operadores.length > bloques) {
          let iteraciones = Math.floor(operadores.length / bloques);
          for (let i = 0; i < iteraciones; i++) {
            for (let j = 0; j < bloques; j++) {
              operadoresTemp.push(operadores[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfOperadores(operadoresTemp);
            operadoresTemp = [];
          }
          if (contador < operadores.length) {
            let resta = operadores.length - contador;
            for (let j = 1; j <= resta; j++) {
              operadoresTemp.push(operadores[contador]);
              contador = contador + 1;
            }
            await innerInsertBlockOfOperadores(operadoresTemp);
            resolve(true);
          } else {
            resolve(true);
          }
        } else {
          await innerInsertBlockOfOperadores(operadores);
          resolve(true);
        }
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  }

  async getAll(): Promise<IOperadores[]> {
    const sqlSelectStatement = `
        SELECT * FROM operadores
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
            reject(new Error('Fallo obtener operadores'));
          },
        );
      });
    });
  }

  async getQuantity(): Promise<string> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT COUNT (*) FROM operadores`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(response.rows.raw()[0]['COUNT (*)']);
          },
          (error: Error) => {
            reject(new Error('Fallo obtener cantidad operadores'));
          },
        );
      });
    });
  }

  async update(id: string, item: IOperadores): Promise<boolean> {
    const sqlUpdateStatement = `
      UPDATE operadores SET
      codigo='${item.codigo}',
      descripcion='${item.descripcion}',
      clave='${item.clave}',
      id='${item.id}',
      cod_vendedor='${item.cod_vendedor}',
      sucursal='${item.sucursal}',
      nro_pedido='${item.nro_pedido}',
      nro_factura='${item.nro_factura}',
      auto_dian='${item.auto_dian}',
      fecha_ini='${item.fecha_ini}',
      fecha_fin='${item.fecha_fin}',
      nro_ini='${item.nro_ini}',
      nro_fin='${item.nro_fin}',
      prefijo='${item.prefijo}',
      vigencia='${item.vigencia}'
      WHERE id = '${id}'
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            console.log('response', response);
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo actualizar operador'));
          },
        );
      });
    });
  }

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperadores> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM operadores WHERE ${attributeName} = ?`,
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
            reject(
              new Error(
                `Fallo al obtener el operador con el codigo ${attributeValue}`,
              ),
            );
          },
        );
      });
    });
  }
}

export {OperadoresRepository};
