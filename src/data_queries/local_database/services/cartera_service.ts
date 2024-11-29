import {CarteraRepository} from '../repositories';

import {ICartera} from '../../../common/types';

const carteraRepository = new CarteraRepository();

class CarteraService {
  private carteraRepository: CarteraRepository;

  constructor() {
    this.carteraRepository = carteraRepository;
  }

  async createTableCartera(): Promise<boolean> {
    return this.carteraRepository.createTable();
  }

  async fillCartera(cartera: ICartera[]): Promise<boolean> {
    return this.carteraRepository.fillTable(cartera);
  }

  async getAllCartera(): Promise<ICartera[]> {
    return this.carteraRepository.getAll();
  }

  async getCarteraByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<ICartera[]> {
    return this.carteraRepository.getByAttribute(attributeName, attributeValue);
  }

  async getQuantityCartera(): Promise<string> {
    return this.carteraRepository.getQuantity();
  }
}

const carteraService = new CarteraService();

export {carteraService};
