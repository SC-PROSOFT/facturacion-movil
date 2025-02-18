import React, {useState} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

/* components */
import {
  _Input,
  _InputSelect,
  _Checkbox,
  CoolButton,
  IconButton,
} from '../components';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  setObjInfoAlert,
  setObjTercero,
  setIsShowTercerosFinder,
} from '../redux/slices';

const Estadisticas = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  return (
    <ScrollView>
      <View style={{padding: 10}}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Estadisticas</Text>
        <View style={{marginTop: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>Estadisticas</Text>
          <View style={{marginTop: 10}}></View>
        </View>
      </View>
    </ScrollView>
  );
};
