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
import {setFile} from '../redux/slices';

const FilesTercero = () => {
  const dispatch = useAppDispatch();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

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
    console.log('objTercero.codigo', objTercero);
  }, [objTercero.codigo, dispatch]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

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

    addFileToArray(rutFile, 'RUT');
    addFileToArray(camaraComercioFile, 'CAMCOM');
    addFileToArray(cedulaFile, 'DI');

    try {
      let response;

      if (
        objTercero.rut_pdf === 'S' ||
        objTercero.camcom_pdf === 'S' ||
        objTercero.di_pdf === 'S'
      ) {
        response = await filesService.updateFile(objTercero.codigo, arrayFiles);
      } else {
        const iFile = {
          codigo: objTercero.codigo,
          nombre: objTercero.nombre,
          tipo: type,
          files: arrayFiles,
        };
        response = await filesService.addFile(iFile);
      }

      if (response) {
        const terceroModificado = {...objTercero};
        terceroModificado.rut_pdf = rutFile ? 'S' : 'N';
        terceroModificado.camcom_pdf = camaraComercioFile ? 'S' : 'N';
        terceroModificado.di_pdf = cedulaFile ? 'S' : 'N';
        await tercerosService.updateTercero(terceroModificado);
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: 'Archivos subidos correctamente.',
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <ActivityIndicator size="large" color="#092254" />
        </View>
      )}
    </View>
  );
};

export {FilesTercero};
