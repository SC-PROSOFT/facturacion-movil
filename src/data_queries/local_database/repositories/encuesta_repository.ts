import {ResultSet} from 'react-native-sqlite-storage';
import {IEncuesta, IRepository} from '../../../common/types';
import {db} from '../local_database_config';

class EncuestaRepository implements IRepository<IEncuesta> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
        CREATE TABLE IF NOT EXISTS encuesta (
            codigo INTEGER NOT NULL UNIQUE, 
            numero_preguntas TEXT NOT NULL,
            activar TEXT CHECK (activar IN ('S', 'N')) NOT NULL,
            preguntas TEXT NOT NULL, 
            admin_creacion TEXT NOT NULL,
            fecha_creacion TEXT NOT NULL, 
            admin_modificacion TEXT NOT NULL,
            fecha_modificacion TEXT NOT NULL
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
            numero_preguntas, 
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
                encuesta.numero_preguntas,
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

  async update(id: string, encuesta: IEncuesta): Promise<boolean> {
    const sqlUpdateStatement = `
        UPDATE encuesta
        SET 
            codigo = ?, 
            numero_preguntas = ?, 
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
            encuesta.numero_preguntas,
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