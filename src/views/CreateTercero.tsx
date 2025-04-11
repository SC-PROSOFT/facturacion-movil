import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native';
import {Text, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

/* components */
import {
  _Input,
  _InputSelect,
  _Checkbox,
  CoolButton,
  IconButton,
  FrecuenciaFinder,
  UploadArchives,
  RutaFinder,
  ZonaFinder,
  SearchLocation,
} from '../components';
/* types */
import {ITerceros} from '../common/types';
/* utils */
import {
  getUbication,
  calcularDigitoVerificacion,
  padLeftCodigo,
} from '../utils';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {generateVisits} from '../utils';
import {
  setObjInfoAlert,
  setObjTercero,
  setIsShowTercerosFinder,
  setIsShowFrecuenciaFinder,
  setIsShowUploadArchives,
  setIsShowZonaFinder,
  setIsShowRutaFinder,
} from '../redux/slices';
/* services */
import {
  tercerosService,
  filesService,
  visitaService,
} from '../data_queries/local_database/services';

import {setFile} from '../redux/slices';

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
    rut_path: '',
    camaracomercio_path: '',
    cc_path: '',
  });

  const [activeFrecuenciaField, setActiveFrecuenciaField] = useState<
    'frecuencia' | 'frecuencia2' | 'frecuencia3' | null
  >(null);

  const [errors, setErrors] = useState({
    codigo: '',
    nombre: '',
    dv: '',
    direcc: '',
    zona: '',
    ruta: '',
    frecuencia: '',
  });

  const [isCodigoValid, setIsCodigoValid] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isAlreadyValidate, setIsAlreadyValidate] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [codeTemp, setCodeTemp] = useState('');
  const [rutFile, setRutFile] = useState<DocumentPickerResponse | null>(null);
  const [camaraComercioFile, setCamaraComercioFile] =
    useState<DocumentPickerResponse | null>(null);
  const [cedulaFile, setCedulaFile] = useState<DocumentPickerResponse | null>(
    null,
  );
  const objOperador = useAppSelector(store => store.operator.objOperator);

  const validateFields = () => {
    const newErrors = {
      codigo: '',
      nombre: '',
      dv: '',
      direcc: '',
      zona: '',
      ruta: '',
      frecuencia: '',
    };

    if (!tercero.codigo) newErrors.codigo = 'El código es requerido';
    if (!tercero.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!tercero.dv) newErrors.dv = 'El DV es requerido';
    if (!tercero.direcc) newErrors.direcc = 'La dirección es requerida';
    if (!tercero.zona) newErrors.zona = 'La zona es requerida';
    if (!tercero.ruta) newErrors.ruta = 'La ruta es requerida';
    if (!tercero.frecuencia)
      newErrors.frecuencia = 'La frecuencia es requerida';

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const checkCodigoExists = async () => {
    console.log(codeTemp, tercero.codigo);
    if (isCodigoValid && codeTemp == tercero.codigo) {
      setIsDisabled(false);
      return;
    }
    if (!tercero.codigo) {
      setErrors(prevErrors => ({
        ...prevErrors,
        codigo: 'El código es requerido',
      }));
      setIsDisabled(true);
      return;
    }

    try {
      calculateDV(tercero.codigo);
      setIsLoading(true);

      const existingTercero = await tercerosService.getByAttribute(
        'codigo',
        tercero.codigo,
      );
      if (existingTercero) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: 'El codigo que digito ya tiene un tercero asociado',
          }),
        );
        setIsLoading(false);
        setIsCodigoValid(false);
        setIsDisabled(true);
      } else {
        setIsLoading(false);
        setIsCodigoValid(true);
        setCodeTemp(tercero.codigo);
        setIsDisabled(false);
      }
    } catch (error) {
      setIsLoading(false);
      setIsCodigoValid(true);
      setIsDisabled(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Cierra el modal
  };

  const handleSaveLocation = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setTercero(prevState => ({
      ...prevState,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    }));
    setIsModalVisible(false); // Cierra el modal
  };

  const calculateDV = (nit: string) => {
    const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43];
    let acum = 0;

    nit = nit.padStart(10, '0');

    for (let i = 0; i < 10; i++) {
      acum += parseInt(nit.charAt(9 - i)) * weights[i];
    }

    const divi = Math.floor(acum / 11);
    const resid = acum % 11;

    let factor = resid > 0 ? resid : 0;

    if (factor === 0 || factor === 1) {
      setTercero(prevState => ({...prevState, dv: factor.toString()}));
    } else {
      setTercero(prevState => ({...prevState, dv: (11 - factor).toString()}));
    }
  };

  const saveTercero = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    try {
      // Calcular el tipo de tercero (NIT o CC)
      const type =
        /^\d{9,10}$/.test(tercero.codigo) &&
        tercero.codigo.slice(-1) ===
          calcularDigitoVerificacion(tercero.codigo.slice(0, -1)).toString()
          ? 'NIT'
          : 'CC';

      // Construir la ruta base
      const basePath = `D:\\psc\\prog\\DATOS\\ANEXOS\\${type}-${padLeftCodigo(
        tercero.codigo,
      )}`;

      // Asignar las rutas de los archivos al tercero
      console.log(objOperador.cod_vendedor);
      const updatedTercero = {
        ...tercero,
        vendedor: objOperador.cod_vendedor,
        rut_path: rutFile ? `S` : 'N',
        camaracomercio_path: camaraComercioFile ? `S` : 'N',
        cc_path: cedulaFile ? `S` : 'N',
      };
      const response = await tercerosService.createTercero(updatedTercero);
      if (response) {
        try {
          const visitas = await generateVisits([updatedTercero]);
          if (visitas.length > 0) {
            console.log('visitas', visitas);
            await visitaService.fillVisitas(visitas);
          }
          if (rutFile || camaraComercioFile || cedulaFile) {
            await uploadFiles();
          }
        } catch (error) {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description: 'Error intentando crear el tercero',
            }),
          );
        }
      }

      setIsLoading(false);
      navigation.navigate('TabNavPrincipal');
    } catch (error: any) {
      setIsLoading(false);
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
    setIsModalVisible(true);
  };

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

  const openFileModal = async () => {
    setObjTercero(tercero);
    dispatch(setIsShowUploadArchives(true));
  };

  const handleFilesUpload = (files: {
    rutFile: DocumentPickerResponse | null;
    camaraComercioFile: DocumentPickerResponse | null;
    cedulaFile: DocumentPickerResponse | null;
  }) => {
    setRutFile(files.rutFile);
    setCamaraComercioFile(files.camaraComercioFile);
    setCedulaFile(files.cedulaFile);
  };

  const uploadFiles = async () => {
    const arrayFiles: DocumentPickerResponse[] = [];
    const type =
      /^\d{9,10}$/.test(tercero.codigo) &&
      tercero.codigo.slice(-1) ===
        calcularDigitoVerificacion(tercero.codigo.slice(0, -1)).toString()
        ? 'NIT'
        : 'CC';

    const addFileToArray = (
      file: DocumentPickerResponse | null,
      suffix: string,
    ) => {
      if (file) {
        let codigoPad = padLeftCodigo(tercero.codigo);
        file.name = `${type}-${codigoPad}${suffix}.${file?.name
          ?.split('.')
          .pop()}`;
        arrayFiles.push(file);
      }
    };

    addFileToArray(rutFile, 'RUT');
    addFileToArray(camaraComercioFile, 'CAMCOM');
    addFileToArray(cedulaFile, 'DI');

    try {
      const iFile = {
        codigo: tercero.codigo,
        nombre: tercero.nombre,
        tipo: type,
        files: arrayFiles,
      };

      const response = await filesService.addFile(iFile);

      if (response) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: 'Tercero creado correctamente.',
          }),
        );
      }
      handleFilesUpload({
        rutFile: null,
        camaraComercioFile: null,
        cedulaFile: null,
      });
    } catch (error) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Error al subir los archivos.',
        }),
      );
    }
  };
  const numericOnly = (text: string) => {
    text = text.replace(/[^0-9]/g, '');
  };
  const screenWidth = Dimensions.get('window').width;

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
          opacity: isLoading ? 0.5 : 1,
        }}
        scrollEnabled={!isLoading}>
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
            error={errors.nombre}
            // disabled={isDisabled}
          />
          <_InputSelect<'CC' | 'NIT'>
            value={tercero.tipo ?? 'CC'}
            values={[
              {label: 'Cedula de ciudadania', value: 'CC'},
              {label: 'Numero de identicacion tributaria', value: 'NIT'},
            ]}
            setValue={value =>
              setTercero(prevState => ({...prevState, tipo: value}))
            }
            // disabled={isDisabled}
          />

          <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1}}>
              <_Input
                label="Identificacion"
                name="codigo"
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text: string) => {
                  numericOnly(text);
                  setTercero(prevState => ({...prevState, codigo: text}));
                }}
                onBlur={checkCodigoExists}
                error={errors.codigo}
              />
            </View>
            <View style={{flex: 0.3}}>
              <_Input
                label="Dv"
                name="dv"
                keyboardType="numeric"
                maxLength={1}
                value={tercero.dv} // Asegúrate de que el valor esté vinculado al estado
                onChangeText={(text: string) => {
                  numericOnly(text);
                  setTercero(prevState => ({...prevState, dv: text}));
                }}
                error={errors.dv}
                disabled={isDisabled}
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1}}>
              <_Input
                label="Telefono"
                name="tel"
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text: string) => {
                  numericOnly(text);
                  setTercero(prevState => ({...prevState, tel: text}));
                }}
                disabled={isDisabled}
              />
            </View>

            <View style={{flex: 0.3}}>
              <_Input
                label="Plazo"
                name="plazo"
                maxLength={3}
                onChangeText={(text: string) => {
                  numericOnly(text);
                  setTercero(prevState => ({
                    ...prevState,
                    plazo: parseInt(text),
                  }));
                }}
                disabled={isDisabled}
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
                disabled={isDisabled}
              />
            </View>

            <View style={{flex: 1}}>
              <_Input
                label="Ciudad"
                name="ciudad"
                onChangeText={(text: string) =>
                  setTercero(prevState => ({...prevState, ciudad: text}))
                }
                disabled={isDisabled}
              />
            </View>
          </View>
          <_Input
            label="Barrio"
            name="barrio"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, barrio: text}))
            }
            disabled={isDisabled}
          />
          <_Input
            label="Direccion"
            name="direcc"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, direcc: text}))
            }
            error={errors.direcc}
            disabled={isDisabled}
          />
          <_Input
            label="Correo electronico"
            name="email"
            onChangeText={(text: string) =>
              setTercero(prevState => ({...prevState, email: text}))
            }
            disabled={isDisabled}
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

          <View style={{flexDirection: 'row', gap: 8}}>
            <View
              style={{flex: 1.5, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 4}}>
                <_Input
                  label="Zona"
                  name="zona"
                  value={tercero.zona}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, zona: text}))
                  }
                  error={errors.zona}
                  disabled={isDisabled}
                />
              </View>
              <View style={{flex: 2, marginLeft: 6}}>
                <IconButton
                  iconName="map-marker-path"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => dispatch(setIsShowZonaFinder(true))}
                  // disabled={isDisabled}
                />
              </View>
            </View>
            <View
              style={{flex: 1.8, flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 1}}>
                <_Input
                  label="Ruta"
                  name="ruta"
                  value={tercero.ruta}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, ruta: text}))
                  }
                  error={errors.ruta}
                  disabled={isDisabled}
                />
              </View>
              <View style={{flex: 0.33, marginLeft: 6}}>
                <IconButton
                  iconName="call-split"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => dispatch(setIsShowRutaFinder(true))}
                  // disabled={isDisabled}
                />
              </View>
            </View>
          </View>
          <View style={styles.container}>
            {/* Input y botón 1 */}
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <_Input
                  label="Frec 1"
                  name="frecuencia"
                  value={tercero.frecuencia}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia: text}))
                  }
                />
              </View>
              <View style={styles.buttonContainer}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia')}
                />
              </View>
            </View>

            {/* Input y botón 2 */}
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <_Input
                  label="Frec 2"
                  name="frecuencia2"
                  value={tercero.frecuencia2}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia2: text}))
                  }
                />
              </View>
              <View style={styles.buttonContainer}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia2')}
                />
              </View>
            </View>

            {/* Input y botón 3 */}
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <_Input
                  label="Frec 3"
                  name="frecuencia3"
                  value={tercero.frecuencia3}
                  onChangeText={(text: string) =>
                    setTercero(prevState => ({...prevState, frecuencia3: text}))
                  }
                />
              </View>
              <View style={styles.buttonContainer}>
                <IconButton
                  iconName="calendar-refresh"
                  iconColor="#FFF"
                  iconSize={36}
                  onPress={() => handleOpenFrequencyFinder('frecuencia3')}
                />
              </View>
            </View>
          </View>

          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity
              style={{
                backgroundColor: '#485E8A',
                padding: 3,
                borderRadius: 5,
              }}
              onPress={() => openFileModal()}
              disabled={isDisabled}>
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
              }}
              disabled={isDisabled}>
              <Icon name="map-marker-radius" size={36} color={'#FFF'} />
            </TouchableOpacity>
          </View>

          {/* <View>
            {tercero.codigo.length < 10 && (
              <Text style={{color: 'red'}}>
                Para adjuntar archivos debe ingresar la cedula del cliente
              </Text>
            )}
          </View> */}
        </View>

        <View style={{marginVertical: 20}}>
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
      <SearchLocation
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
      />
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
      <UploadArchives onFilesUpload={handleFilesUpload} tercero={tercero} />
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro con opacidad
          }}>
          <ActivityIndicator size="large" color="#092254" />
        </View>
      )}
    </View>
  );
};

export {CreateTercero};
