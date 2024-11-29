import React, {ReactNode} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Avatar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useNavigationState} from '@react-navigation/native';

/* utils */
import {getInitialsOfClient} from '../utils';
import {generarPDF} from '../prints/generarPdf';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setArrProductAdded} from '../redux/slices';
/* services */
import {
  pedidosService,
  facturasService,
} from '../data_queries/local_database/services';

interface HeaderProps {
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({children}) => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  const objVisita = useAppSelector(store => store.visita.objVisita);
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);

  const handleBackPress = () => {
    dispatch(setArrProductAdded([]));

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TabNavPrincipal');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Text
            size={42}
            label={getInitialsOfClient(objTercero.nombre)}
            style={{borderRadius: 10}}
          />
          <View style={{marginLeft: 10}}>
            <Text style={{color: '#FFF', fontSize: 20}}>
              {objTercero.nombre}
            </Text>
            <Text style={{color: '#FFF', fontSize: 16, fontWeight: 'bold'}}>
              {objVisita.adress}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleBackPress}>
          <Icon name="arrow-u-left-top" size={28} color={'#FFF'} />
        </TouchableOpacity>
      </View>

      {children}
    </View>
  );
};

const HeaderActionButtons = () => {
  const currentRouteName = useNavigationState(state => {
    const route = state.routes[state.index]; // Obtiene la ruta activa
    return route.name; // Retorna el nombre de la ruta
  });

  const objOperador = useAppSelector(store => store.operator.objOperator);
  const objConfig = useAppSelector(store => store.config.objConfig);

  const togglePrint = async () => {
    if (currentRouteName == 'ModificarPedido') {
      const pedido = await pedidosService.getByAttribute(
        'operador_nro_pedido',
        objOperador.nro_pedido,
      );

      await generarPDF(pedido[0], objConfig, 'pedido');
    }

    if (currentRouteName == 'ModificarFactura') {
      const factura = await facturasService.getByAttribute(
        'operador_nro_factura',
        objOperador.nro_factura,
      );

      await generarPDF(factura[0], objConfig, 'factura');
    }
    try {
    } catch (error) {
      console.error(`[Fallo al obtener pedido]: ${error}`);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
      }}>
      <View
        style={{
          width: '55%',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
        <Text style={{color: '#FFF', fontSize: 24, fontWeight: 'bold'}}>
          Consecutivo{' '}
          {currentRouteName == 'ElaborarPedido' ||
          currentRouteName == 'ModificarPedido'
            ? Number(objOperador.nro_pedido)
            : Number(objOperador.nro_factura)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '12%',
        }}>
        {currentRouteName == 'ModificarPedido' ||
        currentRouteName == 'ModificarFactura' ? (
          <TouchableOpacity style={styles.button} onPress={() => togglePrint()}>
            <Icon name="printer" size={38} color={'#FFF'} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#092254',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  container1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#485E8A',
    padding: 5,
    borderRadius: 5,
  },
});

export {Header, HeaderActionButtons};
