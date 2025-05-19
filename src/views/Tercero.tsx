import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  VirtualizedList,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

/* utils */
import {
  formatToMoney,
  getPermissions,
  getUbication,
  sumarCartera,
} from '../utils';
/* types */
import {IOperation, IEncuesta, IFiles, IVisita} from '../common/types';
/* components */
import {
  Movimiento,
  Header,
  SearchLocation,
  CancelarVisita,
} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  filesService,
  tercerosService,
  visitaService,
  carteraService,
} from '../data_queries/local_database/services';
import {
  setObjOperator,
  setArrProductAdded,
  setObjOperation,
  setObjInfoAlert,
  setObjEncuesta,
  setObjVisita,
  setFile,
  setObjTercero,
  setIntCartera,
} from '../redux/slices';
import {showAlert} from '../utils/showAlert';
import {useFocusEffect} from '@react-navigation/native';

const Tercero = () => {
  const windowHeight = Dimensions.get('window').height;
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga

  const listHeight = windowHeight * 0.35;

  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const arrFactura = useAppSelector(store => store.tercerosFinder.arrFactura);
  const arrPedido = useAppSelector(store => store.tercerosFinder.arrPedido);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const objVisita = useAppSelector(store => store.visitas.objVisita);
  const [cartera, setCartera] = useState<any>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isNotLocation, setIsNotLocation] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCancelarVisitaActive, setIsCancelarVisitaActive] =
    useState<boolean>(false);
  const toggleFilesObj = async () => {
    try {
      setIsLoading(true);
      if (
        objTercero.rut_pdf === 'N' ||
        objTercero.camcom_pdf === 'N' ||
        objTercero.di_pdf === 'N'
      ) {
        setShowAlert(true);
        setIsLoading(false);
        return;
      }
      // const files = await filesService.getFilesByCode(objTercero.codigo);

      // // Verificar si files.files es una cadena y convertirla en un array
      // let parsedFiles = files.files;
      // if (typeof files.files === 'string') {
      //   try {
      //     parsedFiles = JSON.parse(files.files);
      //   } catch (error) {
      //     console.error('Error al analizar files.files como JSON:', error);
      //     setShowAlert(true);
      //     return;
      //   } finally {
      //     setIsLoading(false);
      //   }
      // }
      // // Verificar si parsedFiles es un array y tiene elementos
      // if (
      //   Array.isArray(parsedFiles) &&
      //   parsedFiles.length > 0 &&
      //   parsedFiles?.length === 3
      // ) {
      //   dispatch(setFile({...files, files: parsedFiles}));
      //   setShowAlert(false);
      // } else {
      //   setShowAlert(true);
      // }
    } catch (error: any) {
      setShowAlert(true);
    }
  };

  const toggleLocation = async () => {
    const {longitude, latitude} = objTercero;
    if (!longitude || !latitude) {
      setIsNotLocation(true);
      return;
    }
  };
  const getPedidosDelMesActual = (): any[] => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // Mes actual (0-11)
    const anioActual = fechaActual.getFullYear(); // Año actual

    return arrPedido.filter(pedido => {
      const fechaPedido = new Date(pedido.fecha); // Asegúrate de que `pedido.fecha` sea el campo correcto
      return (
        fechaPedido.getMonth() === mesActual &&
        fechaPedido.getFullYear() === anioActual
      );
    });
  };
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useFocusEffect(
    React.useCallback(() => {
      console.log(objTercero);
      toggleLocation();
      toggleFilesObj();
      loadCartera();
    }, []),
  );
  useEffect(() => {
    if (showAlert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [pulseAnim]);

  const sumarTotalFacturaPedidos = (): number => {
    return [...arrFactura, ...getPedidosDelMesActual()] // Usar pedidos filtrados
      .flatMap(doc => doc.articulosAdded)
      .reduce((total, articulo) => total + articulo.valorTotal, 0);
  };
  const loadCartera = async () => {
    try {
      const cartera = await carteraService.getCarteraByAttribute(
        'nit',
        objTercero.codigo,
      );
      console.log('Cartera,', cartera);
      const carteraSumada = sumarCartera(cartera);
      dispatch(setIntCartera(carteraSumada));
      const carteraSeteada = formatToMoney(carteraSumada);
      setCartera(carteraSeteada || 0);
      //🟦
    } catch (error: any) {
      console.log('Error al cargar la cartera', error);
      if (error === 'no hay cartera pendiente') {
        const carteraSeteada = formatToMoney(0);
        setCartera(carteraSeteada);
        return;
      } else {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error,
          }),
        );
      }
    }
  };
  const toggleMovimiento = (operation: IOperation) => {
    dispatch(setArrProductAdded(operation.articulosAdded));
    dispatch(setObjOperator(operation.operador));
    dispatch(setObjOperation(operation));

    if (operation.tipo_operacion == 'factura') {
      navigation.navigate('ModificarFactura');
    } else {
      navigation.navigate('ModificarPedido');
    }
  };

  const toggleGetGeolocation = async () => {
    console.log('Intente obtener la geolocalizacion');
    setIsModalVisible(true); // Abre el modal
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Cierra el modal
  };
  const closeCancelarVisita = () => {
    setIsCancelarVisitaActive(false);
  };

  const handleCancelarVisita = () => {
    setIsCancelarVisitaActive(true);
  };

  const changeMovStatus = async (data: {
    observacion: string;
    status: boolean;
  }) => {
    const modifiedVisita: IVisita = {
      ...objVisita,
      status: '3', // Cambiar el estado a "cancelado"
      observation: data.observacion, // Agregar la observación
    };
    try {
      await visitaService.updateVisita(modifiedVisita, objVisita.id_visita);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'success',
          description: `Se ha cancelado la visita`,
        }),
      );
    } catch (error) {
      console.error('Error al cancelar la visita:', error);
    }
  };

  const saveLocationInVisitaObj = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    console.log('Ubicación guardada:', location);

    const modifiedVisita: IVisita = {
      ...objVisita,
      location: {
        latitude: location.latitude.toString(), // Guardar la ubicación como un objeto con strings
        longitude: location.longitude.toString(),
      }, // Guardar la ubicación como un objeto con strings
    };

    await visitaService.updateVisita(modifiedVisita, objVisita.id_visita);
    console.log('Ubicación convertida a strings:', modifiedVisita);
  };

  const handleSaveLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const {latitude, longitude} = location;
      console.log('Ubicación guardada:', location);
      const terceroModificado = {
        ...objTercero,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      };
      const response = await tercerosService.updateTercero(terceroModificado);
      if (response) {
        dispatch(setObjTercero(terceroModificado));
      }
      await saveLocationInVisitaObj(location);
      setIsNotLocation(false);
    } catch (error) {
      console.log(error);
    }
    dispatch(
      setObjInfoAlert({
        visible: true,
        type: 'success',
        description: `Ubicación guardada correctamente`,
      }),
    );
    // Cierra el modal
  };
  const renderItem = ({item, index}: {item: IOperation; index: any}) => {
    return (
      <Movimiento
        key={index}
        document={item}
        disabled={false}
        toggleVisita={() => toggleMovimiento(item)}
      />
    );
  };

  return (
    <View>
      <View style={styles.boxLight}></View>
      <View style={styles.boxDark}></View>

      <View
        style={{
          zIndex: 3,
        }}>
        <Header />
      </View>

      <View
        style={{
          position: 'absolute',
          flexDirection: 'column',
          alignSelf: 'flex-end',
          marginTop: 50,
          paddingRight: 14,
          zIndex: 4,
          gap: 5,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#485E8A',
            padding: 3,
            borderRadius: 5,
          }}
          onPress={() => navigation.navigate('FilesTercero')}>
          {showAlert && (
            <Animated.View
              style={[styles.alertIndicator, {transform: [{scale: pulseAnim}]}]}
            />
          )}
          <Icon name="attachment" size={36} color={'#FFF'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#485E8A',
            padding: 3,
            borderRadius: 5,
          }}
          onPress={() => {
            toggleGetGeolocation();
          }}>
          {isNotLocation && (
            <Animated.View
              style={[styles.alertIndicator, {transform: [{scale: pulseAnim}]}]}
            />
          )}
          <Icon name="map-marker-radius" size={36} color={'#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#485E8A',
            padding: 3,
            borderRadius: 5,
          }}
          onPress={() => {
            handleCancelarVisita();
          }}>
          <Icon name="table-cancel" size={36} color={'#FFF'} />
        </TouchableOpacity>
      </View>

      <View style={styles.totalCountContainer}>
        <Text style={styles.totalCountTitle}>Total de cuenta</Text>
        <Text style={styles.totalCount}>
          {formatToMoney(sumarTotalFacturaPedidos())}
        </Text>
        <Text style={styles.saldo}>Saldo: {cartera || '$0'}</Text>
      </View>

      <View style={styles.movientosContainer}>
        <Text
          style={{
            color: '#0B2863',
            fontSize: 18,
            paddingHorizontal: 30,
            marginBottom: 10,
          }}>
          Historial movimientos
        </Text>

        <SafeAreaView style={{height: listHeight}}>
          <FlatList
            data={[...getPedidosDelMesActual(), ...arrFactura].reverse()} // Invertir el orden
            // Usar pedidos filtrados
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={4} // Número inicial de elementos a renderizar
            windowSize={3} // Tamaño de la ventana para renderizado
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 100}}>
                <Text style={styles.emptyText}>
                  No hay movimientos este mes
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 20, paddingHorizontal: 15}}
          />
        </SafeAreaView>
      </View>
      <SearchLocation
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
      />
      <CancelarVisita
        visible={isCancelarVisitaActive}
        onClose={closeCancelarVisita}
        onSubmit={data => {
          changeMovStatus(data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  boxLight: {
    position: 'absolute',
    zIndex: 1,
    width: 600,
    height: 260,
    marginLeft: -190,
    marginTop: -20,
    backgroundColor: '#485E8A',
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'black',
    transform: [{rotate: '15deg'}],
  },
  boxDark: {
    position: 'absolute',
    zIndex: 2,
    width: 2000,
    height: 2000,
    marginTop: -2040,
    marginLeft: -540,
    backgroundColor: '#092254',
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#FFF',
    transform: [{rotate: '-32deg'}],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  totalCountContainer: {
    zIndex: 3,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCountTitle: {
    fontSize: 20,
    color: '#FFF',
  },
  totalCount: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  saldo: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
  },
  emptyText: {
    color: '#504D54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movientosContainer: {
    marginTop: 120,
  },
  alertIndicator: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    zIndex: 5,
  },
});

export {Tercero};
