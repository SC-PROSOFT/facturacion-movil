import React, {useState} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

/* components */
import {_Input, _InputSelect, _Checkbox, CoolButton} from '../components';
/* types */
import {ITerceros} from '../common/types';
/* utils */
import {getUbication} from '../utils';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setObjInfoAlert, setObjTercero} from '../redux/slices';
/* services */
import {tercerosService} from '../data_queries/local_database/services';

const CreateTercero = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

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

    tipo: 'CC',
    departamento: '',
    ciudad: '',
    barrio: '',
    email: '',
    reteica: 'N',
    frecuencia: 'semanal',
    zona: '',
    ruta: '',
    latitude: '',
    longitude: '',
    rut_path: '',
    camaracomercio_path: '',
  });

  const saveTercero = async () => {
    console.log('tercero =>>>>', tercero);
    try {
      const response = await tercerosService.createTercero(tercero);

      console.log('response =>>>>', response);
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: `${error.message}`,
        }),
      );
    }
  };

  const toggleGetGeolocation = async () => {
    try {
      const migeo = await getUbication();

      setTercero(prevState => ({
        ...prevState,
        latitude: migeo.latitude,
        longitude: migeo.longitude,
      }));
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'info',
          description: `${error.message}`,
        }),
      );
    }
  };
  const toggleAddFiles = () => {
    dispatch(setObjTercero(tercero));

    navigation.navigate('FilesTercero');
  };

  return (
    <ScrollView
      style={{
        paddingHorizontal: 15,
        paddingTop: 10,
      }}>
      <Text style={{color: '#092254', fontSize: 22, marginBottom: 10}}>
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
        <_Input
          label="Nombre"
          name="nombre"
          onChangeText={(text: string) =>
            setTercero(prevState => ({...prevState, nombre: text}))
          }
        />
        <_InputSelect<'CC' | 'TI'>
          value={tercero.tipo ?? 'CC'}
          values={[
            {label: 'Cedula de ciudadania', value: 'CC'},
            {label: 'Tarjeta de identidad', value: 'TI'},
          ]}
          setValue={value =>
            setTercero(prevState => ({...prevState, tipo: value}))
          }
        />
        <View style={{flexDirection: 'row', gap: 8}}>
          <View style={{flex: 1}}>
            <_Input
              label="Identificacion"
              name="codigo"
              keyboardType="numeric"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, codigo: text}))
              }
              style={{}}
            />
          </View>

          <View style={{flex: 1}}>
            <_Input
              label="Telefono"
              name="tel"
              keyboardType="numeric"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, tel: text}))
              }
            />
          </View>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <View style={{flex: 1}}>
            <_Input
              label="Departamento"
              name="departamento"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, departamento: text}))
              }
            />
          </View>

          <View style={{flex: 1}}>
            <_Input
              label="Ciudad"
              name="ciudad"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, ciudad: text}))
              }
            />
          </View>
        </View>
        <_Input
          label="Barrio"
          name="barrio"
          onChangeText={(text: string) =>
            setTercero(prevState => ({...prevState, barrio: text}))
          }
        />
        <_Input
          label="Direccion"
          name="direcc"
          onChangeText={(text: string) =>
            setTercero(prevState => ({...prevState, direcc: text}))
          }
        />
        <_Input
          label="Correo electronico"
          name="email"
          onChangeText={(text: string) =>
            setTercero(prevState => ({...prevState, email: text}))
          }
        />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <_Checkbox
            label="Iva"
            status={tercero.ex_iva == 'N' ? true : false}
            onPress={status =>
              setTercero(prevState => ({
                ...prevState,
                ex_iva: status ? 'N' : 'S',
              }))
            }
          />
          <_Checkbox
            label="Reteica"
            status={tercero.reteica == 'S' ? true : false}
            onPress={status =>
              setTercero(prevState => ({
                ...prevState,
                reteica: status ? 'S' : 'N',
              }))
            }
          />
          <View style={{width: '70%'}}>
            <_InputSelect<'01' | '02'>
              value={tercero.f_pago}
              values={[
                {label: 'Contado', value: '01'},
                {label: 'Credito', value: '02'},
              ]}
              setValue={value =>
                setTercero(prevState => ({...prevState, f_pago: value}))
              }
            />
          </View>
        </View>

        <View style={{flexDirection: 'row', gap: 8}}>
          <View style={{width: '40%'}}>
            <_InputSelect<'semanal' | 'mensual'>
              value={tercero.frecuencia}
              values={[
                {label: 'Semanal', value: 'semanal'},
                {label: 'Mensual', value: 'mensual'},
              ]}
              setValue={value =>
                setTercero(prevState => ({...prevState, frecuencia: value}))
              }
            />
          </View>
          <View style={{flex: 1}}>
            <_Input
              label="Zona"
              name="zona"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, zona: text}))
              }
            />
          </View>
          <View style={{flex: 1}}>
            <_Input
              label="Ruta"
              name="ruta"
              onChangeText={(text: string) =>
                setTercero(prevState => ({...prevState, ruta: text}))
              }
            />
          </View>
        </View>

        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity
            style={{
              backgroundColor: '#485E8A',
              padding: 3,
              borderRadius: 5,
            }}
            disabled={tercero.codigo.length < 10 ? true : false}
            onPress={() => toggleAddFiles()}>
            <Icon name="attachment" size={36} color={'#FFF'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#485E8A',
              padding: 3,
              borderRadius: 5,
            }}
            onPress={() => {
              toggleGetGeolocation();
            }}>
            <Icon name="map-marker-radius" size={36} color={'#FFF'} />
          </TouchableOpacity>
        </View>

        <View>
          {tercero.codigo.length < 10 && (
            <Text style={{color: 'red'}}>
              Para adjuntar archivos debe ingresar la cedula del cliente
            </Text>
          )}
        </View>
      </View>

      <View style={{marginBottom: 20}}>
        <CoolButton
          value="Guardar cliente"
          iconName="content-save"
          colorButton="#09540B"
          colorText="#fff"
          iconSize={20}
          fontSize={18}
          pressCoolButton={() => saveTercero()}
        />
      </View>
    </ScrollView>
  );
};

export {CreateTercero};
