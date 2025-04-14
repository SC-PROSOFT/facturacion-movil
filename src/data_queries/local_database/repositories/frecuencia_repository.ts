import {ResultSet} from 'react-native-sqlite-storage';

import {
  IRepository,
  IVisita,
  IFrecuencia,
  IZona,
  IRuta,
} from '../../../common/types';

import {db} from '../local_database_config';

class FrecuenciaRepository implements IRepository<IFrecuencia> {
  createTable(): Promise<boolean> {
    const sqlCreateStatement = `CREATE TABLE IF NOT EXISTS frecuencia (
            tipo TEXT,
            zona TEXT,
            nombre TEXT
        );`;

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

  fillTable(data: IFrecuencia[]): Promise<boolean> {
    const sqlInsertStatement = `INSERT INTO frecuencia (tipo, zona, nombre) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        data.forEach((frecuencia: IFrecuencia) => {
          tx.executeSql(
            sqlInsertStatement,
            [frecuencia.tipo, frecuencia.zona, frecuencia.nombre],
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo insertar frecuencia'));
            },
          );
        });
      });
    });
  }

  get(): Promise<IFrecuencia[]> {
    const sqlSelectStatement = `SELECT * FROM frecuencia`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            let frecuencias: IFrecuencia[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              frecuencias.push(response.rows.item(i));
            }
            resolve(frecuencias);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener frecuencias'));
          },
        );
      });
    });
  }
  getByAttribute(attribute: string, value: string): Promise<IFrecuencia[]> {
    const sqlQuery = `
      SELECT * FROM frecuencia
      WHERE LOWER(${attribute}) LIKE LOWER(?) 
    `;

    const searchValue = `%${value.trim()}%`; // Agregar comodines para búsqueda parcial

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlQuery,
          [searchValue],
          (_: ResultSet, {rows}: ResultSet) => {
            const results: IFrecuencia[] = [];
            for (let i = 0; i < rows.length; i++) {
              results.push(rows.item(i));
            }
            resolve(results);
          },
          (error: ResultSet) => {
            reject(new Error('Error al buscar frecuencias'));
          },
        );
      });
    });
  }

  deleteTable(): Promise<boolean> {
    const sqlDropStatement = `DROP TABLE IF EXISTS frecuencia`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDropStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo eliminar tabla frecuencia'));
          },
        );
      });
    });
  }
}

export {FrecuenciaRepository};
