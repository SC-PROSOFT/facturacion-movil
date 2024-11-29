import {FacturasRepository} from '../repositories';

import {IOperation} from '../../../common/types';

const facturasRepository = new FacturasRepository();

class FacturasService {
  private facturasRepository: FacturasRepository;

  constructor() {
    this.facturasRepository = facturasRepository;
  }

  async createTableFacturas(): Promise<boolean> {
    return this.facturasRepository.createTable();
  }
  async saveFactura(factura: IOperation): Promise<boolean> {
    return this.facturasRepository.create(factura);
  }
  async updateFactura(id: string, factura: IOperation): Promise<boolean> {
    return this.facturasRepository.update(id, factura);
  }
  async getAllFacturas(): Promise<IOperation[]> {
    return this.facturasRepository.getAll();
  }
  async deleteTablaFacturas(): Promise<boolean> {
    return this.facturasRepository.deleteTable();
  }
  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperation[]> {
    return this.facturasRepository.getByAttribute(
      attributeName,
      attributeValue,
    );
  }
}

const facturasService = new FacturasService();
export {facturasService};
