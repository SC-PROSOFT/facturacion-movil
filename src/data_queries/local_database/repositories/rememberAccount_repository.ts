import {ResultSet, ResultSetRowList} from 'react-native-sqlite-storage';

import {IRepository} from '../../../common/types';

import {IRememberAccount} from '../types';

import {db} from '../local_database_config';

class RememberAccountRepository implements IRepository<IRememberAccount> {
  async createTable(): Promise<boolean> {
    const sqlCreateStatement = `
    CREATE TABLE IF NOT EXISTS rememberAccount (
        user TEXT,
        password TEXT
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
          (error: Error) => {
            reject(new Error('Fallo crear tabla rememberAccount'));
          },
        );
      });
    });
  }

  async create(rememberAccount: IRememberAccount): Promise<boolean> {
    const {user, password} = rememberAccount;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT INTO rememberAccount (user, password) VALUES (?, ?)`,
          [user, password],
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('fallo insertar rememberAccount'));
          },
        );
      });
    });
  }

  async update(
    oldUser: string,
    rememberAccount: IRememberAccount,
  ): Promise<boolean> {
    const {user, password} = rememberAccount;

    return new Promise((resolve, reject) => {
      db.transaction(async (tx: any) => {
        tx.executeSql(
          `UPDATE rememberAccount SET
          user='${user}',
          password='${password}'
          WHERE user = '${oldUser}'`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('fallo actualizar rememberAccount'));
          },
        );
      });
    });
  }

  async deleteTable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `DELETE FROM rememberAccount`,
          null,
          (_: ResultSet, response: ResultSet) => {
            resolve(true);
          },
          (error: Error) => {
            reject(new Error('Fallo eliminar rememberAccount'));
          },
        );
      });
    });
  }

  async getAll(): Promise<IRememberAccount> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM rememberAccount`,
          null,
          (_: any, response: any) => {
            const rememberAccountData: ResultSetRowList = response.rows;
            const rememberAccount: IRememberAccount =
              rememberAccountData.raw()[0];

            resolve(rememberAccount);
          },
          (error: Error) => {
            reject(new Error('Error obtener rememberAccount'));
          },
        );
      });
    });
  }
}

export {RememberAccountRepository};
