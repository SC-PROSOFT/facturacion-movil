import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* components */
import {CoolButton} from '../components';
/* redux */
import {useAppSelector} from '../redux/hooks';
import {} from '../redux/slices';

const FilesTercero = () => {
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);

  const addRut = () => {
    console.log('objTercero', objTercero);
  };

  return (
    <View style={{padding: 10}}>
      <Text style={{fontSize: 20, marginBottom: 5, marginLeft: 3}}>RUT</Text>

      <TouchableOpacity
        style={{
          borderRadius: 10,
          elevation: 10,
          padding: 10,
          backgroundColor: '#FFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => addRut()}>
        <Icon
          name="file-remove"
          size={80}
          color={'#DE3A45'}
          style={{textAlign: 'center'}}
        />
        <Text>PDF, JPG, JMPEG, PNG</Text>
        <Text>Tamano maximo: 20mb</Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#092254',
            marginTop: 5,
          }}>
          El archivo RUT no esta
        </Text>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#092254'}}>
          cargado en el tercero
        </Text>
      </TouchableOpacity>

      <Text style={{fontSize: 20, marginTop: 15, marginBottom: 5}}>
        Camara de comercio
      </Text>

      <TouchableOpacity
        style={{
          borderRadius: 10,
          elevation: 10,
          padding: 10,
          backgroundColor: '#FFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 15,
        }}
        onPress={() => {}}>
        <Icon
          name="file-check"
          size={80}
          color={'#97D599'}
          style={{textAlign: 'center'}}
        />
        <Text>PDF, JPG, JMPEG, PNG</Text>
        <Text>Tamano maximo: 20mb</Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#092254',
            marginTop: 5,
          }}>
          El archivo RUT no esta
        </Text>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#092254'}}>
          cargado en el tercero
        </Text>
      </TouchableOpacity>

      <CoolButton
        value="Guardar cambios"
        iconName="menu"
        colorButton="#09540B"
        colorText="#FFF"
        iconSize={26}
        pressCoolButton={() => {}}
      />
    </View>
  );
};

export {FilesTercero};
