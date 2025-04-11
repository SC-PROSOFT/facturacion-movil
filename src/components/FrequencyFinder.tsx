import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  VirtualizedList,
} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IconLeftInput} from '.';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowFrecuenciaFinder} from '../redux/slices/frecuenciasFinderSlice';
import {IFrecuencia} from '../common/types';
import debounce from 'lodash/debounce';
import {frecuenciaService} from '../data_queries/local_database/services';

interface FrecuenciaFinderProps {
  toggleFrecuencia?: (frecuencia: IFrecuencia) => void;
}

export const FrecuenciaFinder = React.memo(
  ({toggleFrecuencia}: FrecuenciaFinderProps) => {
    const dispatch = useAppDispatch();
    const isShowFrecuenciaFinder = useAppSelector(
      store => store.frecuenciaFinder.isShowFrecuenciaFinder,
    );
    const arrFrecuencia = useAppSelector(
      store => store.frecuenciaFinder.arrFrecuencia,
    ); // Obtiene las frecuencias del estado global

    const [inputs, setInputs] = useState({frecuencia: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [tempFrecuencias, setTempFrecuencias] = useState<IFrecuencia[]>([]);
    const [frecuencias, setFrecuencias] = useState<IFrecuencia[]>([]);
    const [filteredFrecuencias, setFilteredFrecuencias] = useState<
      IFrecuencia[]
    >([]);

    useEffect(() => {
      if (isShowFrecuenciaFinder) {
        loadAllFrecuencias();
      }
    }, [isShowFrecuenciaFinder]);

    useEffect(() => {
      return () => {
        debouncedFilterFrecuencias.cancel();
      };
    }, []);
    const closeFrecuenciaFinder = () => {
      dispatch(setIsShowFrecuenciaFinder(false));
    };

    const handleSelectFrecuencia = (frecuencia: IFrecuencia) => {
      if (toggleFrecuencia) {
        toggleFrecuencia(frecuencia); // Llama a la función de callback con la frecuencia seleccionada
      }
      closeFrecuenciaFinder();
    };

    const handleInputChange = (name: string, text: string) => {
      setInputs(prevState => ({...prevState, [name]: text}));
      debouncedFilterFrecuencias(text);
    };

    const debouncedFilterFrecuencias = useCallback(
      debounce((text: string) => {
        filterFrecuencias(text);
      }, 500),
      [],
    );

    const filterFrecuencias = async (text: string) => {
      if (text.length === 0) {
        console.log('Texto vacío, cargando todas las frecuencias.');
        setFilteredFrecuencias(tempFrecuencias); // Cargar todas las frecuencias si el input está vacío
        return;
      }

      const attribute = /^[0-9]/.test(text) ? 'zona' : 'nombre';
      console.log('Filtrando por:', attribute, 'con texto:', text);

      try {
        const filtered = tempFrecuencias.filter(frecuencia => {
          // Asegúrate de que la clave existe y no es undefined
          const value =
            frecuencia[attribute]?.toString().trim().toLowerCase() || ''; // Eliminar espacios y convertir a minúsculas
          const searchText = text.trim().toLowerCase(); // Eliminar espacios y convertir a minúsculas
          return value.includes(searchText); // Comparar en minúsculas
        });
        console.log('Resultados filtrados:', filtered);

        setFilteredFrecuencias(filtered);
      } catch (error) {
        console.error('Error al filtrar frecuencias:', error);
      }
    };

    const loadAllFrecuencias = async () => {
      setIsLoading(true);
      setIsFirstLoad(true);
      try {
        const frecuencias = await frecuenciaService.getAllFrecuencias();
        console.log('Frecuencias:', frecuencias); // Verifica los datos cargados
        setFrecuencias(frecuencias);
        setTempFrecuencias(frecuencias);
        setFilteredFrecuencias(frecuencias);
      } catch (error) {
        console.error('Error al cargar las frecuencias:', error);
      } finally {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
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

    const renderItem = ({item, index}: {item: IFrecuencia; index: any}) => (
      <TouchableOpacity
        onPress={() => handleSelectFrecuencia(item)}
        style={styles.item}>
        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{color: 'grey', fontSize: 15, fontWeight: 'bold'}}>
            Codigo:{' '}
          </Text>
          <Text allowFontScaling={false} style={styles.codigo}>
            {item.zona}
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
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isShowFrecuenciaFinder}
        onDismiss={closeFrecuenciaFinder}
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
              Busqueda de frecuencias
            </Text>
            <IconButton
              icon="close"
              iconColor="#FFF"
              size={25}
              onPress={closeFrecuenciaFinder}
              style={styles.iconClose}
            />
          </View>
          <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
            <IconLeftInput
              value={inputs.frecuencia}
              name="frecuencia"
              mode="flat"
              keyboardType="default"
              icon="magnify"
              handleInputChange={handleInputChange}
            />
          </View>
        </View>
        <SafeAreaView>
          {isLoading && isFirstLoad ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <VirtualizedList
              data={filteredFrecuencias}
              initialNumToRender={4}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              getItemCount={data => data.length}
              getItem={(data, index) => data[index]}
              keyboardShouldPersistTaps="always"
            />
          )}
        </SafeAreaView>
      </Modal>
    );
  },
);
