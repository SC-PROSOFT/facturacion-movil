import {ResultSet} from 'react-native-sqlite-storage';
import {IVisita, IRepository} from '../../../common/types';
import {db} from '../local_database_config';

class VisitasRepository implements IRepository<IVisita> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
      CREATE TABLE IF NOT EXISTS visitas (
        id TEXT ,
        client TEXT,
        adress TEXT,
        status TEXT,
        observation TEXT,
        saleValue INTEGER,
        appointmentDate TEXT,
        latitude TEXT,
        longitude TEXT,
        zona TEXT,
        frecuencia TEXT,
        ruta TEXT,
        frecuencia_2 TEXT,
        frecuencia_3 TEXT
      );
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        console.log('Insertando tabla visitas');
        tx.executeSql(
          sqlCreateStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            console.log('Tabla visitas creada', response);
            resolve(true);
          },
          (error: any) => {
            console.error('Error creando tabla visitas:', error);
            reject(new Error('Fallo crear tabla visitas'));
          },
        );
      });
    });
  }

  async fillTable(data: IVisita[]): Promise<boolean> {
    const sqlInsertStatement = `
      INSERT INTO visitas (
        id, client, adress, status, observation, saleValue, appointmentDate, 
        latitude, longitude, zona, frecuencia, ruta, frecuencia_2, frecuencia_3
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        let insertedCount = 0;
        if (data.length === 0) {
          resolve(false);
        }
        data.forEach((visita: IVisita) => {
          tx.executeSql(
            sqlInsertStatement,
            [
              visita.id_tercero,
              visita.client,
              visita.adress,
              visita.status,
              visita.observation,
              visita.saleValue,
              visita.appointmentDate,
              visita.location.latitude,
              visita.location.longitude,
              visita.zona,
              visita.frecuencia,
              visita.ruta,
              visita.frecuencia_2 || '',
              visita.frecuencia_3 || '',
            ],
            (_: ResultSet, response: ResultSet) => {
              insertedCount++;
              if (insertedCount === data.length) {
                resolve(true);
              }
            },
            (error: any) => {
              console.error('Error al insertar visita:', error);
              reject(new Error('Fallo insertar visita'));
            },
          );
        });
      });
    });
  }

  async get(): Promise<IVisita[]> {
    const sqlSelectStatement = `SELECT * FROM visitas;`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            const visitas: IVisita[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const item = response.rows.item(i);
              visitas.push({
                id_tercero: item.id,
                client: item.client,
                adress: item.adress,
                status: item.status,
                observation: item.observation,
                saleValue: item.saleValue,
                appointmentDate: item.appointmentDate,
                location: {
                  latitude: item.latitude,
                  longitude: item.longitude,
                },
                zona: item.zona,
                frecuencia: item.frecuencia,
                ruta: item.ruta,
                frecuencia_2: item.frecuencia_2,
                frecuencia_3: item.frecuencia_3,
              });
            }
            resolve(visitas);
          },
          (error: any) => {
            console.error('Error al obtener visitas:', error);
            reject(new Error('Fallo obtener visitas'));
          },
        );
      });
    });
  }

  async update(id: string, data: IVisita): Promise<boolean> {
    const sqlUpdateStatement = `
      UPDATE visitas 
      SET client = ?, adress = ?, status = ?, observation = ?, saleValue = ?, appointmentDate = ?,
          latitude = ?, longitude = ?, zona = ?, frecuencia = ?, ruta = ?, frecuencia_2 = ?, frecuencia_3 = ?
      WHERE id = ?;
    `;
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          [
            data.client,
            data.adress,
            data.status,
            data.observation,
            data.saleValue,
            data.appointmentDate,
            data.location.latitude,
            data.location.longitude,
            data.zona,
            data.frecuencia,
            data.ruta,
            data.frecuencia_2 || '',
            data.frecuencia_3 || '',
            id,
          ],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: any) => {
            console.error('Error al actualizar visita:', error);
            reject(new Error('Fallo actualizar visita'));
          },
        );
      });
    });
  }

  async deleteTable(): Promise<boolean> {
    const sqlDeleteStatement = `DROP TABLE IF EXISTS visitas;`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: any) => {
            console.error('Error al borrar tabla visitas:', error);
            reject(new Error('Fallo borrar tabla visitas'));
          },
        );
      });
    });
  }
}

export {VisitasRepository};
