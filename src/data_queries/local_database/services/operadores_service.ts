import {OperadoresRepository} from '../repositories';

import {IOperadores} from '../../../common/types';

const operadoresRepository = new OperadoresRepository();

class OperadoresService {
  private operadoresRepository: OperadoresRepository;

  constructor() {
    this.operadoresRepository = operadoresRepository;
  }

  async createTableOperadores(): Promise<boolean> {
    return this.operadoresRepository.createTable();
  }
  async fillOperadores(operadores: IOperadores[]): Promise<boolean> {
    return this.operadoresRepository.fillTable(operadores);
  }
  async getAllOperadores(): Promise<IOperadores[]> {
    return this.operadoresRepository.getAll();
  }
  async getQuantityOperadores(): Promise<string> {
    return this.operadoresRepository.getQuantity();
  }
  async updateOperador(id: string, operador: IOperadores): Promise<boolean> {
    return this.operadoresRepository.update(id, operador);
  }
  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperadores> {
    return this.operadoresRepository.getByAttribute(
      attributeName,
      attributeValue,
    );
  }
}

const operadoresService = new OperadoresService();

export {operadoresService};
