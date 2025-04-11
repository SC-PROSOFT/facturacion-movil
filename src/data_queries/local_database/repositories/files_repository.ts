import {ResultSet} from 'react-native-sqlite-storage';
import {IFiles, IRepository, ITerceros} from '../../../common/types';
import {db} from '../local_database_config';
import {DocumentPickerResponse} from 'react-native-document-picker';

class FilesRepository implements IRepository<IFiles> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `CREATE TABLE IF NOT EXISTS files (
        codigo TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        files TEXT,
        sincronizado TEXT DEFAULT 'N'
      );`;
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlCreateStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            console.log('Tabla files creada');
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al crear tabla files:', error);
            reject(new Error('Fallo crear tabla files'));
          },
        );
      });
    });
  }

  async create(item: IFiles): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT INTO files (codigo, nombre, tipo, files) VALUES (?, ?, ?, ?);`,
          [item.codigo, item.nombre, item.tipo, JSON.stringify(item.files)],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al agregar archivo:', error);
            reject(new Error('Fallo agregar archivo'));
          },
        );
      });
    });
  }

  async get(): Promise<IFiles[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM files;`,
          [],
          (_: ResultSet, response: ResultSet) => {
            const files: IFiles[] = [];
            for (let i = 0; i < response.rows.length; i++) {
              const file: IFiles = response.rows.item(i);
              files.push(file);
            }
            resolve(files);
          },
          (error: ResultSet) => {
            console.error('Error al obtener archivos:', error);
            reject(new Error('Fallo obtener archivos'));
          },
        );
      });
    });
  }

  async add(file: IFiles): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT INTO files (codigo, nombre, tipo, files, sincronizado) VALUES (?, ?, ?, ?, ?);`,
          [file.codigo, file.nombre, file.tipo, JSON.stringify(file.files)],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al agregar archivo:', error);
            reject(new Error('Fallo agregar archivo'));
          },
        );
      });
    });
  }
  async update(id: string, item: IFiles): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE files SET nombre = ?, tipo = ?, files = ?, sincronizado ? WHERE codigo = ?;`,
          [item.nombre, item.tipo, JSON.stringify(item.files), id],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al actualizar archivo:', error);
            reject(new Error('Fallo actualizar archivo'));
          },
        );
      });
    });
  }
  async updateFiles(
    codigo: string,
    updatedFiles: DocumentPickerResponse[],
  ): Promise<boolean> {
    console.log('codigo:', codigo);
    console.log('updatedFiles:', updatedFiles);

    try {
      const existingFiles: IFiles = await this.getById(codigo);

      if (!existingFiles) {
        throw new Error('Archivo no encontrado');
      }

      // Parsear los archivos existentes
      let filesArray: DocumentPickerResponse[] = [];
      if (typeof existingFiles.files === 'string') {
        try {
          filesArray = JSON.parse(existingFiles.files);
        } catch (error) {
          console.error('Error al parsear archivos existentes:', error);
          throw new Error('Archivos existentes corruptos');
        }
      }

      // Crear un objeto utilizando el nombre del archivo como clave
      const filesMap: {[key: string]: DocumentPickerResponse} = {};
      filesArray.forEach(file => {
        if (file.name) {
          filesMap[file.name] = file; // Solo agregar si file.name es válido
        }
      });

      // Reemplazar o agregar archivos nuevos
      updatedFiles.forEach(updatedFile => {
        if (updatedFile.name) {
          filesMap[updatedFile.name] = updatedFile; // Solo agregar si updatedFile.name es válido
        }
      });

      // Convertir el objeto de vuelta a un array
      const updatedFilesArray = Object.values(filesMap);

      // Convertir a JSON una vez
      const updatedFilesJson = JSON.stringify(updatedFilesArray);

      // Actualizar la base de datos con los archivos combinados
      return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `UPDATE files SET files = ?, sincronizado = 'N' WHERE codigo = ?;`,
            [updatedFilesJson, codigo],
            (_: ResultSet, response: ResultSet) => {
              resolve(true);
            },
            (error: ResultSet) => {
              console.error('Error al actualizar archivo:', error);
              reject(new Error('Fallo actualizar archivo'));
            },
          );
        });
      });
    } catch (error) {
      console.error('Error en updateFiles:', error);
      throw error;
    }
  }

  async getByCodigo(codigo: string): Promise<ResultSet> {
    return await db.executeSql(`SELECT * FROM files WHERE codigo = ?;`, [
      codigo,
    ]);
  }

  async getById(id: string): Promise<IFiles> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM files WHERE codigo = ?;`,
          [id],
          (_: ResultSet, response: ResultSet) => {
            console.log('response:', response);
            if (response.rows.length > 0) {
              resolve(response.rows.item(0));
            } else {
              reject(new Error('Archivo no encontrado'));
            }
          },
          (error: ResultSet) => {
            console.error('Error al obtener archivo:', error);
            reject(new Error('Fallo obtener archivo'));
          },
        );
      });
    });
  }

  async deleteById(codigo: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `DELETE FROM files WHERE codigo = ?;`,
          [codigo],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al eliminar archivo:', error);
            reject(new Error('Fallo eliminar archivo'));
          },
        );
      });
    });
  }
  deleteTable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `DROP TABLE IF EXISTS files;`,
          [],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al eliminar tabla files:', error);
            reject(new Error('Fallo eliminar tabla files'));
          },
        );
      });
    });
  }

  async updateSincronizado(codigo: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE files SET sincronizado = 'S' WHERE codigo = ?;`,
          [codigo],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: ResultSet) => {
            console.error('Error al actualizar sincronizado:', error);
            reject(new Error('Fallo actualizar sincronizado'));
          },
        );
      });
    });
  }
}

export {FilesRepository};
