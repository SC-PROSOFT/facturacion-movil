import {FilesRepository} from '../repositories';
import {IFiles} from '../../../common/types';
import {DocumentPickerResponse} from 'react-native-document-picker';

const filesRepository = new FilesRepository();

class FilesService {
  private filesRepository: FilesRepository;

  constructor() {
    this.filesRepository = filesRepository;
  }

  async createTableFiles(): Promise<boolean> {
    return this.filesRepository.createTable();
  }

  async getAllFiles(): Promise<IFiles[]> {
    return this.filesRepository.get();
  }

  async getAllUnsyncedFiles(): Promise<IFiles[]> {
    return this.filesRepository.getAllUnsynced();
  }

  async addFile(file: IFiles): Promise<boolean> {
    return this.filesRepository.add(file);
  }

  async updateFile(
    codigo: string,
    files: DocumentPickerResponse[],
  ): Promise<boolean> {
    return this.filesRepository.updateFiles(codigo, files);
  }

  async deleteFile(codigo: string): Promise<boolean> {
    return this.filesRepository.deleteById(codigo);
  }

  async getFilesByCode(codigo: string): Promise<IFiles> {
    return this.filesRepository.getById(codigo);
  }

  async deleteTableFiles(): Promise<boolean> {
    return this.filesRepository.deleteTable();
  }
  async updateSincronizado(codigo: string): Promise<boolean> {
    return this.filesRepository.updateSincronizado(codigo);
  }
}

const filesService = new FilesService();

export {filesService};
