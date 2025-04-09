import React, {useEffect, useState, useRef} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {Card, Text} from 'react-native-paper';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* components */
import {
  CoolButton,
  ProductFinder,
  InputSelect,
  StandardInput,
  TercerosFinder,
  CarteraPopup,
  ProductSheet,
  ProductSheetEdit,
  ProductTable,
  HeaderActionButtons,
  Header,
  AwayFromUbication,
} from '../components';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {
  setObjTercero,
  setIsShowCarteraPopup,
  setArrCarteraPopup,
  setIsShowProductFinder,
  setIsShowProductSheet,
  setObjProduct,
  setObjInfoAlert,
  setObjOperator,
  setObjVisita,
  setArrProductAdded,
  setArrPedido,
  setIntCartera,
} from '../redux/slices';
/* local db */
import {
  carteraService,
  pedidosService,
  visitaService,
} from '../data_queries/local_database/services';
/* queries */
import {PedidosApiService} from '../data_queries/api/queries';
/* types */
import {
  IAlmacen,
  IProduct,
  ITerceros,
  IOperation,
  IProductAdded,
  IVisita,
} from '../common/types';
/* context */
import {decisionAlertContext} from '../context';
/* utils */
import {sumarCartera, formatToMoney, checkLocation} from '../utils';
import {generarPDF} from '../prints/generarPdf';
import {getUbication} from '../utils/getUbication';

/* errors */
import {
  ValidationsBeforeSavingError,
  ApiSaveOrderError,
} from '../common/errors';

/* local types */
interface State {
  fechaPedido: string;

  sucursal: string;
  consecutivo: number;
  cod_vendedor: string;
  almacen: string;

  identificacion: string;
  descripcionCliente: string;
  direccion: string;
  telefono: string;
  clasificacion: string;
  plazo: string;
  formaPago: '01' | '02';
  saldoCartera: string;

  titulo: string;
  codigo: string;
  descripcionPedido: string;
  cantidad: string;
  valorBase: string;
  valorDcto: string;
  valorIva: string;
  valorTotal: string;
  total: string;

  articulosAdded: IProductAdded[];
  observaciones: string;
}
interface InfoGeneralProps {
  state: State;
  handleInputChange: Function;
  arrAlmacenes: IAlmacen[];
  selectAlmacen: (almacen: string) => void;
}
interface InfoClienteProps {
  handleInputChange: Function;
  toggleValidateCartera: () => void;
}
interface InfoPedidoProps {
  detalleProducto: {
    titulo: string;
    valorTitulo: string;
    codigo: string;
    descripcion: string;
    cantidad: string;
    valorBase: string;
    valorDcto: string;
    valorIva: string;
    valorTotal: string;
  }[];
  state: State;
  handleInputChange: (input: string, text: string) => void;
  validateBeforeSaving: Function;
  toggleAddArticulos: () => void;
}
interface detalleProductoState {
  titulo: string;
  valorTitulo: string;
  codigo: string;
  descripcion: string;
  cantidad: string;
  valorBase: string;
  valorDcto: string;
  valorIva: string;
  valorTotal: string;
}

const InfoGeneral: React.FC<InfoGeneralProps> = ({
  state,
  arrAlmacenes,
  selectAlmacen,
}) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 5,
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 1,
      paddingBottom: 6,
      marginBottom: 5,
      borderBottomColor: '#365AC3',
      borderBottomWidth: 2,
    },
    textTitle: {
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    switchColumn: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      color: '#0B2863',
    },
    containerText: {
      backgroundColor: '#F3f3f3',
      borderRadius: 8,
      marginBottom: 4,
    },
    text: {
      marginLeft: 5,
      fontSize: 18,
      color: '#4d4d4d',
    },
    twoInputs: {
      width: '49%',
    },
    threeInputs: {
      width: '33%',
    },
    soloInputs: {
      width: '100%',
    },
    switchTitle: {
      color: 'grey',
      fontSize: 18,
    },
    containerButton: {
      alignItems: 'center',
      height: 50,
      width: '100%',
      marginTop: 5,
      marginBottom: 15,
    },
    button: {
      width: '70%',
    },
    iconButton: {
      marginRight: 40,
      width: '20%',
    },
    inputObservaciones: {
      width: '100%',
      height: '100%',
    },
    totalPedido: {
      width: '100%',
      marginTop: 50,
    },
  });

  return (
    <Card style={styles.container} elevation={2}>
      <View style={styles.title}>
        <Icon
          name="book-information-variant"
          color={'black'}
          size={20}
          style={{marginRight: 3}}
        />
        <Text allowFontScaling={false} style={styles.textTitle}>
          Informacion General
        </Text>
      </View>

      <View style={styles.switchRow}>
        <View style={[styles.switchColumn, {width: '39%'}]}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Fecha de pedido'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.fechaPedido}
            </Text>
          </View>
        </View>

        <View style={[styles.twoInputs, {width: '29%'}]}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Sucursal'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.sucursal}
            </Text>
          </View>
        </View>

        <View style={[styles.twoInputs, {width: '29%'}]}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Consecutivo'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.consecutivo}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={{width: '29%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Vendedor'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.cod_vendedor}
            </Text>
          </View>
        </View>

        <View style={{width: '69%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Almacén'}
          </Text>
          <View style={styles.containerText}>
            <InputSelect
              value={state.almacen}
              values={arrAlmacenes}
              selectValue={selectAlmacen}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};

const InfoCliente: React.FC<InfoClienteProps> = ({
  handleInputChange,
  toggleValidateCartera,
}) => {
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const intCartera = useAppSelector(store => store.tercerosFinder.intCartera);
  const objVisita = useAppSelector(store => store.visitas.objVisita);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      marginTop: 20,
      padding: 10,
      borderRadius: 5,
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 1,
      paddingBottom: 6,
      marginBottom: 5,
      borderBottomColor: '#365AC3',
      borderBottomWidth: 2,
    },
    textTitle: {
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    switchColumn: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: 'grey',
    },
    containerText: {
      backgroundColor: '#F3f3f3',
      borderRadius: 8,
      marginBottom: 4,
    },
    text: {
      marginLeft: 5,
      fontSize: 18,
      color: '#4d4d4d',
    },
    twoInputs: {
      width: '49%',
    },
    threeInputs: {
      width: '33%',
    },
    switchTitle: {
      color: 'grey',
      fontSize: 18,
    },
    divider: {
      marginTop: 15,
      marginBottom: 15,
    },
    containerButton: {
      alignItems: 'center',
      height: 50,
      width: '100%',
    },
    button: {
      width: '100%',
      marginBottom: 10,
    },
    iconButton: {
      marginRight: 40,
      width: '20%',
    },
    inputObservaciones: {
      width: '100%',
      height: '100%',
    },
    totalPedido: {
      width: '100%',
      marginTop: 50,
    },
    buttonPicker: {
      color: '#000',
      marginHorizontal: 20,
    },
    itemStyles: {
      backgroundColor: 'red',
      color: 'red',
    },
  });

  return (
    <Card style={styles.container} elevation={2}>
      <View style={styles.title}>
        <Icon
          name="account-box"
          color={'black'}
          size={22}
          style={{marginRight: 3}}
        />
        <Text allowFontScaling={false} style={styles.textTitle}>
          Informacion de cliente
        </Text>
      </View>

      <View style={[styles.switchColumn, {flexDirection: 'column'}]}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Descripción'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={[styles.containerText, {width: '100%'}]}>
            <Text allowFontScaling={false} style={styles.text}>
              {objTercero.nombre}
            </Text>
          </View>

          {/* <TouchableOpacity
            style={{backgroundColor: '#0B2863', padding: 2, borderRadius: 5}}
            onPress={() => toggleSearchClient()}>
            <Icon name="account-search" size={32} color={'#FFF'} />
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{width: '29%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Identificación'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {objTercero.codigo}
            </Text>
          </View>
        </View>

        <View style={{width: '39%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Dirección'}
          </Text>
          <View style={styles.containerText}>
            <Text
              allowFontScaling={false}
              style={styles.text}
              numberOfLines={1}>
              {objTercero.direcc}
            </Text>
          </View>
        </View>

        <View style={{width: '29%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Teléfono'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {objTercero.tel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={{width: '29%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Clasif'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {objTercero.clasificacion}
            </Text>
          </View>
        </View>

        <View style={{flexBasis: '19%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Plazo'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {objTercero.plazo}
            </Text>
          </View>
        </View>

        <View style={[, {width: '49%'}]}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Forma de pago'}
          </Text>

          <View style={styles.containerText}>
            <Picker
              mode="dropdown"
              selectedValue={objTercero.f_pago}
              onValueChange={itemValue =>
                handleInputChange('formaPago', itemValue)
              }
              dropdownIconColor="black"
              itemStyle={styles.itemStyles}
              style={styles.buttonPicker}>
              <Picker.Item label="Contado" value="01" />
              <Picker.Item label="Credito" value="02" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={[styles.switchColumn, {flexDirection: 'column'}]}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Saldo de cartera'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={[styles.containerText, {width: '88%'}]}>
            <Text allowFontScaling={false} style={styles.text}>
              {formatToMoney(intCartera)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleValidateCartera()}
            style={{
              backgroundColor: '#0B2863',
              padding: 5,
              borderRadius: 5,
            }}>
            <Icon name="text-box-search-outline" size={26} color={'#FFF'} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const InfoPedido: React.FC<InfoPedidoProps> = ({
  state,
  handleInputChange,
  toggleAddArticulos,
}) => {
  const arrProductAdded = useAppSelector(
    state => state.product.arrProductAdded,
  );

  const calculateTotalOrder = () => {
    let totalOrder = 0;

    arrProductAdded.forEach(article => {
      totalOrder = totalOrder + article.valorTotal;
    });

    return formatToMoney(totalOrder);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      marginTop: 20,
      padding: 10,
      borderRadius: 5,
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 1,
      paddingBottom: 6,
      marginBottom: 5,
      borderBottomColor: '#365AC3',
      borderBottomWidth: 2,
    },
    textTitle: {
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    switchRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    twoInputs: {
      width: '49%',
    },
    threeInputs: {
      width: '33%',
    },
    switchTitle: {
      color: 'grey',
      fontSize: 18,
    },
    containerTitulo: {
      // color: 'black',
      marginHorizontal: 5,
      marginTop: 15,
      fontSize: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    titulo: {
      color: 'black',
      fontSize: 18,
    },
    valor: {
      color: 'grey',
      fontSize: 18,
    },
    divider: {
      marginTop: 15,
      marginBottom: 15,
    },
    containerButton: {
      alignItems: 'center',
      height: 50,
      width: '100%',
      marginBottom: 20,
    },

    iconButton: {
      marginRight: 40,
      width: '20%',
    },
    containerListTitle: {
      display: 'flex',
      width: 240,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    listTitle: {
      color: 'black',
      fontWeight: 'bold',
    },
    listTitle2: {
      color: 'black',
      fontFamily: 'arial',
    },
    containerItemListRight: {
      width: '95%',
      flexDirection: 'row',
      paddingHorizontal: 15,
    },
    titleItemListRight: {
      width: '60%',
      color: 'black',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    textItemListRight: {
      width: '40%',
      color: 'black',
      fontFamily: 'arial',
      textAlign: 'right',
    },
    containerItemListLeft: {
      width: '95%',
      flexDirection: 'row',
      paddingHorizontal: 15,
    },
    titleItemListLeft: {
      width: '40%',
      color: 'black',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    textItemListLeft: {
      width: '60%',
      color: 'black',
      fontFamily: 'arial',
      textAlign: 'left',
    },
    inputObservaciones: {
      width: '100%',
      height: '100%',
    },
    totalPedido: {
      width: '50%',
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    labelTotal: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'grey',
      flexBasis: '50%',
    },
    containerTextTotal: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 4,
      paddingHorizontal: 5,
    },
    textTotal: {
      marginLeft: 5,
      fontSize: 14,
      color: '#4d4d4d',
      fontWeight: 'bold',
    },
    iconsArticuloAdded: {
      width: '100%',
      alignItems: 'flex-end',
    },
  });

  return (
    <Card style={styles.container} elevation={2}>
      <View style={styles.title}>
        <Icon
          name="receipt"
          color={'black'}
          size={20}
          style={{marginRight: 3}}
        />
        <Text allowFontScaling={false} style={styles.textTitle}>
          Informacion de productos
        </Text>
      </View>

      <View>
        <ProductTable />
      </View>

      <View style={[styles.switchRow, {alignItems: 'center'}]}>
        <View style={{width: '45%', marginTop: 5}}>
          <CoolButton
            value="Agregar Productos"
            iconName="package-variant"
            colorButton="#0B2863"
            colorText="white"
            iconSize={25}
            fontSize={14}
            pressCoolButton={toggleAddArticulos}
          />
        </View>

        <View style={styles.totalPedido}>
          <Text allowFontScaling={false} style={styles.labelTotal}>
            {'Total Pedido:'}
          </Text>
          <View style={styles.containerTextTotal}>
            <Text allowFontScaling={false} style={styles.textTotal}>
              {calculateTotalOrder()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.inputObservaciones}>
          <StandardInput
            value={state.observaciones}
            label="Observaciones"
            name="observaciones"
            mode="outlined"
            keyboardType="default"
            onChange={handleInputChange}
          />
        </View>
      </View>
    </Card>
  );
};

const ElaborarPedido: React.FC = () => {
  const dispatch = useAppDispatch();

  const {showDecisionAlert} = decisionAlertContext();

  const ArrAlmacenes = useAppSelector(store => store.sync.arrAlmacenes);
  const objOperador = useAppSelector(store => store.operator.objOperator);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const arrCartera = useAppSelector(store => store.sync.arrCartera);
  const objConfig = useAppSelector(store => store.config.objConfig);
  const objVisita = useAppSelector(store => store.visitas.objVisita);
  const arrProductAdded = useAppSelector(
    state => state.product.arrProductAdded,
  );
  const arrPedidos = useAppSelector(store => store.tercerosFinder.arrPedido);
  const intCartera = useAppSelector(store => store.tercerosFinder.intCartera);

  const scrollViewRef = useRef<any>(null);

  const [state, setState] = useState<State>({
    fechaPedido: '',

    sucursal: '',
    consecutivo: 0,
    cod_vendedor: '',
    almacen: 'ALM01', // valor por defecto

    identificacion: '',
    descripcionCliente: '',
    direccion: '',
    telefono: '',
    clasificacion: '',
    plazo: '',
    formaPago: objTercero.f_pago,
    saldoCartera: '',

    titulo: '',
    codigo: '',
    descripcionPedido: '',
    cantidad: '',
    valorBase: '',
    valorDcto: '',
    valorIva: '',
    valorTotal: '',
    total: '',

    articulosAdded: [],
    observaciones: '',
  });
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const [detalleProducto, setDetalleProducto] = useState<
    detalleProductoState[]
  >([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    const initialize = async () => {
      const ubi = await checkUbication();
      if (ubi) {
        loadOperator();
        loadCartera();
      }
    };

    initialize();
  }, [objOperador]);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({animated: true});
        }
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Aqui se pueden poder accines adicionales cuando se oculte el teclado
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const checkUbication = async () => {
    setIsModalVisible(true);
    try {
      const res = await checkLocation(
        objTercero.latitude,
        objTercero.longitude,
      );
      switch (res) {
        case 0:
        case 3:
          return true;
        case 1:
        case 2:
        case 99:
          return false;
        default:
          return false;
      }
    } catch (error: any) {
      return false;
    }
  };
  const loadCartera = async () => {
    try {
      const cartera = await carteraService.getCarteraByAttribute(
        'nit',
        objTercero.codigo,
      );
      const carteraSumada = sumarCartera(cartera);
      dispatch(setIntCartera(carteraSumada));
      //🟦
    } catch (error: any) {
      console.log('Error al cargar la cartera', error);
      if (error === 'no hay cartera pendiente') {
        return;
      } else {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error,
          }),
        );
      }
    }
  };
  const loadOperator = () => {
    const {sucursal, nro_pedido} = objOperador;

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    setState(prevState => ({
      ...prevState,
      cod_vendedor: objOperador.cod_vendedor,
      sucursal: sucursal,
      consecutivo: nro_pedido,
      fechaPedido: formattedDate,
    }));
  };
  const selectAlmacen = (almacen: string) => {
    setState(prevState => ({...prevState, almacen}));
  };
  const handleInputChange = (input: string, text: string) => {
    setState(prevState => ({...prevState, [input]: text}));
  };
  const toggleSaveOrder = async () => {
    setIsLoadingSave(true);
    const pedidosApiService = new PedidosApiService(
      objConfig.direccionIp,
      objConfig.puerto,
    );

    try {
      validateBeforeSaving();
      const {latitude, longitude} = await getUbication();
      const pedido = estructurarPedido({latitude, longitude});
      // await pedidosApiService._savePedido(pedido, 'post');
      await pedidosService.savePedido({
        ...pedido,
        sincronizado: 'N',
        guardadoEnServer: 'N',
      });
      dispatch(
        setObjOperator({
          ...pedido.operador,
          nro_pedido: Number(pedido.operador.nro_pedido) + 1,
        }),
      );
      dispatch(setArrProductAdded([]));
      dispatch(setArrPedido([...arrPedidos, pedido]));
      resetState();
      // await generarPDF(pedido, objConfig, 'pedido');
      Toast.show({
        type: 'success',
        text1: 'Pedido guardado en el servidor correctamente',
      });

      setIsLoadingSave(false);
      visitaRealizada();
    } catch (error: any) {
      if (error instanceof ValidationsBeforeSavingError) {
        Toast.show({
          type: error.details.type,
          text1: error.details.text1,
        });
        setIsLoadingSave(false);
      } else if (error instanceof ApiSaveOrderError) {
        saveOrderInLocalDatabaseOnly();
        visitaRealizada();
      } else {
        console.log('Save err' + error);
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error.message,
          }),
        );
        setIsLoadingSave(false);
      }
    }
  };

  const visitaRealizada = async () => {
    const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD

    // Verificar si la visita coincide con la fecha de hoy
    if (objVisita.appointmentDate !== today) {
      console.error('No se encontró una visita para la fecha de hoy.');
      return;
    }

    // Crear el objeto modificado para la visita de hoy
    const modifiedVisita: IVisita = {
      ...objVisita,
      status: '1', // Cambiar el estado a "visitado"
      observation: state.observaciones, // Agregar la observación
    };

    try {
      // Actualizar la visita
      await visitaService.updateVisita(modifiedVisita, objVisita.id_tercero);
    } catch (error) {
      console.error('Error al actualizar la visita:', error);
    }
  };

  const saveOrderInLocalDatabaseOnly = async (): Promise<void> => {
    try {
      const {latitude, longitude} = await getUbication();
      const order = estructurarPedido({latitude, longitude});

      await pedidosService.savePedido({...order, sincronizado: 'N'});
      dispatch(
        setObjOperator({
          ...order.operador,
          nro_pedido: Number(order.operador.nro_pedido) + 1,
        }),
      );
      resetState();
      Toast.show({
        type: 'success',
        text1: 'Pedido guardado correctamente',
      });
      setIsLoadingSave(false);
    } catch (error: any) {
      console.log('Save Order' + error);
      setIsLoadingSave(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message,
        }),
      );
    }
  };
  const validateBeforeSaving = (): boolean => {
    const geoLocalizacion = false; // En desarrollo 07/09/2023

    const {almacen, identificacion} = state;

    if (objConfig.seleccionarAlmacen && almacen == '') {
      throw new ValidationsBeforeSavingError(
        'Error en las validaciones de pre guardado',
        {
          type: 'info',
          text1: 'Debes seleccionar un almacen',
        },
      );
    } else if (objTercero.codigo == '') {
      throw new ValidationsBeforeSavingError(
        'Error en las validaciones de pre guardado',
        {
          type: 'info',
          text1: 'No ha seleccionado un cliente',
        },
      );
    } else if (arrProductAdded.length < 1) {
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
  const estructurarPedido = ({
    latitude,
    longitude,
  }: {
    latitude: string;
    longitude: string;
  }): IOperation => {
    return {
      tipo_operacion: 'pedido',
      //fecha: new Date().toISOString().slice(0, 10).replaceAll('-', '/'),
      fecha: new Date().toISOString().slice(0, 10),
      hora: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
      fechaTimestampUnix: new Date().getTime(),
      almacen: state.almacen,

      operador: objOperador,
      tercero: objTercero,
      articulosAdded: arrProductAdded,

      formaPago: state.formaPago,
      fechaVencimiento: moment().add(1, 'days').format('YYYYMMDD'),
      valorPedido: state.articulosAdded.reduce(
        (acumulator, articulo) => acumulator + articulo.valorTotal,
        0,
      ),
      observaciones: state.observaciones,
      ubicacion: {
        latitud: latitude,
        longitud: longitude,
      },
      guardadoEnServer: 'N', // solo estoy inicializando
      sincronizado: 'N', // solo estoy inicializando
    };
  };
  const toggleProduct = (product: IProduct) => {
    dispatch(setIsShowProductSheet(true));
    dispatch(setObjProduct(product));
  };
  const toggleTercero = async (tercero: ITerceros) => {
    const {codigo, nombre, direcc, tel, clasificacion, plazo} = tercero;

    try {
      const cartera = await carteraService.getCarteraByAttribute('nit', codigo);
      const carteraSumada = sumarCartera(cartera);

      setState(prevState => ({
        ...prevState,
        identificacion: codigo,
        descripcionCliente: nombre,
        direccion: direcc,
        telefono: tel,
        clasificacion: clasificacion,
        plazo: plazo.toString(),
        saldoCartera: carteraSumada.toString(),
      }));
    } catch (error) {
      if (error == 'no hay cartera pendiente') {
        setState(prevState => ({
          ...prevState,
          identificacion: codigo,
          descripcionCliente: nombre,
          direccion: direcc,
          telefono: tel,
          clasificacion: clasificacion,
          plazo: plazo.toString(),
          saldoCartera: '0',
        }));
      }
    }

    dispatch(setObjTercero(tercero));
  };
  const toggleValidateCartera = () => {
    if (intCartera > 0) {
      const carteraFilter = arrCartera.filter(
        cartera => cartera.nit == objTercero.codigo,
      );

      dispatch(setArrCarteraPopup(carteraFilter));
      dispatch(setIsShowCarteraPopup(true));
    } else {
      Toast.show({
        type: 'info',
        text1: 'No hay cartera pendiente',
      });
    }
  };
  const toggleAddArticulos = () => {
    if (objTercero.codigo == '') {
      Toast.show({
        type: 'info',
        text1: 'No ha seleccionado un cliente',
      });
    } else {
      dispatch(setIsShowProductFinder(true));
    }
  };
  const resetState = () => {
    setState(state => ({
      ...state,

      almacen: 'ALM01', // valor por defecto

      identificacion: '',
      descripcionCliente: '',
      direccion: '',
      telefono: '',
      clasificacion: '',
      plazo: '',
      formaPago: objTercero.f_pago,
      saldoCartera: '',

      titulo: '',
      codigo: '',
      descripcionPedido: '',
      cantidad: '',
      valorBase: '',
      valorDcto: '',
      valorIva: '',
      valorTotal: '',
      total: '',

      observaciones: '',
      articulosAdded: [],
    }));
  };
  const styles = StyleSheet.create({
    container: {
      marginBottom: 23,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    title: {
      color: 'black',
      fontWeight: 'bold',
      fontSize: 22,
    },
  });

  return (
    <View>
      <View>
        <Header>
          <HeaderActionButtons />
        </Header>
      </View>

      <ScrollView
        style={styles.container}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="always">
        <View>
          <InfoGeneral
            state={state}
            handleInputChange={handleInputChange}
            arrAlmacenes={ArrAlmacenes}
            selectAlmacen={selectAlmacen}
          />
        </View>
        <View>
          <InfoCliente
            handleInputChange={handleInputChange}
            toggleValidateCartera={toggleValidateCartera}
          />
        </View>
        <View>
          <InfoPedido
            detalleProducto={detalleProducto}
            state={state}
            validateBeforeSaving={validateBeforeSaving}
            toggleAddArticulos={toggleAddArticulos}
            handleInputChange={handleInputChange}
          />
        </View>

        <View style={{marginTop: 10, paddingBottom: 120}}>
          <CoolButton
            value={isLoadingSave ? '' : 'Guardar Pedido'}
            pressCoolButton={toggleSaveOrder}
            colorButton="#19C22A"
            iconName="download"
            colorText="#fff"
            iconSize={20}
            loading={isLoadingSave}
          />
        </View>
      </ScrollView>

      <TercerosFinder toggleTercero={toggleTercero} searchTable="terceros" />
      <ProductFinder toggleProduct={toggleProduct} />
      <CarteraPopup />
      <ProductSheet />
      <ProductSheetEdit />
      <AwayFromUbication
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        tercero={objTercero}
        onSubmit={data => {
          setState(prevState => ({
            ...prevState,
            observaciones: data.observacion,
          }));
          setIsModalVisible(false);
        }}
      />
    </View>
  );
};

export {ElaborarPedido};
