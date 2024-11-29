import React, {useEffect, useState, useRef} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {List, Card, Text} from 'react-native-paper';
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
  CarteraPopup,
  ProductSheet,
  FacturasFinder,
  IconButton,
  ProductSheetEdit,
} from '../components';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {
  setIsShowTercerosFinder,
  setIsShowFacturasFinder,
  setIsShowCarteraPopup,
  setArrCarteraPopup,
  setIsShowProductFinder,
  setIsShowProductSheet,
  setObjProduct,
  setObjInfoAlert,
  setObjTercero,
  setIntIndexProduct,
  setObjProductAdded,
  setIsShowProductSheetEdit,
} from '../redux/slices';
/* local database services */
import {
  facturasService,
  articulosService,
} from '../data_queries/local_database/services';
/* utils */
import {formatToMoney, validateBeforeSaving} from '../utils';
import {getUbication} from '../common/ubication/getUbication';
/* types */
import {IAlmacen, IProduct, IProductAdded, IPedidos} from '../common/types';
/* context */
import {decisionAlertContext} from '../context';
/* api queries */
import {FacturasApiService} from '../data_queries/api/queries';
/* errors */
import {
  ValidationsBeforeSavingError,
  ApiSaveInvoiceError,
} from '../common/errors';

/* local types */
interface State {
  fechaPedido: string;

  sucursal: string;
  consecutivo: number;
  vendedor: string;
  almacen: string;
  ubicacion: {
    latitud: string;
    longitud: string;
  };
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
  guardadoEnServer: 'S' | 'N';
  sincronizado: 'S' | 'N';
}
interface InfoGeneralProps {
  state: State;
  handleStateChange: Function;
  arrAlmacenes: IAlmacen[];
  selectAlmacen: (almacen: string) => void;
  toggleSeleccionarFactura: () => void;
}
interface InfoClienteProps {
  state: State;
  handleStateChange: (input: string, text: string) => void;
  toggleSearchClient: Function;
  toggleValidateCartera: () => void;
}
interface InfoFacturaProps {
  state: State;
  handleStateChange: (input: string, text: string) => void;
  toggleAddArticulos: () => void;
  toggleArticuloAdded: (articulo: IProductAdded, index: number) => void;
  deleteArticuloAdded: (articulo: IProductAdded, index: number) => void;
}

const InfoGeneral: React.FC<InfoGeneralProps> = ({
  state,
  arrAlmacenes,
  selectAlmacen,
  toggleSeleccionarFactura,
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
      <View>
        <CoolButton
          pressCoolButton={toggleSeleccionarFactura}
          colorButton="#365AC3"
          value="Seleccionar factura"
          colorText="#fff"
          iconName="package-variant-closed"
          iconSize={32}
        />
      </View>

      <View style={styles.switchColumn}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Fecha de factura'}
        </Text>
        <View style={styles.containerText}>
          <Text allowFontScaling={false} style={styles.text}>
            {state.fechaPedido}
          </Text>
        </View>
      </View>
      <View style={styles.switchRow}>
        <View style={styles.twoInputs}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Sucursal'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.sucursal}
            </Text>
          </View>
        </View>
        <View style={styles.twoInputs}>
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
        <View style={styles.soloInputs}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Vendedor'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.vendedor}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.soloInputs}>
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
  state,
  handleStateChange,
}) => {
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

      <View style={styles.switchColumn}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Identificación'}
        </Text>
        <View style={styles.containerText}>
          <Text allowFontScaling={false} style={styles.text}>
            {state.identificacion}
          </Text>
        </View>
      </View>
      <View style={styles.switchColumn}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Descripción'}
        </Text>
        <View style={styles.containerText}>
          <Text allowFontScaling={false} style={styles.text}>
            {state.descripcionCliente}
          </Text>
        </View>
      </View>
      <View style={styles.switchColumn}>
        <Text allowFontScaling={false} style={styles.label}>
          {'Dirección'}
        </Text>
        <View style={styles.containerText}>
          <Text allowFontScaling={false} style={styles.text}>
            {state.direccion}
          </Text>
        </View>
      </View>
      <View style={styles.switchRow}>
        <View style={{flexBasis: '50%', marginRight: 5}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Teléfono'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.telefono}
            </Text>
          </View>
        </View>
        <View style={{flexBasis: '20%', marginRight: 5}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Clasif'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.clasificacion}
            </Text>
          </View>
        </View>
        <View style={{flexBasis: '27%'}}>
          <Text allowFontScaling={false} style={styles.label}>
            {'Plazo'}
          </Text>
          <View style={styles.containerText}>
            <Text allowFontScaling={false} style={styles.text}>
              {state.plazo}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Picker
          selectedValue={state.formaPago}
          onValueChange={itemValue => handleStateChange('formaPago', itemValue)}
          dropdownIconColor="black"
          itemStyle={styles.itemStyles}
          style={styles.buttonPicker}>
          <Picker.Item label="Contado" value="contado" />
          <Picker.Item label="Credito" value="credito" />
        </Picker>
      </View>
    </Card>
  );
};

const InfoPedido: React.FC<InfoFacturaProps> = ({
  state,
  handleStateChange,
  toggleAddArticulos,
  toggleArticuloAdded,
  deleteArticuloAdded,
}) => {
  const calculateTotalOrder = () => {
    let totalOrder = 0;

    state.articulosAdded.forEach(article => {
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
    button: {
      width: '100%',
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
      width: '100%',
      marginTop: 50,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    labelTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: 'grey',
      flexBasis: '33%',
      // backgroundColor: 'lime',
    },
    containerTextTotal: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 4,
      paddingHorizontal: 5,
    },
    textTotal: {
      marginLeft: 5,
      fontSize: 18,
      color: '#4d4d4d',
      fontWeight: 'bold',
    },
    articuloAddedContainer: {
      flexDirection: 'row',
    },
    articuloAdded: {
      backgroundColor: '#f4f4f4',
      borderRadius: 8,
      width: '100%',
    },
    articuloAddedInfo: {
      backgroundColor: '#eee',
      borderRadius: 8,
      width: '100%',
      paddingVertical: 10,
      paddingTop: 0,
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
          Detalle de factura
        </Text>
      </View>
      <View style={styles.containerButton}>
        <View style={styles.button}>
          <CoolButton
            value="Agregar Productos"
            iconName="package-variant"
            colorButton="#365AC3"
            colorText="white"
            iconSize={32}
            pressCoolButton={toggleAddArticulos}
          />
        </View>
      </View>
      <View>
        {state.articulosAdded.map((articulo, index) => (
          <View style={styles.articuloAddedContainer} key={index}>
            <View style={styles.articuloAdded}>
              <List.AccordionGroup>
                <List.Accordion
                  title={
                    <View style={styles.containerListTitle}>
                      <Text allowFontScaling={false} style={styles.listTitle}>
                        {articulo.descrip}
                      </Text>
                      <Text allowFontScaling={false} style={styles.listTitle2}>
                        {formatToMoney(articulo.valorTotal)}
                      </Text>
                    </View>
                  }
                  style={{
                    backgroundColor: '#fff',
                  }}
                  id="1">
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      onPress={() => toggleArticuloAdded(articulo, index)}
                      style={styles.articuloAddedInfo}>
                      <View style={styles.iconsArticuloAdded}>
                        <IconButton
                          iconName="close"
                          iconColor="#DE3A45"
                          iconSize={20}
                          pressIconButton={() =>
                            deleteArticuloAdded(articulo, index)
                          }
                        />
                      </View>
                      <View style={styles.containerItemListLeft}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListLeft}>
                          Codigo:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListLeft}>
                          {articulo.codigo}
                        </Text>
                      </View>
                      <View style={styles.containerItemListLeft}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListLeft}>
                          Descripción:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListLeft}>
                          {articulo.descrip}
                        </Text>
                      </View>
                      <View style={styles.containerItemListRight}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListRight}>
                          Cantidad:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListRight}>
                          {articulo.cantidad}
                        </Text>
                      </View>
                      <View style={styles.containerItemListRight}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListRight}>
                          Valor Base:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListRight}>
                          {formatToMoney(articulo.valorBase)}
                        </Text>
                      </View>
                      <View style={styles.containerItemListRight}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListRight}>
                          Valor Descuento:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListRight}>
                          {formatToMoney(articulo.valorDescuento)}
                        </Text>
                      </View>
                      <View style={styles.containerItemListRight}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListRight}>
                          Valor IVA:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListRight}>
                          {formatToMoney(articulo.valorIva)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.containerItemListRight,
                          {marginBottom: 15},
                        ]}>
                        <Text
                          allowFontScaling={false}
                          style={styles.titleItemListRight}>
                          Valor Total:{' '}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.textItemListRight}>
                          {formatToMoney(articulo.valorTotal)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </List.Accordion>
              </List.AccordionGroup>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.switchRow}>
        <View style={styles.totalPedido}>
          <Text allowFontScaling={false} style={styles.labelTotal}>
            {'Total Factura:'}
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
            onChange={handleStateChange}
          />
        </View>
      </View>
    </Card>
  );
};

const ModificarFactura: React.FC = () => {
  const dispatch = useAppDispatch();
  const {showDecisionAlert} = decisionAlertContext();
  const scrollViewRef = useRef<any>(null);

  const ArrAlmacenes = useAppSelector(store => store.sync.arrAlmacenes);
  const objOperador = useAppSelector(store => store.operator.objOperator);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const arrCartera = useAppSelector(store => store.sync.arrCartera);
  const objConfig = useAppSelector(store => store.config.objConfig);

  const [state, setState] = useState<State>({
    fechaPedido: '',

    sucursal: '',
    consecutivo: 0,
    vendedor: '',
    almacen: 'ALM01', // valor por defecto
    ubicacion: {
      latitud: '',
      longitud: '',
    },

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
    guardadoEnServer: 'N',
    sincronizado: 'N',
  });

  const [isLoadingModify, setIsLoadingModify] = useState(false);

  useEffect(() => {
    resetState();
  }, []);
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

  const selectAlmacen = (almacen: string) => {
    setState(prevState => ({...prevState, almacen}));
  };

  const handleStateChange = (input: string, text: string) => {
    setState(prevState => ({...prevState, [input]: text}));
  };

  const toggleFactura = async (factura: IPedidos) => {
    setState(prevState => ({
      ...prevState,
      fechaPedido: factura.fecha,
      sucursal: factura.operador.sucursal,
      consecutivo: Number(factura.operador.nro_factura),
      vendedor: factura.operador.descripcion,
      almacen: factura.almacen,
      ubicacion: {
        latitud: factura.ubicacion.latitud,
        longitud: factura.ubicacion.longitud,
      },

      identificacion: factura.tercero.codigo,
      descripcionCliente: factura.tercero.nombre,
      direccion: factura.tercero.direcc,
      telefono: factura.tercero.tel,
      clasificacion: factura.tercero.clasificacion,
      plazo: factura.tercero.plazo.toString(),
      formaPago: factura.formaPago,

      articulosAdded: factura.articulosAdded,
      observaciones: factura.observaciones,
      guardadoEnServer: factura.guardadoEnServer,
      sincronizado: factura.sincronizado,
    }));

    dispatch(setObjTercero(factura.tercero));
  };
  const toggleUpdateInvoice = async () => {
    setIsLoadingModify(true);

    const facturasApiService = new FacturasApiService(
      objConfig.direccionIp,
      objConfig.puerto,
    );

    try {
      validateBeforeSaving({
        almacen: state.almacen,
        identificacion: state.identificacion,
        articulosAddedLength: state.articulosAdded.length,
        objConfig: objConfig,
      });
      const invoice = structureInvoice();

      await facturasApiService._saveFactura(invoice, 'put');
      await facturasService.updateFactura(objOperador.nro_factura.toString(), {
        ...invoice,
        sincronizado: 'S',
      });
      resetState();
      Toast.show({
        type: 'success',
        text1: 'Factura modificada en el servidor correctamente',
      });
      setIsLoadingModify(false);
    } catch (error: any) {
      if (error instanceof ValidationsBeforeSavingError) {
        Toast.show({
          type: error.details.type,
          text1: error.details.text1,
        });
        setIsLoadingModify(false);
      } else if (error instanceof ApiSaveInvoiceError) {
        saveOrderInLocalDatabaseOnly();
      } else {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error.message,
          }),
        );
        setIsLoadingModify(false);
      }
    }
  };
  const saveOrderInLocalDatabaseOnly = async (): Promise<void> => {
    try {
      const invoice = structureInvoice();

      await facturasService.updateFactura(state.consecutivo.toString(), {
        ...invoice,
        sincronizado: 'N',
      });

      resetState();
      Toast.show({
        type: 'success',
        text1: 'Factura modificada correctamente',
      });
      setIsLoadingModify(false);
    } catch (error: any) {
      setIsLoadingModify(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message,
        }),
      );
    }
  };
  const structureInvoice = (): IPedidos => {
    return {
      tipo_operacion: 'factura',
      fecha: new Date().toISOString().slice(0, 10).replaceAll('-', '/'),
      hora: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
      fechaTimestampUnix: new Date().getTime(),
      almacen: state.almacen,

      operador: {...objOperador, nro_factura: state.consecutivo},

      tercero: objTercero,
      articulosAdded: state.articulosAdded,

      formaPago: state.formaPago,
      fechaVencimiento: moment().add(1, 'days').format('YYYYMMDD'),
      valorPedido: state.articulosAdded.reduce(
        (acumulator, articulo) => acumulator + articulo.valorTotal,
        0,
      ),
      observaciones: state.observaciones,
      ubicacion: state.ubicacion,
      guardadoEnServer: state.guardadoEnServer,
      sincronizado: state.sincronizado,
    };
  };

  const toggleArticulo = (articulo: IProduct) => {
    dispatch(setIsShowProductSheet(true));
    dispatch(setObjProduct(articulo));
  };

  const toggleSearchClient = () => {
    dispatch(setIsShowTercerosFinder(true));
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

  const toggleEditArticulo = (articulo: IProductAdded, index: number) => {
    const copyArticulosAdded = [...state.articulosAdded];

    copyArticulosAdded[index] = articulo;

    setState(prevState => ({...prevState, articulosAdded: copyArticulosAdded}));
  };

  const toggleAddArticulos = () => {
    const {identificacion} = state;

    if (identificacion == '') {
      Toast.show({
        type: 'info',
        text1: 'No ha seleccionado un cliente',
      });
    } else {
      dispatch(setIsShowProductFinder(true));
    }
  };

  const toggleSeleccionarFactura = () => {
    dispatch(setIsShowFacturasFinder(true));
  };

  const toggleAgregarProducto = (producto: IProductAdded) => {
    setState(prevState => ({
      ...prevState,
      articulosAdded: [...prevState.articulosAdded, producto],
    }));
  };

  const resetState = () => {
    setState({
      fechaPedido: '',

      sucursal: '',
      consecutivo: 0,
      vendedor: '',
      almacen: 'ALM01', // valor por defecto
      ubicacion: {
        latitud: '',
        longitud: '',
      },

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
      guardadoEnServer: 'N',
      sincronizado: 'N',
    });
  };
  const toggleArticuloAdded = async (
    articulo: IProductAdded,
    index: number,
  ) => {
    const objArticuloScope = await articulosService.getArticuloByCodigo(
      articulo.codigo,
    );
    dispatch(setIsShowProductSheetEdit(true));
    dispatch(setObjProductAdded(articulo));
    dispatch(setObjProduct(objArticuloScope));
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

  const styles = StyleSheet.create({
    container: {
      height: '100%',
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
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="always">
        <View>
          <InfoGeneral
            state={state}
            handleStateChange={handleStateChange}
            arrAlmacenes={ArrAlmacenes}
            selectAlmacen={selectAlmacen}
            toggleSeleccionarFactura={toggleSeleccionarFactura}
          />
        </View>
        <View>
          <InfoCliente
            state={state}
            toggleSearchClient={toggleSearchClient}
            handleStateChange={handleStateChange}
            toggleValidateCartera={toggleValidateCartera}
          />
        </View>
        <View>
          <InfoPedido
            state={state}
            toggleAddArticulos={toggleAddArticulos}
            handleStateChange={handleStateChange}
            toggleArticuloAdded={toggleArticuloAdded}
            deleteArticuloAdded={deleteArticuloAdded}
          />
        </View>

        <View style={{marginHorizontal: 10, marginTop: 5}}>
          <CoolButton
            value={isLoadingModify ? '' : 'Modificar Factura'}
            pressCoolButton={toggleUpdateInvoice}
            colorButton="#19C22A"
            iconName="content-save"
            colorText="#fff"
            iconSize={20}
            loading={isLoadingModify}
          />
        </View>
      </ScrollView>

      <ProductFinder toggleProduct={toggleArticulo} />
      <FacturasFinder toggleFactura={toggleFactura} />
      <CarteraPopup />
      <ProductSheet />
      <ProductSheetEdit />
    </View>
  );
};

export {ModificarFactura};
