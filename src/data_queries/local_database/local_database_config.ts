import SQLite from 'react-native-sqlite-storage';

/* local database services */
import {
  operadoresService,
  articulosService,
  almacenesService,
  carteraService,
  tercerosService,
  rememberAccountService,
  configService,
  pedidosService,
  facturasService,
} from './services';

const db: any = SQLite.openDatabase({name: 'localdb16'}); // 14

/* create tables */
const createTables = async (): Promise<boolean> => {
  try {
    await operadoresService.createTableOperadores();
    await articulosService.createTableArticulos();
    await almacenesService.createTableAlmacenes();
    await carteraService.createTableCartera();
    await tercerosService.createTableTerceros();
    await rememberAccountService.createTableRememberAccount();
    await configService.createTableConfig();
    await pedidosService.createTablePedidos();
    await facturasService.createTableFacturas();

    return true;
  } catch (error: any) {
    if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error(
        `Error desconocido, contacta al equipo de desarrollo [localdb]: ${error.message} `,
      );
    }
  }
};

export {db, createTables};
