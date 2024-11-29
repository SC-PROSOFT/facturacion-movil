import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';
import Toast from 'react-native-toast-message';

/* components */
import {CoolButton, PrincipalHeader} from '../components';
/* redux hook */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {setObjInfoAlert} from '../redux/slices';
/* local database services */
import {pedidosService} from '../data_queries/local_database/services';
/* api queries */
import {PedidosApiService} from '../data_queries/api/queries';
/* local types */
interface State {
  pedidosActualizados: number;
  pedidosPendientesDeActualizacion: number;
  pedidosElaborados: number;
}

const ActualizarPedidos: React.FC = () => {
  const dispatch = useAppDispatch();

  const objConfig = useAppSelector(store => store.config.objConfig);

  const [state, setState] = useState<State>({
    pedidosActualizados: 0,
    pedidosPendientesDeActualizacion: 0,
    pedidosElaborados: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPedidosValues();
  }, []);

  const loadPedidosValues: () => void = async () => {
    try {
      const pedidos = await pedidosService.getAllPedidos();

      const pedidosValues = {
        pedidosActualizados: 0,
        pedidosPendientesDeActualizacion: 0,
        pedidosElaborados: 0,
      };

      for (let pedido of pedidos) {
        pedido.sincronizado == 'S'
          ? (pedidosValues.pedidosActualizados += 1)
          : (pedidosValues.pedidosPendientesDeActualizacion += 1);

        pedidosValues.pedidosElaborados++;
      }

      setState(pedidosValues);
    } catch (error) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Fallo cargar valores de pedidos',
        }),
      );
    }
  };
  const updatePedidos: () => void = async () => {
    setLoading(true);
    const pedidosApiService = new PedidosApiService(
      objConfig.descargasIp,
      objConfig.puerto,
    );

    const pedidos = await pedidosService.getAllPedidos();

    for (let index = 0; index < pedidos.length; index++) {
      const pedido = pedidos[index];

      try {
        await pedidosApiService._savePedido(
          pedido,
          pedido.guardadoEnServer == 'S' ? 'put' : 'post',
        );

        if (index === pedidos.length - 1) {
          Toast.show({
            type: 'success',
            text1: 'pedidos actualizados correctamente',
          });
        }

        loadPedidosValues();
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error.message,
          }),
        );
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
    },
    pedidosSummary: {
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      elevation: 3,
      marginTop: 10,
      backgroundColor: 'white',
      borderColor: '#ddd',
    },
    pedidosSummaryTitle: {
      borderBottomColor: 'grey',
      borderTopColor: '#fff',
      borderLeftColor: '#fff',
      borderRightColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      marginHorizontal: 10,
      marginBottom: 20,
      paddingVertical: 10,
      backgroundColor: '#fff',
    },
    itemsContainer: {
      padding: 20,
      paddingTop: 0,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    itemTitle: {
      width: '90%',
      fontSize: 18,
      color: '#000',
    },
    itemContent: {
      width: '10%',
      fontSize: 13,
      fontWeight: 'bold',
      color: '#464646',
    },
  });

  return (
    <View>
      <View>
        <PrincipalHeader />
      </View>

      <View style={{paddingHorizontal: 15, paddingTop: 10}}>
        <View>
          <CoolButton
            pressCoolButton={updatePedidos}
            value="Actualizar pedidos"
            iconName="sync"
            colorButton="#19C22A"
            colorText={
              state.pedidosPendientesDeActualizacion > 0 ? '#fff' : 'grey'
            }
            loading={loading}
            iconSize={25}
            disabled={state.pedidosPendientesDeActualizacion > 0 ? false : true}
          />
        </View>

        <View style={styles.pedidosSummary}>
          <View style={styles.pedidosSummaryTitle}>
            <Text
              allowFontScaling={false}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              }}>
              Todos los pedidos
            </Text>
          </View>

          <View style={styles.itemsContainer}>
            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Pedidos actualizados
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: 'green',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.pedidosActualizados}
                </Badge>
              </View>
            </View>

            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Pedidos pendientes por actualizar
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: 'orange',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.pedidosPendientesDeActualizacion}
                </Badge>
              </View>
            </View>

            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Total pedidos elaborados
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: '#365AC3',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.pedidosElaborados}
                </Badge>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export {ActualizarPedidos};
