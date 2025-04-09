import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, Keyboard} from 'react-native';
import Toast from 'react-native-toast-message';
import {Modal} from 'react-native-paper';

/* components */
import {IconButton, StandardInput, NormalCheckbox, CoolButton} from '.';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* global function */
import {formatToMoney} from '../utils';
/* types */
import {IProductAdded, IProduct} from '../common/types';
/* redux */
import {
  setIsShowProductSheetEdit,
  setObjProductAdded,
  setArrProductAdded,
} from '../redux/slices';
/* utils */
import {redefineArrProducts} from '../utils';

/* local types */
interface ProductSheetProps {}

const ProductSheetEdit: React.FC<ProductSheetProps> = ({}) => {
  const dispatch = useAppDispatch();

  const isShowProductSheetEdit = useAppSelector(
    store => store.product.isShowProductSheetEdit,
  );

  const objProductAdded: any = useAppSelector(
    store => store.product.objProductAdded,
  );
  const objProduct: IProduct | any = useAppSelector(
    store => store.product.objProduct,
  );
  const objtercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const ObjGeneralConfig = useAppSelector(store => store.config.objConfig);
  const arrProductAdded = useAppSelector(
    store => store.product.arrProductAdded,
  );
  const intIndexProduct = useAppSelector(
    store => store.product.intIndexProduct,
  );

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const [productAdded, setProductAdded] = useState<IProductAdded>({
    codigo: '',
    descrip: '',
    saldo: 0,
    descuento: 0,
    cantidad: 0,
    peso: 0,
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
  }, [objProductAdded]);

  useEffect(() => {
    adjustScreenSize();
  }, []);

  useEffect(() => {
    calculateSubtotal();
  }, [productAdded.cantidad, productAdded.valorUnidad, productAdded.descuento]);

  /* 🟥 procedure */
  const handleInputChange = (input: string, text: string | boolean) => {
    setProductAdded(prevState => ({
      ...prevState,
      [input]:
        text === '' ? text : text === true ? 'S' : text === false ? 'N' : text,
    }));
  };
  //Hacer un test a esta funcion jejej si o fokin si // no lo hice equisde :c
  const toggleEditProduct = () => {
    const {saldo} = objProduct;
    const {facturarSinExistencias} = ObjGeneralConfig;

    let valorBase =
      Number(productAdded.cantidad) * Number(productAdded.valorUnidad);

    let valorDescuento = (valorBase * Number(productAdded.descuento)) / 100;

    let valorIva = productAdded.valorIva; // en desarrollo.

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
      const redefinedArrProducts = redefineArrProducts(arrProductAdded, {
        ...productAdded,
        valorBase,
        valorDescuento,
        valorTotal,
        valorIva,
      });
      dispatch(setArrProductAdded(redefinedArrProducts));
      dispatch(setIsShowProductSheetEdit(false));
      Toast.show({
        type: 'success',
        text1: 'Producto editado correctamente',
      });
    }
  };
  const loadProduct = () => {
    setProductAdded(objProductAdded);
  };
  const calculateSubtotal = () => {
    let descuento;
    let valorIva: number;
    let valorBase = productAdded.cantidad * productAdded.valorUnidad;

    if (objtercero.ex_iva == 'N') {
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

      if (objtercero.ex_iva == 'N') {
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
  const toggleCloseProductSheet: () => void = () => {
    dispatch(setIsShowProductSheetEdit(false));
    resetComponent();
  };
  const resetComponent: () => void = () => {
    setProductAdded({
      codigo: '',
      descrip: '',
      saldo: 0,
      descuento: 0,
      cantidad: 0,
      peso: 0,
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
      setObjProductAdded({
        codigo: '',
        descrip: '',
        saldo: 0,
        descuento: 0,
        cantidad: 0,
        peso: 0,
        valorUnidad: 0,
        valorDescuento: 0,
        valorBase: 0,
        valorIva: 0,
        valorTotal: 0,
        instalado: 'N',
        detalles: '',
        index_lista: 0,
      }),
    );
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'flex-end',
      height: screenHeight,
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
    <Modal
      visible={isShowProductSheetEdit}
      onDismiss={toggleCloseProductSheet}
      style={styles.container}>
      <View style={styles.titleContainer}>
        <Text allowFontScaling={false} style={styles.title}>
          Editar producto
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
                {objtercero.ex_iva == 'N' ? 'No' : 'Si'}
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
              label="Descuento"
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
                style={[styles.value, {width: 80, textAlign: 'right'}]}>
                {objtercero.ex_iva == 'N'
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
                style={[styles.value, {width: 80, textAlign: 'right'}]}>
                {formatToMoney(productAdded.valorTotal)}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <CoolButton
            value="Editar producto"
            iconName="cart-arrow-down"
            iconSize={24}
            colorButton="#19C22A"
            colorText="#fff"
            pressCoolButton={toggleEditProduct}
          />
        </View>
      </View>
    </Modal>
  );
};

export {ProductSheetEdit};
