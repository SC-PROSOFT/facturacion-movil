import {EncuestaRepository} from '../repositories';

import {IEncuesta, IRespEncuesta} from '../../../common/types';

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

  async createTableRespEncuesta(): Promise<boolean> {
    return this.encuestaRepository.createTableRespuesta();
  }

  async createRespEncuesta(respuesta: IRespEncuesta): Promise<boolean> {
    return this.encuestaRepository.createRespuesta(respuesta);
  }

  async deleteTableRespEncuesta(): Promise<boolean> {
    return this.encuestaRepository.deleteTableResp();
  }

  async getRespEncuesta(): Promise<IRespEncuesta[]> {
    return this.encuestaRepository.getAllResp();
  }

  async getRespEncuestaByGuardado(guardado: string): Promise<IRespEncuesta[]> {
    return this.encuestaRepository.getRespEncuestaByGuardado(guardado);
  }

  async updateRespEncuestaByGuardado(
    codigo: string,
    guardado: string,
  ): Promise<boolean> {
    return this.encuestaRepository.updateRespEncuestaGuardado(codigo, guardado);
  }

  async getRespEncuestaByCodigo(codigo: string): Promise<IRespEncuesta[]> {
    return this.encuestaRepository.getRespEncuestaByTercero(codigo);
  }
}

const encuestaService = new EncuestaService();
export {encuestaService};
