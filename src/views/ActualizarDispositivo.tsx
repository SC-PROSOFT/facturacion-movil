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

/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {
  setIsShowTercerosFinder,
  setIsShowOperadoresFinder,
  setIsShowProductFinder,
  setIsShowCarteraFinder,
  setIsShowAlmacenesFinder,
} from '../redux/slices';
/* components */
import {
  CoolButton,
  OperadoresFinder,
  TercerosFinder,
  ProductFinder,
  AlmacenesFinder,
  CarteraFinder,
} from '../components';
/* queries */
import {SyncQueries} from '../data_queries/api/queries';
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
  zonaService,
  visitaService,
  frecuenciaService,
  rutaService,
} from '../data_queries/local_database/services';
/* utils */
import {showAlert} from '../utils/showAlert';
/* slices */
import {setObjInfoAlert} from '../redux/slices';
import {generateVisits} from '../utils';
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
  toggleDownOperadores: () => void;
  toggleTerceros: () => void;
  toggleDownTerceros: () => void;
  toggleArticulos: () => void;
  toggleDownArticulos: () => void;
  toggleCartera: () => void;
  toggleDownCartera: () => void;
  toggleAlmacenes: () => void;
  toggleDownAlmacenes: () => void;
  toggleDownEncuesta: () => void;
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
  toggleDownOperadores,
  toggleTerceros,
  toggleDownTerceros,
  toggleArticulos,
  toggleDownArticulos,
  toggleCartera,
  toggleDownCartera,
  toggleAlmacenes,
  toggleDownAlmacenes,
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
    itemContainerRight: {
      marginTop: 8,
      paddingHorizontal: 5,
    },
    itemRight: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
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

        <TouchableOpacity
          onPress={toggleDownOperadores}
          style={styles.itemContainerRight}>
          <View style={styles.itemRight}>
            <Icon name="arrow-down-circle-outline" color="#365AC3" size={28} />
          </View>
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={toggleDownArticulos}
          style={styles.itemContainerRight}>
          <View style={styles.itemRight}>
            <Icon name="arrow-down-circle-outline" color="#365AC3" size={28} />
          </View>
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={toggleDownAlmacenes}
          style={styles.itemContainerRight}>
          <View style={styles.itemRight}>
            <Icon name="arrow-down-circle-outline" color="#365AC3" size={28} />
          </View>
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={toggleDownCartera}
          style={styles.itemContainerRight}>
          <View style={styles.itemRight}>
            <Icon name="arrow-down-circle-outline" color="#365AC3" size={28} />
          </View>
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={toggleDownTerceros}
          style={styles.itemContainerRight}>
          <View style={styles.itemRight}>
            <Icon name="arrow-down-circle-outline" color="#365AC3" size={28} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const ActualizarDispositivo = () => {
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

    setSyncQueriesScope(syncQueries);

    try {
      await tercerosService.createTableTercerosCreates();
      await tercerosService.createTableTercerosEdits();
      setDialogContent('Trayendo operadores - 1/9');
      const resGetOperadores = await syncQueries._getOperadores();

      setDialogContent('Trayendo artículos - 2/9');
      const resGetArticulos = await syncQueries._getArticulos();

      setDialogContent('Trayendo almacenes - 3/9');
      const resGetAlmacenes = await syncQueries._getAlmacenes();

      setDialogContent('Trayendo cartera - 4/9');
      const resGetCartera = await syncQueries._getCartera();

      setDialogContent('Trayendo encuesta - 5/9');
      const resGetEncuesta = await syncQueries._getEncuesta();

      setDialogContent('Trayendo terceros - 6/9');
      const resGetTerceros = await syncQueries._getTerceros();

      setDialogContent('Generando visitas - 7/9');
      const resVisitas = await generateVisits(resGetTerceros);

      setDialogContent('Trayendo zonas - 8/9');
      const resGetZonas = await syncQueries._getZonas();

      setDialogContent('Trayendo rutas - 9/9');
      const resGetRutas = await syncQueries._getRutas();

      setDialogContent('Trayendo frecuencias - 10/10');
      const resGetFrecuencias = await syncQueries._getFrecuencias();

      setDisabledCancel(true);

      await facturasService.deleteTablaFacturas();
      await zonaService.deleteZonas();
      await visitaService.deleteVisitas();

      setDialogContent('Descargando operadores - 1/7');
      await operadoresService.fillOperadores(resGetOperadores);

      setDialogContent('Descargando artículos - 2/7');
      await articulosService.fillArticulos(resGetArticulos);

      setDialogContent('Descargando almacenes - 3/7');
      await almacenesService.fillAlmacenes(resGetAlmacenes);

      setDialogContent('Descargando cartera - 4/7');
      await carteraService.fillCartera(resGetCartera);

      setDialogContent('Descargando encuesta - 5/7');
      await encuestaService.fillEncuesta(resGetEncuesta);

      setDialogContent('Descargando terceros - 6/7');
      await tercerosService.fillTerceros(resGetTerceros);

      setDialogContent('Descargando visitas - 7/7');
      await visitaService.fillVisitas(resVisitas);

      setDialogContent('Descargando zonas - 8/8');
      await zonaService.fillZona(resGetZonas);

      setDialogContent('Descargando rutas - 9/9');
      await rutaService.fillRuta(resGetRutas);

      setDialogContent('Descargando frecuencias - 10/10');
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
  const toggleDownOperadores = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);

    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo operadores - 1/1');
      const resGetOperadores = await syncQueries._getOperadores();

      setDisabledCancel(true);

      // await pedidosService.deleteTablaPedidos();

      setDialogContent('Descargando operadores - 1/1');
      await operadoresService.fillOperadores(resGetOperadores);

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
  const toggleDownTerceros = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);

    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo terceros - 1/1');
      const resGetTerceros = await syncQueries._getTerceros();

      setDisabledCancel(true);

      // await pedidosService.deleteTablaPedidos();

      setDialogContent('Descargando terceros - 1/1');
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
  const toggleDownArticulos = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);

    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo Articulos - 1/1');
      const resGetArticulos = await syncQueries._getArticulos();

      setDisabledCancel(true);

      // await pedidosService.deleteTablaPedidos();

      setDialogContent('Descargando articulos - 1/1');
      await articulosService.fillArticulos(resGetArticulos);

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
  const toggleDownCartera = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);

    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo cartera - 1/1');
      const resGetCartera = await syncQueries._getCartera();

      setDisabledCancel(true);

      // await pedidosService.deleteTablaPedidos();

      setDialogContent('Descargando cartera - 1/1');
      await carteraService.fillCartera(resGetCartera);

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
  const toggleDownAlmacenes = async () => {
    setShowProgressWindow(true);

    const {direccionIp, puerto} = objConfig;

    const syncQueries = new SyncQueries(direccionIp, puerto);

    setSyncQueriesScope(syncQueries);

    try {
      setDialogContent('Trayendo almacenes - 1/1');
      const resGetAlmacenes = await syncQueries._getAlmacenes();

      setDisabledCancel(true);

      // await pedidosService.deleteTablaPedidos();

      setDialogContent('Descargando almacenes - 1/1');
      await almacenesService.fillAlmacenes(resGetAlmacenes);

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

  const toggleDownEncuesta = async () => {
    setShowProgressWindow(true);
    const {direccionIp, puerto} = objConfig;
    const syncQueries = new SyncQueries(direccionIp, puerto);
    setSyncQueriesScope(syncQueries);
    try {
      setDialogContent('Trayendo encuesta - 1/1');
      const resGetEncuesta = await syncQueries._getEncuesta();
      setDisabledCancel(true);
      setDialogContent('Descargando encuesta - 1/1');
      await encuestaService.fillEncuesta(resGetEncuesta);
      setDisabledCancel(false);
      setShowProgressWindow(false);
      loadRecord();
      dispatch(showAlert('05'));
    } catch (error: any) {}
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
            toggleDownOperadores={toggleDownOperadores}
            toggleTerceros={toggleTerceros}
            toggleDownTerceros={toggleDownTerceros}
            toggleArticulos={toggleArticulos}
            toggleDownArticulos={toggleDownArticulos}
            toggleCartera={toggleCartera}
            toggleDownCartera={toggleDownCartera}
            toggleAlmacenes={toggleAlmacenes}
            toggleDownAlmacenes={toggleDownAlmacenes}
            toggleDownEncuesta={toggleDownEncuesta}
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

export {ActualizarDispositivo};
