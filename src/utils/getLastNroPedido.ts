// En tu archivo de utilidades (donde getLastNroPedido está definido)
import {SyncQueries} from '../data_queries/api/queries'; // Asegúrate que la ruta es correcta
import {setObjOperator} from '../redux/slices'; // Acción de Redux para actualizar el operador
import {IOperadores} from '../common/types/IOperadores'; // Tipo para el objeto operador
import {IConfig} from '../common/types'; // Tipo para el objeto de configuración
import {Dispatch} from '@reduxjs/toolkit'; // Tipo para la función dispatch de Redux
import {operadoresService} from '../data_queries/local_database/services';

// NO debe haber un "import { useAppDispatch } from '../redux/hooks';" aquí si no se usa.
// NO debe haber "const dispatch = useAppDispatch();" dentro de esta función.

export const getLastNroPedido = async (
  operador: IOperadores, // El objeto operador actual (puede tener un nro_pedido desactualizado)
  objConfig: IConfig, // Configuración necesaria para la conexión (IP, puerto)
  dispatch: Dispatch, // La función dispatch de Redux, pasada como argumento
): Promise<number | null> => {
  // La función ahora devuelve una Promesa que se resuelve a un número o null

  // Verifica que los parámetros necesarios para la conexión están presentes
  if (!objConfig || !objConfig.direccionIp || !objConfig.puerto) {
    console.error(
      'getLastNroPedido: Configuración de conexión incompleta (direccionIp o puerto faltante).',
    );
    return null; // No se puede proceder sin configuración
  }
  if (!operador || !operador.codigo) {
    console.error('getLastNroPedido: Código de operador no proporcionado.');
    return null; // No se puede proceder sin el código del operador
  }

  const {direccionIp, puerto} = objConfig;

  try {
    // Inicializa el servicio para consultar la API
    const syncQueries = new SyncQueries(direccionIp, puerto);
    // Obtiene todos los operadores desde el servidor
    const operadoresDesdeServidor = await syncQueries._getOperadores();

    if (operadoresDesdeServidor && operadoresDesdeServidor.length > 0) {
      // Busca el operador específico por su código
      const operEnServidor = operadoresDesdeServidor.find(
        op => op.codigo === operador.codigo,
      );

      if (
        operEnServidor &&
        typeof operEnServidor.nro_pedido !== 'undefined' &&
        operEnServidor.nro_pedido !== null
      ) {
        // Si se encuentra el operador y tiene un nro_pedido válido
        const nroPedidoNum = Number(operEnServidor.nro_pedido);

        if (isNaN(nroPedidoNum)) {
          console.warn(
            `getLastNroPedido: El nro_pedido para ${operador.codigo} no es un número válido ('${operEnServidor.nro_pedido}').`,
          );
          return null;
        }

        console.log('Nro Pedido obtenido del servidor:', nroPedidoNum);

        // 1. Efecto secundario: Actualiza el nro_pedido en el store de Redux
        if (operador.nro_pedido !== nroPedidoNum) {
          dispatch(
            setObjOperator({
              ...operador, // Mantiene los otros datos del operador que se pasaron
              nro_pedido: nroPedidoNum, // Actualiza solo el nro_pedido con el valor del servidor
            }),
          );
          const operadorAct: IOperadores = {
            ...operador,
            nro_pedido: nroPedidoNum,
          };
          await operadoresService.updateOperador(operador.id, operadorAct);
        }

        // 2. Retorna el valor obtenido para que el llamador lo use directamente
        return nroPedidoNum;
      } else {
        console.warn(
          `getLastNroPedido: Operador con código '${operador.codigo}' no encontrado en el servidor o su nro_pedido es indefinido/nulo.`,
        );
        return null; // Indica que no se encontró el nro_pedido o el operador
      }
    } else {
      console.warn(
        'getLastNroPedido: No se recibieron operadores del servidor o la lista está vacía.',
      );
      return null; // Indica que no se pudieron obtener los operadores
    }
  } catch (error) {
    // Captura cualquier error durante el proceso (ej. error de red)
    console.error(
      'getLastNroPedido: Error al intentar obtener el último Nro Pedido:',
      error,
    );
    return null; // Indica un fallo en la operación
  }
};
