import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* Views */
import {Visitas, Sync, ActualizarFacturas, ActualizarPedidos} from '../views';

const Tab = createBottomTabNavigator();

const TabNavPrincipal = () => {
  const optionsTabScreen = ({
    icon,
  }: {
    icon: string;
  }): BottomTabNavigationOptions => {
    return {
      headerShown: false,
      tabBarIcon: () => (
        <Icon name={icon} style={{color: '#0B2863'}} size={38} />
      ),
      tabBarLabelStyle: {
        color: '#0B2863',
        fontSize: 14,
        fontWeight: 'bold',
      },
      tabBarStyle: {
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

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Visitas"
        component={Visitas}
        options={optionsTabScreen({icon: 'transit-connection-variant'})}
      />
      <Tab.Screen
        name="Sinc. facturas"
        component={ActualizarFacturas}
        options={optionsTabScreen({icon: 'receipt'})}
      />
      <Tab.Screen
        name="Sinc. pedidos"
        component={ActualizarPedidos}
        options={optionsTabScreen({icon: 'shopping'})}
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
