import React from 'react';
import {useNavigation} from '@react-navigation/native';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

/* icons */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';

/* redux slices */
import {setStrTouchedButton} from '../redux/slices/simpleTabButtonsSlice';

export const SimpleTabButtons = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  const strTouchedButton = useAppSelector(
    store => store.simpleTabButtons.strTouchedButton,
  );

  const pressButtonConfig = () => {
    dispatch(setStrTouchedButton('config'));
    navigation.replace('Config');
  };

  const pressSyncConfig = () => {
    dispatch(setStrTouchedButton('sync'));
    navigation.replace('Sync');
  };

  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
    },
    tabButtonConfig: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: strTouchedButton == 'config' ? '#ccc' : '#fff',
      width: '50%',
    },
    tabButtonSync: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: strTouchedButton == 'sync' ? '#ccc' : '#fff',
      width: '50%',
    },
    textButton: {
      color: 'black',
    },
  });
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButtonConfig}
        onPress={() => pressButtonConfig()}>
        <Icon name="cog" color="black" size={24} />
         <Text allowFontScaling={false} style={styles.textButton}>Configuración</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButtonSync}
        onPress={() => pressSyncConfig()}>
        <Icon name="sync" color="black" size={24} />
         <Text allowFontScaling={false} style={styles.textButton}>Sincronización</Text>
      </TouchableOpacity>
    </View>
  );
};
