import {ConfigRepository} from '../repositories';
import {IConfig} from '../../../common/types';

const configRepository = new ConfigRepository();

class ConfigService {
  private configRepository: ConfigRepository;

  constructor() {
    this.configRepository = configRepository;
  }

  async createTableConfig(): Promise<boolean> {
    return this.configRepository.createTable();
  }

  async saveConfig(config: IConfig): Promise<boolean | null> {
    return this.configRepository.create(config);
  }

  async getConfig(): Promise<IConfig> {
    return this.configRepository.getAll();
  }
}

const configService = new ConfigService();
export {configService};
