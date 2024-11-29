/* types */
import {ICartera, IConfig, IOperation, IProductAdded} from '../common/types';
/* errors */
import {ValidationsBeforeSavingError} from '../common/errors';
/* local db */
import {operadoresService} from '../data_queries/local_database/services';

/**
 * Suma los valores numéricos de la propiedad `vlr` en un arreglo de objetos `ICartera`.
 * La función toma un arreglo de objetos `ICartera`, convierte el valor de la propiedad `vlr`
 * (que es un string) a número después de eliminar cualquier espacio en blanco, y lo suma al acumulador.
 * Si la conversión no es válida (por ejemplo, si el string no representa un número), el valor se ignora
 * y se suma 0 en su lugar.
 *
 * @param {ICartera[]} array - Un arreglo de objetos que implementan la interfaz `ICartera`.
 * Cada objeto contiene varias propiedades, incluyendo `vlr`, que es un string que representa un valor numérico.
 *
 * @returns {number} - La suma total de los valores numéricos convertidos de la propiedad `vlr`.
 * Si un valor no es numérico o es inválido, se ignora y se suma 0.
 *
 * @example
 * const cartera = [
 *   { nit: "123456", sucursal: "A", nro: "001", vlr: "100.50", fecha: "2024-09-20" },
 *   { nit: "789101", sucursal: "B", nro: "002", vlr: " 200 ", fecha: "2024-09-21" },
 *   { nit: "111213", sucursal: "C", nro: "003", vlr: "abc", fecha: "2024-09-22" }, // No es un número válido
 * ];
 *
 * const total = sumarCartera(cartera);
 * console.log(total); // 300.50
 */
export const sumarCartera = (cartera: ICartera[]): number => {
  return cartera.reduce((acumulador, elemento) => {
    const valor = parseFloat(elemento.vlr.trim());

    return acumulador + (isNaN(valor) ? 0 : valor);
  }, 0);
};
export const validateBeforeSaving = ({
  almacen,
  identificacion,
  articulosAddedLength,
  objConfig,
}: {
  almacen: string;
  identificacion: string;
  articulosAddedLength: number;
  objConfig: IConfig;
}): boolean => {
  const geoLocalizacion = false; // En desarrollo 07/09/2023

  if (objConfig.seleccionarAlmacen && almacen == '') {
    throw new ValidationsBeforeSavingError(
      'Error en las validaciones de pre guardado',
      {
        type: 'info',
        text1: 'Debes seleccionar un almacen',
      },
    );
  } else if (identificacion == '') {
    throw new ValidationsBeforeSavingError(
      'Error en las validaciones de pre guardado',
      {
        type: 'info',
        text1: 'No ha seleccionado un cliente',
      },
    );
  } else if (articulosAddedLength < 1) {
    throw new ValidationsBeforeSavingError(
      'Error en las validaciones de pre guardado',
      {
        type: 'info',
        text1: 'No ha seleccionado ningun producto',
      },
    );
  } else if (!geoLocalizacion && objConfig.localizacionGps) {
    throw new ValidationsBeforeSavingError(
      'Error en las validaciones de pre guardado',
      {
        type: 'info',
        text1: 'No se ha cargado la geolocalizacion',
      },
    );
  } else {
    return true;
  }
};
export const redefineOrders = (
  arrPedidos: IOperation[],
  newPedido: IOperation,
) => {
  const redefinedOrders = arrPedidos.map(pedido =>
    pedido.operador.nro_pedido == newPedido.operador.nro_pedido
      ? newPedido
      : pedido,
  );

  return redefinedOrders;
};
export const redefineBills = (
  arrFacturas: IOperation[],
  newFactura: IOperation,
) => {
  const redefinedOrders = arrFacturas.map(factura =>
    factura.operador.nro_factura == newFactura.operador.nro_factura
      ? newFactura
      : factura,
  );

  return redefinedOrders;
};
export const redefineArrProducts = (
  arrProducts: IProductAdded[],
  newProduct: IProductAdded,
) => {
  const redefinedArrProducts = arrProducts.map(product =>
    product.codigo == newProduct.codigo ? newProduct : product,
  );
  return redefinedArrProducts;
};
export const getCurrentOperator = async (codigoOperador: string) => {
  try {
    const currentOperator = await operadoresService.getByAttribute(
      'codigo',
      codigoOperador,
    );

    return currentOperator;
  } catch (error: any) {
    throw new Error(error);
  }
};
export const getInitialsOfClient = (client: string): string => {
  const clientScope = client.split(' ');

  let clientInitials = '';
  clientScope.forEach(client => {
    if (clientScope.length <= 1 && client == '') {
      return (clientInitials = '..');
    }

    if (clientScope.length <= 1) {
      return (clientInitials = client.slice(0, 2).toUpperCase());
    }

    if (clientScope.length <= 2) {
      return (clientInitials += client.slice(0, 1).toUpperCase());
    }

    if (clientScope.length > 2) {
      return (clientInitials += client.slice(0, 1).toUpperCase());
    }
  });

  return clientInitials.slice(0, 2);
};
