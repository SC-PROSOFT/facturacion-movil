import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';

/* components */
import {_Input, _InputSelect, _Checkbox} from '../components';
/* types */
import {ITerceros} from '../common/types';

const CreateTercero = () => {
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
  });

  return (
    <ScrollView
      style={{
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 10,
        paddingBottom: 10,
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
      </View>
    </ScrollView>
  );
};

export {CreateTercero};
