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
/* toast */
import Toast from 'react-native-toast-message';
/* paper components */
import {Modal, Text, IconButton} from 'react-native-paper';
/* components */
import {IconLeftInput} from '.';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowProductFinder} from '../redux/slices';
/* local database instances */
import {articulosService} from '../data_queries/local_database/services';
/* types */
import {IProduct, IProductAdded} from '../common/types';
/* local types */
interface ProductFinderProps {
  toggleProduct?: (product: IProduct) => void;
}

export const ProductFinder = React.memo(
  ({toggleProduct}: ProductFinderProps) => {
    const dispatch = useAppDispatch();

    const productAdded = useAppSelector(store => store.product.arrProductAdded);

    const [screenHeight, setScreenHeight] = useState(
      Dimensions.get('window').height,
    );

    const isShowProductFinder = useAppSelector(
      store => store.product.isShowProductFinder,
    );

    const [inputs, setInputs] = useState({
      product: '',
    });

    const [products, setProducts] = useState<IProduct[]>([]);

    useEffect(() => {
      adjustScreenSize();
    }, []);

    useEffect(() => {
      toggleShowProductFinder();
    }, [isShowProductFinder]);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };
    const closeProductFinder = () => {
      setProducts([]);
      dispatch(setIsShowProductFinder(false));
    };
    const toggleShowProductFinder = async () => {
      if (isShowProductFinder) {
        const productScope = await articulosService.getAllArticulos();

        setProducts(productScope);
      } else {
        setInputs({product: ''});
      }
    };
    const scopeToggleProduct = (item: IProduct) => {
      if (toggleProduct) {
        const findProduct = productAdded.find(
          product => product.codigo == item.codigo,
        );

        if (!findProduct) {
          toggleProduct(item);
        } else {
          Toast.show({
            type: 'info',
            text1: 'El producto ya existe en el detalle del pedido',
          });
        }
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

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    };

    const styles = StyleSheet.create({
      container: {
        justifyContent: 'flex-end',
        height: screenHeight > 700 ? screenHeight : 666,
      },
      modal: {
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
      },
      iconClose: {},
      item: {
        backgroundColor: 'white',
        borderTopColor: 'white',
        borderLeftColor: 'white',
        borderRightColor: 'white',
        borderBottomColor: '#eee',
        borderWidth: 1,
        padding: 20,
      },
      codigo: {},
      loaderContainer: {
        marginVertical: 16,
        alignItems: 'center',
      },
    });

    const renderItem = ({item, index}: {item: IProduct; index: any}) => (
      <TouchableOpacity
        onPress={() => scopeToggleProduct(item)}
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
                style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
                Codigo:{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {item.codigo}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
                Saldo :{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {item.saldo}
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
                Nombre :{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {item.descrip}
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
        visible={isShowProductFinder}
        onDismiss={closeProductFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: '#092254',
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              paddingLeft: 20,
            }}>
            <Text allowFontScaling={false} style={styles.title}>
              Busqueda de articulos
            </Text>

            <IconButton
              icon="close"
              iconColor="#FFF"
              size={25}
              onPress={closeProductFinder}
              style={styles.iconClose}
            />
          </View>

          <View style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 5}}>
            <IconLeftInput
              value={inputs.product}
              // label="Buscar articulo"
              name="articulo"
              mode="flat"
              keyboardType="default"
              icon="magnify"
              handleInputChange={handleInputChange}
            />
          </View>
        </View>

        <SafeAreaView>
          <VirtualizedList
            data={products.filter(
              product =>
                product.codigo.includes(inputs.product.toUpperCase()) ||
                product.descrip.includes(inputs.product.toUpperCase()),
            )}
            renderItem={renderItem}
            getItemCount={data => data.length}
            getItem={(data, index) => data[index]}
            keyExtractor={item => item.codigo.toString()}
            style={
              screenHeight < 680
                ? {height: screenHeight * 0.59}
                : {height: screenHeight * 0.66}
            }
          />
        </SafeAreaView>
      </Modal>
    );
  },
);
