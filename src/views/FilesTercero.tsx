import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {InfoAlert} from '../components';
import {calcularDigitoVerificacion, padLeftCodigo} from '../utils';
import {ITerceros} from '../common/types';
/* components */
import {CoolButton} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';
import {FilesApiServices} from '../data_queries/api/queries';
import {
  filesService,
  tercerosService,
} from '../data_queries/local_database/services';
import {IFiles} from '../common/types';
import {setFile} from '../redux/slices';
import {useNavigation} from '@react-navigation/native';

const FilesTercero = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const files = useAppSelector(store => store.files.file);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  const objConfig = useAppSelector(store => store.config.objConfig);
  const [file, setFileState] = useState<IFiles | null>(null);
  const [copyFile, setCopyFile] = useState<IFiles | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [rutFile, setRutFile] = useState<DocumentPickerResponse | null>(null);
  const [camaraComercioFile, setCamaraComercioFile] =
    useState<DocumentPickerResponse | null>(null);
  const [cedulaFile, setCedulaFile] = useState<DocumentPickerResponse | null>(
    null,
  );

  const getFiles = async () => {
    // let files = null;
    // try {
    //   files = await filesService.getFilesByCode(objTercero.codigo);
    // } catch (error) {
    //   setIsLoading(false);
    // }
    // console.log(files);
    const files = await filesService.getFilesByCode(objTercero.codigo);
    setCopyFile(files);
    if (files) {
      try {
        const parsedFiles = JSON.parse(files.files);
        parsedFiles.forEach((file: DocumentPickerResponse) => {
          if (file.name?.includes('RUT')) {
            setRutFile(file);
          } else if (file.name?.includes('CAMCOM')) {
            setCamaraComercioFile(file);
          } else if (file.name?.includes('DI')) {
            setCedulaFile(file);
          }
        });
        if (JSON.stringify(files) !== JSON.stringify(file)) {
          setFileState(files);
        }
      } catch (error) {
        setIsLoading(false);
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Error al cargar los archivos.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getFiles();
  }, [objTercero.codigo]);

  const handleFileSelection = async (type: string) => {
    setIsDisabled(false);
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });
      if (res && res[0]) {
        const selectedFile = res[0];
        if (selectedFile.size > MAX_FILE_SIZE) {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description:
                'El archivo seleccionado excede el tamaño máximo de 20 MB.',
            }),
          );
          return;
        }

        assignFile(type, selectedFile);
      }
    } catch (err) {
      handleFileSelectionError(err);
    }
  };

  const assignFile = (type: string, file: DocumentPickerResponse) => {
    switch (type) {
      case 'RUT':
        setRutFile(file);
        break;
      case 'Cámara de Comercio':
        setCamaraComercioFile(file);
        break;
      case 'Cédula':
        setCedulaFile(file);
        break;
      default:
        break;
    }
  };

  const handleFileSelectionError = (err: any) => {
    if (DocumentPicker.isCancel(err)) {
    } else {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description:
            'Ocurrió un error al seleccionar el archivo. Por favor, inténtelo de nuevo.',
        }),
      );
    }
  };

  const uploadFiles = async () => {
    setIsDisabled(true);
    setIsLoading(true);
    const arrayFiles: DocumentPickerResponse[] = [];
    const type =
      /^\d{9,10}$/.test(objTercero.codigo) &&
      objTercero.codigo.slice(-1) ===
        calcularDigitoVerificacion(objTercero.codigo.slice(0, -1)).toString()
        ? 'NIT'
        : 'CC';

    const addFileToArray = (
      file: DocumentPickerResponse | null,
      suffix: string,
    ) => {
      console.log('file añadida', file);

      if (file) {
        file.name = `${type}-${padLeftCodigo(
          objTercero.codigo,
        )}-${suffix}.${file?.name?.split('.').pop()}`;
        arrayFiles.push(file);
      }
    };

    addFileToArray(rutFile, 'RUT');
    addFileToArray(camaraComercioFile, 'CAMCOM');
    addFileToArray(cedulaFile, 'DI');

    try {
      console.log(files.files);
      let response;

      if (copyFile?.files?.length ?? 0 > 0) {
        console.log('update');
        response = await filesService.updateFile(copyFile?.codigo, arrayFiles);
        console.log(response);
      } else {
        const iFile: IFiles = {
          codigo: objTercero.codigo,
          nombre: objTercero.nombre,
          tipo: type,
          files: arrayFiles,
        };
        console.log('add');
        response = await filesService.addFile(iFile);
      }

      if (response) {
        const terceroModificado = {...objTercero};
        terceroModificado.tipo =
          /^\d{9,10}$/.test(objTercero.codigo) &&
          objTercero.codigo.slice(-1) ===
            calcularDigitoVerificacion(
              objTercero.codigo.slice(0, -1),
            ).toString()
            ? 'NIT'
            : 'CC';
        const ruta = `D:\\psc\\prog\\DATOS\\ANEXOS\\${
          terceroModificado.tipo
        }-${padLeftCodigo(terceroModificado.codigo)}`;
        terceroModificado.rut_path = rutFile ? 'S' : 'N';
        terceroModificado.camaracomercio_path = camaraComercioFile ? 'S' : 'N';
        terceroModificado.cc_path = cedulaFile ? 'S' : 'N';
        await tercerosService.updateTercero(terceroModificado);
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: 'Archivos subidos correctamente y paths actualizados.',
          }),
        );
      } else {
        setIsDisabled(true);
        setIsLoading(false);
      }
    } catch (error) {
      setIsDisabled(false);
      setIsLoading(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Error al subir los archivos.',
        }),
      );
    } finally {
      const archivos = await filesService.getFilesByCode(objTercero.codigo);
      dispatch(setFile(archivos));
      setIsLoading(false);
    }
  };
  const filesApiServices = new FilesApiServices(
    objConfig.direccionIp,
    objConfig.puerto,
  );
  const tryUploadFiles = async () => {
    console.log(objConfig);
    filesApiServices._uploadFiles(rutFile, objTercero);
  };

  const removeFile = (type: string) => {
    if (type === 'RUT') {
      setRutFile(null);
    } else if (type === 'Cámara de Comercio') {
      setCamaraComercioFile(null);
    } else if (type === 'Cédula') {
      setCedulaFile(null);
    }
  };

  const addRut = () => handleFileSelection('RUT');
  const addCamaraComercio = () => handleFileSelection('Cámara de Comercio');
  const addCedula = () => handleFileSelection('Cédula');

  const styles = StyleSheet.create({
    fileTitle: {
      fontSize: 20,
      textAlign: 'center',
      fontWeight: 'semibold',
    },
    TouchableOpacityButton: {
      backgroundColor: isDisabled ? '#9ab39a' : '#09540B',
      borderRadius: 5,
      marginTop: 10,
      marginBottom: 10,
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'row', // Asegura que el icono y el texto estén en la misma fila
    },
    textButton: {
      color: '#FFF',
      fontSize: 18,
      marginLeft: 10,
      lineHeight: 40, // Añade un margen izquierdo para separar el texto del icono
    },
  });

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <View style={{opacity: isLoading ? 0.5 : 1, height: '100%'}}>
        <View style={{padding: 10}}>
          <Text style={styles.fileTitle}>DOCUMENTO DE IDENTIFICACION</Text>
          <View style={{position: 'relative', marginBottom: 15}}>
            <TouchableOpacity
              style={{
                borderRadius: 10,
                elevation: 10,
                padding: 10,
                backgroundColor: '#FFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={addCedula}>
              <Icon
                name={cedulaFile ? 'file-check' : 'file-remove'}
                size={80}
                color={cedulaFile ? '#97D599' : '#DE3A45'}
                style={{textAlign: 'center'}}
              />
              <Text>PDF, JPG, JPEG, PNG</Text>
              <Text style={{textAlign: 'center'}}>Tamaño máximo 20MB</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#092254',
                  marginTop: 5,
                }}>
                {cedulaFile ? 'Archivo cargado' : 'No se ha cargado archivo'}
              </Text>
            </TouchableOpacity>
            {cedulaFile && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: '#092254',
                  borderRadius: 15,
                  padding: 5,
                }}
                onPress={() => removeFile('Cédula')}>
                <Icon name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
            <View style={{flex: 1, marginRight: 10, alignItems: 'center'}}>
              <View style={{minHeight: 70, justifyContent: 'center'}}>
                <Text style={styles.fileTitle}>RUT</Text>
              </View>
              <View style={{position: 'relative', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{
                    borderRadius: 10,
                    elevation: 10,
                    padding: 10,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={addRut}>
                  <Icon
                    name={rutFile ? 'file-check' : 'file-remove'}
                    size={80}
                    color={rutFile ? '#97D599' : '#DE3A45'}
                    style={{textAlign: 'center'}}
                  />
                  <Text>PDF, JPG, JPEG, PNG</Text>
                  <Text style={{textAlign: 'center'}}>Tamaño máximo 20MB</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#092254',
                      marginTop: 5,
                      textAlign: 'center',
                    }}>
                    {rutFile ? 'Archivo cargado' : 'No se ha cargado archivo'}
                  </Text>
                </TouchableOpacity>
                {rutFile && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: '#092254',
                      borderRadius: 15,
                      padding: 5,
                    }}
                    onPress={() => removeFile('RUT')}>
                    <Icon name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{flex: 1, marginLeft: 5, alignItems: 'center'}}>
              <View
                style={{
                  minHeight: 60,
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                <Text style={styles.fileTitle}>CAMARA DE COMERCIO</Text>
              </View>
              <View style={{position: 'relative', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{
                    borderRadius: 10,
                    elevation: 10,
                    padding: 10,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={addCamaraComercio}>
                  <Icon
                    name={camaraComercioFile ? 'file-check' : 'file-remove'}
                    size={80}
                    color={camaraComercioFile ? '#97D599' : '#DE3A45'}
                    style={{textAlign: 'center'}}
                  />
                  <Text>PDF, JPG, JPEG, PNG</Text>
                  <Text style={{textAlign: 'center'}}>Tamaño máximo 20MB</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#092254',
                      marginTop: 5,
                      textAlign: 'center',
                    }}>
                    {camaraComercioFile
                      ? 'Archivo cargado'
                      : 'No se ha cargado archivo'}
                  </Text>
                </TouchableOpacity>
                {camaraComercioFile && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: '#092254',
                      borderRadius: 15,
                      padding: 5,
                    }}
                    onPress={() => removeFile('Cámara de Comercio')}>
                    <Icon name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.TouchableOpacityButton}
            onPress={uploadFiles}
            disabled={isDisabled}>
            <Icon name="menu" size={26} color="#FFF" />
            <Text style={styles.textButton}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>

        <View>
          <InfoAlert />
        </View>
      </View>
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

export {FilesTercero};
