import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* Views */
import {
  Visitas,
  Sync,
  ActualizarFacturas,
  ActualizarPedidos,
  SyncDispositivo,
  Estadisticas,
} from '../views';
/* redux */
import {useAppSelector} from '../redux/hooks';
import {setIsShowTercerosFinder} from '../redux/slices';

const Tab = createBottomTabNavigator();

const TabNavPrincipal = () => {
  const isShowTercerosFinder = useAppSelector(
    store => store.tercerosFinder.isShowTercerosFinder,
  );

  const optionsTabScreen = ({
    icon,
  }: {
    icon: string;
  }): BottomTabNavigationOptions => {
    return {
      headerShown: false,
      tabBarIcon: () => (
        <Icon name={icon} style={{color: '#0B2863'}} size={30} />
      ),
      tabBarLabelStyle: {
        color: '#0B2863',
        fontSize: 14,
        fontWeight: 'bold',
      },
      tabBarStyle: {
        display: isShowTabBar(),
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
        backgroundColor: '#FFF',
        marginBottom: 20,
        position: 'absolute',
        marginHorizontal: 10,
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
      },
      tabBarItemStyle: {
        borderRadius: 10,
      },
      tabBarActiveBackgroundColor: '#B6BFD1',
    };
  };
  const isShowTabBar = (): 'none' | 'flex' => {
    if (isShowTercerosFinder) {
      return 'none';
    } else {
      return 'flex';
    }
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Visitas"
        component={Visitas}
        options={optionsTabScreen({icon: 'transit-connection-variant'})}
      />
      {/* <Tab.Screen
        name="Sinc. facturas"
        component={ActualizarPedidos}
        options={optionsTabScreen({icon: 'receipt'})}
      /> */}
      <Tab.Screen
        name="Estadisticas"
        component={Estadisticas}
        options={optionsTabScreen({icon: 'chart-bar'})}
      />

      <Tab.Screen
        name="Sincronización"
        component={SyncDispositivo}
        options={optionsTabScreen({icon: 'cloud-sync'})}
      />
      <Tab.Screen
        name="Actualizar"
        component={Sync}
        options={optionsTabScreen({icon: 'cellphone-check'})}
      />
    </Tab.Navigator>
  );
};
export {TabNavPrincipal};
