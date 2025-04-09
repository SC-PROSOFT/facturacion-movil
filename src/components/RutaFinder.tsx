import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  VirtualizedList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IconLeftInput} from '.';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowRutaFinder} from '../redux/slices/rutaFinderSlice';
import {rutaService} from '../data_queries/local_database/services';
import {IRuta} from '../common/types';
import debounce from 'lodash/debounce';

interface RutaFinderProps {
  toggleRuta?: (ruta: IRuta) => void;
}

export const RutaFinder = React.memo(({toggleRuta}: RutaFinderProps) => {
  const dispatch = useAppDispatch();
  const isShowRutaFinder = useAppSelector(
    store => store.rutaFinder.isShowRutaFinder,
  );

  const [inputs, setInputs] = useState({ruta: ''});
  const [tempRutas, setTempRutas] = useState<IRuta[]>([]);
  const [rutas, setRutas] = useState<IRuta[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<IRuta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isShowRutaFinder) {
      loadAllRutas();
    }
  }, [isShowRutaFinder]);

  useEffect(() => {
    return () => {
      debouncedFilterRutas.cancel();
    };
  }, []);

  const handleInputChange = (name: string, text: string) => {
    setInputs(prevState => ({...prevState, [name]: text}));
    debouncedFilterRutas(text);
  };

  const debouncedFilterRutas = useCallback(
    debounce((text: string) => {
      filterRutas(text);
    }, 500),
    [],
  );

  const filterRutas = async (text: string) => {
    if (text.length === 0) {
      setFilteredRutas(tempRutas); // Cargar todas las rutas si el input está vacío
      return;
    }

    const attribute = /^[0-9]/.test(text) ? 'zona' : 'nombre';
    console.log('Filtrando por:', attribute, 'con texto:', text);

    try {
      const filtered = tempRutas.filter(ruta => {
        const value = ruta[attribute]?.toLowerCase() || ''; // Asegúrate de que el valor no sea undefined
        return value.includes(text.toLowerCase());
      });
      console.log('Resultados filtrados:', filtered);

      setFilteredRutas(filtered);
    } catch (error) {
      console.log('Error al filtrar rutas:', error);
    }
  };

  const closeRutaFinder = () => {
    setRutas([]);
    setFilteredRutas([]);
    dispatch(setIsShowRutaFinder(false));
  };

  const loadAllRutas = async () => {
    setIsLoading(true);
    try {
      const allRutas = await rutaService.getAllRutas();
      console.log('Rutas cargadas:', allRutas); // Verifica los datos cargados
      setTempRutas(allRutas);
      setRutas(allRutas);
      setFilteredRutas(allRutas);
    } catch (error) {
      console.log('Error al cargar rutas:', error);
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

  const renderItem = ({item, index}: {item: IRuta; index: any}) => (
    <TouchableOpacity
      onPress={() => {
        closeRutaFinder();
        toggleRuta && toggleRuta(item);
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
              Ruta: {''}
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
        </View>
        <View>
          <Icon name="arrow-right" size={28} color={'#0B2863'} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isShowRutaFinder}
      onDismiss={closeRutaFinder}
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
            Busqueda de rutas
          </Text>

          <IconButton
            icon="close"
            iconColor="#FFF"
            size={25}
            onPress={closeRutaFinder}
            style={styles.iconClose}
          />
        </View>
        <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
          <IconLeftInput
            value={inputs.ruta}
            name="ruta"
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
            data={filteredRutas}
            initialNumToRender={5}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            getItemCount={() => filteredRutas.length}
            getItem={(data, index) => data[index]}
            keyboardShouldPersistTaps="always"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
});
