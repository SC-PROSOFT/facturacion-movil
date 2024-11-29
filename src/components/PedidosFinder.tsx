import React, {useState, useEffect} from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  VirtualizedList,
  SafeAreaView,
} from 'react-native';

/* icons */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* paper components */
import {Text, Badge, Modal, IconButton} from 'react-native-paper';

/* components */
import {IconLeftInput} from '../components';

/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';

/* redux slices */
import {setIsShowPedidosFinder, setObjInfoAlert} from '../redux/slices';

/* local database services */
import {pedidosService} from '../data_queries/local_database/services';

/* types */
import {IOperation} from '../common/types';

/* utils */
import {formatToMoney} from '../utils';

/* local types */
interface PedidosFinderProps {
  togglePedido: (pedido: IOperation) => void;
}

const PedidosFinder: React.FC<PedidosFinderProps> = React.memo(
  ({togglePedido}) => {
    const dispatch = useAppDispatch();

    const isShowPedidosFinder = useAppSelector(
      store => store.pedidosFinder.isShowPedidosFinder,
    );

    const [screenHeight, setScreenHeight] = useState(
      Dimensions.get('window').height,
    );

    const [inputs, setInputs] = useState({
      pedido: '',
    });

    const [pedidos, setPedidos] = useState<IOperation[]>([]);

    useEffect(() => {
      loadPedidos();
    }, [isShowPedidosFinder]);
    useEffect(() => {
      adjustScreenSize();
    }, []);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };
    const loadPedidos = async () => {
      if (isShowPedidosFinder) {
        try {
          const pedidos = await pedidosService.getAllPedidos();

          setPedidos(pedidos);
        } catch (error: any) {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description: error.message,
            }),
          );
        }
      } else {
        setPedidos([]);
      }
    };
    const hidePedidosFinder = (): void => {
      setPedidos([]);
      dispatch(setIsShowPedidosFinder(false));
    };
    const adjustScreenSize = () => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        event => {
          const keyboardHeight = event.endCoordinates.height;
          const screenHeight = Dimensions.get('window').height;
          const availableScreenHeight = screenHeight - keyboardHeight;
          setScreenHeight(availableScreenHeight);
        },
      );

      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          const screenHeight = Dimensions.get('window').height;
          setScreenHeight(screenHeight);
        },
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    };
    const styles = StyleSheet.create({
      container: {
        justifyContent: 'flex-end',
        flex: 1,
      },
      modal: {
        backgroundColor: '#fff',
        height: '80%',
        justifyContent: 'flex-start',
        paddingTop: 20,
        paddingBottom: 105,
        paddingLeft: 20,
        paddingRight: 20,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      iconClose: {
        marginTop: -8,
        marginRight: -8,
      },
      item: {
        backgroundColor: 'white',
        borderTopColor: 'white',
        borderLeftColor: 'white',
        borderRightColor: 'white',
        borderBottomColor: '#eee',
        borderWidth: 1,
        padding: 20,
      },
      codigo: {
        fontSize: 16,
        color: 'black',
      },
      loaderContainer: {
        marginVertical: 16,
        alignItems: 'center',
      },
    });

    const renderItem = ({item, index}: {item: IOperation; index: any}) => (
      <TouchableOpacity
        onPress={() => {
          dispatch(setIsShowPedidosFinder(false));
          togglePedido(item);
        }}
        style={styles.item}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: 'black', fontSize: 18, fontWeight: 'bold'}}>
                Pedido #{item.operador.sucursal} -
              </Text>
              <Text
                allowFontScaling={false}
                style={{fontSize: 18, color: 'black', fontWeight: 'bold'}}>
                {' '}
                {item.operador.nro_pedido}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: 'grey', fontSize: 18}}>
                {item.fecha} - {item.hora}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: '#303134', fontSize: 16}}>
                Cliente :{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {item.tercero.nombre}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: '#303134', fontSize: 16}}>
                Sincronizado :{' '}
              </Text>
              <View>
                <Badge
                  style={
                    item.sincronizado == 'S'
                      ? {backgroundColor: 'green'}
                      : {backgroundColor: 'red'}
                  }>
                  {item.sincronizado == 'S' ? 'Si' : 'No'}
                </Badge>
              </View>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: '#303134', fontSize: 16}}>
                Valor total :{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {formatToMoney(item.valorPedido)}
              </Text>
            </View>
          </View>

          <View>
            <Icon name="chevron-right" size={20} color="#303134"></Icon>
          </View>
        </View>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isShowPedidosFinder}
        onDismiss={hidePedidosFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text allowFontScaling={false} style={styles.title}>
            Busqueda de pedidos
          </Text>

          <IconButton
            icon="close"
            iconColor="#365AC3"
            size={25}
            onPress={hidePedidosFinder}
            style={styles.iconClose}
          />
        </View>

        <View>
          <IconLeftInput
            value={inputs.pedido}
            label="Buscar pedido"
            name="pedido"
            mode="flat"
            keyboardType="default"
            icon="magnify"
            handleInputChange={handleInputChange}
          />
        </View>

        <SafeAreaView>
          <VirtualizedList
            data={pedidos.filter(
              pedido =>
                pedido.tercero.codigo.includes(inputs.pedido.toUpperCase()) ||
                pedido.tercero.nombre.includes(inputs.pedido.toUpperCase()) ||
                pedido.operador.nro_pedido.toString().includes(inputs.pedido),
            )}
            renderItem={renderItem}
            getItemCount={data => data.length}
            getItem={(data, index) => data[index]}
            keyExtractor={(item, index) => index.toString()}
          />
        </SafeAreaView>
      </Modal>
    );
  },
);

export {PedidosFinder};
