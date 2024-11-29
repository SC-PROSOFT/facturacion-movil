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
import {setIsShowOperadoresFinder} from '../redux/slices/operadoresFinderSlice';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';

/* types */
import {IOperadores} from '../common/types';
import {operadoresService} from '../data_queries/local_database/services';

/* local types */
interface ItemData {
  codigo: string;
  descripcion: string;
  sucursal: string;
}

export const OperadoresFinder = React.memo(() => {
  const dispatch = useAppDispatch();

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const isShowOperadoresFinder = useAppSelector(
    store => store.operadoresFinder.isShowOperadoresFinder,
  );

  const [inputs, setInputs] = useState({
    operador: '',
  });

  const [operadores, setOperadores] = useState<IOperadores[]>([]);

  useEffect(() => {
    adjustScreenSize();
  }, []);

  useEffect(() => {
    toggleShowOperadoresFinder();
  }, [isShowOperadoresFinder]);

  const handleInputChange = (name: string, text: string) => {
    setInputs(prevState => ({...prevState, [name]: text}));
  };

  const closeOperadoresFinder = () => {
    setOperadores([]);
    dispatch(setIsShowOperadoresFinder(false));
  };

  const toggleShowOperadoresFinder = async () => {
    if (isShowOperadoresFinder) {
      try {
        const operadoresScope = await operadoresService.getAllOperadores();

        setOperadores(operadoresScope);
      } catch (error) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: 'No se cargaron los operadores',
          }),
        );
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

  const renderItem = ({item, index}: {item: IOperadores; index: any}) => (
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
         <Text allowFontScaling={false} style={styles.codigo}>{item.descripcion}</Text>
      </View>

      <View style={{flexDirection: 'row'}}>
         <Text allowFontScaling={false} style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
          Sucursal:{' '}
        </Text>
         <Text allowFontScaling={false} style={styles.codigo}>{item.sucursal}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isShowOperadoresFinder}
      onDismiss={closeOperadoresFinder}
      contentContainerStyle={styles.modal}
      style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
         <Text allowFontScaling={false} style={styles.title}>Busqueda de operadores</Text>

        <IconButton
          icon="close"
          iconColor="#365AC3"
          size={25}
          onPress={closeOperadoresFinder}
          style={styles.iconClose}
        />
      </View>

      <View>
        <IconLeftInput
          value={inputs.operador}
          label="Buscar operador"
          name="operador"
          mode="flat"
          keyboardType="default"
          icon="magnify"
          handleInputChange={handleInputChange}
        />
      </View>

      <SafeAreaView>
        <VirtualizedList
          data={operadores.filter(
            operador =>
              operador.codigo.includes(inputs.operador.toUpperCase()) ||
              operador.descripcion.includes(inputs.operador.toUpperCase()),
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
});
