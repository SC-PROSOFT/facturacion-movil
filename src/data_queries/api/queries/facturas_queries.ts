import {createAxiosInstance} from '../axiosInstance';

/* types */
import {IProductAdded, IOperation} from '../../../common/types';
import {articulosService} from '../../local_database/services';
import {ApiSaveInvoiceError} from '../../../common/errors';
import {getErrorMessage} from '../../../utils';

class FacturasApiService {
  private axiosInstance;
  private direccionIp;

  constructor(direccionIp: string, puerto: string) {
    this.axiosInstance = createAxiosInstance(direccionIp, puerto);
    this.direccionIp = direccionIp;
  }

  _saveFactura = async (
    factura: IOperation,
    saveOrUpdate: 'post' | 'put',
  ): Promise<boolean> => {
    const innerFormatFactura = (factura: IOperation) => {
      let articulosAdded: any = {};

      factura.articulosAdded.forEach((articulo, index) => {
        let articuloToSave = [
          factura.almacen,
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
        prefijo: factura.operador.sucursal,
        nro: factura.operador.nro_factura,
        fecha: factura.fecha.replaceAll('-', ''),
        hora: factura.hora.replaceAll(':', '').slice(0, 4),

        nit: factura.tercero.codigo,
        oper: factura.operador.codigo,
        vend: factura.operador.cod_vendedor,

        forma_pago: factura.formaPago,
        dias_entrega: Number(factura.tercero.plazo.toString().trim()),

        observ: factura.observaciones,

        estado: 0, // "0" no aprobado, "1" aprobado
        fecha_vence: factura.fechaVencimiento,
        paso: saveOrUpdate == 'post' ? 1 : 2, // "1" crear, "2" editar
        nro_fact: factura.operador.nro_factura,

        lat: factura.ubicacion.latitud,
        log: factura.ubicacion.longitud,

        ...articulosAdded,
      };
    };
    try {
      const response = await this.axiosInstance.post(
        `/v1/contabilidad/dll?ip=${this.direccionIp}&directorio=comercial/inc/app/COMER106.dll`,
        innerFormatFactura(factura),
      );
      console.log(response.data.data);
      if (
        response.data.data.STATUS == '35' ||
        response.data.data.STATUS == '30'
      ) {
        throw new Error('La configuracion no es correcta');
      }

      await this.updateSaldoProducts(factura);

      return true;
    } catch (error: any) {
      if (error?.message == 'La configuracion no es correcta') {
        throw new Error(error.message);
      } else if (error?.message == 'La solicitud fue cancelada') {
        throw new Error(error.message);
      } else {
        throw new ApiSaveInvoiceError(
          getErrorMessage('systemErrors', 'apiFailed'),
        );
      }
    }
  };

  private async updateSaldoProducts(operation: IOperation): Promise<void> {
    try {
      for (let product of operation.articulosAdded) {
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

export {FacturasApiService};
