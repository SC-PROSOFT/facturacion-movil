import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  VirtualizedList,
  SafeAreaView,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

/* utils */
import {formatToMoney} from '../utils';
/* types */
import {IOperation} from '../common/types';
/* components */
import {Movimiento, Header} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  setObjOperator,
  setArrProductAdded,
  setObjOperation,
} from '../redux/slices';

const Tercero = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();

  const arrFactura = useAppSelector(store => store.tercerosFinder.arrFactura);
  const arrPedido = useAppSelector(store => store.tercerosFinder.arrPedido);

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
});

export {Tercero};