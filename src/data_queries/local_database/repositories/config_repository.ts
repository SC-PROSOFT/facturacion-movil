import {ResultSetRowList, ResultSet} from 'react-native-sqlite-storage';

import {IConfig, IRepository} from '../../../common/types';

import {db} from '../local_database_config';

class ConfigRepository implements IRepository<IConfig> {
  async createTable(): Promise<boolean> {
    const sqlStatement = `
    CREATE TABLE IF NOT EXISTS config (
      facturarSinExistencias INTEGER,
      seleccionarAlmacen INTEGER,
      localizacionGps INTEGER,
      filtrarTercerosPorVendedor INTEGER,
      modificarPrecio INTEGER,
      direccionIp TEXT,
      puerto TEXT,
      descargasIp TEXT,
      datosIp TEXT,
      directorioContabilidad TEXT,
      empresa TEXT,
      nit TEXT,
      direccion TEXT,
      ciudad TEXT,
      tarifaIva1 TEXT,
      tarifaIva2 TEXT,
      tarifaIva3 TEXT
    )
  `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('Fallo crear tabla config'));
          },
        );
      });
    });
  }

  async create(config: IConfig): Promise<boolean> {
    const sqlSelectStatement = `SELECT * FROM config`;

    const sqlInsertStatement = `
    INSERT INTO config (
      facturarSinExistencias,
      seleccionarAlmacen,
      localizacionGps,
      filtrarTercerosPorVendedor,
      modificarPrecio,
      direccionIp,
      puerto,
      descargasIp,
      datosIp,
      directorioContabilidad,
      empresa,
      nit,
      direccion,
      ciudad,
      tarifaIva1,
      tarifaIva2,
      tarifaIva3
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const sqlUpdateStatement = `
    UPDATE config SET 
      facturarSinExistencias=?,
      seleccionarAlmacen=?,
      localizacionGps=?,
      filtrarTercerosPorVendedor=?,
      modificarPrecio=?,
      direccionIp=?,
      puerto=?,
      descargasIp=?,
      datosIp=?,
      directorioContabilidad=?,
      empresa=?,
      nit=?,
      direccion=?,
      ciudad=?,
      tarifaIva1=?,
      tarifaIva2=?,
      tarifaIva3=?
    `;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, result: ResultSet) => {
            if (result.rows.length > 0) {
              tx.executeSql(
                sqlUpdateStatement,
                [
                  config.facturarSinExistencias ? 1 : 0,
                  config.seleccionarAlmacen ? 1 : 0,
                  config.localizacionGps ? 1 : 0,
                  config.filtrarTercerosPorVendedor ? 1 : 0,
                  config.modificarPrecio ? 1 : 0,
                  config.direccionIp,
                  config.puerto,
                  config.descargasIp,
                  config.datosIp,
                  config.directorioContabilidad,
                  config.empresa,
                  config.nit,
                  config.direccion,
                  config.ciudad,
                  config.tarifaIva1,
                  config.tarifaIva2,
                  config.tarifaIva3,
                ],
                (_: ResultSet, result: ResultSet) => {
                  resolve(true);
                },
                (error: Error) => {
                  reject(new Error('Fallo guardar configuracion'));
                },
              );
            } else {
              tx.executeSql(
                sqlInsertStatement,
                [
                  config.facturarSinExistencias ? 1 : 0,
                  config.seleccionarAlmacen ? 1 : 0,
                  config.localizacionGps ? 1 : 0,
                  config.filtrarTercerosPorVendedor ? 1 : 0,
                  config.modificarPrecio ? 1 : 0,
                  config.direccionIp,
                  config.puerto,
                  config.descargasIp,
                  config.datosIp,
                  config.directorioContabilidad,
                  config.empresa,
                  config.nit,
                  config.direccion,
                  config.ciudad,
                  config.tarifaIva1,
                  config.tarifaIva2,
                  config.tarifaIva3,
                ],
                (_: ResultSet, result: ResultSet) => {
                  resolve(true);
                },
                (error: Error) => {
                  reject(new Error('Fallo guardar configuracion'));
                },
              );
            }
          },
          (error: Error) => {
            reject(new Error('Fallo guardar configuracion'));
          },
        );
      });
    });
  }

  async getAll(): Promise<IConfig> {
    const sqlSelectStatement = `SELECT * FROM config`;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sqlSelectStatement,
          null,
          (_: ResultSet, response: ResultSet) => {
            if (response.rows.raw().length == 0) {
              reject(new Error('no se ha guardado ninguna config'));
            } else {
              const config = response.rows.raw().map(config => {
                return {
                  ...config,
                  facturarSinExistencias:
                    config.facturarSinExistencias === 1 ? true : false,
                  seleccionarAlmacen:
                    config.seleccionarAlmacen === 1 ? true : false,
                  localizacionGps: config.localizacionGps === 1 ? true : false,
                  filtrarTercerosPorVendedor:
                    config.filtrarTercerosPorVendedor === 1 ? true : false,
                  modificarPrecio: config.modificarPrecio === 1 ? true : false,
                };
              });

              resolve(config[0]);
            }
          },
          (error: Error) => {
            reject(new Error('Fallo obtener configuracion'));
          },
        );
      });
    });
  }
}

export {ConfigRepository};
