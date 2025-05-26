import {PedidosRepository} from '../repositories';

import {IOperation} from '../../../common/types';
import {setArrPedido} from '../../../redux/slices';

const pedidosRepository = new PedidosRepository();

class PedidosService {
  private pedidosRepository: PedidosRepository;

  constructor() {
    this.pedidosRepository = pedidosRepository;
  }

  async createTablePedidos(): Promise<boolean> {
    return this.pedidosRepository.createTable();
  }
  async savePedido(
    pedidoSinIdAun: Omit<IOperation, 'id'>,
  ): Promise<IOperation> {
    const repo = new PedidosRepository();
    const success = await repo.create(pedidoSinIdAun as IOperation); // 'create' devuelve boolean

    if (success) {
      const newId = await repo.getLastInsertId(); // Obtener el ID después de la inserción
      if (newId !== null) {
        return {...pedidoSinIdAun, id: newId} as IOperation;
      } else {
        throw new Error('Fallo al obtener el ID del pedido recién creado.');
      }
    } else {
      throw new Error('Fallo al guardar el pedido en la base de datos local.');
    }
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

  async getPedidosDeHoy(): Promise<IOperation[]> {
    return this.pedidosRepository.getPedidosDeHoy();
  }

  async getPedidosDeEsteMes(): Promise<IOperation[]> {
    return this.pedidosRepository.getPedidosDeEsteMes();
  }

  async getPedidoById(id: string): Promise<IOperation | null> {
    const pedidos = await this.pedidosRepository.getByAttribute('id', id);
    return pedidos.length > 0 ? pedidos[0] : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.pedidosRepository.delete(id);
  }
}

const pedidosService = new PedidosService();
export {pedidosService};
