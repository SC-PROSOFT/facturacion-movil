import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {InfoAlert} from '../components';
import {calcularDigitoVerificacion} from '../utils';
import {ITerceros} from '../common/types';
/* components */
import {CoolButton} from '../components';
/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';
import {FilesApiServices} from '../data_queries/api/queries';
import {filesService} from '../data_queries/local_database/services';
import {IFiles} from '../common/types';
import {convert} from 'react-native-html-to-pdf';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const FilesTercero = () => {
  const dispatch = useAppDispatch();
  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const files = useAppSelector(store => store.files.file);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  const objConfig = useAppSelector(store => store.config.objConfig);
  const [file, setFile] = useState<IFiles | null>(null);
  const [copyFile, setCopyFile] = useState<IFiles | null>(null);
  const [rutFile, setRutFile] = useState<DocumentPickerResponse | null>(null);
  const [camaraComercioFile, setCamaraComercioFile] =
    useState<DocumentPickerResponse | null>(null);
  const [cedulaFile, setCedulaFile] = useState<DocumentPickerResponse | null>(
    null,
  );
  const getFiles = async () => {
    if (files) {
      const parsedFiles = JSON.parse(files.files);
      parsedFiles.forEach((file: DocumentPickerResponse) => {
        if (file.name?.includes('RUT')) {
          setRutFile(file);
        } else if (file.name?.includes('CAMCOMERCIO')) {
          setCamaraComercioFile(file);
        } else if (file.name?.includes('DI')) {
          setCedulaFile(file);
        }
      });
      if (JSON.stringify(files) !== JSON.stringify(file)) {
        setFile(files);
        setCopyFile(files);
      }
    }
  };

  useEffect(() => {
    getFiles();
  }, [objTercero.codigo]);

  const filesApiServices = new FilesApiServices(
    objConfig.direccionIp,
    objConfig.puerto,
  );

  const handleFileSelection = async (type: string) => {
    console.log('type', type);
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: false,
      });
      console.log('entre document picker');
      if (res && res[0]) {
        if (res[0].size > MAX_FILE_SIZE) {
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
        if (type === 'RUT') {
          setRutFile(res[0]);
        } else if (type === 'Cámara de Comercio') {
          setCamaraComercioFile(res[0]);
        } else if (type === 'Cédula') {
          setCedulaFile(res[0]);
        }
        console.log(`Selected ${type} file: `, res[0]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.log(err);
        throw err;
      }
    }
  };

  const uploadFiles = async () => {
    const arrayFiles: DocumentPickerResponse[] = [];
    const type =
      /^\d{9,10}$/.test(objTercero.codigo) &&
      objTercero.codigo.slice(-1) ===
        calcularDigitoVerificacion(objTercero.codigo.slice(0, -1)).toString()
        ? 'NIT'
        : 'CC';
    if (rutFile) {
      rutFile.name = `${type}-${objTercero.codigo}-RUT.${rutFile?.name
        ?.split('.')
        .pop()}`;
      arrayFiles.push(rutFile);
    }
    if (camaraComercioFile) {
      camaraComercioFile.name = `${type}-${
        objTercero.codigo
      }-CAMCOMERCIO.${camaraComercioFile?.name?.split('.').pop()}`;
      arrayFiles.push(camaraComercioFile);
    }
    if (cedulaFile) {
      cedulaFile.name = `${type}-${objTercero.codigo}-DI.${cedulaFile?.name
        ?.split('.')
        .pop()}`;
      arrayFiles.push(cedulaFile);
    }
    if (files) {
      console.log('arrayFiles', arrayFiles);
      const response = await filesService.updateFile(files.codigo, arrayFiles);
      if (response) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: 'Archivos subidos correctamente.',
          }),
        );
      } else {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: 'Error al subir los archivos.',
          }),
        );
      }
    } else {
      const iFile: IFiles = {
        codigo: objTercero.codigo,
        nombre: objTercero.nombre,
        tipo: type,
        files: arrayFiles,
      };

      try {
        const response = await filesService.addFile(iFile);
        if (response) {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'success',
              description: 'Archivos subidos correctamente.',
            }),
          );
        } else {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description: 'Error al subir los archivos.',
            }),
          );
        }
      } catch (error) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: 'Error al subir los archivos.',
          }),
        );
      }
    }
  };

  // const convertToFile = async (
  //   file: DocumentPickerResponse,
  // ): Promise<File | null> => {
  //   try {
  //     const blob = await uriToBlob(file.uri);
  //     const convertedFile = new File([blob], file.name, {type: file.type});
  //     return convertedFile;
  //   } catch (error) {
  //     console.error('Error converting file:', error);
  //     return null;
  //   }
  // };

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

  return (
    <View>
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
          <View style={{flex: 1, marginRight: 5, alignItems: 'center'}}>
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

        <CoolButton
          value="Guardar cambios"
          iconName="menu"
          colorButton="#09540B"
          colorText="#FFF"
          iconSize={26}
          pressCoolButton={() => {
            uploadFiles();
          }}
        />
      </View>
      <View>
        <InfoAlert />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fileTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'semibold',
  },
});

export {FilesTercero};
