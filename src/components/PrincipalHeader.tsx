import React, {useState, ReactNode, FC} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {Avatar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Menu, Divider} from 'react-native-paper';
/* utils */
import {checkForUpdate, getInitialsOfClient} from '../utils';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  setIsSignedIn,
  setIsAdmin,
  setIsShowTercerosFinder,
  showUpdateModal,
} from '../redux/slices';
/* context */
import {decisionAlertContext} from '../context';
/* components */
import {IconLeftInput, IconButton} from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type FlyOutProps = {
  children?: ReactNode;
};

const PrincipalHeader: FC<FlyOutProps> = ({children}) => {
  const dispatch = useAppDispatch();
  const {showDecisionAlert} = decisionAlertContext();

  const objOperador = useAppSelector(store => store.operator.objOperator);

  const logout = () => {
    const innerCerrarSesion = () => {
      dispatch(setIsSignedIn(false));
      dispatch(setIsAdmin(false));
      AsyncStorage.removeItem('isSignedIn');
    };

    showDecisionAlert({
      type: 'info',
      description: '¿Desea cerrar sesion?',
      textButton: 'Cerrar sesion',
      executeFunction: () => innerCerrarSesion(),
    });
  };

  return (
    <Shadow
      distance={6}
      offset={[1, 5]}
      style={{
        width: '100%',
        backgroundColor: '#092254',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 10,
          }}>
          <Avatar.Text
            size={42}
            label={getInitialsOfClient(objOperador.descripcion)}
            style={{borderRadius: 10}}
          />
          <View style={{marginLeft: 10, flex: 1}}>
            {/* <--- CAMBIO CLAVE 1: Haz este View flexible */}
            <Text numberOfLines={1} style={{color: '#FFF', fontSize: 12}}>
              Sesion iniciada como:
            </Text>
            <Text
              numberOfLines={1} // <--- CAMBIO CLAVE 2: Añade esto para truncar el texto
              style={{color: '#FFF', fontSize: 16, fontWeight: 'bold'}}>
              {objOperador.descripcion}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#485E8A',
            paddingHorizontal: 10,
            paddingRight: 5,
            borderRadius: 5,
            // Quité marginTop y alignSelf para un mejor alineamiento con flexbox
          }}
          onPress={logout}>
          <Text style={{fontSize: 16, marginRight: 5, color: '#FFF'}}>
            Salir
          </Text>
          <Icon name="logout" size={28} color={'#FFF'} />
        </TouchableOpacity>
      </View>
      {children}
    </Shadow>
  );
};

const Searcher = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const openMenu = () => setIsMenuVisible(true); // <--- NUEVO
  const closeMenu = () => setIsMenuVisible(false); // <--- NUEVO
  const handleInputChange = (name: string, text: string) => {
    setSearch(text);
  };
  const navigateToCreateRuta = () => {
    navigation.navigate('CreateRuta');
    closeMenu();
  };

  const navigateToCreateTerce = () => {
    navigation.navigate('EditarTercero');
    closeMenu();
  };
  const searchAct = async () => {
    try {
      const {updateInfo, isUpdateAvailable} = await checkForUpdate();
      if (isUpdateAvailable && updateInfo) {
        dispatch(showUpdateModal(updateInfo));
        closeMenu();
      } else {
        Toast.show({
          type: 'info',
          text1: 'No hay actualizaciones disponibles',
          text2: `Ultima version ${updateInfo?.version}.`,
        });
      }
    } catch (error) {
      console.error('Error al buscar actualizaciones:', error);
    }
  };
  return (
    <View style={{paddingHorizontal: 15, paddingBottom: 7}}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#FFF',
          marginBottom: 4,
        }}>
        Visitas programadas
      </Text>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignContent: 'center',
        }}>
        <View style={{flex: 1, marginRight: 10}}>
          <IconLeftInput
            value={search}
            name="articulo"
            mode="flat"
            keyboardType="default"
            icon="magnify"
            handleInputChange={handleInputChange}
          />
        </View>
        <IconButton
          iconName="account-search"
          iconColor="#FFF"
          iconSize={30}
          onPress={() => dispatch(setIsShowTercerosFinder(true))}
        />
        {/* <View style={{marginLeft: 10}}>
          <IconButton
            iconName="map-marker-path"
            iconColor="#FFF"
            iconSize={30}
            onPress={() => navigation.navigate('CreateRuta')}
          />
        </View> */}
        <View style={{marginLeft: 10}}>
          <IconButton
            iconName="account-plus"
            iconColor="#FFF"
            iconSize={30}
            onPress={() => navigation.navigate('CreateTercero')}
          />
        </View>
        <View style={{marginLeft: 10}}>
          <Menu
            visible={isMenuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                iconName="menu"
                iconColor="#FFF"
                iconSize={30}
                onPress={openMenu} // El botón ahora abre el menú
              />
            }
            //simular un triangulo
            contentStyle={{
              marginTop: 40,
              borderRadius: 10,
              backgroundColor: '#FFF',
              padding: 0,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              zIndex: 1000, // Asegúrate de que el menú esté por encima de otros elementos
            }}>
            <Menu.Item
              onPress={navigateToCreateRuta}
              title="Crear ruta extra"
              leadingIcon={props => (
                <Icon {...props} name="map-marker-path" color={'#092254'} />
              )}
              rippleColor={'#B6BFD1'}
              theme={{colors: {primary: '#092254'}}}
            />
            <Menu.Item
              onPress={navigateToCreateTerce}
              title="Editar cliente"
              leadingIcon={props => (
                <Icon {...props} name="account-edit" color={'#092254'} />
              )}
              rippleColor={'#B6BFD1'}
              theme={{colors: {primary: '#092254'}}}
            />
            <Divider />
            <Menu.Item
              onPress={searchAct}
              title="Buscar actualizaciones"
              leadingIcon={props => (
                <Icon {...props} name="sync" color={'#092254'} />
              )}
              rippleColor={'#B6BFD1'}
              theme={{colors: {primary: '#092254'}}} // Cambia el color del ripple
            />
          </Menu>
        </View>
      </View>
    </View>
  );
};

export {PrincipalHeader, Searcher};
