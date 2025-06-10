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

  /**
   * Crea una nueva visita en la base de datos.
   * @param visitaData - El objeto de visita a crear, sin el campo 'id_visita'
   * ya que este será autogenerado por la base de datos.
   * @returns Una promesa que resuelve con el objeto IVisita completo (incluyendo
   * el id_visita asignado por la base de datos) o null si la creación falló.
   */
  async createVisita(
    visitaData: Omit<IVisita, 'id_visita'>,
  ): Promise<IVisita | null> {
    try {
      // El método createVisita del repositorio ya maneja la lógica de inserción
      // y devuelve la visita con su ID o null.
      const nuevaVisitaConId = await this.visitaRepository.createVisita(
        visitaData,
      );

      if (nuevaVisitaConId) {
        console.log(
          `VisitaService: Visita creada exitosamente con id_visita: ${nuevaVisitaConId.id_visita}`,
        );
        return nuevaVisitaConId;
      } else {
        // Esto podría ocurrir si, por ejemplo, la inserción falló por una restricción UNIQUE
        // y el repositorio decidió devolver null en lugar de lanzar un error.
        console.warn(
          'VisitaService: La creación de la visita en el repositorio no devolvió un objeto (posiblemente duplicado o fallo silenciado).',
        );
        return null;
      }
    } catch (error) {
      console.error(
        'VisitaService: Error crítico al intentar crear visita:',
        error,
      );
      // Podrías querer lanzar el error para que el llamador lo maneje,
      // o devolver null y loguear el error aquí.
      // Depende de tu estrategia de manejo de errores.
      throw error; // Re-lanzar el error es una buena práctica general
    }
  }

  /**
   * Obtiene todas las visitas para una fecha específica.
   * @param appointmentDate - La fecha en formato "YYYY-MM-DD".
   * @returns Una promesa que resuelve con un array de IVisita.
   */
  async getVisitasByDate(appointmentDate: string): Promise<IVisita[]> {
    try {
      return await this.visitaRepository.getVisitasByDate(appointmentDate);
    } catch (error) {
      console.error(
        `VisitaService: Error al obtener visitas por fecha ${appointmentDate}:`,
        error,
      );
      throw error; // O devuelve [] si prefieres no propagar el error
    }
  }

  // Aquí irían otros métodos de tu servicio de visitas, por ejemplo:
  async getAllVisitas(): Promise<IVisita[]> {
    return this.visitaRepository.getAll(); // Asumiendo que getAll está en tu repositorio
  }

  async updateVisita(
    data: Partial<Omit<IVisita, 'id_visita' | 'id_tercero'>>,
    idVisita: string,
  ): Promise<boolean> {
    // El idVisita aquí es string porque tu IRepository.update(id: string, ...) lo espera así.
    // El repositorio internamente lo convertirá a número.
    return this.visitaRepository.update(idVisita, data);
  }

  async fillVisitas(visitas: IVisita[]): Promise<boolean> {
    return this.visitaRepository.fillTable(visitas);
  }

  async deleteTableVisitas(): Promise<boolean> {
    return this.visitaRepository.deleteTable();
  }

  async deleteVisitas(): Promise<boolean> {
    return this.visitaRepository.deleteData();
  }
  async createBulkVisitas(
    visitas: Omit<IVisita, 'id_visita'>[],
  ): Promise<IVisita[]> {
    try {
      // Aquí podrías implementar la lógica para insertar múltiples visitas en una sola transacción
      // o en lotes, dependiendo de tu base de datos y repositorio.
      return this.visitaRepository.createBulkVisitas(visitas);
    } catch (error) {
      console.error('Error al crear múltiples visitas:', error);
      throw error; // O maneja el error según tu estrategia
    }
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

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IFrecuencia[]> {
    return this.frecuenciaRepository.getByAttribute(
      attributeName,
      attributeValue,
    );
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

  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IZona[]> {
    return this.zonaRepository.getByAttribute(attributeName, attributeValue);
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

  async getByAttribute(
    attributeName: string,
    attributeValue: string,
  ): Promise<IRuta[]> {
    return this.rutaRepository.getByAttribute(attributeName, attributeValue);
  }
}

const frecuenciaService = new FrecuenciaService();
const zonaService = new ZonaService();
const rutaService = new RutaService();
const visitaService = new VisitasService();

export {frecuenciaService, zonaService, rutaService, visitaService};
