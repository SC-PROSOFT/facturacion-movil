import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  VirtualizedList,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

/* utils */
import {formatToMoney, getPermissions, getUbication} from '../utils';
/* types */
import {IOperation, IEncuesta, IFiles} from '../common/types';
/* components */
import {Movimiento, Header} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {filesService} from '../data_queries/local_database/services';
import {
  setObjOperator,
  setArrProductAdded,
  setObjOperation,
  setObjInfoAlert,
  setObjEncuesta,
  setFile,
} from '../redux/slices';
import {showAlert} from '../utils/showAlert';
import {useFocusEffect} from '@react-navigation/native'; // Importa useFocusEffect

const Tercero = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const arrFactura = useAppSelector(store => store.tercerosFinder.arrFactura);
  const arrPedido = useAppSelector(store => store.tercerosFinder.arrPedido);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const toggleFilesObj = async () => {
    try {
      const files = await filesService.getFilesByCode(objTercero.codigo);
      console.log('Encuesta', files);
      dispatch(setFile(files));
      isShowAlert(files);
    } catch (error: any) {
      setShowAlert(true);
    }
  };

  const isShowAlert = async (files: IFiles) => {
    console.log('files', files);
    if ((files?.files?.length ?? 0) == 0 || (files?.files?.length ?? 0) < 3) {
      setShowAlert(true);
    }
    return setShowAlert(false);
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useFocusEffect(
    React.useCallback(() => {
      toggleFilesObj(); // Ejecutar toggleFilesObj cada vez que la vista sea visible
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
    return [...arrFactura, ...arrPedido]
      .flatMap(doc => doc.articulosAdded)
      .reduce((total, articulo) => total + articulo.valorTotal, 0);
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
    try {
      const migeo = await getUbication();
      console.log('objTercero', objTercero);
      console.log('migeo', migeo);
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'info',
          description: `${error.message}`,
        }),
      );
    }
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
          <Icon name="map-marker-radius" size={36} color={'#FFF'} />
        </TouchableOpacity>
      </View>

      <View style={styles.totalCountContainer}>
        <Text style={styles.totalCountTitle}>Total de cuenta</Text>
        <Text style={styles.totalCount}>
          {formatToMoney(sumarTotalFacturaPedidos())}
        </Text>
        <Text style={styles.saldo}>-----------------------</Text>
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

        <SafeAreaView>
          <VirtualizedList
            data={[...arrPedido, ...arrFactura]}
            renderItem={renderItem}
            getItemCount={data => data.length}
            getItem={(data, index) => data[index]}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={<View style={{height: 100}} />}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 100}}>
                <Text
                  style={{color: '#504D54', fontSize: 16, fontWeight: 'bold'}}>
                  SIN MOVIMIENTOS ESTE MES
                </Text>
              </View>
            }
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              height: 520,
            }}
          />
        </SafeAreaView>
      </View>
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
    fontSize: 17,
    color: '#FFF',
    marginTop: 10,
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
