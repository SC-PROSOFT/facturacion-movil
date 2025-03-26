import React, {useState, useEffect, useCallback} from 'react';
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
import {IconLeftInput} from '.';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowTercerosFinder} from '../redux/slices/tercerosFinderSlice';
import {tercerosService} from '../data_queries/local_database/services';
import {ITerceros} from '../common/types';
import debounce from 'lodash/debounce';

interface TercerosFinderProps {
  toggleTercero?: (tercero: ITerceros) => void;
  searchTable: 'terceros' | 'terceros_nuevos';
}

export const TercerosFinder = React.memo(
  ({toggleTercero, searchTable}: TercerosFinderProps) => {
    const dispatch = useAppDispatch();
    const route = useRoute();
    const isShowTercerosFinder = useAppSelector(
      store => store.tercerosFinder.isShowTercerosFinder,
    );
    const objConfig = useAppSelector(store => store.config.objConfig);
    const objOperador = useAppSelector(store => store.operator.objOperator);
    const [inputs, setInputs] = useState({operador: ''});
    const [tempTerceros, setTempTerceros] = useState<ITerceros[]>([]);
    const [terceros, setTerceros] = useState<ITerceros[]>([]);
    const [filteredTerceros, setFilteredTerceros] = useState<ITerceros[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [quantityTerceros, setQuantityTerceros] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [isLoadingTerceros, setIsLoadingTerceros] = useState(false);

    useEffect(() => {
      adjustScreenSize();
    }, []);

    useEffect(() => {
      if (isShowTercerosFinder && !isLoadingTerceros) {
        loadAllTerceros();
      }
    }, [isShowTercerosFinder]);
    useEffect(() => {
      return () => {
        debouncedFilterTerceros.cancel();
      };
    }, []);

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
      debouncedFilterTerceros(text);
    };

    const debouncedFilterTerceros = useCallback(
      debounce((text: string) => {
        filterTerceros(text);
      }, 2000),
      [],
    );

    const filterTerceros = async (text: string) => {
      if (text.length === 0) {
        setFilteredTerceros(tempTerceros);
        return;
      }

      const attribute = /^[0-9]/.test(text) ? 'codigo' : 'nombre';
      try {
        const filtered = await tercerosService.getByLikeAttribute(
          attribute,
          text,
          searchTable,
        );

        setFilteredTerceros(filtered);
        console.log('Filtered Terceros:', filtered);
      } catch (error) {
        console.error('Error al filtrar terceros:', error);
      }
    };

    const closeOperadoresFinder = () => {
      setTerceros([]);
      setFilteredTerceros([]);
      dispatch(setIsShowTercerosFinder(false));
    };

    const loadAllTerceros = async () => {
      if (isLoadingTerceros) return; // Evitar múltiples ejecuciones
      setIsLoadingTerceros(true);
      setIsLoading(true);

      try {
        const {filtrarTercerosPorVendedor} = objConfig;
        const {cod_vendedor} = objOperador;

        const quantityTerceros = await tercerosService.getQuantityByTable(
          searchTable,
        );
        setQuantityTerceros(parseInt(quantityTerceros));

        const allTerceros = await tercerosService.getPaginatedByTable(
          searchTable,
          1, // Reset page to 1
          pageSize,
        );
        console.log('All Terceros:', allTerceros);

        console.log(terceros);
        if (route.name != 'Sync' && filtrarTercerosPorVendedor) {
          const filteredTerceros = allTerceros.filter(
            tercero => tercero.vendedor === cod_vendedor,
          );
          setTempTerceros(filteredTerceros);
          setTerceros(filteredTerceros);
          setFilteredTerceros(filteredTerceros);
        } else {
          setTempTerceros(allTerceros);
          setTerceros(allTerceros);
          setFilteredTerceros(allTerceros);
        }
      } catch (error) {
        console.error('Error al obtener terceros:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingTerceros(false);
        setIsFirstLoad(false);
      }
    };

    const loadMoreTerceros = async () => {
      if (isLoading) return;
      if (filteredTerceros.length >= quantityTerceros) return;

      setIsLoading(true);
      const newPage = page + 1;

      try {
        const moreTerceros = await tercerosService.getPaginatedByTable(
          searchTable,
          newPage,
          pageSize,
        );

        setTerceros(prevTerceros => [...prevTerceros, ...moreTerceros]);
        setFilteredTerceros(prevTerceros => [...prevTerceros, ...moreTerceros]);
        setTempTerceros(prevTerceros => [...prevTerceros, ...moreTerceros]);
        setPage(newPage);
      } catch (error) {
        console.error('Error al cargar más terceros:', error);
      } finally {
        setIsLoading(false);
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
    console.log('Terceros:', filteredTerceros);
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
              Busqueda de terceros ({quantityTerceros})
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

        <SafeAreaView style={{paddingHorizontal: 10, paddingBottom: 120}}>
          {isLoading && isFirstLoad ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <VirtualizedList
              data={filteredTerceros}
              renderItem={renderItem}
              getItemCount={data => data.length}
              getItem={(data, index) => data[index]}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="always"
              onEndReached={loadMoreTerceros}
              onEndReachedThreshold={0.7}
              ListFooterComponent={
                isLoading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#0000ff" />
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    );
  },
);
