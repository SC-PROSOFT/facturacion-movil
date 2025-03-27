import React, {ReactNode, FC} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {Avatar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

/* utils */
import {getInitialsOfClient} from '../utils';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  setIsSignedIn,
  setIsAdmin,
  setIsShowTercerosFinder,
} from '../redux/slices';
/* context */
import {decisionAlertContext} from '../context';
/* components */
import {IconLeftInput, IconButton} from '../components';

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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Text
            size={42}
            label={getInitialsOfClient(objOperador.descripcion)}
            style={{borderRadius: 10}}
          />
          <View style={{marginLeft: 10}}>
            <Text style={{color: '#FFF', fontSize: 12}}>
              Sesion iniciada como:
            </Text>
            <Text style={{color: '#FFF', fontSize: 16, fontWeight: 'bold'}}>
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
            marginTop: 10,
            alignSelf: 'flex-start', // Hace que el botón se ajuste al contenido
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

  const handleInputChange = (name: string, text: string) => {
    setSearch(text);
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
      </View>
    </View>
  );
};

export {PrincipalHeader, Searcher};
