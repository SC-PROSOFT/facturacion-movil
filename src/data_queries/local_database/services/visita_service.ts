import {
  FrecuenciaRepository,
  ZonaRepository,
  RutaRepository,
  VisitasRepository,
} from '../repositories';

import {IFrecuencia, IRuta, IZona, IVisita} from '../../../common/types';

const frecuenciaRepository = new FrecuenciaRepository();
const zonaRepository = new ZonaRepository();
const rutaRepository = new RutaRepository();
const visitaRepository = new VisitasRepository();

class VisitasService {
  private visitaRepository: VisitasRepository;

  constructor() {
    this.visitaRepository = visitaRepository;
  }

  async createTableVisitas(): Promise<boolean> {
    return this.visitaRepository.createTable();
  }

  async fillVisitas(visitas: IVisita[]): Promise<boolean> {
    return this.visitaRepository.fillTable(visitas);
  }

  async getAllVisitas(): Promise<IVisita[]> {
    return this.visitaRepository.get();
  }

  async updateVisita(visita: IVisita, id: number): Promise<boolean> {
    return this.visitaRepository.update(id.toString(), visita);
  }

  async deleteTableVisitas(): Promise<boolean> {
    return this.visitaRepository.deleteTable();
  }

  async getVisitaByCode(code: string): Promise<IVisita> {
    return this.visitaRepository.getByCode(code);
  }

  async deleteVisitas(): Promise<boolean> {
    return this.visitaRepository.deleteVisitas();
  }
}

class FrecuenciaService {
  private frecuenciaRepository: FrecuenciaRepository;

  constructor() {
    this.frecuenciaRepository = frecuenciaRepository;
  }

  async createTableFrecuencia(): Promise<boolean> {
    return this.frecuenciaRepository.createTable();
  }

  async fillFrecuencia(frecuencias: IFrecuencia[]): Promise<boolean> {
    return this.frecuenciaRepository.fillTable(frecuencias);
  }

  async getAllFrecuencias(): Promise<IFrecuencia[]> {
    return this.frecuenciaRepository.get();
  }
}

class ZonaService {
  private zonaRepository: ZonaRepository;

  constructor() {
    this.zonaRepository = zonaRepository;
  }

  async createTableZona(): Promise<boolean> {
    return this.zonaRepository.createTable();
  }

  async fillZona(zonas: IZona[]): Promise<boolean> {
    return this.zonaRepository.fillTable(zonas);
  }

  async getAllZonas(): Promise<IZona[]> {
    return this.zonaRepository.get();
  }

  async dropTableZona(): Promise<boolean> {
    return this.zonaRepository.deleteTable();
  }

  async deleteZonas(): Promise<boolean> {
    return this.zonaRepository.deleteZonas();
  }
}

class RutaService {
  private rutaRepository: RutaRepository;

  constructor() {
    this.rutaRepository = rutaRepository;
  }

  async createTableRuta(): Promise<boolean> {
    return this.rutaRepository.createTable();
  }

  async fillRuta(rutas: IRuta[]): Promise<boolean> {
    return this.rutaRepository.fillTable(rutas);
  }

  async getAllRutas(): Promise<IRuta[]> {
    return this.rutaRepository.get();
  }
}

const frecuenciaService = new FrecuenciaService();
const zonaService = new ZonaService();
const rutaService = new RutaService();
const visitaService = new VisitasService();

export {frecuenciaService, zonaService, rutaService, visitaService};
