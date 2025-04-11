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
import {setIsShowZonaFinder} from '../redux/slices/zonaFinderSilce';
import {zonaService} from '../data_queries/local_database/services';
import {IZona} from '../common/types';
import debounce from 'lodash/debounce';

interface ZonaFinderProps {
  toggleZona?: (zona: IZona) => void;
}

export const ZonaFinder = React.memo(({toggleZona}: ZonaFinderProps) => {
  const dispatch = useAppDispatch();
  const isShowZonaFinder = useAppSelector(
    store => store.zonaFinder.isShowZonaFinder,
  );
  const [inputs, setInputs] = useState({zona: ''});
  const [tempZonas, setTempZonas] = useState<IZona[]>([]);
  const [zonas, setZonas] = useState<IZona[]>([]);
  const [filteredZonas, setFilteredZonas] = useState<IZona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isShowZonaFinder) {
      loadAllZonas();
    }
  }, [isShowZonaFinder]);

  useEffect(() => {
    return () => {
      debouncedFilterZonas.cancel();
    };
  }, []);

  const handleInputChange = (name: string, text: string) => {
    setInputs(prevState => ({...prevState, [name]: text}));
    debouncedFilterZonas(text);
  };

  const debouncedFilterZonas = useCallback(
    debounce((text: string) => {
      filterZonas(text);
    }, 500),
    [],
  );

  const filterZonas = async (text: string) => {
    if (text.length === 0) {
      setFilteredZonas(tempZonas); // Cargar todas las zonas si el input está vacío
      return;
    }
  
    const attribute = /^[0-9]/.test(text) ? 'zona' : 'nombre';
    console.log('Filtrando por:', attribute, 'con texto:', text);
  
    try {
      const filtered = zonas.filter(zona => {
        // Asegúrate de que la clave existe y no es undefined
        const value = zona[attribute] ? zona[attribute].toString().toLowerCase() : '';
        return value.includes(text.toLowerCase());
      });
      console.log('Resultados filtrados:', filtered);
      setFilteredZonas(filtered); // Actualizar las zonas filtradas
    } catch (error) {
      console.error('Error al filtrar zonas:', error);
    }
  };

  const closeZonaFinder = () => {
    setZonas([]);
    setFilteredZonas([]);
    dispatch(setIsShowZonaFinder(false));
  };

  const loadAllZonas = async () => {
    setIsLoading(true);

    try {
      const allZonas = await zonaService.getAllZonas();
      console.log('allZonas:', allZonas); // Verifica los datos cargados
      setTempZonas(allZonas);
      setZonas(allZonas);
      setFilteredZonas(allZonas);
    } catch (error) {
      console.error('Error al obtener zonas:', error);
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

  const renderItem = ({item, index}: {item: IZona; index: any}) => (
    <TouchableOpacity
      onPress={() => {
        closeZonaFinder();
        toggleZona && toggleZona(item);
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
              Zona:{' '}
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
          <Icon name="chevron-right" size={20} color="#303134"></Icon>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isShowZonaFinder}
      onDismiss={closeZonaFinder}
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
            Busqueda de Zonas
          </Text>

          <IconButton
            icon="close"
            iconColor="#FFF"
            size={25}
            onPress={closeZonaFinder}
            style={styles.iconClose}
          />
        </View>

        <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
          <IconLeftInput
            value={inputs.zona}
            name="zona"
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
            data={filteredZonas}
            renderItem={renderItem}
            getItemCount={data => data.length}
            getItem={(data, index) => data[index]}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="always"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
});
