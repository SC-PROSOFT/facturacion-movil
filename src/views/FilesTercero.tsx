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
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';
import {
  filesService,
  tercerosService,
} from '../data_queries/local_database/services';
import {setFile, setObjTercero} from '../redux/slices';
import {ITerceros, IFiles} from '../common/types';
import Toast from 'react-native-toast-message';
import {FilesApiServices} from '../data_queries/api/queries';
import {Loader} from '../components';
const FilesTercero = () => {
  const dispatch = useAppDispatch();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const objConfig = useAppSelector(store => store.config.objConfig);

  const [loaderMessage, setLoaderMessage] = useState<string>('');
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  const placeholderCargado = {
    name: 'Archivo cargado',
    uri: '', // URI no es relevante para el placeholder
    fileCopyUri: null,
    type: 'application/pdf', // O un tipo genérico
    size: 0, // Indica que no es un archivo real seleccionado
  };
  // Estados iniciales basados en objTercero
  const [rutFile, setRutFile] = useState<DocumentPickerResponse | null>(
    objTercero.rut_pdf === 'S'
      ? {
          name: 'Archivo cargado',
          uri: '',
          fileCopyUri: null,
          type: 'application/pdf',
          size: 0,
        }
      : null,
  );
  const [camaraComercioFile, setCamaraComercioFile] =
    useState<DocumentPickerResponse | null>(
      objTercero.camcom_pdf === 'S'
        ? {
            name: 'Archivo cargado',
            uri: '',
            fileCopyUri: null,
            type: 'application/pdf',
            size: 0,
          }
        : null,
    );
  const [cedulaFile, setCedulaFile] = useState<DocumentPickerResponse | null>(
    objTercero.di_pdf === 'S'
      ? {
          name: 'Archivo cargado',
          uri: '',
          fileCopyUri: null,
          type: 'application/pdf',
          size: 0,
        }
      : null,
  );
  useEffect(() => {
    // Sincronizar RUT
    if (objTercero.rut_pdf === 'S') {
      // Si no hay un archivo seleccionado por el usuario (size > 0), mostrar placeholder
      if (!rutFile || rutFile.size === 0) {
        setRutFile(placeholderCargado);
      }
    } else {
      // Si objTercero dice 'N' y el estado local es el placeholder, limpiarlo.
      // No limpiar si es un archivo recién seleccionado por el usuario.
      if (rutFile && rutFile.name === 'Archivo cargado' && rutFile.size === 0) {
        setRutFile(null);
      }
    }

    // Sincronizar Cámara de Comercio
    if (objTercero.camcom_pdf === 'S') {
      if (!camaraComercioFile || camaraComercioFile.size === 0) {
        setCamaraComercioFile(placeholderCargado);
      }
    } else {
      if (
        camaraComercioFile &&
        camaraComercioFile.name === 'Archivo cargado' &&
        camaraComercioFile.size === 0
      ) {
        setCamaraComercioFile(null);
      }
    }

    // Sincronizar Cédula/DI
    if (objTercero.di_pdf === 'S') {
      if (!cedulaFile || cedulaFile.size === 0) {
        setCedulaFile(placeholderCargado);
      }
    } else {
      if (
        cedulaFile &&
        cedulaFile.name === 'Archivo cargado' &&
        cedulaFile.size === 0
      ) {
        setCedulaFile(null);
      }
    }
  }, [objTercero.rut_pdf, objTercero.camcom_pdf, objTercero.di_pdf]);
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      await getFiles();
      setIsLoading(false);
    };
    fetchFiles();
    console.log('objTercero.codigo', objTercero);
  }, [objTercero.codigo, dispatch]);

  const [filesObj, setFiles] = useState<IFiles>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const handleFileSelection = async (type: string) => {
    setIsDisabled(false);
    setHasChanges(true); // Activar el estado de cambios
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
  const getFiles = async () => {
    let files = null;
    try {
      files = await filesService.getFilesByCode(objTercero.codigo);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setFiles(files);
      updateFileStates(); // Actualizar los estados de los archivos
    }
  };

  const updateFileStates = () => {
    // Actualizar los estados de los archivos basados en objTercero
    setRutFile(
      objTercero.rut_pdf === 'S'
        ? {
            name: 'Archivo cargado',
            uri: '',
            fileCopyUri: null,
            type: 'application/pdf',
            size: 0,
          }
        : null,
    );
    setCamaraComercioFile(
      objTercero.camcom_pdf === 'S'
        ? {
            name: 'Archivo cargado',
            uri: '',
            fileCopyUri: null,
            type: 'application/pdf',
            size: 0,
          }
        : null,
    );
    setCedulaFile(
      objTercero.di_pdf === 'S'
        ? {
            name: 'Archivo cargado',
            uri: '',
            fileCopyUri: null,
            type: 'application/pdf',
            size: 0,
          }
        : null,
    );
    setIsDisabled(true); // Bloquear el botón después de actualizar los estados
    setHasChanges(false); // Reiniciar el estado de cambios
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
      // Usuario canceló la selección
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
      if (file) {
        file.name = `${type}-${padLeftCodigo(
          objTercero.codigo,
        )}-${suffix}.${file?.name?.split('.').pop()}`;
        arrayFiles.push(file);
      }
    };

    // Agregar archivos al array
    addFileToArray(rutFile, 'RUT');
    addFileToArray(camaraComercioFile, 'CAMCOM');
    addFileToArray(cedulaFile, 'DI');

    // Filtrar archivos válidos
    const validFiles = arrayFiles.filter(
      file => file.size > 0 && !file.name.includes('.Archivo cargado'),
    );

    if (validFiles.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No hay archivos válidos para subir.',
      });
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    try {
      setLoaderMessage('Subiendo archivos al servidor...');
      // Subir archivos válidos a la API
      const uploadResults = await Promise.all(
        validFiles.map(async file => {
          const success = await uploadFilesApi(file, objTercero);
          return {file, success};
        }),
      );

      // Filtrar los archivos que no se subieron correctamente
      const failedUploads = uploadResults.filter(result => !result.success);

      // Guardar localmente los archivos que fallaron
      if (failedUploads.length > 0) {
        setLoaderMessage('Guardando archivos localmente...');
        const failedFiles = failedUploads.map(result => result.file);
        const localFile: IFiles = {
          codigo: objTercero.codigo,
          nombre: objTercero.nombre,
          tipo: type,
          files: validFiles,
          sincronizado: 'N',
          guardado: 'S',
        };

        // Verificar si objFiles tiene guardado en 'S' o 'N'
        let response;
        console.log(filesObj);
        if (filesObj?.guardado === 'S') {
          // Actualizar archivos existentes
          response = await filesService.updateFile(
            objTercero.codigo,
            validFiles,
          );
        } else {
          // Agregar nuevos archivos
          const iFile: IFiles = {
            codigo: objTercero.codigo,
            nombre: objTercero.nombre,
            tipo: type,
            files: validFiles,
            sincronizado: 'N',
            guardado: 'S', // Cambiar a 'S' porque se guardarán en la base de datos
          };
          response = await filesService.addFile(iFile);
        }
        console.log('response', response);
        if (response) {
          console.log(validFiles);
          // Actualizar objTercero y los estados de los archivos
          const terceroModificado: ITerceros = {
            ...objTercero,
            rut_pdf: arrayFiles.some(file => file.name.includes('RUT'))
              ? 'S'
              : 'N',
            camcom_pdf: arrayFiles.some(file => file.name.includes('CAMCOM'))
              ? 'S'
              : 'N',
            di_pdf: arrayFiles.some(file => file.name.includes('DI'))
              ? 'S'
              : 'N',
          };

          // Guardar cambios en la base de datos
          console.log('terceroModificado', terceroModificado);
          await tercerosService.updateTercero(terceroModificado);
          dispatch(setObjTercero(terceroModificado));
          dispatch(
            setFile(await filesService.getFilesByCode(objTercero.codigo)),
          );
        }
        if (response) {
          Toast.show({
            type: 'info',
            text1: 'Archivos guardados localmente.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error al guardar los archivos localmente.',
          });
        }
      }
      // Mostrar mensajes de éxito o información
      const allUploaded = uploadResults.every(result => result.success);
      if (allUploaded) {
        Toast.show({
          type: 'success',
          text1: 'Archivos subidos correctamente.',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Se guardaron los archivos localmente.',
        });
      }

      // Limpiar los archivos subidos
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al subir los archivos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFilesApi = async (
    file: DocumentPickerResponse,
    tercero: ITerceros,
  ): Promise<boolean> => {
    try {
      const filesApiServices = new FilesApiServices(
        objConfig.direccionIp,
        objConfig.puerto,
      );
      const success = await filesApiServices._uploadFiles(file, tercero);
      return success;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      return false;
    }
  };

  const removeFile = (type: string) => {
    setHasChanges(true); // Activar el estado de cambios
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
      flexDirection: 'row',
    },
    textButton: {
      color: '#FFF',
      fontSize: 18,
      marginLeft: 10,
      lineHeight: 40,
    },
  });

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <View style={{opacity: isLoading ? 0.5 : 1, height: '100%'}}>
        <View style={{padding: 10}}>
          {/* Documento de Identificación */}
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

          {/* RUT */}
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

            {/* Cámara de Comercio */}
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

          {/* Botón Guardar Cambios */}
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
      <Loader visible={isLoading} message={loaderMessage} />
    </View>
  );
};

export {FilesTercero};
