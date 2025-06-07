import {ResultSet} from 'react-native-sqlite-storage';
import {IEncuesta, IRepository, IRespEncuesta} from '../../../common/types';
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
    // Validar que la entrada no esté vacía
    if (!data || data.length === 0) {
      return true;
    }

    const encuesta = data[0];

    // Validar que las propiedades de encuesta sean válidas
    if (
      !encuesta.codigo ||
      !encuesta.nro_preguntas ||
      !encuesta.activar ||
      !encuesta.preguntas ||
      !encuesta.admin_creacion ||
      !encuesta.fecha_creacion ||
      !encuesta.admin_modificacion ||
      !encuesta.fecha_modificacion
    ) {
      console.error(
        'Error: Propiedades de encuesta no válidas o incompletas.',
        encuesta,
      );
      throw new Error('Propiedades de encuesta no válidas.');
    }

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
      try {
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
      } catch (error) {
        console.error('Error inesperado durante la transacción:', error);
        reject(new Error('Error inesperado durante la transacción.'));
      }
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
              resolve(encuesta);
            } else {
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
  async createTableRespuesta(): Promise<boolean> {
    const sqlCreateStatement = `
        CREATE TABLE IF NOT EXISTS respuesta (
            codigo TEXT , 
            codigo_tercero TEXT,
            codigo_vende TEXT ,
            respuesta TEXT , 
            admin_creacion TEXT ,
            fecha_creacion TEXT , 
            admin_modificacion TEXT ,
            fecha_modificacion TEXT,
            guardado TEXT
        )
        `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            console.log('Tabla respuesta creada');
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al crear tabla respuesta:', error);
            reject(new Error('Fallo crear tabla respuesta'));
          },
        );
      });
    });
  }

  async createRespuesta(data: IRespEncuesta): Promise<boolean> {
    const respuesta = data;
    const sqlInsertStatement = `
        INSERT INTO respuesta (
            codigo, 
            codigo_tercero, 
            codigo_vende, 
            respuesta, 
            admin_creacion, 
            fecha_creacion, 
            admin_modificacion, 
            fecha_modificacion,
            guardado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        console.log('Insertando nueva respuesta:', respuesta);
        tx.executeSql(
          sqlInsertStatement,
          [
            respuesta.codigo,
            respuesta.codigo_tercero,
            respuesta.codigo_vende,
            JSON.stringify(respuesta.respuesta),
            respuesta.admin_creacion,
            respuesta.fecha_creacion,
            respuesta.admin_modificacion,
            respuesta.fecha_modificacion,
            respuesta.guardado,
          ],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al insertar respuesta:', error);
            reject(new Error('Fallo insertar respuesta'));
          },
        );
      });
    });
  }

  async deleteTableResp(): Promise<boolean> {
    const sqlDeleteStatement = `DROP TABLE IF EXISTS respuesta`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlDeleteStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            console.log('Tabla respuesta eliminada');
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al eliminar tabla respuesta:', error);
            reject(new Error('Fallo eliminar tabla respuesta'));
          },
        );
      });
    });
  }

  async getAllResp(): Promise<IRespEncuesta[]> {
    const sqlSelectStatement = `SELECT * FROM respuesta`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [],
          (_: ResultSet, response: ResultSet) => {
            const respuestas: IRespEncuesta[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const respuesta = response.rows.item(i);
              respuestas.push(respuesta);
            }
            resolve(respuestas);
          },
          (error: ResultSet) => {
            console.error('Error al obtener respuestas:', error);
            reject(new Error('Fallo obtener respuestas'));
          },
        );
      });
    });
  }

  async getRespEncuestaByGuardado(guardado: string): Promise<IRespEncuesta[]> {
    const sqlSelectStatement = `SELECT * FROM respuesta WHERE guardado = ?`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [guardado],
          (_: ResultSet, response: ResultSet) => {
            const respuestas: IRespEncuesta[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const respuesta = response.rows.item(i);
              respuestas.push(respuesta);
            }
            resolve(respuestas);
          },
          (error: ResultSet) => {
            console.error('Error al obtener respuestas:', error);
            reject(new Error('Fallo obtener respuestas'));
          },
        );
      });
    });
  }

  async getByTerceroAndGuardado(
    codigoTercero: string,
    guardado: string,
  ): Promise<IRespEncuesta[]> {
    const sqlSelectStatement = `SELECT * FROM respuesta WHERE codigo_tercero = ? AND guardado = ?`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [codigoTercero, guardado],
          (_: ResultSet, response: ResultSet) => {
            const respuestas: IRespEncuesta[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const respuesta = response.rows.item(i);
              respuestas.push(respuesta);
            }
            resolve(respuestas);
          },
          (error: ResultSet) => {
            console.error('Error al obtener respuestas:', error);
            reject(new Error('Fallo obtener respuestas'));
          },
        );
      });
    });
  }

  async getRespEncuestaByTercero(
    codigoTercero: string,
  ): Promise<IRespEncuesta[]> {
    const sqlSelectStatement = `SELECT * FROM respuesta WHERE codigo_tercero = ?`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          [codigoTercero],
          (_: ResultSet, response: ResultSet) => {
            const respuestas: IRespEncuesta[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const respuesta = response.rows.item(i);
              respuestas.push(respuesta);
            }
            resolve(respuestas);
          },
          (error: ResultSet) => {
            console.error('Error al obtener respuestas:', error);
            reject(new Error('Fallo obtener respuestas'));
          },
        );
      });
    });
  }

  async updateRespEncuestaGuardado(
    codigo: string,
    guardado: string,
  ): Promise<boolean> {
    const sqlUpdateStatement = `UPDATE respuesta SET guardado = ? WHERE codigo = ?`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlUpdateStatement,
          [guardado, codigo],
          (_: ResultSet, response: ResultSet) => {
            console.log(
              `Encuesta con código ${codigo} actualizada a guardado = ${guardado}`,
            );
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al actualizar guardado:', error);
            reject(new Error('Fallo actualizar guardado'));
          },
        );
      });
    });
  }
}

export {EncuestaRepository};
