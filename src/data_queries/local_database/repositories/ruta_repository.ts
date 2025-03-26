import {ResultSet} from 'react-native-sqlite-storage';

import {
  IRepository,
  IVisita,
  IFrecuencia,
  IZona,
  IRuta,
} from '../../../common/types';

import {db} from '../local_database_config';

class RutaRepository implements IRepository<IRuta> {
  createTable(): Promise<boolean> {
    const sqlCreateStatement = `CREATE TABLE IF NOT EXISTS ruta (
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
            reject(new Error('Fallo crear tabla ruta'));
          },
        );
      });
    });
  }
  fillTable(data: IRuta[]): Promise<boolean> {
    const sqlInsertStatement = `INSERT INTO ruta (tipo, zona, nombre) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        data.forEach((ruta: IRuta) => {
          tx.executeSql(
            sqlInsertStatement,
            [ruta.tipo, ruta.zona, ruta.nombre],
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              reject(new Error('Fallo insertar ruta'));
            },
          );
        });
      });
    });
  }

  get(): Promise<IRuta[]> {
    const sqlSelectStatement = `SELECT * FROM ruta`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            const rutas: IRuta[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              rutas.push(response.rows.item(i));
            }
            resolve(rutas);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener rutas'));
          },
        );
      });
    });
  }

  deleteTable(): Promise<boolean> {
    const sqlDeleteStatement = `DROP TABLE IF EXISTS ruta`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo borrar tabla ruta'));
          },
        );
      });
    });
  }
}

export {RutaRepository};
