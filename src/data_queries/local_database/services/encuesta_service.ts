import {EncuestaRepository} from '../repositories';

import {IEncuesta} from '../../../common/types';

const encuestaRepository = new EncuestaRepository();

class EncuestaService {
  private encuestaRepository: EncuestaRepository;

  constructor() {
    this.encuestaRepository = encuestaRepository;
  }

  async createTableEncuesta(): Promise<boolean> {
    return this.encuestaRepository.createTable();
  }

  async fillEncuesta(encuesta: IEncuesta[]): Promise<boolean> {
    return this.encuestaRepository.fillTable(encuesta);
  }

  async getEncuesta(): Promise<IEncuesta | null> {
    return this.encuestaRepository.get();
  }
}

const encuestaService = new EncuestaService();
export {encuestaService};
