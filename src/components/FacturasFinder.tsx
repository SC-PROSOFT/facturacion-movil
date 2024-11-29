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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Text, Badge, Modal, IconButton} from 'react-native-paper';

/* components */
import {IconLeftInput} from '.';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {setIsShowFacturasFinder, setObjInfoAlert} from '../redux/slices';
/* local database services */
import {facturasService} from '../data_queries/local_database/services';
/* types */
import {IOperation} from '../common/types';
/* utils */
import {formatToMoney} from '../utils';

/* local types */
interface FacturasFinderProps {
  toggleFactura: (factura: IOperation) => void;
}

const FacturasFinder: React.FC<FacturasFinderProps> = React.memo(
  ({toggleFactura}) => {
    const dispatch = useAppDispatch();

    const isShowFacturasFinder = useAppSelector(
      store => store.facturasFinder.isShowFacturasFinder,
    );

    const [screenHeight, setScreenHeight] = useState(
      Dimensions.get('window').height,
    );

    const [inputs, setInputs] = useState({
      factura: '',
    });

    const [facturas, setFacturas] = useState<IOperation[]>([]);

    useEffect(() => {
      loadFacturas();
    }, [isShowFacturasFinder]);
    useEffect(() => {
      adjustScreenSize();
    }, []);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };
    const loadFacturas = async () => {
      if (isShowFacturasFinder) {
        try {
          const facturas = await facturasService.getAllFacturas();

          setFacturas(facturas);
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
        setFacturas([]);
      }
    };
    const hideFacturasFinder = (): void => {
      setFacturas([]);
      dispatch(setIsShowFacturasFinder(false));
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
          dispatch(setIsShowFacturasFinder(false));
          toggleFactura(item);
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
                Factura #{item.operador.sucursal} -
              </Text>
              <Text
                allowFontScaling={false}
                style={{fontSize: 18, color: 'black', fontWeight: 'bold'}}>
                {' '}
                {item.operador.nro_factura}
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
        visible={isShowFacturasFinder}
        onDismiss={hideFacturasFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text allowFontScaling={false} style={styles.title}>
            Busqueda de facturas
          </Text>

          <IconButton
            icon="close"
            iconColor="#365AC3"
            size={25}
            onPress={hideFacturasFinder}
            style={styles.iconClose}
          />
        </View>

        <View>
          <IconLeftInput
            value={inputs.factura}
            label="Buscar factura"
            name="factura"
            mode="flat"
            keyboardType="default"
            icon="magnify"
            handleInputChange={handleInputChange}
          />
        </View>

        <SafeAreaView>
          <VirtualizedList
            data={facturas.filter(
              factura =>
                factura.tercero.codigo.includes(inputs.factura.toUpperCase()) ||
                factura.tercero.nombre.includes(inputs.factura.toUpperCase()) ||
                factura.operador.nro_factura
                  .toString()
                  .includes(inputs.factura),
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

export {FacturasFinder};
