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
import {setIsShowAlmacenesFinder} from '../redux/slices/almacenesFinderSlice';

/* db */
//import {getAlmacenes} from '../utils/localdb/almacenesDb';
/* local database services */
import {almacenesService} from "../data_queries/local_database/services";

/* types */
import {IAlmacen} from '../common/types';

/* local types */
interface AlmacenesFinderProps {
  toggleAlmacen?: (almacen: IAlmacen) => void;
}

export const AlmacenesFinder = React.memo(
  ({toggleAlmacen}: AlmacenesFinderProps) => {
    const dispatch = useAppDispatch();

    const [screenHeight, setScreenHeight] = useState(
      Dimensions.get('window').height,
    );

    const isShowAlmacenesFinder = useAppSelector(
      store => store.almacenesFinder.isShowAlmacenesFinder,
    );

    const [inputs, setInputs] = useState({
      almacen: '',
    });

    const [almacenes, setAlmacenes] = useState<IAlmacen[]>([]);

    useEffect(() => {
      adjustScreenSize();
    }, []);

    useEffect(() => {
      toggleShowAlmacenesFinder();
    }, [isShowAlmacenesFinder]);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };

    const closeAlmacenesFinder = () => {
      setAlmacenes([]);
      dispatch(setIsShowAlmacenesFinder(false));
    };

    const toggleShowAlmacenesFinder = async () => {
      if (isShowAlmacenesFinder) {
        const almacenesScope = await almacenesService.getAllAlmacenes();

        setAlmacenes(almacenesScope);
      } else {
        setInputs({almacen: ''});
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
        display: 'flex',
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
    });

    const renderItem = ({item, index}: {item: IAlmacen; index: any}) => (
      <TouchableOpacity
        onPress={() => console.log('operador')}
        style={styles.item}>
        <View style={{flexDirection: 'row'}}>
           <Text allowFontScaling={false} style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Codigo:{' '}
          </Text>
           <Text allowFontScaling={false} style={styles.codigo}>{item.codigo}</Text>
        </View>

        <View style={{flexDirection: 'row'}}>
           <Text allowFontScaling={false} style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Nombre :{' '}
          </Text>
           <Text allowFontScaling={false} style={styles.codigo}>{item.nombre}</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isShowAlmacenesFinder}
        onDismiss={closeAlmacenesFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
           <Text allowFontScaling={false} style={styles.title}>Busqueda de almacenes</Text>

          <IconButton
            icon="close"
            iconColor="#365AC3"
            size={25}
            onPress={closeAlmacenesFinder}
            style={styles.iconClose}
          />
        </View>

        <View>
          <IconLeftInput
            value={inputs.almacen}
            // label="Buscar almacen"
            name="almacen"
            mode="flat"
            keyboardType="default"
            icon="magnify"
            handleInputChange={handleInputChange}
          />
        </View>

        <View>
          <VirtualizedList
            data={almacenes.filter(
              almacen =>
                almacen.codigo.includes(inputs.almacen.toUpperCase()) ||
                almacen.nombre.includes(inputs.almacen.toUpperCase()),
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
        </View>
      </Modal>
    );
  },
);
