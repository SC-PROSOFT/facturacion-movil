import React, {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  VirtualizedList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* components */
import {IconLeftInput} from '.';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {setIsShowTercerosFinder} from '../redux/slices/tercerosFinderSlice';
/* local database service */
import {tercerosService} from '../data_queries/local_database/services';
/* types */
import {ITerceros} from '../common/types';

/* local types */
interface TercerosFinderProps {
  toggleTercero?: (tercero: ITerceros) => void;
}

export const TercerosFinder = React.memo(
  ({toggleTercero}: TercerosFinderProps) => {
    const dispatch = useAppDispatch();

    const route = useRoute();

    const isShowTercerosFinder = useAppSelector(
      store => store.tercerosFinder.isShowTercerosFinder,
    );

    const objConfig = useAppSelector(store => store.config.objConfig);
    const objOperador = useAppSelector(store => store.operator.objOperator);
    const [inputs, setInputs] = useState({
      operador: '',
    });

    const [terceros, setTerceros] = useState<ITerceros[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      adjustScreenSize();
    }, []);

    useEffect(() => {
      toggleShowOperadoresFinder();
    }, [isShowTercerosFinder]);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
    };

    const closeOperadoresFinder = () => {
      setTerceros([]);
      dispatch(setIsShowTercerosFinder(false));
    };

    const toggleShowOperadoresFinder = async () => {
      if (isShowTercerosFinder) {
        setIsLoading(true);
        const {filtrarTercerosPorVendedor} = objConfig;
        const {cod_vendedor} = objOperador;

        try {
          const tercerosScope = await tercerosService.getAllTerceros();

          if (route.name != 'Sync' && filtrarTercerosPorVendedor) {
            let tercerosFilterScope = tercerosScope.filter(
              tercero => tercero.vendedor === cod_vendedor,
            );
            setTerceros(tercerosFilterScope);
          } else {
            setTerceros(tercerosScope);
          }
        } catch (error) {
          console.error('Error al obtener terceros:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setInputs({operador: ''});
      }
    };

    const adjustScreenSize = () => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {},
      );

      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {},
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    };

    const styles = StyleSheet.create({
      container: {
        justifyContent: 'flex-end',
        flex: 1,
      },
      modal: {
        backgroundColor: '#fff',
        height: '80%',
        justifyContent: 'flex-start',
      },
      title: {
        fontSize: 18,
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

    const renderItem = ({item, index}: {item: ITerceros; index: any}) => (
      <TouchableOpacity
        onPress={() => {
          closeOperadoresFinder();
          toggleTercero && toggleTercero(item);
        }}
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
                Nombre :{' '}
              </Text>
              <Text allowFontScaling={false} style={styles.codigo}>
                {item.nombre}
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
        visible={isShowTercerosFinder}
        onDismiss={closeOperadoresFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: '#092254',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 20,
            }}>
            <Text allowFontScaling={false} style={styles.title}>
              Busqueda de terceros ({terceros.length})
            </Text>

            <IconButton
              icon="close"
              iconColor="#FFF"
              size={25}
              onPress={closeOperadoresFinder}
              style={styles.iconClose}
            />
          </View>

          <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
            <IconLeftInput
              value={inputs.operador}
              name="operador"
              mode="flat"
              keyboardType="default"
              icon="magnify"
              handleInputChange={handleInputChange}
            />
          </View>
        </View>

        <SafeAreaView style={{paddingHorizontal: 10}}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <VirtualizedList
              data={terceros.filter(
                tercero =>
                  tercero.codigo.includes(inputs.operador.toUpperCase()) ||
                  tercero.nombre.includes(inputs.operador.toUpperCase()),
              )}
              renderItem={renderItem}
              getItemCount={data => data.length}
              getItem={(data, index) => data[index]}
              keyExtractor={item => item.codigo.toString()}
              keyboardShouldPersistTaps="always"
            />
          )}
        </SafeAreaView>
      </Modal>
    );
  },
);
