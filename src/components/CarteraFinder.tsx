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

/* paper components */
import {Modal, Text, IconButton} from 'react-native-paper';

/* components */
import {IconLeftInput} from '.';

/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';

/* redux slices */
import {setIsShowCarteraFinder} from '../redux/slices/carteraFinderSlice';

/* local database services */
import {carteraService} from '../data_queries/local_database/services';

/* types */
import {ICartera} from '../common/types';

/* local types */
interface CarteraFinderProps {
  toggleCartera?: (cartera: ICartera) => void;
}

export const CarteraFinder = React.memo(
  ({toggleCartera}: CarteraFinderProps) => {
    const dispatch = useAppDispatch();

    const [screenHeight, setScreenHeight] = useState(
      Dimensions.get('window').height,
    );

    const isShowCarteraFinder = useAppSelector(
      store => store.carteraFinder.isShowCarteraFinder,
    );

    const [inputs, setInputs] = useState({
      cartera: '',
    });

    const [cartera, setCartera] = useState<ICartera[]>([]);

    useEffect(() => {
      adjustScreenSize();
    }, []);

    useEffect(() => {
      toggleShowCarteraFinder();
    }, [isShowCarteraFinder]);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };

    const closeCarteraFinder = () => {
      setCartera([]);
      dispatch(setIsShowCarteraFinder(false));
    };

    const toggleShowCarteraFinder = async () => {
      if (isShowCarteraFinder) {
        const carteraScope = await carteraService.getAllCartera();

        setCartera(carteraScope);
      } else {
        setInputs({cartera: ''});
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
        height: screenHeight - 56,
      },
      modal: {
        backgroundColor: '#fff',
        height: screenHeight * 0.8,
        justifyContent: 'flex-start',
        paddingTop: 20,
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
      codigo: {},
      loaderContainer: {
        marginVertical: 16,
        alignItems: 'center',
      },
    });

    const renderItem = ({item, index}: {item: ICartera; index: any}) => (
      <TouchableOpacity
        onPress={() => console.log('operador')}
        style={styles.item}>
        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Numero:{' '}
          </Text>
          <Text allowFontScaling={false} style={styles.codigo}>
            {item.nro}
          </Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Sucursal :{' '}
          </Text>
          <Text allowFontScaling={false} style={styles.codigo}>
            {item.sucursal}
          </Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Nit :{' '}
          </Text>
          <Text allowFontScaling={false} style={styles.codigo}>
            {item.nit}
          </Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Valor :{' '}
          </Text>
          <Text allowFontScaling={false} style={styles.codigo}>
            {item.vlr}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isShowCarteraFinder}
        onDismiss={closeCarteraFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text allowFontScaling={false} style={styles.title}>
            Busqueda de cartera
          </Text>

          <IconButton
            icon="close"
            iconColor="#365AC3"
            size={25}
            onPress={closeCarteraFinder}
            style={styles.iconClose}
          />
        </View>

        <View>
          <IconLeftInput
            value={inputs.cartera}
            label="Buscar cartera"
            name="cartera"
            mode="flat"
            keyboardType="default"
            icon="magnify"
            handleInputChange={handleInputChange}
          />
        </View>

        <SafeAreaView>
          <VirtualizedList
            data={cartera.filter(
              cartera =>
                cartera.nro.includes(inputs.cartera.toUpperCase()) ||
                cartera.sucursal.includes(inputs.cartera.toUpperCase()),
            )}
            renderItem={renderItem}
            getItemCount={data => data.length}
            getItem={(data, index) => data[index]}
            keyExtractor={item => item.nro.toString()}
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
