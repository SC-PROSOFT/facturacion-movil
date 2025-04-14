import {ResultSet} from 'react-native-sqlite-storage';

import {
  IRepository,
  IVisita,
  IFrecuencia,
  IZona,
  IRuta,
} from '../../../common/types';

import {db} from '../local_database_config';

class ZonaRepository implements IRepository<IZona> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `CREATE TABLE IF NOT EXISTS zona (
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
            reject(new Error('Fallo crear tabla zona'));
          },
        );
      });
    });
  }
  fillTable(data: IZona[]): Promise<boolean> {
    const sqlInsertStatement = `INSERT INTO zona (tipo, zona, nombre) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        data.forEach((zona: IZona) => {
          tx.executeSql(
            sqlInsertStatement,
            [zona.tipo, zona.zona, zona.nombre],
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              console.log('error =>', error);
              reject(new Error('Fallo insertar zona'));
            },
          );
        });
      });
    });
  }

  get(): Promise<IZona[]> {
    const sqlSelectStatement = `SELECT * FROM zona`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            console.log('response.rows.raw() =>', response.rows.raw());
            resolve(response.rows.raw());
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener terceros'));
          },
        );
      });
    });
  }

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IZona[]> {
    const sqlSelectStatement = `SELECT * FROM zona WHERE LOWER(${attributeName}) LIKE LOWER(?)`;

    const searchValue = `%${attributeValue.trim()}%`; // Agregar comodines para búsqueda parcial

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [searchValue],
          (_: ResultSet, response: ResultSet) => {
            let zonas: IZona[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              zonas.push(response.rows.item(i));
            }
            resolve(zonas);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo obtener zonas'));
          },
        );
      });
    });
  }

  deleteTable(): Promise<boolean> {
    const sqlDeleteStatement = `DROP TABLE IF EXISTS zona`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo eliminar tabla zona'));
          },
        );
      });
    });
  }

  async deleteZonas(): Promise<boolean> {
    const sqlDeleteStatement = `DELETE FROM zona`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            reject(new Error('Fallo eliminar zonas'));
          },
        );
      });
    });
  }
}

export {ZonaRepository};
