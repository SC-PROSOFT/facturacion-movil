import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {Button, Text} from 'react-native-paper';

/* components */
import {
  _Input,
  _InputSelect,
  _Checkbox,
  CoolButton,
  _DatePicker,
  TercerosFinder,
  IconButton,
} from '../components';
/* types */
import {ITerceros} from '../common/types';
import {setIsShowTercerosFinder} from '../redux/slices';
import {tercerosService} from '../data_queries/local_database/services';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import AxiosInstance from 'axios';
// import {TercerosQueries} from '../data_queries/api/queries/terceros_queries';

// const TercerosQuery = new TercerosQueries();

const CreateRuta = () => {
  const dispatch = useAppDispatch();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
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
  const [dateOfVisit, setDateOfVisit] = useState<Date>(new Date());
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
  const saveTercero = () => {
    console.log('Intente guardar un tercero');
  };

  const searchTercero = (cod_terce: string) => {
    console.log('Buscando tercero con codigo =>', cod_terce);
  };

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
                value={tercero.codigo}
                label="Identificacion"
                name="codigo"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, codigo: text}))
                }
                style={{}}
              />
            </View>

            <View style={{flex: 1}}>
              <_Input
                value={tercero.tel}
                label="Telefono"
                name="tel"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, tel: text}))
                }
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1}}>
              <_Input
                value={tercero.departamento}
                label="Departamento"
                name="departamento"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, departamento: text}))
                }
              />
            </View>

            <View style={{flex: 1}}>
              <_Input
                value={tercero.ciudad}
                label="Ciudad"
                name="ciudad"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, ciudad: text}))
                }
              />
            </View>
          </View>
          <_Input
            value={tercero.barrio}
            label="Barrio"
            name="barrio"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, barrio: text}))
            }
          />
          <_Input
            value={tercero.direcc}
            label="Direccion"
            name="direcc"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, direcc: text}))
            }
          />
          <_Input
            value={tercero.email}
            label="Correo electronico"
            name="email"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, email: text}))
            }
          />

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <_Checkbox
              label="Iva"
              status={tercero.ex_iva == 'S' ? true : false}
              onPress={status =>
                setTercero(prevState => ({
                  ...prevState,
                  ex_iva: status ? 'S' : 'N',
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
            padding: 7,
            backgroundColor: '#fff',
            borderRadius: 10,
            gap: 8,
          }}>
          <View style={{flexDirection: 'row', gap: 8}}>
            <View>
              <_DatePicker date={dateOfVisit} setDate={setDateOfVisit} />
            </View>
            <View style={{flex: 1}}>
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
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
            }}>
            <View style={{flex: 1}}>
              <_Input
                value={tercero.zona}
                label="Zona"
                name="zona"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, zona: text}))
                }
              />
            </View>
            <View style={{flex: 1}}>
              <_Input
                value={tercero.ruta}
                label="Ruta"
                name="ruta"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, ruta: text}))
                }
              />
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
      <TercerosFinder toggleTercero={toggleTercero} />
    </View>
  );
};

export {CreateRuta};
