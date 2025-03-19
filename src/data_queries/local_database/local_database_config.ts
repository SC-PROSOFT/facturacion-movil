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
  encuestaService,
  filesService,
} from './services';

const db: any = SQLite.openDatabase({name: 'localdb16'}); // 14

/* create tables */
const createTables = async (): Promise<boolean> => {
  try {
    console.log('Creando tablas 1...');
    await configService.createTableConfig();
    console.log('Creando tablas 2...');
    await operadoresService.createTableOperadores();
    console.log('Creando tablas 3...');
    await articulosService.createTableArticulos();
    console.log('Creando tablas 4...');
    await almacenesService.createTableAlmacenes();
    console.log('Creando tablas 5...');
    await carteraService.createTableCartera();
    console.log('Creando tablas 6...');
    await tercerosService.createTableTerceros();
    console.log('Creando tablas 6.1...');
    await tercerosService.createTableTercerosCreates();
    console.log('Creando tablas 6.2...');
    await tercerosService.createTableTercerosEdits();
    console.log('Creando tablas 7...');
    await rememberAccountService.createTableRememberAccount();
    console.log('Creando tablas 8...');
    await encuestaService.createTableEncuesta();
    console.log('Creando tablas 8.1...');
    await encuestaService.createTableRespEncuesta();
    console.log('Creando tablas 9...');
    await pedidosService.createTablePedidos();
    console.log('Creando tablas 10...');
    await facturasService.createTableFacturas();
    console.log('Creando tablas 11...');
    await filesService.createTableFiles();

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
