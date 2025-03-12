import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {CoolButton} from '../components';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setIsShowUploadArchives} from '../redux/slices/uploadArchivesSlice';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';
import {calcularDigitoVerificacion} from '../utils';

interface UploadArchivesProps {
  onFilesUpload: (files: {
    rutFile: DocumentPickerResponse | null;
    camaraComercioFile: DocumentPickerResponse | null;
    cedulaFile: DocumentPickerResponse | null;
  }) => void;
}

export const UploadArchives: React.FC<UploadArchivesProps> = React.memo(
  ({onFilesUpload}) => {
    const dispatch = useAppDispatch();
    const isShowUploadArchives = useAppSelector(
      store => store.uploadArchives.isShowUploadArchives,
    );
    const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
    const [rutFile, setRutFile] = useState<DocumentPickerResponse | null>(null);
    const [camaraComercioFile, setCamaraComercioFile] =
      useState<DocumentPickerResponse | null>(null);
    const [cedulaFile, setCedulaFile] = useState<DocumentPickerResponse | null>(
      null,
    );
    const [isLoading, setIsLoading] = useState(false);

    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isShowUploadArchives) {
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, [isShowUploadArchives]);

    const closeUploadArchives = () => {
      dispatch(setIsShowUploadArchives(false));
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

    const selectFile = async (
      setFile: React.Dispatch<
        React.SetStateAction<DocumentPickerResponse | null>
      >,
      type: string,
    ) => {
      try {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
        });
        if (res && res[0]) {
          const selectedFile = res[0];
          const fileType =
            /^\d{9,10}$/.test(objTercero.codigo) &&
            objTercero.codigo.slice(-1) ===
              calcularDigitoVerificacion(objTercero.codigo.slice(0, -1)).toString()
              ? 'NIT'
              : 'CC';
          selectedFile.name = `${fileType}-${objTercero.codigo}${type}.${selectedFile.name
            ?.split('.')
            .pop()}`;
          setFile(selectedFile);
        }
      } catch (error) {
        console.log('error =>>>>', error);
      }
    };

    const handleUpload = async () => {
      if (!rutFile || !camaraComercioFile || !cedulaFile) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: 'Todos los archivos deben ser seleccionados.',
          }),
        );
        return;
      }
      setIsLoading(true);
      onFilesUpload({rutFile, camaraComercioFile, cedulaFile});
      setIsLoading(false);
      closeUploadArchives();
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '80%',
        transform: [
          {
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
        opacity: animation,
      },
      buttonView: {
        marginBottom: 10,
        textAlign: 'center',
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
      },
      headContainer: {
        backgroundColor: '#092254',
        width: '100%',
        padding: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        zIndex: 1,
      },
      btnSelect: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
      },
      textSelect: {
        fontSize: 16,
        textAlign: 'center',
      },
      iconClose: {
        position: 'absolute',
        top: 10,
        right: 10,
      },
    });

    return (
      <Modal
        visible={isShowUploadArchives}
        onRequestClose={closeUploadArchives}
        animationType="none"
        transparent={true}>
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPressOut={closeUploadArchives}>
          <Animated.View style={styles.modal}>
            <View style={styles.headContainer}>
              <TouchableOpacity
                onPress={closeUploadArchives}
                style={styles.iconClose}>
                <Icon name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Subir Archivos</Text>
            </View>
            <View style={{marginTop: 60, padding: 20}}>
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.btnSelect}
                  onPress={() => selectFile(setRutFile, 'RUT')}>
                  <Text style={styles.textSelect}>RUT</Text>
                </TouchableOpacity>
                {rutFile && (
                  <Text style={{textAlign: 'center'}}>{rutFile.name}</Text>
                )}
              </View>

              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.btnSelect}
                  onPress={() => selectFile(setCamaraComercioFile, 'CAMCOMERCIO')}>
                  <Text style={styles.textSelect}>Cámara de Comercio</Text>
                </TouchableOpacity>
                {camaraComercioFile && (
                  <Text style={{textAlign: 'center'}}>
                    {camaraComercioFile.name}
                  </Text>
                )}
              </View>
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.btnSelect}
                  onPress={() => selectFile(setCedulaFile, 'DI')}>
                  <Text style={styles.textSelect}>Cédula</Text>
                </TouchableOpacity>
                {cedulaFile && (
                  <Text style={{textAlign: 'center'}}>{cedulaFile.name}</Text>
                )}
              </View>

              <CoolButton
                value="Guardar cambios"
                iconName="menu"
                colorButton="#09540B"
                colorText="#FFF"
                iconSize={26}
                pressCoolButton={handleUpload}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  },
);