import {ResultSet} from 'react-native-sqlite-storage';
import {IEncuesta, IRepository} from '../../../common/types';
import {db} from '../local_database_config';

class EncuestaRepository implements IRepository<IEncuesta> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
        CREATE TABLE IF NOT EXISTS encuesta (
            codigo INTEGER , 
            nro_preguntas TEXT,
            activar TEXT ,
            preguntas TEXT , 
            admin_creacion TEXT ,
            fecha_creacion TEXT , 
            admin_modificacion TEXT ,
            fecha_modificacion TEXT
        )
        `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            console.log('Tabla encuesta creada');
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al crear tabla encuesta:', error);
            reject(new Error('Fallo crear tabla encuesta'));
          },
        );
      });
    });
  }

  async fillTable(data: IEncuesta[]): Promise<boolean> {
    const encuesta = data[0];
    const sqlDeletePrevious = `DELETE FROM encuesta`; // Elimina la encuesta anterior
    const sqlInsertStatement = `
        INSERT INTO encuesta (
            codigo, 
            nro_preguntas, 
            activar, 
            preguntas, 
            admin_creacion, 
            fecha_creacion, 
            admin_modificacion, 
            fecha_modificacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        console.log('Iniciando transacción para eliminar encuesta anterior');
        tx.executeSql(
          sqlDeletePrevious,
          [],
          () => {
            console.log('Encuesta anterior eliminada');
            console.log('Insertando nueva encuesta:', encuesta);
            tx.executeSql(
              sqlInsertStatement,
              [
                encuesta.codigo,
                encuesta.nro_preguntas,
                encuesta.activar,
                JSON.stringify(encuesta.preguntas),
                encuesta.admin_creacion,
                encuesta.fecha_creacion,
                encuesta.admin_modificacion,
                encuesta.fecha_modificacion,
              ],
              (_: ResultSet, response: ResultSet) => {
                console.log('Encuesta insertada correctamente');
                resolve(true);
              },
              (error: ResultSet) => {
                console.error('Error al insertar encuesta:', error);
                reject(new Error('Fallo insertar encuesta'));
              },
            );
          },
          (error: ResultSet) => {
            console.error('Error al eliminar encuesta anterior:', error);
            reject(new Error('Fallo eliminar encuesta anterior'));
          },
        );
      });
    });
  }

  async get(): Promise<IEncuesta | null> {
    const sqlSelectStatement = `SELECT * FROM encuesta`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            console.log(response);
            if (response.rows.length > 0) {
              const encuesta = response.rows.item(0);
              console.log('Encuesta obtenida:', encuesta);
              console.log('Encuesta obtenida:', encuesta);
              resolve(encuesta);
            } else {
              console.log('No se encontraron encuestas');
              resolve(null);
            }
          },
          (error: ResultSet) => {
            console.error('Error al obtener encuesta:', error);
            reject(new Error('Fallo obtener encuesta'));
          },
        );
      });
    });
  }

  async update(id: string, encuesta: IEncuesta): Promise<boolean> {
    const sqlUpdateStatement = `
        UPDATE encuesta
        SET 
            codigo = ?, 
            nro_preguntas = ?, 
            activar = ?, 
            preguntas = ?, 
            admin_modificacion = ?, 
            fecha_modificacion = ?
            WHERE id = 1
        `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          [
            encuesta.codigo,
            encuesta.nro_preguntas,
            encuesta.activar,
            JSON.stringify(encuesta.preguntas),
            encuesta.admin_modificacion,
            encuesta.fecha_modificacion,
          ],
          (_: ResultSet, response: ResultSet) => {
            console.log('Encuesta actualizada correctamente');
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al actualizar encuesta:', error);
            reject(new Error('Fallo actualizar encuesta'));
          },
        );
      });
    });
  }
}

export {EncuestaRepository};
