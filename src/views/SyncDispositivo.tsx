import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {
  Divider,
  Dialog,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {showAlert} from '../utils/showAlert';
import {
  setObjInfoAlert,
  setIsSignedIn,
  setStrTouchedButton,
  setIsShowTercerosFinder,
} from '../redux/slices';
import {CoolButton, PrincipalHeader, TercerosFinder} from '../components';
import {SyncQueries} from '../data_queries/api/queries';
import {
  pedidosService,
  facturasService,
  tercerosService,
} from '../data_queries/local_database/services';
import {ITerceros} from '../common/types';

interface ProgressWindowProps {
  visible: boolean;
  dialogContent: string;
  cancelSyncQueries: () => void;
  disabledCancel: boolean;
}

interface RecordProps {
  records: {
    quantityTerceros: string;
    createdTerceros: number;
    editedTerceros: number;
  };
  toggleTerceros: () => void;
}

interface Records {
  quantityTerceros: string;
  createdTerceros: number;
  editedTerceros: number;
}

const ProgressWindow = ({
  visible,
  dialogContent,
  cancelSyncQueries,
  disabledCancel,
}: ProgressWindowProps) => {
  const styles = StyleSheet.create({
    container: {
      paddingBottom: 15,
    },
    dialogContent: {
      display: 'flex',
      flexDirection: 'row',
    },
  });

  return (
    <Dialog visible={visible} dismissable={false} style={{marginTop: -10}}>
      <Dialog.Title>Descargando datos</Dialog.Title>
      <Dialog.Content>
        <View style={styles.dialogContent}>
          <ActivityIndicator animating={true} color="black" size={10} />
          <Text
            allowFontScaling={false}
            variant="bodyMedium"
            style={{marginLeft: 5}}>
            {dialogContent}...
          </Text>
        </View>
        {disabledCancel && (
          <Text allowFontScaling={false} style={{marginLeft: 15, marginTop: 5}}>
            Por favor, no cierre la aplicación ni apague el equipo.
          </Text>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={cancelSyncQueries} disabled={disabledCancel}>
          Cancelar
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const Record = ({records, toggleTerceros}: RecordProps) => {
  const {quantityTerceros, createdTerceros, editedTerceros} = records;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
    },
    itemContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemLeft: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    itemLeftSuperiorText: {
      color: '#303134',
      fontSize: 18,
    },
    itemLeftInferiorText: {
      color: 'grey',
    },
    itemRight: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemRightIcon: {},
    divider: {
      marginVertical: 10,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTerceros} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Terceros
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityTerceros} registros
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {createdTerceros} creados, {editedTerceros} editados
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SyncDispositivo = () => {
  const dispatch = useAppDispatch();
  const objConfig = useAppSelector(store => store.config.objConfig);
  const tercerosCreados = useAppSelector(
    store => store.tercerosFinder.tercerosCreados,
  );
  const tercerosEditados = useAppSelector(
    store => store.tercerosFinder.tercerosEditados,
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );
  const [syncQueriesScope, setSyncQueriesScope] = useState<any>();
  const [showProgressWindow, setShowProgressWindow] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState('');
  const [disabledCancel, setDisabledCancel] = useState<boolean>(false);
  const [records, setRecords] = useState<Records>({
    quantityTerceros: '0',
    createdTerceros: 0,
    editedTerceros: 0,
  });

  useEffect(() => {
    loadRecord();
  }, []);

  const toggleUploadData = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;
    const syncQueries = new SyncQueries(direccionIp, puerto);
    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo terceros');
      const resGetTerceros = await syncQueries._getTerceros();

      setDisabledCancel(true);

      await pedidosService.deleteTablaPedidos();
      await facturasService.deleteTablaFacturas();

      setDialogContent('Descargando terceros');
      await tercerosService.fillTerceros(resGetTerceros);

      setDisabledCancel(false);
      setShowProgressWindow(false);
      loadRecord();
      dispatch(showAlert('05'));
    } catch (error: any) {
      setShowProgressWindow(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message,
        }),
      );
    }
  };

  const decisionExecutefunction = (executeFunctionScope: string) => {
    switch (executeFunctionScope) {
      case 'cerrar sesion':
        singOff();
        break;
      default:
        break;
    }
  };

  const singOff = () => {
    dispatch(setIsSignedIn(false));
    dispatch(setStrTouchedButton('config'));
  };

  const cancelSyncQueries = async () => {
    setShowProgressWindow(false);
    syncQueriesScope._cancelSyncQueries();
  };

  const loadRecord = async () => {
    const createdTerceros = tercerosCreados.length || 0;
    const editedTerceros = tercerosEditados.length || 0;
    const quantityTerceros = (createdTerceros + editedTerceros).toString();

    setRecords({
      quantityTerceros,
      createdTerceros,
      editedTerceros,
    });
  };

  const toggleTerceros = () => {
    dispatch(setIsShowTercerosFinder(true));
  };

  const styles = StyleSheet.create({
    container: {
      height: screenHeight - 55,
    },
    content: {
      height: screenHeight * 0.85,
    },
    title: {
      color: '#7B7B7B',
      fontWeight: 'bold',
      fontSize: 22,
    },
    buttonContainer: {
      backgroundColor: '#fff',
      marginTop: 10,
      marginBottom: 10,
      marginHorizontal: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      height: screenHeight * 0.1,
    },
    recordContainer: {
      backgroundColor: '#fff',
      marginHorizontal: 20,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 10,
    },
    tabButtonsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      height: screenHeight * 0.15 - 55,
    },
  });

  return (
    <View style={styles.container}>
      <View>
        <PrincipalHeader />
      </View>
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <CoolButton
            value="Sincronizar datos"
            iconName="upload"
            colorButton="#365AC3"
            colorText="#fff"
            iconSize={20}
            pressCoolButton={() => toggleUploadData()}
          />
        </View>

        <View style={styles.recordContainer}>
          <Record records={records} toggleTerceros={toggleTerceros} />
        </View>
      </View>

      <ProgressWindow
        visible={showProgressWindow}
        dialogContent={dialogContent}
        cancelSyncQueries={cancelSyncQueries}
        disabledCancel={disabledCancel}
      />

      <TercerosFinder />
    </View>
  );
};

export {SyncDispositivo};
