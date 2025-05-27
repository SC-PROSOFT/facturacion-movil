import React, {useState} from 'react';
import {View, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {generatePotentialVisits} from '../utils';
import {useNavigation} from '@react-navigation/native';

/* components */
import {
  _Input,
  _InputSelect,
  _Checkbox,
  CoolButton,
  _DatePicker,
  TercerosFinder,
  IconButton,
  RutaFinder,
  ZonaFinder,
  FrecuenciaFinder,
  Loader,
} from '../components';
/* types */
import {ITerceros} from '../common/types';
import {
  setObjInfoAlert,
  setObjTercero,
  setIsShowTercerosFinder,
  setIsShowFrecuenciaFinder,
  setIsShowUploadArchives,
  setIsShowZonaFinder,
  setIsShowRutaFinder,
} from '../redux/slices';
import {
  tercerosService,
  visitaService,
} from '../data_queries/local_database/services';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import AxiosInstance from 'axios';
import {TercerosApiServices} from '../data_queries/api/queries/terceros_queries';
import Toast from 'react-native-toast-message';

const CreateRuta = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const objConfig = useAppSelector(store => store.config.objConfig);
  const [tercero, setTercero] = useState<ITerceros>({
    codigo: '',
    nombre: '',
    direcc: '',
    tel: '',
    vendedor: '',
    plazo: 0,
    f_pago: '01',
    ex_iva: 'N',
    clasificacion: '',
    dv: '1',
    tipo: 'CC',
    departamento: '',
    ciudad: '',
    barrio: '',
    email: '',
    reteica: 'N',
    frecuencia: '',
    frecuencia2: '',
    frecuencia3: '',
    zona: '',
    ruta: '',
    latitude: '',
    longitude: '',
    rut_pdf: '',
    camcom_pdf: '',
    di_pdf: '',
  });
  const [dateOfVisit, setDateOfVisit] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const toggleTercero = async (tercero: ITerceros) => {
    console.log('tercero =>>>>', tercero);
    const {codigo, nombre, direcc, tel, clasificacion, plazo} = tercero;
    setTercero({
      ...tercero,
      codigo,
      nombre,
      direcc,
      tel,
      clasificacion,
      plazo,
    });
  };
  const [activeFrecuenciaField, setActiveFrecuenciaField] = useState<
    'frecuencia' | 'frecuencia2' | 'frecuencia3' | null
  >(null);
  const handleOpenFrequencyFinder = (
    field: 'frecuencia' | 'frecuencia2' | 'frecuencia3',
  ) => {
    setActiveFrecuenciaField(field); // Establece el campo activo
    dispatch(setIsShowFrecuenciaFinder(true)); // Abre el FrequencyFinder
  };

  const handleSelectFrecuencia = (frecuencia: string) => {
    // Asigna la frecuencia seleccionada al campo activo
    if (activeFrecuenciaField) {
      setTercero(prevState => ({
        ...prevState,
        [activeFrecuenciaField]: frecuencia,
      }));
    }
    setActiveFrecuenciaField(null); // Resetea el campo activo
  };
  const saveTercero = async () => {
    setIsLoading(true);
    try {
      const terceroModificado = {
        ...tercero,
      };
      const response = await tercerosService.updateTercero(terceroModificado);
      if (response) {
        generateVisitas(terceroModificado);
      }
    } catch (error) {
      console.log('Error al guardar tercero', error);
    } finally {
      setIsLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Ruta creada 🥳✅',
      });
      navigation.goBack();
    }
  };

  const generateVisitas = async (tercero: ITerceros) => {
    try {
      const visitas = await generatePotentialVisits([tercero]);
      if (visitas.length > 0) {
        console.log('visitas', visitas);
        await visitaService.fillVisitas(visitas);
      }
    } catch (e) {
      console.log('Error al generar visitas', e);
    }
  };

  const searchTercero = (cod_terce: string) => {
    console.log('Buscando tercero con codigo =>', cod_terce);
  };
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap', // Permite que los elementos se envuelvan si no caben
      justifyContent: 'space-between',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      width: '48%', // Cada fila ocupa el 48% del ancho para que quepan dos por línea
    },
    inputContainer: {
      flex: 2,
      marginRight: 6,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{
          paddingHorizontal: 15,
          paddingTop: 10,
        }}>
        <Text
          style={{
            color: '#092254',
            fontSize: 22,
            marginBottom: 10,
            marginLeft: 3,
          }}>
          Informacion cliente
        </Text>

        <View
          style={{
            elevation: 5,
            padding: 7,
            backgroundColor: '#fff',
            borderRadius: 10,
            gap: 8,
          }}>
          <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1}}>
              <_Input
                label="Nombre"
                name="nombre"
                value={tercero.nombre}
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, nombre: text}))
                }
              />
            </View>
            <View style={{flex: 0}}>
              <IconButton
                iconName="account-search"
                iconColor="#FFF"
                iconSize={35}
                onPress={() => dispatch(setIsShowTercerosFinder(true))}
              />
            </View>
          </View>
        </View>

        <Text
          style={{
            color: '#092254',
            fontSize: 22,
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 3,
          }}>
          Informacion visita
        </Text>

        {/* 🟥 Informacion visita */}
        <View
          style={{
            elevation: 5,
            padding: 10,
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          {/* Zona y Ruta */}

          {/* Frecuencias */}
          <View style={{flexDirection: 'row', gap: 8, marginBottom: 15}}>
            {/* Frecuencia 1 */}
            <View
              style={{flex: 1.5, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 6}}>
                <_Input
                  label="Frec 1"
                  name="frecuencia"
                  value={tercero.frecuencia}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia: text}))
                  }
                />
              </View>
              <View style={{flex: 1.1, marginLeft: 6}}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia')}
                />
              </View>
            </View>
          </View>

          <View style={{flexDirection: 'row', gap: 8, marginBottom: 15}}>
            {/* Frecuencia 2 */}
            <View
              style={{flex: 1.5, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 6}}>
                <_Input
                  label="Frec 2"
                  name="frecuencia2"
                  value={tercero.frecuencia2}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia2: text}))
                  }
                />
              </View>
              <View style={{flex: 1.1, marginLeft: 6}}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia2')}
                />
              </View>
            </View>
          </View>

          <View style={{flexDirection: 'row', gap: 8}}>
            {/* Frecuencia 3 */}
            <View
              style={{flex: 1.5, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 6}}>
                <_Input
                  label="Frec 3"
                  name="frecuencia3"
                  value={tercero.frecuencia3}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia3: text}))
                  }
                />
              </View>
              <View style={{flex: 1.1, marginLeft: 6}}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia3')}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={{marginBottom: 20, marginTop: 15}}>
          <CoolButton
            value="Guardar ruta"
            iconName="content-save"
            colorButton="#09540B"
            colorText="#fff"
            iconSize={20}
            fontSize={18}
            pressCoolButton={() => saveTercero()}
          />
        </View>
      </ScrollView>
      <TercerosFinder toggleTercero={toggleTercero} searchTable="terceros" />
      <FrecuenciaFinder
        toggleFrecuencia={frecuencia => handleSelectFrecuencia(frecuencia.zona)}
      />
      <ZonaFinder
        toggleZona={zona =>
          setTercero(prevState => ({...prevState, zona: zona.zona}))
        }
      />

      <RutaFinder
        toggleRuta={ruta =>
          setTercero(prevState => ({...prevState, ruta: ruta.zona}))
        }
      />
      <Loader visible={isLoading} message='Creando ruta nueva'/>
    </View>
  );
};

export {CreateRuta};
