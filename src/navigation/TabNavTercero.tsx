import React, {useEffect, useState} from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* Views */
import {Tercero, Survey, ElaborarPedido, ElaborarFactura} from '../views';
/* utils */
import {getCurrentOperator} from '../utils';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setArrProductAdded, setObjOperator} from '../redux/slices';
/* services */
import {encuestaService} from '../data_queries/local_database/services';

const Tab = createBottomTabNavigator();

const TabNavTercero = () => {
  const dispatch = useAppDispatch();

  const operator = useAppSelector(store => store.operator.objOperator);
  const tercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const isShowEncuesta = useAppSelector(store => store.encuesta.isShowEncuesta);
  const [respuestasEncuestas, setRespuestasEncuestas] = useState<any[]>([]);
  const [isEncuestaDisabled, setIsEncuestaDisabled] = useState(true);

  useEffect(() => {
    // Obtener respuestas de encuestas del tercero
    const fetchRespuestasEncuestas = async () => {
      try {
        const encuesta = await encuestaService.getEncuesta(); // Reemplazar 'codigo_actual' con el código dinámico
        const respuestas = await encuestaService.getRespEncuestaByCodigo(
          tercero.codigo,
        );
        setRespuestasEncuestas(respuestas);

        // Verificar si el código de encuesta ya existe
        const encuestaRespondida = respuestas.some(
          respuesta => respuesta.codigo === encuesta?.codigo.toString(), // Reemplaza 'codigo_actual' con el código dinámico
        );
        console.log('encuesta', encuesta);
        console.log('respuestas:', respuestas);
        console.log('encuestaRespondida:', encuestaRespondida);
        setIsEncuestaDisabled(encuestaRespondida);
      } catch (error: any) {
        console.error('Error al obtener respuestas de encuestas:', error);
      }
    };

    fetchRespuestasEncuestas();
  }, [tercero.codigo]);

  const optionsTabScreenLeft = ({
    icon,
  }: {
    icon: string;
  }): BottomTabNavigationOptions => {
    return {
      headerShown: false,
      tabBarIcon: () => (
        <Icon name={icon} style={{color: '#0B2863'}} size={25} />
      ),
      tabBarLabelStyle: {
        color: '#0B2863',
        fontSize: 10,
        fontWeight: 'bold',
      },
      tabBarStyle: {
        height: 70,
        width: '50%',
        paddingBottom: 10,
        backgroundColor: '#FFF',
        marginBottom: 20,
        position: 'absolute',
        marginHorizontal: 10,
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
      },
      tabBarItemStyle: {
        marginTop: 10,
        borderRadius: 10,
        marginHorizontal: 10,
        paddingVertical: 0.5,
      },
      tabBarActiveBackgroundColor: '#B6BFD1',
    };
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Historial"
        component={Tercero}
        options={optionsTabScreenLeft({icon: 'sticker-text'})}
      />
      <Tab.Screen
        name="Encuesta"
        component={Survey}
        options={({route}) => ({
          headerShown: false,
          tabBarIcon: () => (
            <Icon
              name="notebook-plus"
              style={{
                color: isEncuestaDisabled ? '#ccc' : '#0B2863', // Cambiar color si está desactivado
              }}
              size={25}
            />
          ),
          tabBarLabelStyle: {
            color: isEncuestaDisabled ? '#ccc' : '#0B2863', // Cambiar color si está desactivado
            fontSize: 10,
            fontWeight: 'bold',
          },
          tabBarStyle: {
            display: route.name == 'Encuesta' ? 'none' : 'flex',
            height: 70,
            width: '50%',
            paddingBottom: 10,
            backgroundColor: '#FFF',
            marginBottom: 20,
            position: 'absolute',
            marginHorizontal: 10,
            borderRadius: 10,
            paddingLeft: 5,
            paddingRight: 5,
          },
          tabBarItemStyle: {
            marginTop: 10,
            borderRadius: 10,
            marginHorizontal: 10,
            paddingVertical: 0.5,
          },
          tabBarActiveBackgroundColor: '#B6BFD1',
        })}
        listeners={({navigation}) => ({
          tabPress: e => {
            if (isEncuestaDisabled) {
              // Prevenir navegación si está desactivado
              e.preventDefault();
            }
          },
        })}
      />
      <Tab.Screen
        name="ElaborarFactura"
        component={ElaborarFactura}
        options={({route}) => ({
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: () => (
            <Icon
              name="newspaper-check"
              style={{color: '#FFF', position: 'absolute', paddingTop: 38}}
              size={35}
            />
          ),
          tabBarStyle: {
            display: route.name == 'ElaborarFactura' ? 'none' : 'flex',
            height: 80,
            width: '50%',
            paddingBottom: 10,
            backgroundColor: '#FFF',
            marginBottom: 20,
            position: 'absolute',
            marginHorizontal: 10,
            borderRadius: 10,
            paddingLeft: 10,
            paddingRight: 10,
          },
          tabBarItemStyle: {
            position: 'absolute',
            borderRadius: 10,
            backgroundColor: '#0B2863',
            height: 70,
            width: 70,
            marginLeft: 185,
          },
        })}
        listeners={({navigation}) => ({
          tabPress: async e => {
            e.preventDefault();

            const currentOperator = await getCurrentOperator(operator.codigo);
            dispatch(setObjOperator(currentOperator));
            dispatch(setArrProductAdded([]));

            navigation.navigate('ElaborarFactura');
          },
        })}
      />
      <Tab.Screen
        name="ElaborarPedido"
        component={ElaborarPedido}
        options={({route}) => ({
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: () => (
            <Icon
              name="cart-plus"
              style={{color: '#FFF', position: 'absolute', paddingTop: 38}}
              size={35}
            />
          ),
          tabBarStyle: {
            display: route.name == 'ElaborarPedido' ? 'none' : 'flex',
            height: 80,
            width: '50%',
            paddingBottom: 10,
            backgroundColor: '#FFF',
            marginBottom: 20,
            position: 'absolute',
            marginHorizontal: 10,
            borderRadius: 10,
            paddingLeft: 10,
            paddingRight: 10,
          },
          tabBarItemStyle: {
            position: 'absolute',
            borderRadius: 10,
            backgroundColor: '#0B2863',
            height: 70,
            width: 70,
            marginLeft: 265,
          },
        })}
        listeners={({navigation}) => ({
          tabPress: async e => {
            e.preventDefault();

            const currentOperator = await getCurrentOperator(operator.codigo);
            dispatch(setObjOperator(currentOperator));
            dispatch(setArrProductAdded([]));
            navigation.navigate('ElaborarPedido');
          },
        })}
      />
    </Tab.Navigator>
  );
};

export {TabNavTercero};
