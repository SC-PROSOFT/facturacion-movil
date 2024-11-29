import {ArticulosRepository} from '../repositories';

import {IProduct} from '../../../common/types';

const articulosRepository = new ArticulosRepository();

class ArticulosService {
  private articulosRepository: ArticulosRepository;

  constructor() {
    this.articulosRepository = articulosRepository;
  }

  async createTableArticulos(): Promise<boolean> {
    return this.articulosRepository.createTable();
  }
  async fillArticulos(products: IProduct[]): Promise<boolean> {
    return this.articulosRepository.fillTable(products);
  }
  async getAllArticulos(): Promise<IProduct[]> {
    return this.articulosRepository.getAll();
  }
  async getArticuloByCodigo(codigo: string): Promise<IProduct> {
    return this.articulosRepository.getArticuloByCodigo(codigo);
  }
  async getQuantityArticulos(): Promise<string> {
    return this.articulosRepository.getQuantity();
  }
  async updateSaldoArticulo(id: string, nuevoSaldo: string): Promise<boolean> {
    return this.articulosRepository.updateSaldo(id, nuevoSaldo);
  }
}

const articulosService = new ArticulosService();

export {articulosService};
