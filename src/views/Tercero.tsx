// Tercero.tsx
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
  Platform, // Para posible paddingTop específico de plataforma
  // Dimensions, // No es estrictamente necesario si usamos flex
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

/* utils */
import {formatToMoney, sumarCartera} from '../utils';
/* types */
import {IOperation, IVisita} from '../common/types';
/* components */
import {
  Movimiento,
  Header,
  SearchLocation,
  CancelarVisita,
} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
// No es necesario importar todos los services aquí si no se usan directamente
// import { tercerosService, visitaService, carteraService } from '../data_queries/local_database/services';
import {
  // Solo los services usados en este archivo
  tercerosService,
  visitaService,
  carteraService,
  pedidosService,
} from '../data_queries/local_database/services';

import {
  // Solo las actions usadas en este archivo
  setObjOperator,
  setArrProductAdded,
  setObjOperation,
  setObjInfoAlert,
  setObjVisita,
  setObjTercero,
  setIntCartera,
} from '../redux/slices';
import {all} from 'axios';
import Toast from 'react-native-toast-message';

const Tercero = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const arrFactura = useAppSelector(store => store.tercerosFinder.arrFactura);
  const arrPedido = useAppSelector(store => store.tercerosFinder.arrPedido);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const objVisita = useAppSelector(store => store.visitas.objVisita);

  const [cartera, setCartera] = useState<string>('$0');
  const [showMissingFilesAlert, setShowMissingFilesAlert] =
    useState<boolean>(false);
  const [showMissingLocationAlert, setShowMissingLocationAlert] =
    useState<boolean>(false);
  const [isLocationModalVisible, setIsLocationModalVisible] =
    useState<boolean>(false);
  const [isCancelarVisitaModalVisible, setIsCancelarVisitaModalVisible] =
    useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const getPedidosDelMesActual = useCallback((): IOperation[] => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const anioActual = fechaActual.getFullYear();
    return arrPedido.filter(pedido => {
      if (!pedido.fecha) return false;
      const fechaPedido = new Date(pedido.fecha);
      return (
        fechaPedido.getMonth() === mesActual &&
        fechaPedido.getFullYear() === anioActual
      );
    });
  }, [arrPedido]);

  const combinedMovements = useMemo(() => {
    // Asegúrate que tus IOperation tengan un campo 'id' único
    // Si no, necesitas una forma robusta de generar una clave para FlatList
    const allMovements = [...getPedidosDelMesActual(), ...arrFactura];
    console.log(allMovements);
    return allMovements.sort((a, b) => b.id - a.id);
  }, [getPedidosDelMesActual, arrFactura, arrPedido]);

  const calculateTotalCuentaValue = useCallback(
    (movements: IOperation[]): number => {
      return movements
        .flatMap(doc => doc.articulosAdded || [])
        .reduce((total, articulo) => total + (articulo.valorTotal || 0), 0);
    },
    [],
  );

  const totalCuenta = useMemo(() => {
    return calculateTotalCuentaValue(combinedMovements);
  }, [combinedMovements, calculateTotalCuentaValue]);

  const checkTerceroData = useCallback(() => {
    if (objTercero) {
      setShowMissingFilesAlert(
        objTercero.rut_pdf === 'N' ||
          objTercero.camcom_pdf === 'N' ||
          objTercero.di_pdf === 'N',
      );
      setShowMissingLocationAlert(
        !objTercero.longitude || !objTercero.latitude,
      );
    } else {
      setShowMissingFilesAlert(false);
      setShowMissingLocationAlert(false);
    }
  }, [objTercero]);

  const loadCartera = useCallback(async () => {
    if (!objTercero || !objTercero.codigo) {
      setCartera(formatToMoney(0));
      return;
    }
    try {
      const carteraData = await carteraService.getCarteraByAttribute(
        'nit',
        objTercero.codigo,
      );
      const carteraSumada = sumarCartera(carteraData);
      dispatch(setIntCartera(carteraSumada));
      setCartera(formatToMoney(carteraSumada));
    } catch (error: any) {
      setCartera(formatToMoney(0));
      const errorMessage = error.message || String(error);
      if (errorMessage.toLowerCase() !== 'no hay cartera pendiente') {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: errorMessage,
          }),
        );
      }
    }
  }, [dispatch, objTercero]);

  useFocusEffect(
    useCallback(() => {
      checkTerceroData();
      loadCartera();
    }, [checkTerceroData, loadCartera]),
  );

  useEffect(() => {
    const animate = showMissingFilesAlert || showMissingLocationAlert;
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        {iterations: 3},
      ).start();
    } else {
      pulseAnim.setValue(1); // Detener y resetear si no hay alerta
      // pulseAnim.stopAnimation(); // También puedes usar esto si la animación está en curso
    }
  }, [showMissingFilesAlert, showMissingLocationAlert, pulseAnim]);

  // const toggleMovimiento = useCallback(
  //   (operation: IOperation) => {
  //     dispatch(setArrProductAdded(operation.articulosAdded));
  //     dispatch(setObjOperator(operation.operador));
  //     dispatch(setObjOperation(operation));
  //     navigation.navigate(
  //       operation.tipo_operacion === 'factura'
  //         ? 'ModificarFactura'
  //         : 'ModificarPedido',
  //     );
  //   },
  //   [dispatch, navigation],
  // );

  const toggleMovimiento = (operation: IOperation) => {
    dispatch(setArrProductAdded(operation.articulosAdded));
    dispatch(setObjOperator(operation.operador));
    dispatch(setObjOperation(operation));
    navigation.navigate(
      operation.tipo_operacion === 'factura'
        ? 'ModificarFactura'
        : 'ModificarPedido',
    );
  };

  const handleDeletePedido = async (id: string) => {
    try {
      const response = await pedidosService.delete(id);
      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Movimiento eliminado correctamente 🥳',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'No se pudo eliminar el movimiento 😢',
        });
      }
      checkTerceroData();
    } catch (error) {
      console.log(error);
      Toast.show({type: 'error', text1: 'Error al eliminar movimiento ❌'});
      throw error;
    }
  };

  const handleOpenLocationModal = () => setIsLocationModalVisible(true);
  const handleCloseLocationModal = () => setIsLocationModalVisible(false);
  const handleOpenCancelarVisitaModal = () =>
    setIsCancelarVisitaModalVisible(true);
  const handleCloseCancelarVisitaModal = () =>
    setIsCancelarVisitaModalVisible(false);

  const handleSaveLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!objTercero || !objTercero.codigo) return;
    try {
      const terceroModificado = {
        ...objTercero,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      };
      await tercerosService.updateTercero(terceroModificado);
      dispatch(setObjTercero(terceroModificado));
      setShowMissingLocationAlert(false);
      if (objVisita && objVisita.id_visita) {
        const modifiedVisita: IVisita = {
          ...objVisita,
          location: {
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
          },
        };
        await visitaService.updateVisita(
          modifiedVisita,
          objVisita.id_visita.toString(),
        );
      }
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'success',
          description: 'Ubicación guardada.',
        }),
      );
    } catch (error: any) {
      console.log(error);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Fallo al guardar ubicación.',
        }),
      );
    }
    handleCloseLocationModal();
  };

  const handleConfirmCancelarVisita = async (data: {
    observacion: string;
    status: boolean;
  }) => {
    if (!objVisita || !objVisita.id_visita) return;
    const modifiedVisita: IVisita = {
      ...objVisita,
      status: '3',
      observation: data.observacion,
    };
    try {
      await visitaService.updateVisita(
        modifiedVisita,
        objVisita.id_visita.toString(),
      );
      dispatch(setObjVisita(modifiedVisita));
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'success',
          description: 'Visita cancelada.',
        }),
      );
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Fallo al cancelar visita.',
        }),
      );
    }
    handleCloseCancelarVisitaModal();
  };

  const renderItem = ({item}: {item: IOperation}) => (
    <Movimiento
      document={item}
      onPressItem={toggleMovimiento} // toggleMovimiento espera el objeto IOperation
      onDeletePedido={pedidoId => handleDeletePedido(pedidoId)} // Si necesitas manejar la eliminación
    />
  );

  return (
    <View style={styles.fullScreenContainer}>
      {/* --- Sección Superior como estaba en tu código original --- */}
      <View style={styles.originalBoxLight_fromUser} />
      <View style={styles.originalBoxDark_fromUser} />

      <View style={styles.headerWrapper_fromUser}>
        <Header />
      </View>

      <View style={styles.originalTotalCountContainer_fromUser}>
        <Text style={styles.originalTotalCountTitle_fromUser}>
          Total de cuenta
        </Text>
        <Text style={styles.originalTotalCount_fromUser}>
          {formatToMoney(totalCuenta)}
        </Text>
        <Text style={styles.originalSaldo_fromUser}>Saldo: {cartera}</Text>
      </View>
      {/* --- Fin Sección Superior Original --- */}

      {/* --- Botones de Acción Flotantes (Nuevo Diseño) --- */}
      <View style={styles.newFloatingActionsContainer}>
        <TouchableOpacity
          style={styles.newActionButton}
          onPress={() => navigation.navigate('FilesTercero')}>
          {showMissingFilesAlert && (
            <Animated.View
              style={[
                styles.newAlertIndicator,
                {transform: [{scale: pulseAnim}]},
              ]}
            />
          )}
          <Icon name="attachment" size={28} color={'#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newActionButton}
          onPress={handleOpenLocationModal}>
          {showMissingLocationAlert && (
            <Animated.View
              style={[
                styles.newAlertIndicator,
                {transform: [{scale: pulseAnim}]},
              ]}
            />
          )}
          <Icon name="map-marker-radius" size={28} color={'#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newActionButton}
          onPress={handleOpenCancelarVisitaModal}>
          <Icon name="calendar-remove-outline" size={28} color={'#FFF'} />
        </TouchableOpacity>
      </View>
      {/* --- Fin Botones de Acción Flotantes --- */}

      {/* --- Sección de Historial de Movimientos (Scrollable, Nuevo Diseño) --- */}
      <View style={styles.newMovimientosListSection}>
        <Text style={styles.newHistorialTitle}>Historial movimientos</Text>
        <SafeAreaView style={styles.newListSafeArea}>
          <FlatList
            data={combinedMovements}
            renderItem={renderItem}
            keyExtractor={item => item.id?.toString()} // IMPORTANTE: IOperation DEBE tener un campo 'id' único
            ListEmptyComponent={
              <View style={styles.newEmptyListContainer}>
                <Text style={styles.newEmptyText}>
                  No hay movimientos este mes
                </Text>
              </View>
            }
            contentContainerStyle={styles.newListContentContainer}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={11}
            getItemLayout={(_data, index) =>
              // (Altura APROXIMADA del item + marginBottom deseado)
              // Ej: Si Movimiento mide 78px + 2px de gap = 80
              ({length: 80, offset: 80 * index, index})
            }
          />
        </SafeAreaView>
      </View>
      {/* --- Fin Sección de Historial --- */}

      {/* Modales */}
      <SearchLocation
        visible={isLocationModalVisible}
        onClose={handleCloseLocationModal}
        onSave={handleSaveLocation}
      />
      <CancelarVisita
        visible={isCancelarVisitaModalVisible}
        onClose={handleCloseCancelarVisitaModal}
        onSubmit={handleConfirmCancelarVisita}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#E9EFF5', // Color de fondo general
  },
  // --- Estilos de tu diseño original para la parte superior ---
  originalBoxLight_fromUser: {
    position: 'absolute',
    zIndex: 1,
    width: 600,
    height: 260,
    marginLeft: -190,
    marginTop: -20,
    backgroundColor: '#485E8A',
    // elevation: 10, // react-native-shadow-2 maneja mejor las sombras multiplataforma
    borderWidth: 1.5,
    borderColor: 'black',
    transform: [{rotate: '15deg'}],
  },
  originalBoxDark_fromUser: {
    position: 'absolute',
    zIndex: 2, // Encima del light box
    width: 2000,
    height: 2000,
    marginTop: -2040,
    marginLeft: -540,
    backgroundColor: '#092254',
    // elevation: 10,
    borderWidth: 1.5,
    borderColor: '#FFF',
    transform: [{rotate: '-32deg'}],
  },
  headerWrapper_fromUser: {
    // Contenedor para el Header
    zIndex: 3, // Encima de los boxes
    // El componente Header usualmente se posiciona o tiene altura propia
    // Si es un header flotante, necesitará position: 'absolute', top, left, right
    // Si es parte del flujo, el siguiente elemento (totalCountContainer) necesitará un marginTop
    paddingTop: Platform.OS === 'android' ? 10 : 40, // Espacio para la barra de estado
  },
  originalTotalCountContainer_fromUser: {
    zIndex: 3, // Encima de los boxes
    height: 180, // Altura fija como en tu original
    alignItems: 'center',
    justifyContent: 'center',
    // Este se renderizará después del Header. Si Header no es absoluto y tiene altura,
    // este contenedor será empujado hacia abajo. Si Header es absoluto,
    // este podría necesitar un paddingTop para no quedar debajo del Header.
    // Por ahora, asumimos que el Header se renderiza y este va después.
  },
  originalTotalCountTitle_fromUser: {fontSize: 20, color: '#FFF'},
  originalTotalCount_fromUser: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  originalSaldo_fromUser: {fontSize: 16, color: '#FFF', marginTop: 10},

  // --- Estilos para los Botones Flotantes (Nuevo Diseño) ---
  newFloatingActionsContainer: {
    position: 'absolute',
    top: 80, // Ajusta este valor para que quede bien debajo de tu Header
    right: 15,
    zIndex: 4, // Encima de la sección de total, pero debajo de modales
    gap: 8,
  },
  newActionButton: {
    backgroundColor: 'rgba(72, 94, 138, 0.7)',
    padding: 10,
    borderRadius: 25,
    elevation: 4,
  },
  newAlertIndicator: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    zIndex: 1,
  },

  // --- Estilos para la Sección de Lista de Movimientos (Nuevo Diseño) ---
  newMovimientosListSection: {
    flex: 1, // Clave para que la lista ocupe el espacio restante y permita scroll
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    // El marginTop para esta sección es crucial.
    // Debe ser la altura visible de tu sección superior.
    // Si originalTotalCountContainer_fromUser tiene height: 180 y está después del Header,
    // y el Header mide, digamos, 50px, entonces el marginTop sería alrededor de 230.
    // O, si totalCountContainer está DENTRO de un área con altura fija,
    // entonces esta lista debe empezar DESPUÉS de esa área.
    // Tu estilo original 'movientosContainer' tenía marginTop: 120. Probemos con eso.
    marginTop: 120, // AJUSTA ESTE VALOR CUIDADOSAMENTE
    // Si `originalTotalCountContainer_fromUser` (height 180) se renderiza después del
    // `Header` (supongamos 50px de altura), entonces 50 + 180 = 230px.
    // Pero tu `boxLight` y `boxDark` crean un fondo que podría ser más alto.
    // El `marginTop` de `movientosContainer` de tu código original es la mejor pista.
  },
  newHistorialTitle: {
    color: '#0B2863',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  newListSafeArea: {flex: 1},
  newListContentContainer: {paddingHorizontal: 15, paddingBottom: 70}, // paddingBottom para que el último ítem no quede pegado al tab bar
  newEmptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  newEmptyText: {color: '#6c757d', fontSize: 16},
});

export {Tercero};
