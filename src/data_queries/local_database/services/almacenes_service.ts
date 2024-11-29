import {AlmacenesRepository} from '../repositories';

import {IAlmacen} from '../../../common/types';

const almacenesRepository = new AlmacenesRepository();

class AlmacenesService {
  private almacenesRepository: AlmacenesRepository;

  constructor() {
    this.almacenesRepository = almacenesRepository;
  }

  async createTableAlmacenes(): Promise<boolean> {
    return this.almacenesRepository.createTable();
  }

  async fillAlmacenes(almacenes: IAlmacen[]): Promise<boolean> {
    return this.almacenesRepository.fillTable(almacenes);
  }

  async getAllAlmacenes(): Promise<IAlmacen[]> {
    return this.almacenesRepository.getAll();
  }

  async getQuantityAlmacenes(): Promise<string> {
    return this.almacenesRepository.getQuantity();
  }
}

const almacenesService = new AlmacenesService();

export {almacenesService};
