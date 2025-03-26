import {TercerosRepository} from '../repositories';

import {ITerceros} from '../../../common/types';
import {useAppDispatch} from '../../../redux/hooks';

const tercerosRepository = new TercerosRepository();

class TercerosService {
  private tercerosRepository: TercerosRepository;

  constructor() {
    this.tercerosRepository = tercerosRepository;
  }

  async createTableTerceros(): Promise<boolean> {
    return this.tercerosRepository.createTable();
  }

  async createTableTercerosCreates(): Promise<boolean> {
    return this.tercerosRepository.createTableCreates();
  }

  async createTableTercerosEdits(): Promise<boolean> {
    return this.tercerosRepository.createTableEdits();
  }

  async createTercero(tercero: ITerceros): Promise<boolean> {
    return this.tercerosRepository.create(tercero);
  }

  async updateTercero(tercero: ITerceros): Promise<boolean> {
    return this.tercerosRepository.update(tercero.codigo, tercero);
  }

  async getModifiedTerceros(): Promise<ITerceros[]> {
    return this.tercerosRepository.getModified();
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

  async getPaginatedByTable(
    tableSearch: 'terceros' | 'terceros_nuevos',
    page: number,
    pageSize: number,
  ): Promise<ITerceros[]> {
    return this.tercerosRepository.getPaginatedByTable(
      tableSearch,
      page,
      pageSize,
    );
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

  async getByLikeAttribute(
    attributeName: string,
    attributeValue: any,
    tableSearch: 'terceros' | 'terceros_nuevos',
  ): Promise<ITerceros[]> {
    return this.tercerosRepository.getByLikeAttribute(
      attributeName,
      attributeValue,
      tableSearch,
    );
  }

  async getAllByTable(
    tableSearch: 'terceros' | 'terceros_nuevos',
  ): Promise<ITerceros[]> {
    return this.tercerosRepository.getAllByTable(tableSearch);
  }

  async getQuantityByTable(
    tableSearch: 'terceros' | 'terceros_nuevos',
  ): Promise<string> {
    return this.tercerosRepository.getQuantityByTable(tableSearch);
  }

  async getCreated(): Promise<ITerceros[]> {
    return this.tercerosRepository.getCreatedTerceros();
  }

  async getModified(): Promise<ITerceros[]> {
    return this.tercerosRepository.getEditedTerceros();
  }

  async deleteTerceroFromCreated(codigo: string): Promise<boolean> {
    return this.tercerosRepository.deleteFromTable('terceros_nuevos', codigo);
  }

  async deleteTerceroFromEdited(codigo: string): Promise<boolean> {
    return this.tercerosRepository.deleteFromTable('terceros_editados', codigo);
  }

  async dropAllTables(): Promise<boolean> {
    return this.tercerosRepository.dropAllTables();
  }

  async dropTableCreates(): Promise<boolean> {
    return this.tercerosRepository.dropAllTablesCreates();
  }

  async dropTableEdits(): Promise<boolean> {
    return this.tercerosRepository.dropAllTablesEdits();
  }
}

const tercerosService = new TercerosService();

export {tercerosService};
