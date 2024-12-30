import React from 'react';

import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

/* components */
import {NormalMenu} from '../components';
/* redux hooks */
import {useAppSelector} from '../redux/hooks';
/* navigators */
import {TabNavPrincipal, TabNavTercero} from '../navigation';
/* views */
import {
  Config,
  Sync,
  Login,
  ModificarFactura,
  ModificarPedido,
  CreateTercero,
} from '../views';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Navigation = () => {
  const isSignedIn = useAppSelector(store => store.operator.isSignedIn);
  const isAdmin = useAppSelector(store => store.operator.isAdmin);

  if (isAdmin) {
    const styles = StyleSheet.create({
      icon: {
        fontSize: 28,
        color: 'white',
      },
      icon2: {
        fontSize: 28,
        color: '#30313498',
      },
    });

    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Config"
            component={Config}
            options={{
              //unmountOnBlur: true,
              title: 'Configuración',
              headerTitleAlign: 'left',
              headerShown: false,
              headerRight: () => <NormalMenu />,

              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#365AC3',
              },

              headerRightContainerStyle: {
                paddingRight: 10,
              },

              tabBarShowLabel: false,
              tabBarStyle: {
                height: 60,
                backgroundColor: '#E9ECF5',
              },
              tabBarIcon: () => (
                <Icon name="settings" style={styles.icon2} size={32} />
              ),
              tabBarActiveBackgroundColor: '#C8D3DE',
            }}
          />

          <Tab.Screen
            name="Sync"
            component={Sync}
            options={{
              headerShown: false,
              //unmountOnBlur: true,
              headerTitle: 'Sincronizacion',
              headerTitleAlign: 'left',
              headerStyle: {
                backgroundColor: '#365AC3',
              },
              headerTintColor: '#fff',

              headerRight: () => <NormalMenu />,
              headerRightContainerStyle: {
                paddingRight: 10,
              },

              tabBarShowLabel: false,
              tabBarStyle: {
                height: 60,
                backgroundColor: '#E9ECF5',
              },
              tabBarIcon: () => (
                <Icon name="sync" style={styles.icon2} size={32} />
              ),
              tabBarActiveBackgroundColor: '#C8D3DE',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  if (isSignedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="TabNavPrincipal"
            component={TabNavPrincipal}
            options={{
              title: 'Visitas programadas',
              headerTitleAlign: 'left',
              headerShown: false,
              animation: 'none',
              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#092254',
              },
            }}
          />
          <Stack.Screen
            name="TabNavTercero"
            component={TabNavTercero}
            options={{
              title: 'Visitas programadas',
              headerTitleAlign: 'left',
              headerShown: false,
              animation: 'none',
              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#092254',
              },
            }}
          />
          <Stack.Screen
            name="ModificarFactura"
            component={ModificarFactura}
            options={{
              title: 'Modificar factura',
              headerTitleAlign: 'left',
              headerShown: false,
              animation: 'none',
              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#092254',
              },
            }}
          />
          <Stack.Screen
            name="ModificarPedido"
            component={ModificarPedido}
            options={{
              title: 'Modificar pedido',
              headerTitleAlign: 'left',
              headerShown: false,
              animation: 'none',
              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#092254',
              },
            }}
          />
          <Stack.Screen
            name="CreateTercero"
            component={CreateTercero}
            options={{
              title: 'Crear Tercero',
              headerTitleAlign: 'left',
              headerShown: true,
              animation: 'none',
              headerTintColor: '#fff',
              headerStyle: {
                backgroundColor: '#092254',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: 'Iniciar sesion',
            headerTitleAlign: 'center',
            headerShown: false,
          }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
