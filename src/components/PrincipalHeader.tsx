import React, {ReactNode, FC} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {Avatar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* utils */
import {getInitialsOfClient} from '../utils';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setIsSignedIn, setIsAdmin} from '../redux/slices/operatorSlice';
/* context */
import {decisionAlertContext} from '../context';
/* components */
import {IconLeftInput} from '../components';

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
            <Text style={{color: '#FFF', fontSize: 20}}>
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

      <IconLeftInput
        value={search}
        label="Buscar visita"
        name="articulo"
        mode="flat"
        keyboardType="default"
        icon="magnify"
        handleInputChange={handleInputChange}
      />
    </View>
  );
};

export {PrincipalHeader, Searcher};
