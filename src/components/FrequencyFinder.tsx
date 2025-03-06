import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Modal, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IconLeftInput} from '.';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowFrecuenciaFinder} from '../redux/slices/frecuenciasFinderSlice';
import {IFrecuencia} from '../common/types';

interface FrecuenciaFinderProps {
  toggleFrecuencia?: (frecuencia: IFrecuencia) => void;
}

export const FrecuenciaFinder = React.memo(
  ({toggleFrecuencia}: FrecuenciaFinderProps) => {
    const dispatch = useAppDispatch();
    const isShowFrecuenciaFinder = useAppSelector(
      store => store.frecuenciaFinder.isShowFrecuenciaFinder,
    );
    const [inputs, setInputs] = useState({frecuencia: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [quantityFrecuencias, setQuantityFrecuencias] = useState(0);

    const closeFrecuenciaFinder = () => {
      dispatch(setIsShowFrecuenciaFinder(false));
    };

    const styles = StyleSheet.create({
      container: {
        justifyContent: 'flex-end',
        flex: 1,
      },
      modal: {
        backgroundColor: '#fff',
        height: '80%',
        justifyContent: 'flex-start',
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
      },
      iconClose: {},
      loaderContainer: {
        marginVertical: 16,
        alignItems: 'center',
      },
    });

    return (
      <Modal
        visible={isShowFrecuenciaFinder}
        onDismiss={closeFrecuenciaFinder}
        contentContainerStyle={styles.modal}
        style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: '#092254',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 20,
            }}>
            <Text allowFontScaling={false} style={styles.title}>
              Busqueda de frecuencias ({quantityFrecuencias})
            </Text>

            <IconButton
              icon="close"
              iconColor="#FFF"
              size={25}
              onPress={closeFrecuenciaFinder}
              style={styles.iconClose}
            />
          </View>

          <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
            <IconLeftInput
              value={inputs.frecuencia}
              name="frecuencia"
              mode="flat"
              keyboardType="default"
              icon="magnify"
              handleInputChange={() => {}}
            />
          </View>
        </View>

        <SafeAreaView style={{paddingHorizontal: 10, paddingBottom: 120}}>
          {isLoading && isFirstLoad ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <View>{/* Aquí puedes agregar la lista de frecuencias */}</View>
          )}
        </SafeAreaView>
      </Modal>
    );
  },
);
