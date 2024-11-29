import {PedidosRepository} from '../repositories';

import {IOperation} from '../../../common/types';

const pedidosRepository = new PedidosRepository();

class PedidosService {
  private pedidosRepository: PedidosRepository;

  constructor() {
    this.pedidosRepository = pedidosRepository;
  }

  async createTablePedidos(): Promise<boolean> {
    return this.pedidosRepository.createTable();
  }
  async savePedido(pedido: IOperation): Promise<boolean> {
    return this.pedidosRepository.create(pedido);
  }
  async updatePedido(id: string, pedido: IOperation): Promise<boolean> {
    return this.pedidosRepository.update(id, pedido);
  }
  async getAllPedidos(): Promise<IOperation[]> {
    return this.pedidosRepository.getAll();
  }
  async deleteTablaPedidos(): Promise<boolean> {
    return this.pedidosRepository.deleteTable();
  }
  async getByAttribute(
    attributeName: string,
    attributeValue: any,
  ): Promise<IOperation[]> {
    return this.pedidosRepository.getByAttribute(attributeName, attributeValue);
  }
}

const pedidosService = new PedidosService();
export {pedidosService};
