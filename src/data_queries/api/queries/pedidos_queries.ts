import {createAxiosInstance} from '../axiosInstance';

/* types */
import {IOperation, IProductAdded} from '../../../common/types';
/* errors */
import {ApiSaveOrderError} from '../../../common/errors';
/* utils */
import {getErrorMessage} from '../../../utils';
/* local database services */
import {articulosService, pedidosService} from '../../local_database/services';

class PedidosApiService {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _savePedido = async (
    pedido: IOperation,
    saveOrUpdate: 'post' | 'put',
  ): Promise<boolean> => {
    const innerFormatPedido = (pedido: IOperation) => {
      let articulosAdded: any = {};

      pedido.articulosAdded.forEach((articulo, index) => {
        let articuloToSave = [
          pedido.almacen,
          articulo.codigo.trim(),
          articulo.cantidad,
          articulo.valorBase, //articulo.valorTotal, se cambia valorTotal x valorBase porq en cobol se hace el calculo
          articulo.valorIva,
          articulo.index_lista,
          articulo.descuento,
        ];

        articulosAdded[`TBL-${(index + 1).toString().padStart(3, '0')}`] =
          articuloToSave.join('|') + '|';
      });

      return {
        prefijo: pedido.operador.sucursal,
        nro: pedido.operador.nro_pedido,
        fecha: pedido.fecha.replaceAll('-', ''),
        hora: pedido.hora.replaceAll(':', '').slice(0, 4),

        nit: pedido.tercero.codigo,
        oper: pedido.operador.codigo,
        vend: pedido.operador.cod_vendedor, // este es el que supuestamente debe ir

        forma_pago: pedido.observaciones,
        dias_entrega: Number(pedido.tercero.plazo.toString().trim()),

        observ: pedido.observaciones,

        estado: 0, // "0" no aprobado, "1" aprobado
        fecha_vence: pedido.fechaVencimiento,
        paso: saveOrUpdate == 'post' ? 1 : 2, // 1 crear, 2 editar,
        nro_fact: pedido.operador.nro_pedido,

        lat: pedido.ubicacion.latitud,
        log: pedido.ubicacion.longitud,

        ...articulosAdded,
      };
    };

    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/COMER105.dll`,
        innerFormatPedido(pedido),
      );
      console.log(response.data.data);
      if (response.data.data.STATUS === '00') {
        await pedidosService.updatePedido(
          pedido.operador.nro_pedido.toString(),
          {
            ...pedido,
            sincronizado: 'S',
            guardadoEnServer: 'S',
          },
        );
      } else if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      await this.updateSaldoProducts(pedido);

      return true;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error(error.message);
      } else {
        throw new ApiSaveOrderError(
          getErrorMessage('systemErrors', 'apiFailed'),
        );
      }
    }
  };

  private async updateSaldoProducts(pedido: IOperation): Promise<void> {
    try {
      for (let product of pedido.articulosAdded) {
        await articulosService.updateSaldoArticulo(
          product.codigo,
          this.getNewSaldo(product),
        );
      }
    } catch (error: any) {
      throw new Error(`[Error al actualizar el saldo de articulos]: ${error}`);
    }
  }
  private getNewSaldo(productAdded: IProductAdded): string {
    let newSaldo = productAdded.saldo - productAdded.cantidad;

    if (newSaldo < 1) {
      return '0';
    } else {
      return newSaldo.toString();
    }
  }
}

export {PedidosApiService};
