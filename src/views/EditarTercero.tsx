import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setIsShowTercerosFinder, setObjInfoAlert} from '../redux/slices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  IconButton,
  TercerosFinder,
  _InputSelect,
  _Input,
  _Checkbox,
} from '../components';
import {decisionAlertContext} from '../context';
import {ITerceros} from '../common/types';
import {Card, useTheme} from 'react-native-paper';
import {SyncQueries, TercerosApiServices} from '../data_queries/api/queries';
import Toast from 'react-native-toast-message';
import {tercerosService} from '../data_queries/local_database/services';
const defaultTercero: ITerceros = {
  codigo: '',
  nombre: '',
  direcc: '',
  tel: '',
  vendedor: '',
  plazo: 0,
  f_pago: '01',
  ex_iva: 'N',
  clasificacion: '',
  dv: '',
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
  rut_pdf: 'N',
  camcom_pdf: 'N',
  di_pdf: 'N',
};
const EditarTercero = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const [tercero, setTercero] = useState<ITerceros>(defaultTercero);
  const [tercerTemp, setTerceroTemp] = useState<ITerceros>(defaultTercero);
  const objConfig = useAppSelector(store => store.config.objConfig);
  const screenWidth = Dimensions.get('window').width;
  const toggleTerceros = async (terceroSelec: ITerceros) => {
    const {codigo} = terceroSelec;
    console.log('terceroSelec', terceroSelec);
    setTercero({
      ...terceroSelec,
      codigo: codigo,
    });
    setTerceroTemp({
      ...terceroSelec,
      codigo: codigo,
    });
  };
  // Existen cambios sin guardar o no
  const hasUnsavedChanges = useRef(false);

  const {showDecisionAlert} = decisionAlertContext();

  const cleanAllTercerosData = () => {
    setTercero(defaultTercero);
    setTerceroTemp(defaultTercero);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation alert
      showDecisionAlert({
        type: 'info',
        description:
          '¿Desea volver al menu? Los cambios no guardados se perderán.',
        textButton: 'Salir',
        executeFunction: () => {
          navigation.dispatch(e.data.action);
        },
      });
    });

    return unsubscribe;
  }, [navigation, showDecisionAlert]);

  // 1. Mostrar desicion alert para confirmar guardar los cambios

  const handleSaveChanges = () => {
    // Verificar si se han realizado cambios

    if (!tercero.codigo) {
      Toast.show({
        type: 'error',
        text1: 'Debe seleccionar un cliente antes de guardar los cambios.',
      });
      return;
    }
    if (
      JSON.stringify(tercero) === JSON.stringify(tercerTemp) ||
      tercero.codigo === ''
    ) {
      Toast.show({
        type: 'info',
        text1: 'No hay cambios para guardar.',
      });
      return;
    }
    console.log('Guardando cambios para el cliente:', tercero);
    showDecisionAlert({
      type: 'info',
      description: '¿Esta seguro de realizar los cambios?',
      textButton: 'Guardar cambios',
      executeFunction: async () => {
        await ModifyTercero();
      },
    });
  };

  const ModifyTercero = async () => {
    try {
      const {direccionIp, puerto} = objConfig;
      const tercerosQueries = new TercerosApiServices(direccionIp, puerto);
      const response = await tercerosQueries._updateTercero(tercero);
      if (response) {
        await tercerosService.updateTercero(tercero);
        Toast.show({
          type: 'success',
          text1: `Cliente modificado correctamente.`,
          text2: `Cliente ${tercero.nombre} actualizado en el servidor.`,
        });

        cleanAllTercerosData();
      } else {
        const dbResponse = await tercerosService.updateTercero(tercero);
        if (dbResponse) {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description: `No se pudo subir los datos del cliente ${tercero.nombre} al servidor, y se guardaron localmente, sincronize luego para intentar subirlos al servidor.`,
            }),
          );
          Toast.show({
            type: 'success',
            text1: `Los datos del cliente ${tercero.nombre} se guardaron localmente.`,
          });
          cleanAllTercerosData();
        } else {
          Toast.show({
            type: 'error',
            text1: `No se pudo guardar los datos del cliente ${tercero.nombre}.`,
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `Error al modificar el cliente ${tercero.nombre}.`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={{color: '#092254', fontSize: 22, marginBottom: 10}}>
          Selecciona el cliente
        </Text>
        <Card style={styles.card}>
          <Card.Content style={{paddingVertical: 6, paddingHorizontal: 6}}>
            <View style={styles.searchContainer}>
              <View style={styles.inputContainer}>
                <_Input
                  value={tercero.codigo}
                  onChangeText={(text: string) => {
                    setTercero(prevState => ({...prevState, codigo: text}));
                  }}
                  label="Codigo cliente"
                />
              </View>
              <IconButton
                iconSize={32}
                iconName="magnify"
                onPress={() => {
                  dispatch(setIsShowTercerosFinder(true));
                }}
                // 4. El color del ícono ahora se adapta al tema
                iconColor={'#FFFF'}
              />
            </View>
          </Card.Content>
        </Card>
        <Text style={{color: '#092254', fontSize: 22, marginVertical: 10}}>
          Informacion del cliente
        </Text>
        <Card style={styles.card}>
          <Card.Content style={{paddingVertical: 6, paddingHorizontal: 6}}>
            <View style={styles.inputOrganizedContainer}>
              <_Input
                value={tercero.nombre}
                label="Nombre"
                onChangeText={(text: string) => {
                  setTercero(prevState => ({...prevState, nombre: text}));
                }}
                placeholder="Nombre del cliente"
              />
            </View>
            <View style={styles.inputOrganizedContainer}>
              <View style={styles.input}>
                <_Input
                  value={tercero.tel}
                  label="Teléfono"
                  onChangeText={(text: string) => {
                    setTercero(prevState => ({...prevState, tel: text}));
                  }}
                />
              </View>
              <View style={{flex: 0.3, marginLeft: 4}}>
                <_Input
                  value={tercero.plazo}
                  label="Plazo"
                  onChangeText={(text: number) => {
                    setTercero(prevState => ({...prevState, plazo: text}));
                  }}
                />
              </View>
            </View>
            <View style={styles.inputOrganizedContainer}>
              <View style={styles.input}>
                <_Input
                  value={tercero.direcc}
                  label="Dirección"
                  onChangeText={(text: string) => {
                    setTercero(prevState => ({...prevState, direcc: text}));
                  }}
                />
              </View>
            </View>
            <View style={styles.inputOrganizedContainer}>
              <View style={styles.input}>
                <_Input
                  value={tercero.barrio}
                  label="Barrio"
                  onChangeText={(text: string) => {
                    setTercero(prevState => ({...prevState, barrio: text}));
                  }}
                />
              </View>
            </View>
            <View style={styles.inputOrganizedContainer}>
              <View style={{flex: 1}}>
                <_Input
                  value={tercero.departamento}
                  label="Departamento"
                  onChangeText={(text: string) => {
                    setTercero(prevState => ({
                      ...prevState,
                      departamento: text,
                    }));
                  }}
                />
              </View>
              <View style={{flex: 1, marginLeft: 4}}>
                <_Input
                  value={tercero.ciudad}
                  label="Ciudad"
                  onChangeText={(tetx: string) =>
                    setTercero(prevState => ({...prevState, ciudad: tetx}))
                  }
                />
              </View>
            </View>
            <View style={styles.inputOrganizedContainer}>
              <View style={styles.input}>
                <_Input
                  value={tercero.email}
                  label="Correo electrónico"
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, email: text}))
                  }
                />
              </View>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <_Checkbox
                label="Iva"
                status={tercero.ex_iva == 'N' ? true : false}
                onPress={status =>
                  setTercero(prevState => ({
                    ...prevState,
                    ex_iva: status ? 'N' : 'S',
                  }))
                }
                // disabled={isDisabled}
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
                // disabled={isDisabled}
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
                  // disabled={isDisabled}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
        <View style={styles.buttoContainer}>
          <View style={{marginVertical: 20}}>
            <TouchableOpacity
              style={{
                backgroundColor: '#09540B',
                padding: 6,
                borderRadius: 5,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                width: screenWidth - 30,
                alignSelf: 'center',
              }}
              onPress={handleSaveChanges}>
              <Icon name="content-save" size={36} color={'#FFF'} />
              <Text style={{color: '#fff', fontSize: 18}}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <TercerosFinder toggleTercero={toggleTerceros} searchTable="terceros" />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12, // Padding general para la pantalla
  },
  card: {
    width: '100%', // La tarjeta ocupa todo el ancho disponible
    // La elevación y el borde redondeado son manejados por el componente Card
  },
  searchContainer: {
    flexDirection: 'row', // Los elementos se colocan en fila
    alignItems: 'center', // Se alinean verticalmente al centro
    width: '100%',
    gap: 2, // Espacio moderno y consistente entre el input y el botón
  },
  inputContainer: {
    flex: 1, // ¡La clave! Hace que este contenedor ocupe todo el espacio sobrante
  },
  iconButton: {
    // Generalmente no necesita estilos si el tamaño se controla con props,
    // pero se puede usar para márgenes o fondos si es necesario.
    // El componente IconButton se encargará de su propio padding.
  },
  inputOrganizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  input: {
    flex: 1, // Hace que el input ocupe todo el espacio disponible
  },
  buttoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
});
export {EditarTercero};
