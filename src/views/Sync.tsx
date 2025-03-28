import React, {useState, useEffect} from 'react';

import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {generateVisits} from '../utils';
import {
  Divider,
  Dialog,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';

/* icons */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {
  setIsSignedIn,
  setStrTouchedButton,
  setIsShowTercerosFinder,
  setIsShowOperadoresFinder,
  setIsShowProductFinder,
  setIsShowCarteraFinder,
  setIsShowAlmacenesFinder,
} from '../redux/slices';
/* components */
import {
  CoolButton,
  PrincipalHeader,
  OperadoresFinder,
  TercerosFinder,
  ProductFinder,
  AlmacenesFinder,
  CarteraFinder,
} from '../components';
/* queries */
import {SyncQueries, TercerosApiServices} from '../data_queries/api/queries';
/* local database services */
import {
  operadoresService,
  articulosService,
  almacenesService,
  carteraService,
  tercerosService,
  pedidosService,
  facturasService,
  encuestaService,
  frecuenciaService,
  rutaService,
  zonaService,
  visitaService,
} from '../data_queries/local_database/services';
/* utils */
import {showAlert} from '../utils/showAlert';
/* slices */
import {setObjInfoAlert} from '../redux/slices';
/* local types */
interface ProgressWindowProps {
  visible: boolean;
  dialogContent: string;
  cancelSyncQueries: () => void;
  disabledCancel: boolean;
}

interface RecordProps {
  records: {
    quantityOperadores: string;
    quantityArticulos: string;
    quantityAlmacenes: string;
    quantityCartera: string;
    quantityTerceros: string;
  };
  toggleOperadores: () => void;
  toggleTerceros: () => void;
  toggleArticulos: () => void;
  toggleCartera: () => void;
  toggleAlmacenes: () => void;
}

interface Records {
  quantityOperadores: string;
  quantityArticulos: string;
  quantityAlmacenes: string;
  quantityCartera: string;
  quantityTerceros: string;
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

const Record = ({
  records,
  toggleOperadores,
  toggleTerceros,
  toggleArticulos,
  toggleCartera,
  toggleAlmacenes,
}: RecordProps) => {
  const {
    quantityOperadores,
    quantityArticulos,
    quantityAlmacenes,
    quantityCartera,
    quantityTerceros,
  } = records;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      //height: '100%',
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
      <TouchableOpacity onPress={toggleOperadores} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Operadores
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityOperadores} registros
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <TouchableOpacity onPress={toggleArticulos} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Articulos
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityArticulos} registros
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <TouchableOpacity onPress={toggleAlmacenes} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Almacenes
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityAlmacenes} registros
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <TouchableOpacity onPress={toggleCartera} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Cartera
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityCartera} registros
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <TouchableOpacity onPress={toggleTerceros} style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Terceros
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityTerceros} registros
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Icon name="chevron-right" color="grey" size={28} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Sync = () => {
  const dispatch = useAppDispatch();

  const objConfig = useAppSelector(store => store.config.objConfig);

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const [syncQueriesScope, setSyncQueriesScope] = useState<any>();

  const [showProgressWindow, setShowProgressWindow] = useState<boolean>(false);

  const [dialogContent, setDialogContent] = useState('');

  const [disabledCancel, setDisabledCancel] = useState<boolean>(false);

  const [records, setRecords] = useState<Records>({
    quantityOperadores: '',
    quantityArticulos: '',
    quantityAlmacenes: '',
    quantityCartera: '',
    quantityTerceros: '',
  });

  useEffect(() => {
    loadRecord();
  }, []);

  const toggleDownloadData = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);
    const tercerosQueries = new TercerosApiServices(direccionIp, puerto);
    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo operadores - 1/9');
      const resGetOperadores = await syncQueries._getOperadores();

      setDialogContent('Trayendo articulos - 2/9');
      const resGetArticulos = await syncQueries._getArticulos();

      setDialogContent('Trayendo almacenes - 3/9');
      const resGetAlmacenes = await syncQueries._getAlmacenes();

      setDialogContent('Trayendo cartera - 4/9');
      const resGetCartera = await syncQueries._getCartera();
      setDialogContent('Trayendo encuesta - 5/9');
      const resGetEncuesta = await syncQueries._getEncuesta();
      setDialogContent('Treyendo terceros - 6/9');
      const resGetTerceros = await tercerosQueries._getTerceros();
      setDialogContent('Generando visitas - 7/9');
      const resVisitas = await generateVisits(resGetTerceros);
      setDialogContent('Trayendo zonas - 7/9');
      const resGetZonas = await syncQueries._getZonas();
      console.log('resGetZonas:', resGetZonas);
      setDialogContent('Trayendo rutas - 8/9');
      const resGetRutas = await syncQueries._getRutas();
      setDialogContent('Trayendo frecuencias - 9/9');
      const resGetFrecuencias = await syncQueries._getFrecuencias();

      setDisabledCancel(true);

      await pedidosService.deleteTablaPedidos();
      await facturasService.deleteTablaFacturas();
      await zonaService.deleteZonas();
      // await visitaService.deleteTableVisitas();

      setDialogContent('Descargando operadores - 1/5');
      await operadoresService.fillOperadores(resGetOperadores);
      setDialogContent('Descargando articulos - 2/5');
      await articulosService.fillArticulos(resGetArticulos);
      setDialogContent('Descargando almacenes - 3/5');
      await almacenesService.fillAlmacenes(resGetAlmacenes);
      setDialogContent('Descargando casrtera - 4/5');
      await carteraService.fillCartera(resGetCartera);
      setDialogContent('Descargando encuesta - 5/5');
      await encuestaService.fillEncuesta(resGetEncuesta);
      setDialogContent('Descargando terceros - 5/5');
      // await tercerosService.fillTerceros(resGetTerceros);
      setDialogContent('Descargando visitas - 5/5');
      await visitaService.fillVisitas(resVisitas);
      setDialogContent('Descargando zonas - 5/5');
      await zonaService.fillZona(resGetZonas);
      setDialogContent('Descargando rutas - 5/5');
      await rutaService.fillRuta(resGetRutas);
      setDialogContent('Descargando frecuencias - 5/5');
      await frecuenciaService.fillFrecuencia(resGetFrecuencias);

      setDisabledCancel(false);

      setShowProgressWindow(false);

      loadRecord();

      dispatch(showAlert('05'));
    } catch (error: any) {
      console.error('Error durante la sincronización:', error);
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
    const quantityOperadores = await operadoresService.getQuantityOperadores();
    const quantityArticulos = await articulosService.getQuantityArticulos();
    const quantityAlmacenes = await almacenesService.getQuantityAlmacenes();
    const quantityCartera = await carteraService.getQuantityCartera();
    const quantityTerceros = await tercerosService.getQuantityTerceros();

    setRecords({
      quantityOperadores,
      quantityArticulos,
      quantityAlmacenes,
      quantityCartera,
      quantityTerceros,
    });
  };
  const toggleOperadores = () => {
    dispatch(setIsShowOperadoresFinder(true));
  };
  const toggleTerceros = () => {
    dispatch(setIsShowTercerosFinder(true));
  };
  const toggleArticulos = () => {
    dispatch(setIsShowProductFinder(true));
  };
  const toggleCartera = () => {
    dispatch(setIsShowCarteraFinder(true));
  };
  const toggleAlmacenes = () => {
    dispatch(setIsShowAlmacenesFinder(true));
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
      //height: screenHeight * 0.5,
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
            value="Descargar datos"
            iconName="download"
            colorButton="#365AC3"
            colorText="#fff"
            iconSize={20}
            pressCoolButton={() => toggleDownloadData()}
          />
        </View>

        <View style={styles.recordContainer}>
          <Record
            records={records}
            toggleOperadores={toggleOperadores}
            toggleTerceros={toggleTerceros}
            toggleArticulos={toggleArticulos}
            toggleCartera={toggleCartera}
            toggleAlmacenes={toggleAlmacenes}
          />
        </View>
      </View>

      <ProgressWindow
        visible={showProgressWindow}
        dialogContent={dialogContent}
        cancelSyncQueries={cancelSyncQueries}
        disabledCancel={disabledCancel}
      />

      <OperadoresFinder />
      <ProductFinder />
      <AlmacenesFinder />
      <CarteraFinder />
      <TercerosFinder searchTable="terceros" />
    </View>
  );
};

export {Sync};
