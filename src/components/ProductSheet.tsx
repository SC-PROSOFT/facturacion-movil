import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions, Keyboard} from 'react-native';
import Toast from 'react-native-toast-message';
import {Modal, Text} from 'react-native-paper';

/* components */
import {IconButton, StandardInput, NormalCheckbox, CoolButton} from '.';
/* global function */
import {formatToMoney} from '../utils';
/* types */
import {IProductAdded, IProduct} from '../common/types';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {
  setObjProduct,
  setIsShowProductSheet,
  setArrProductAdded,
} from '../redux/slices';

/* local types */
interface ProductSheetProps {}

const ProductSheet: React.FC<ProductSheetProps> = ({}) => {
  const dispatch = useAppDispatch();

  const isShowProductSheet = useAppSelector(
    store => store.product.isShowProductSheet,
  );
  const objProduct: IProduct | any = useAppSelector(
    store => store.product.objProduct,
  );
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const ObjGeneralConfig = useAppSelector(store => store.config.objConfig);
  const arrProductAdded = useAppSelector(
    store => store.product.arrProductAdded,
  );

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const lista_valores: any = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    A: '10',
    B: '11',
    C: '12',
    D: '13',
    E: '14',
    F: '15',
  };

  const [productAdded, setProductAdded] = useState<IProductAdded>({
    codigo: '',
    descrip: '',
    saldo: 0,
    descuento: 0,
    cantidad: 1,
    valorUnidad: 0,
    valorDescuento: 0,
    valorBase: 0,
    valorIva: 0,
    valorTotal: 0,
    instalado: 'N',
    detalles: '',
    index_lista: 0,
  });

  useEffect(() => {
    loadProduct();
  }, [objProduct]);

  useEffect(() => {
    adjustScreenSize();
  }, []);

  useEffect(() => {
    calculateSubtotal();
  }, [productAdded.cantidad, productAdded.valorUnidad, productAdded.descuento]);

  const handleInputChange = (input: string, text: string | boolean) => {
    setProductAdded(prevState => ({
      ...prevState,
      [input]:
        text === '' ? text : text === true ? 'S' : text === false ? 'N' : text,
    }));
  };

  //Hacer un test a esta funcion
  const toggleAddProduct = () => {
    const {saldo} = objProduct;

    const {facturarSinExistencias} = ObjGeneralConfig;

    let valorBase = productAdded.cantidad * productAdded.valorUnidad;

    let valorDescuento = (valorBase * productAdded.descuento) / 100;

    let valorIva = productAdded.valorIva; // en desarrollo

    let valorTotal = valorBase - valorDescuento + valorIva;

    if (
      !facturarSinExistencias && // aqui debe ser !facturarSinExistencias
      (Number(saldo) == 0 || productAdded.cantidad > Number(saldo))
    ) {
      Toast.show({
        type: 'error',
        text1: 'No hay saldo disponible para facturar',
      });
    } else if (productAdded.cantidad == 0 || productAdded.cantidad < 1) {
      Toast.show({
        type: 'error',
        text1: 'Debes ingresar una cantidad',
      });
    } else if (productAdded.valorUnidad == 0 || productAdded.valorUnidad < 1) {
      Toast.show({
        type: 'error',
        text1: 'Debes seleccionar un precio',
      });
    } else if (valorTotal <= 0) {
      Toast.show({
        type: 'error',
        text1: 'El subtotal debe ser mayor a 0',
      });
    } else {
      dispatch(
        setArrProductAdded([
          ...arrProductAdded,
          {...productAdded, valorBase, valorDescuento, valorTotal, valorIva},
        ]),
      );

      dispatch(setIsShowProductSheet(false));

      Toast.show({
        type: 'success',
        text1: 'Producto agregado correctamente',
      });
    }
  };
  const loadProduct = () => {
    let numeroLista: any = lista_valores[objTercero.clasificacion] || 1;
    let valorBase = objProduct[`vlr${numeroLista}`] || '0';

    setProductAdded(prevState => ({
      ...prevState,
      codigo: objProduct.codigo,
      descrip: objProduct.descrip,
      saldo: Number(objProduct.saldo),
      descuento: 0,
      cantidad: 1,
      valorUnidad: Number(valorBase),
      valorDescuento: 0,
      valorBase: Number(valorBase),
      valorIva: 0, // en desarrollo
      valorTotal: Number(valorBase),
      instalado: 'N',
      detalles: '',
      index_lista: numeroLista,
    }));
  };
  const calculateSubtotal = () => {
    let descuento;
    let valorIva: number;
    let valorBase = productAdded.cantidad * productAdded.valorUnidad;

    if (objTercero.ex_iva == 'N') {
      valorIva = Number(
        (valorBase * Number(`0.${objProduct.iva_usu}`)).toFixed(2),
      );
    } else {
      valorIva = 0;
    }

    if (productAdded.descuento == 0) {
      setProductAdded(prevState => ({
        ...prevState,
        valorTotal: valorBase + valorIva,
        valorIva,
      }));
    } else {
      descuento = (valorBase * productAdded.descuento) / 100;

      if (objTercero.ex_iva == 'N') {
        valorIva = Number(
          ((valorBase - descuento) * Number(`0.${objProduct.iva_usu}`)).toFixed(
            2,
          ),
        );
      } else {
        valorIva = 0;
      }

      let valorTotal = valorBase + valorIva - descuento;

      setProductAdded(prevState => ({
        ...prevState,
        valorTotal,
        valorIva,
        valorBase,
      }));
    }
  };
  const toggleCloseProductSheet: () => void = () => {
    dispatch(setIsShowProductSheet(false));
    resetComponent();
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

    const keyboardDidChangeFrame = Keyboard.addListener(
      'keyboardDidChangeFrame',
      event => {
        const screenHeight = Dimensions.get('window').height;
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      keyboardDidChangeFrame.remove();
    };
  };
  const resetComponent: () => void = () => {
    setProductAdded({
      codigo: '',
      descrip: '',
      saldo: 0,
      descuento: 0,
      cantidad: 0,
      valorUnidad: 0,
      valorDescuento: 0,
      valorBase: 0,
      valorIva: 0,
      valorTotal: 0,
      instalado: 'N',
      detalles: '',
      index_lista: 0,
    });

    dispatch(
      setObjProduct({
        codigo: '',
        descrip: '',
        ref: '',
        saldo: '',
        unidad: '',
        peso: '',
        iva: '',
        iva_usu: '',
        ipto_consumo: '',
        vlr_ipto_consumo: '',
        vlr1: '',
        vlr2: '',
        vlr3: '',
        vlr4: '',
        vlr5: '',
        vlr6: '',
        vlr7: '',
        vlr8: '',
        vlr9: '',
        vlr10: '',
        vlr11: '',
        vlr12: '',
        vlr13: '',
        vlr14: '',
        vlr15: '',
      }),
    );
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'flex-end',
      height: screenHeight, // -56
      //height: screenHeight > 700 ? screenHeight : 650,
    },
    titleContainer: {
      backgroundColor: '#092254',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 20,
    },
    title: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 18,
    },
    iconClose: {},
    contentContainer: {
      backgroundColor: '#fff',
    },
    valuesContainer: {
      flexDirection: 'row',
    },
    descripcion: {
      fontWeight: 'bold',
      color: 'black',
    },
    value: {
      color: 'black',
      marginLeft: 5,
    },
    inputsContainer: {
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    inputContainer: {
      width: '32%',
    },
    instaladoContainer: {
      backgroundColor: '#fff',
      flexDirection: 'row',
    },
  });

  return (
    <Modal visible={isShowProductSheet} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text allowFontScaling={false} style={styles.title}>
          Detalles del producto
        </Text>

        <IconButton
          iconName="close"
          iconColor="#FFF"
          iconSize={25}
          onPress={toggleCloseProductSheet}
        />
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#fff',
        }}>
        <View style={styles.contentContainer}>
          <View>
            <View style={styles.valuesContainer}>
              <Text allowFontScaling={false} style={styles.descripcion}>
                Descripción:{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.value}>
                {productAdded.descrip}
              </Text>
            </View>

            <View style={styles.valuesContainer}>
              <Text allowFontScaling={false} style={styles.descripcion}>
                Codigo:{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.value}>
                {productAdded.codigo}
              </Text>
            </View>

            <View style={styles.valuesContainer}>
              <Text allowFontScaling={false} style={styles.descripcion}>
                Saldo:{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.value}>
                {productAdded.saldo}
              </Text>
            </View>
            <View style={styles.valuesContainer}>
              <Text allowFontScaling={false} style={styles.descripcion}>
                Excento de iva:{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.value}>
                {objTercero.ex_iva == 'N' ? 'No' : 'Si'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <StandardInput
              label="Cantidad"
              value={productAdded.cantidad.toString()}
              name="cantidad"
              keyboardType="number-pad"
              onChange={handleInputChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <StandardInput
              label="% Descuen"
              value={productAdded.descuento.toString()}
              name="descuento"
              keyboardType="number-pad"
              onChange={handleInputChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <StandardInput
              label="Precio"
              value={formatToMoney(productAdded.valorUnidad)}
              name="precioUnidad"
              keyboardType="number-pad"
              onChange={handleInputChange}
            />
          </View>
        </View>

        <View style={styles.inputsContainer}>
          <View>
            <NormalCheckbox
              label="Instalado"
              checked={productAdded.instalado == 'S' ? true : false}
              checkboxName="instalado"
              pressNormalCheckbox={handleInputChange}
            />
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                allowFontScaling={false}
                style={[styles.descripcion, {width: 100}]}>
                Valor iva {objProduct.iva_usu}%:
              </Text>
              <Text
                allowFontScaling={false}
                style={[styles.value, {width: 85, textAlign: 'right'}]}>
                {objTercero.ex_iva == 'N'
                  ? formatToMoney(productAdded.valorIva)
                  : 'Excento iva'}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={[styles.descripcion, {width: 100}]}>
                Subtotal:{' '}
              </Text>
              <Text
                allowFontScaling={false}
                style={[styles.value, {width: 85, textAlign: 'right'}]}>
                {formatToMoney(productAdded.valorTotal)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{}}>
          <CoolButton
            value="Agregar producto"
            iconName="cart-arrow-down"
            iconSize={24}
            colorButton="#19C22A"
            colorText="#fff"
            pressCoolButton={toggleAddProduct}
          />
        </View>
      </View>
    </Modal>
  );
};

export {ProductSheet};
