import React, {useEffect, useState, useRef, useCallback} from 'react';
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
import {useNavigation} from '@react-navigation/native';

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
  const navigation: any = useNavigation(); // Obtener el objeto de navegación
  // const {showDecisionAlert} = decisionAlertContext();
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
  const [noMoreAwayUbication, setNoMoreAwayUbication] = useState(false);

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

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      sucursal: objOperador?.sucursal || '',
      consecutivo: objOperador?.nro_pedido || 0,
      cod_vendedor: objOperador?.cod_vendedor || '',
      almacen: state.almacen || ArrAlmacenes?.[0]?.codigo || 'ALM01', // Mantener selección si ya existe
      identificacion: objTercero?.codigo || '',
      descripcionCliente: objTercero?.nombre || '',
      direccion: objTercero?.direcc || '',
      telefono: objTercero?.tel || '',
      clasificacion: objTercero?.clasificacion || '',
      plazo: objTercero?.plazo?.toString() || '',
      formaPago: objTercero?.f_pago || prevState.formaPago || '01', // Mantener selección o default de tercero
      saldoCartera: formatToMoney(intCartera || 0),
      // No es necesario sincronizar state.articulosAdded con arrProductAdded aquí
      // si estructurarPedido y validateBeforeSaving usan directamente arrProductAdded de Redux.
    }));
  }, [objOperador, objTercero, intCartera, ArrAlmacenes]);

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

  const handleModalSubmit = (data: {observacion: string; status: boolean}) => {
    console.log('AwayFromUbication onSubmit en Padre - data:', data);

    // 1. Actualiza el estado del componente padre con la observación del modal
    setState(prevState => ({
      ...prevState,
      observaciones: data.observacion,
    }));

    // 2. Cierra el modal (ya lo haces en tu código original)
    setIsModalVisible(false);

    // 3. Ejecuta la lógica de navegación CONDICIONALMENTE basada en data.status
    if (data.status === false) {
      console.log('Modal observation data,' + data.observacion);
      // Solo navega si el modal indicó un flujo que NO era el de "guardar observación por estar fuera de zona"
      // (Es decir, para los casos donde locationStatus fue 0, 1, 2, o 99 en el modal)
      requestAnimationFrame(() => {
        // Usar requestAnimationFrame para suavizar la transición
        if (navigation.canGoBack()) {
          console.log('Navegando hacia atrás (modal status: false)');
          navigation.goBack();
        } else {
          console.log('Navegando a TabNavPrincipal (modal status: false)');
          navigation.navigate('TabNavPrincipal'); // Reemplaza 'TabNavPrincipal' con tu ruta principal
        }
      });
    } else {
      // data.status === true (esto significa que fue el caso locationStatus === 3 y se guardó la observación)
      // En este escenario, solo cerramos el modal (ya hecho con setIsModalVisible(false)) y no navegamos.
      console.log(
        'Observación por estar fuera de zona guardada. No se navega.',
      );
    }
  };

  const toggleSaveOrder = async () => {
    setIsLoadingSave(true);
    let pedidoGuardadoConExitoEnServidorYDb = false;
    let pedidoGuardadoConExitoEnDbOnly; // Para controlar el flujo final

    try {
      console.log('[SAVE_ORDER] Iniciando validaciones...');
      validateBeforeSaving(); // Puede lanzar ValidationsBeforeSavingError
      console.log('[SAVE_ORDER] Validaciones OK.');

      console.log('[SAVE_ORDER] Obteniendo ubicación...');
      const {latitude, longitude} = await getUbication(); // Puede lanzar error si falla la ubicación
      console.log(`[SAVE_ORDER] Ubicación: ${latitude},${longitude}`);

      const pedidoBase = estructurarPedido({latitude, longitude});
      console.log('[SAVE_ORDER] Pedido base estructurado.');

      const pedidosApiService = new PedidosApiService(
        objConfig.direccionIp,
        objConfig.puerto,
      );

      try {
        console.log('[SAVE_ORDER] Intentando guardar en API...');
        await pedidosApiService._savePedido(pedidoBase as IOperation, 'post'); // El 'as IOperation' es por si pedidoBase es Omit<IOperation, 'id'>
        console.log('[SAVE_ORDER] Guardado en API exitoso.');

        // Si API tiene éxito, guarda localmente como sincronizado
        const pedidoConIdDesdeBD = await pedidosService.savePedido({
          ...pedidoBase,
          sincronizado: 'S',
          guardadoEnServer: 'S',
        } as IOperation); // Asumimos que savePedido espera IOperation

        if (!pedidoConIdDesdeBD || pedidoConIdDesdeBD.id === undefined) {
          throw new Error(
            'Fallo al guardar en BD local (después de API) o no se obtuvo ID.',
          );
        }

        dispatch(setArrPedido([...arrPedidos, pedidoConIdDesdeBD])); // Usar el objeto con ID
        Toast.show({type: 'success', text1: 'Pedido guardado y sincronizado!'});
        pedidoGuardadoConExitoEnServidorYDb = true;
      } catch (apiError: any) {
        console.warn(
          '[SAVE_ORDER] Fallo el guardado en API. Revisando error...',
        );
        console.warn(
          `[SAVE_ORDER] API Error Details: Name: ${apiError.name}, Message: ${apiError.message}`,
        );
        // Para ver más detalles del error de red:
        // console.warn('[SAVE_ORDER] API Error Completo:', JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)));

        // Comprobación más robusta para errores de red/offline
        const esErrorDeRed =
          apiError instanceof ApiSaveOrderError || // Tu error personalizado
          (apiError.message &&
            (apiError.message
              .toLowerCase()
              .includes('network request failed') ||
              apiError.message.toLowerCase().includes('failed to fetch') ||
              apiError.message.toLowerCase().includes('offline') ||
              apiError.message.toLowerCase().includes('timeout') || // Podría ser timeout de red
              apiError.name === 'TypeError')); // A veces 'TypeError: Network request failed'

        if (esErrorDeRed) {
          Toast.show({
            type: 'info',
            text1: 'Sin conexión o fallo de API.',
            text2: 'Guardando pedido localmente...',
          });
          await saveOrderInLocalDatabaseOnly(pedidoBase); // Pasar pedidoBase para no recalcular
          pedidoGuardadoConExitoEnDbOnly = true; // Guardado local exitoso
        } else {
          // Otro tipo de error de la API (ej. 4xx, 5xx que no son puramente de red)
          // o un error inesperado durante el proceso de guardado en API.
          throw apiError; // Re-lanzar para que lo capture el catch principal
        }
      }

      // Si se guardó exitosamente (en API y local, o solo local como fallback)
      if (pedidoGuardadoConExitoEnServidorYDb) {
        console.log('[SAVE_ORDER] Actualizando operador y UI...');
        dispatch(
          setObjOperator({
            ...objOperador,
            nro_pedido: (Number(objOperador.nro_pedido) || 0) + 1,
          }),
        );
        // Limpiar productos añadidos para el próximo pedido
        visitaRealizada(pedidoBase.valorPedido); // Marcar visita como realizada con el valor del pedido
        resetStateAndNavigate(); // Resetear el formulario y navegar
      } else if (pedidoGuardadoConExitoEnDbOnly) {
        // Si solo se guardó localmente
        console.log('[SAVE_ORDER] Pedido guardado localmente, pero no en API.');
        visitaRealizada(pedidoBase.valorPedido);
        resetStateAndNavigate(); // Resetear el formulario y navegar
      }
    } catch (error: any) {
      // Catch para ValidationsBeforeSavingError, error de getUbication, o errores de API no manejados por el catch anidado
      console.error('[SAVE_ORDER] Error general en el proceso:', error);
      if (error instanceof ValidationsBeforeSavingError) {
        Toast.show({type: error.details.type, text1: error.details.text1});
      } else {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description:
              error.message || 'Error desconocido al procesar el pedido.',
          }),
        );
      }
    } finally {
      setIsLoadingSave(false);
      console.log('[SAVE_ORDER] Proceso de guardado finalizado.');
    }
  };

  // Modificar saveOrderInLocalDatabaseOnly para aceptar el pedido base y no repetir lógica de UI
  const saveOrderInLocalDatabaseOnly = async (
    pedidoBase: Omit<IOperation, 'id'>,
  ): Promise<void> => {
    console.log('[SAVE_LOCAL_ONLY] Iniciando guardado local...');
    try {
      // Ya tenemos pedidoBase, no necesitamos getUbication ni estructurarPedido de nuevo
      const pedidoConId = await pedidosService.savePedido({
        ...pedidoBase,

        sincronizado: 'N',
        guardadoEnServer: 'N',
        operador: {
          ...pedidoBase.operador,
          nro_pedido: 0,
        },
      } as IOperation); // Asumimos que savePedido espera IOperation

      if (!pedidoConId || pedidoConId.id === undefined) {
        // Este error debería ser capturado por el catch de toggleSaveOrder si se re-lanza
        throw new Error(
          'Fallo al guardar localmente (saveOrderInLocalDatabaseOnly) o no se obtuvo ID.',
        );
      }

      // Las actualizaciones de Redux (arrPedido) y UI (Toast, reset) se manejarán
      // en el flujo principal de toggleSaveOrder si pedidoGuardadoConExitoEnAlgunLado es true.
      // Solo logueamos aquí o mostramos un Toast específico si es necesario.
      dispatch(setArrPedido([...arrPedidos, pedidoConId])); // Es importante añadirlo a Redux
      console.log(
        '[SAVE_LOCAL_ONLY] Pedido guardado localmente con ID:',
        pedidoConId.id,
      );
      Toast.show({type: 'success', text1: 'Pedido guardado localmente.'}); // Mensaje específico para este caso
    } catch (error: any) {
      console.error('[SAVE_LOCAL_ONLY] Error:', error);
      // El error será capturado por el catch de toggleSaveOrder si se re-lanza,
      // o podemos manejar un Toast específico aquí si no se re-lanza.
      // Por ahora, el error se propagará si esta función es llamada desde el try/catch anidado
      // y falla después de que la API falló.
      throw error; // Re-lanzar para que el catch principal de toggleSaveOrder pueda manejarlo
    }
    // No hay setIsLoadingSave(false) aquí, lo maneja el finally de toggleSaveOrder
  };
  const visitaRealizada = async (saleValue?: number) => {
    // saleValue ahora es opcional
    if (!objVisita || !objVisita.id_visita) return; // No hacer nada si no hay objVisita

    const valorVenta =
      saleValue !== undefined
        ? saleValue
        : arrProductAdded.reduce(
            // Recalcular si no se pasa
            (acumulator, articulo) => acumulator + articulo.valorTotal,
            0,
          );

    const modifiedVisita: IVisita = {
      ...objVisita,
      status: '1', // Visitado
      observation: state.observaciones,
      saleValue: valorVenta,
    };
    try {
      await visitaService.updateVisita(
        modifiedVisita,
        objVisita.id_visita.toString(),
      );
      dispatch(setObjVisita(modifiedVisita)); // Actualizar visita en Redux
    } catch (error) {
      console.error('Error al actualizar la visita:', error);
    }
  };

  const resetStateAndNavigate = () => {
    // Lógica de resetState
    setState({
      fechaPedido: moment().format('DD-MM-YYYY'),
      sucursal: objOperador.sucursal || '',
      consecutivo: Number(objOperador.nro_pedido || 0) + 1, // Ya incrementado en Redux, pero re-sincroniza
      cod_vendedor: objOperador.cod_vendedor || '',
      almacen: ArrAlmacenes?.[0]?.codigo || 'ALM01',
      identificacion: '',
      descripcionCliente: '',
      direccion: '',
      telefono: '',
      clasificacion: '',
      plazo: '',
      formaPago: '01',
      saldoCartera: '$0',
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
    setNoMoreAwayUbication(true); // Para que no vuelva a saltar el modal de ubicación al navegar
    dispatch(setArrProductAdded([])); // Limpiar productos añadidos en Redux
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

  const estructurarPedido = useCallback(
    ({
      latitude,
      longitude,
    }: {
      latitude: string;
      longitude: string;
    }): Omit<IOperation, 'id'> => {
      // Devuelve el objeto sin 'id'
      const totalValorPedido = arrProductAdded.reduce(
        // Usar arrProductAdded de Redux
        (acumulator, articulo) => acumulator + articulo.valorTotal,
        0,
      );

      return {
        // id: undefined, // No se define aquí
        tipo_operacion: 'pedido',
        fecha: moment(state.fechaPedido, 'DD-MM-YYYY')
          .toISOString()
          .slice(0, 10), // Convertir a YYYY-MM-DD
        hora: `${new Date().getHours().toString().padStart(2, '0')}:${new Date()
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${new Date()
          .getSeconds()
          .toString()
          .padStart(2, '0')}`,
        fechaTimestampUnix: new Date().getTime(),
        almacen: state.almacen,
        operador: objOperador, // Usar el de Redux
        tercero: objTercero, // Usar el de Redux
        articulosAdded: arrProductAdded, // Usar el de Redux
        formaPago: state.formaPago,
        // Asegúrate que fechaVencimiento se calcule correctamente
        fechaVencimiento:
          state.formaPago === '02' && objTercero.plazo
            ? moment(state.fechaPedido, 'DD-MM-YYYY')
                .add(objTercero.plazo, 'days')
                .format('YYYY-MM-DD')
            : moment(state.fechaPedido, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        valorPedido: totalValorPedido,
        observaciones: state.observaciones,
        ubicacion: {latitud: latitude, longitud: longitude},
        guardadoEnServer: 'N',
        sincronizado: 'N',
      };
    },
    [
      state.fechaPedido,
      state.almacen,
      state.formaPago,
      state.observaciones,
      objOperador,
      objTercero,
      arrProductAdded,
    ],
  );

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
        plazo: plazo?.toString(),
        saldoCartera: carteraSumada?.toString(),
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
          plazo: plazo?.toString(),
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
    setIsModalVisible(false);
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
        visible={isModalVisible && !noMoreAwayUbication}
        onClose={() => setIsModalVisible(false)}
        tercero={objTercero}
        onSubmit={data => handleModalSubmit(data)}
      />
    </View>
  );
};

export {ElaborarPedido};
