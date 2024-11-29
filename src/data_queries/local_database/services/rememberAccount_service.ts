import {RememberAccountRepository} from '../repositories';

import {IRememberAccount} from '../types';

const rememberAccountRepository = new RememberAccountRepository();

class RememberAccountService {
  private rememberAccountRepository: RememberAccountRepository;

  constructor() {
    this.rememberAccountRepository = rememberAccountRepository;
  }

  async createTableRememberAccount(): Promise<boolean> {
    return this.rememberAccountRepository.createTable();
  }

  async createRememberAccount(
    rememberAccount: IRememberAccount,
  ): Promise<boolean> {
    return this.rememberAccountRepository.create(rememberAccount);
  }

  async updateRememberAccount(
    oldUser: string,
    rememberAccount: IRememberAccount,
  ): Promise<boolean> {
    return this.rememberAccountRepository.update(oldUser, rememberAccount);
  }

  async deleteTableRememberAccount(): Promise<boolean> {
    return this.rememberAccountRepository.deleteTable();
  }

  async getRememberAccount(): Promise<IRememberAccount> {
    return this.rememberAccountRepository.getAll();
  }
}

const rememberAccountService = new RememberAccountService();

export {rememberAccountService};
