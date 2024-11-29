import {TercerosRepository} from '../repositories';

import {ITerceros} from '../../../common/types';

const tercerosRepository = new TercerosRepository();

class TercerosService {
  private tercerosRepository: TercerosRepository;

  constructor() {
    this.tercerosRepository = tercerosRepository;
  }

  async createTableTerceros(): Promise<boolean> {
    return this.tercerosRepository.createTable();
  }

  async fillTerceros(terceros: ITerceros[]): Promise<boolean> {
    return this.tercerosRepository.fillTable(terceros);
  }

  async getAllTerceros(): Promise<ITerceros[]> {
    return this.tercerosRepository.getAll();
  }

  async getQuantityTerceros(): Promise<string> {
    return this.tercerosRepository.getQuantity();
  }

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<ITerceros> {
    return this.tercerosRepository.getByAttribute(
      attributeName,
      attributeValue,
    );
  }
}

const tercerosService = new TercerosService();

export {tercerosService};
