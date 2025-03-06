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
import {Picker} from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
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
  Header,
  HeaderActionButtons,
  ProductTable,
} from '../components';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {
  setIsShowTercerosFinder,
  setObjTercero,
  setIsShowCarteraPopup,
  setArrCarteraPopup,
  setIsShowProductFinder,
  setIsShowProductSheet,
  setObjProduct,
  setObjInfoAlert,
  setObjOperator,
  setIntIndexProduct,
  setObjProductAdded,
  setIsShowProductSheetEdit,
  setArrFactura,
  setArrProductAdded,
} from '../redux/slices';
/* local db */
import {
  carteraService,
  facturasService,
  articulosService,
} from '../data_queries/local_database/services';
/* types */
import {
  IAlmacen,
  IProduct,
  ITerceros,
  IProductAdded,
  IOperation,
} from '../common/types';
/* context */
import {decisionAlertContext} from '../context';
import {FacturasApiService} from '../data_queries/api/queries';
/* errors */
import {
  ValidationsBeforeSavingError,
  ApiSaveInvoiceError,
} from '../common/errors';
/* utils */
import {formatToMoney} from '../utils';
import {generarPDF} from '../prints/generarPdf';
import {getUbication} from '../utils/getUbication';
import {sumarCartera} from '../utils';

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
  formaPago: '01' | '02'; // 01 contado, 02 credito
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
  observaciones: '';
}
interface InfoGeneralProps {
  state: State;
  handleInputChange: Function;
  arrAlmacenes: IAlmacen[];
  selectAlmacen: (almacen: string) => void;
}
interface InfoClienteProps {
  state: State;
  handleInputChange: Function;
  toggleSearchClient: Function;
  toggleValidateCartera: () => void;
}
interface InfoFacturaProps {
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
      borderRadius: 10,
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
          <View style={[]}>
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
  state,
  handleInputChange,
  toggleSearchClient,
  toggleValidateCartera,
}) => {
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      marginTop: 20,
      padding: 10,
      borderRadius: 10,
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
              {formatToMoney(Number(state.saldoCartera))}
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

const InfoFactura: React.FC<InfoFacturaProps> = ({
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
      borderRadius: 10,
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

const ElaborarFactura: React.FC = () => {
  const dispatch = useAppDispatch();

  const {showDecisionAlert} = decisionAlertContext();

  const scrollViewRef = useRef<any>(null);

  const ArrAlmacenes = useAppSelector(store => store.sync.arrAlmacenes);
  const objOperador = useAppSelector(store => store.operator.objOperator);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const arrCartera = useAppSelector(store => store.sync.arrCartera);
  const objConfig = useAppSelector(store => store.config.objConfig);
  const arrProductAdded = useAppSelector(
    state => state.product.arrProductAdded,
  );
  const arrFacturas = useAppSelector(store => store.tercerosFinder.arrFactura);

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

  const [detalleProducto, setDetalleProducto] = useState<
    detalleProductoState[]
  >([]);

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    loadOperator();
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
        // Puedes realizar acciones adicionales cuando se oculte el teclado si lo deseas
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadOperator = () => {
    const {sucursal, nro_factura} = objOperador;

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    setState(prevState => ({
      ...prevState,
      cod_vendedor: objOperador.cod_vendedor,
      sucursal: sucursal,
      consecutivo: Number(nro_factura),
      fechaPedido: formattedDate,
    }));
  };
  const selectAlmacen = (almacen: string) => {
    setState(prevState => ({...prevState, almacen}));
  };
  const handleInputChange = (input: string, text: string) => {
    setState(prevState => ({...prevState, [input]: text}));
  };
  const toggleSaveInvoice = async () => {
    setIsLoadingSave(true);
    const facturasApiService = new FacturasApiService(
      objConfig.direccionIp,
      objConfig.puerto,
    );

    try {
      validateBeforeSaving();
      const {latitude, longitude} = await getUbication();
      const factura = estructurarFactura({latitude, longitude});
      await facturasApiService._saveFactura(factura, 'post');
      await facturasService.saveFactura({
        ...factura,
        sincronizado: 'S',
        guardadoEnServer: 'S',
      });
      dispatch(
        setObjOperator({
          ...factura.operador,
          nro_factura: Number(factura.operador.nro_factura) + 1,
        }),
      );
      dispatch(setArrProductAdded([]));
      dispatch(setArrFactura([...arrFacturas, factura]));
      resetState();
      await generarPDF(factura, objConfig, 'factura');
      Toast.show({
        type: 'success',
        text1: 'Factura guardada en el servidor correctamente',
      });
      setIsLoadingSave(false);
    } catch (error: any) {
      if (error instanceof ValidationsBeforeSavingError) {
        Toast.show({
          type: error.details.type,
          text1: error.details.text1,
        });
      } else if (error instanceof ApiSaveInvoiceError) {
        saveInvoiceInLocaldatabaseOnly();
      } else {
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
  const saveInvoiceInLocaldatabaseOnly = async (): Promise<void> => {
    try {
      const {latitude, longitude} = await getUbication();
      const factura = estructurarFactura({latitude, longitude});

      await facturasService.saveFactura({...factura, sincronizado: 'N'});
      dispatch(
        setObjOperator({
          ...factura.operador,
          nro_factura: Number(factura.operador.nro_factura) + 1,
        }),
      );
      resetState();
      Toast.show({
        type: 'success',
        text1: 'Factura guardada correctamente',
      });
      setIsLoadingSave(false);
    } catch (error: any) {
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

    const {almacen} = state;

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
  const estructurarFactura = ({
    latitude,
    longitude,
  }: {
    latitude: string;
    longitude: string;
  }): IOperation => {
    return {
      //fecha: new Date().toISOString().slice(0, 10).replaceAll('-', '/'),
      tipo_operacion: 'factura',
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
  const toggleArticulo = (articulo: IProduct) => {
    dispatch(setIsShowProductSheet(true));
    dispatch(setObjProduct(articulo));
  };
  const toggleSearchClient = () => {
    dispatch(setIsShowTercerosFinder(true));
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
    const {saldoCartera, identificacion} = state;

    if (Number(saldoCartera) > 0) {
      const carteraFilter = arrCartera.filter(
        cartera => cartera.nit == identificacion,
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
  const toggleAgregarProducto = (producto: IProductAdded) => {
    setState(prevState => ({
      ...prevState,
      articulosAdded: [...prevState.articulosAdded, producto],
    }));
  };
  const toggleArticuloAdded = async (
    articulo: IProductAdded,
    index: number,
  ) => {
    const objArticuloScope = await articulosService.getArticuloByCodigo(
      articulo.codigo,
    );
    dispatch(setObjProduct(objArticuloScope));
    dispatch(setIsShowProductSheetEdit(true));
    dispatch(setObjProductAdded(articulo));
    dispatch(setIntIndexProduct(index));
  };
  const deleteArticuloAdded = (articulo: IProductAdded, index: number) => {
    const innerDeleteArticulo = () => {
      const copiaArray = [...state.articulosAdded];

      copiaArray.splice(index, 1);

      setState(prevState => ({
        ...prevState,
        articulosAdded: copiaArray,
      }));
    };

    showDecisionAlert({
      type: 'info',
      description: `¿Desea eliminar el articulo ${articulo.descrip}?`,
      textButton: 'Eliminar',
      executeFunction: () => innerDeleteArticulo(),
    });
  };
  const toggleEditArticulo = (articulo: IProductAdded, index: number) => {
    const copyArticulosAdded = [...state.articulosAdded];

    copyArticulosAdded[index] = articulo;

    setState(prevState => ({...prevState, articulosAdded: copyArticulosAdded}));
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
        ref={scrollViewRef}
        keyboardShouldPersistTaps="always"
        style={styles.container}>
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
            state={state}
            toggleSearchClient={toggleSearchClient}
            handleInputChange={handleInputChange}
            toggleValidateCartera={toggleValidateCartera}
          />
        </View>
        <View>
          <InfoFactura
            state={state}
            validateBeforeSaving={validateBeforeSaving}
            toggleAddArticulos={toggleAddArticulos}
            handleInputChange={handleInputChange}
          />
        </View>

        <View style={{marginHorizontal: 10, marginTop: 10, paddingBottom: 120}}>
          <CoolButton
            value={isLoadingSave ? '' : 'Guardar Factura'}
            pressCoolButton={toggleSaveInvoice}
            colorButton="#19C22A"
            iconName="download"
            colorText="#fff"
            iconSize={20}
            loading={isLoadingSave}
          />
        </View>
      </ScrollView>

      <TercerosFinder toggleTercero={toggleTercero} searchTable="terceros" />
      <ProductFinder toggleProduct={toggleArticulo} />
      <CarteraPopup />
      <ProductSheet />
      <ProductSheetEdit />
    </View>
  );
};

export {ElaborarFactura};
