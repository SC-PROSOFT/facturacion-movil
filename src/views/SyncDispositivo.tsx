import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Divider,
  Dialog,
  Button,
  Text,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {showAlert} from '../utils/showAlert';
import {
  setObjInfoAlert,
  setIsSignedIn,
  setStrTouchedButton,
  setIsShowTercerosFinder,
  setObjOperator,
} from '../redux/slices';
import {CoolButton, PrincipalHeader, TercerosFinder} from '../components';
import {SyncQueries} from '../data_queries/api/queries';
import {
  pedidosService,
  facturasService,
  tercerosService,
  encuestaService,
  filesService,
  operadoresService,
} from '../data_queries/local_database/services';
import {IOperadores, ITerceros} from '../common/types';
import {
  FacturasApiService,
  PedidosApiService,
  EncuestaApiServices,
  TercerosApiServices,
  FilesApiServices,
} from '../data_queries/api/queries';
import Toast from 'react-native-toast-message';
import {useFocusEffect} from '@react-navigation/native';
import {TercerosRepository} from '../data_queries/local_database/repositories';
import {getLastNroPedido, checkInternetConnection} from '../utils';

interface ProgressWindowProps {
  visible: boolean;
  dialogContent: string;
  cancelSyncQueries: () => void;
  disabledCancel: boolean;
}
interface Facturas {
  facturasActualizados: number;
  facturasPendientesDeActualizacion: number;
  facturasElaborados: number;
}

interface Pedidos {
  pedidosActualizados: number;
  pedidosPendientesDeActualizacion: number;
  pedidosElaborados: number;
}

interface Files {
  filesActualizados: number;
  filesPendientesDeActualizacion: number;
  filesElaborados: number;
}
interface RecordProps {
  records: {
    quantityTerceros: string;
    createdTerceros: number;
    editedTerceros: number;
    facturasActualizados: number;
    facturasPendientesDeActualizacion: number;
    facturasElaborados: number;
    pedidosActualizados: number;
    pedidosPendientesDeActualizacion: number;
    pedidosElaborados: number;
    filesActualizados: number;
    filesPendientesDeActualizacion: number;
    filesElaborados: number;
  };
  toggleTerceros: () => void;
}
interface UploadResultDetail {
  exitosos: number;
  fallidos: number;
  mensajesError?: string[];
}

interface UploadSummary {
  terceros?: UploadResultDetail;
  pedidos?: UploadResultDetail;
  facturas?: UploadResultDetail;
  archivos?: UploadResultDetail;
  encuestas?: UploadResultDetail;
}

interface Records {
  quantityTerceros: string;
  createdTerceros: number;
  editedTerceros: number;
  facturasActualizados: number;
  facturasPendientesDeActualizacion: number;
  facturasElaborados: number;
  pedidosActualizados: number;
  pedidosPendientesDeActualizacion: number;
  pedidosElaborados: number;
  filesActualizados: number;
  filesPendientesDeActualizacion: number;
  filesElaborados: number;
}

const ProgressWindow = ({
  visible,
  dialogContent,
  cancelSyncQueries,
  disabledCancel,
}: ProgressWindowProps) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#0B2863',
      width: '100%',
    },
    dialogContent: {
      paddingVertical: 10,
      display: 'flex',
      flexDirection: 'row',
    },
    dialogTitle: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#fff',
      width: 'auto',
    },
  });

  return (
    <Dialog visible={visible} dismissable={false} style={{marginTop: -10}}>
      <View style={styles.container}>
        <Dialog.Title style={styles.dialogTitle}>
          <Icon name="sync" size={20} color="#fff" />
          Sincronizando
        </Dialog.Title>
      </View>
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
interface ResultsModalProps {
  visible: boolean;
  summary: UploadSummary | null;
  onClose: () => void;
}

const UploadResultsModal = ({visible, summary, onClose}: ResultsModalProps) => {
  if (!summary) return null;
  const styles = StyleSheet.create({
    titleContainer: {
      backgroundColor: '#0B2863',
      width: '100%',
      marginBottom: 16,
    },
    dialogTitle: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#fff',
      width: 'auto',
    },
  });
  const renderSection = (title: string, data?: UploadResultDetail) => {
    if (!data) return null;

    return (
      <View style={{marginBottom: 16}}>
        <Text variant="titleMedium" style={{marginBottom: 6, color: '#333'}}>
          {title}
        </Text>
        <View style={{paddingLeft: 10}}>
          {data.exitosos + data.fallidos > 0 ? (
            <View>
              <Text style={{fontSize: 14, color: 'green', marginBottom: 2}}>
                ✅ Exitosos: {data.exitosos}
              </Text>
              <Text style={{fontSize: 14, color: 'red', marginBottom: 6}}>
                ❌ Fallidos: {data.fallidos}
              </Text>
            </View>
          ) : (
            <Text style={{fontSize: 14, color: '#666', marginBottom: 6}}>
              ⬜ No existen datos para sincronizar.
            </Text>
          )}
        </View>
        {data.fallidos > 0 &&
          Array.isArray(data.mensajesError) &&
          data.mensajesError.length > 0 && (
            <View style={{paddingLeft: 20}}>
              <Text style={{fontWeight: '600', marginBottom: 4}}>
                Detalles de errores:
              </Text>
              {data.mensajesError.map((msg, index) => (
                <Text
                  key={index}
                  style={{fontSize: 12, color: '#666', marginBottom: 2}}>
                  • {msg}
                </Text>
              ))}
            </View>
          )}
        <Divider style={{marginTop: 12}} />
      </View>
    );
  };

  return (
    <Dialog visible={visible} onDismiss={onClose} style={{borderRadius: 16}}>
      <View style={styles.titleContainer}>
        <Dialog.Title style={styles.dialogTitle}>
          <Icon name="sync" size={24} color="#fff" />
          Resultados de la Sincronización
        </Dialog.Title>
      </View>
      <Dialog.Content>
        <ScrollView
          style={{maxHeight: 400}}
          showsVerticalScrollIndicator={false}>
          {renderSection('🧑‍💼 Terceros', summary.terceros)}
          {renderSection('🧾 Pedidos', summary.pedidos)}
          {/* {renderSection('📄 Facturas', summary.facturas)} */}
          {renderSection('📂 Archivos', summary.archivos)}
          {renderSection('📋 Encuestas', summary.encuestas)}
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          mode="contained"
          onPress={onClose}
          style={{borderRadius: 8, backgroundColor: '#0B2863'}}>
          Cerrar
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
const Record = ({records, toggleTerceros}: RecordProps) => {
  const {
    quantityTerceros,
    createdTerceros,
    editedTerceros,
    facturasActualizados,
    facturasPendientesDeActualizacion,
    facturasElaborados,
    pedidosElaborados,
    pedidosPendientesDeActualizacion,
    pedidosActualizados,
    filesActualizados,
    filesPendientesDeActualizacion,
    filesElaborados,
  } = records;

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
      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Terceros
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Badge
              size={20}
              style={{
                backgroundColor: '#0B2863',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4,
              }}>
              {quantityTerceros}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              Terceros totales
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
            <Badge
              size={20}
              style={{
                backgroundColor: 'green',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4,
              }}>
              {createdTerceros}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {createdTerceros == 1 ? 'Creado ' : 'Creados '},
            </Text>
            <Badge
              size={20}
              style={{
                backgroundColor: 'green',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4,
                marginLeft: 8, // Espaciado entre el Badge y el texto
              }}>
              {editedTerceros}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {editedTerceros == 1 ? 'Editado' : 'Editados'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Divider style={styles.divider} />

      <TouchableOpacity style={styles.itemContainer}>
        <View
          style={[
            styles.itemLeft,
            {flexDirection: 'column', alignItems: 'flex-start'},
          ]}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Pedidos
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Badge
              size={20}
              style={{
                backgroundColor: '#0B2863',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4, // Espaciado entre el Badge y el texto
              }}>
              {pedidosElaborados}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              Pedidos totales
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
            <Badge
              size={20}
              style={{
                backgroundColor: 'orange',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4, // Espaciado entre el Badge y el texto
              }}>
              {pedidosPendientesDeActualizacion}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {pedidosPendientesDeActualizacion == 1
                ? 'Pendiente '
                : 'Pendientes '}
              ,
            </Text>
            <Badge
              size={20}
              style={{
                backgroundColor: 'green',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4,
                marginLeft: 8, // Espaciado entre el Badge y el texto
              }}>
              {pedidosActualizados}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {pedidosActualizados == 1 ? 'Actualizado' : 'Actualizados'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Divider style={styles.divider} />
      <TouchableOpacity style={styles.itemContainer}>
        <View
          style={[
            styles.itemLeft,
            {flexDirection: 'column', alignItems: 'flex-start'},
          ]}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Archivos
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Badge
              size={20}
              style={{
                backgroundColor: '#0B2863',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4, // Espaciado entre el Badge y el texto
              }}>
              {filesElaborados}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              Archivos totales
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
            <Badge
              size={20}
              style={{
                backgroundColor: 'orange',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4, // Espaciado entre el Badge y el texto
              }}>
              {filesPendientesDeActualizacion}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {filesPendientesDeActualizacion == 1
                ? 'Pendiente '
                : 'Pendientes '}
              ,
            </Text>
            <Badge
              size={20}
              style={{
                backgroundColor: 'green',
                fontWeight: 'bold',
                fontSize: 14,
                marginRight: 4,
                marginLeft: 8, // Espaciado entre el Badge y el texto
              }}>
              {filesActualizados}
            </Badge>
            <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
              {filesActualizados == 1 ? 'Actualizado' : 'Actualizados'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SyncDispositivo = () => {
  const dispatch = useAppDispatch();
  const objConfig = useAppSelector(store => store.config.objConfig);
  const objOperador = useAppSelector(store => store.operator.objOperator);
  const tercerosCreados = useAppSelector(
    store => store.tercerosFinder.tercerosCreados,
  );
  const tercerosEditados = useAppSelector(
    store => store.tercerosFinder.tercerosEditados,
  );

  const [factura, setFacturas] = useState<Facturas>({
    facturasActualizados: 0,
    facturasPendientesDeActualizacion: 0,
    facturasElaborados: 0,
  });

  const [pedido, setPedidos] = useState<Pedidos>({
    pedidosActualizados: 0,
    pedidosPendientesDeActualizacion: 0,
    pedidosElaborados: 0,
  });

  const [file, setFiles] = useState<Files>({
    filesActualizados: 0,
    filesPendientesDeActualizacion: 0,
    filesElaborados: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );
  const [syncQueriesScope, setSyncQueriesScope] = useState<any>();
  const [showProgressWindow, setShowProgressWindow] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState('');
  const [disabledCancel, setDisabledCancel] = useState<boolean>(false);
  const [isConnectToInternet, setIsConnectToInternet] = useState<boolean>(true);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(
    null,
  );
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [records, setRecords] = useState<Records>({
    quantityTerceros: '0',
    createdTerceros: 0,
    editedTerceros: 0,
    facturasActualizados: 0,
    facturasPendientesDeActualizacion: 0,
    facturasElaborados: 0,
    pedidosActualizados: 0,
    pedidosPendientesDeActualizacion: 0,
    pedidosElaborados: 0,
    filesActualizados: 0,
    filesPendientesDeActualizacion: 0,
    filesElaborados: 0,
  });

  useFocusEffect(
    useCallback(() => {
      checkConnection();
      loadRecord();
      loadFacturasValues();
      loadPedidosValues();
      loadFiles();
    }, []),
  );

  const checkConnection = async () => {
    const isConnected = await checkInternetConnection();
    console.log(isConnected); // Esperar el resultado booleano
    setIsConnectToInternet(isConnected); // Actualizar el estado con el resultado real
  };
  const loadFacturasValues: () => void = async () => {
    try {
      const facturas = await facturasService.getAllFacturas();

      const facturasValues = {
        facturasActualizados: 0,
        facturasPendientesDeActualizacion: 0,
        facturasElaborados: 0,
      };

      for (let factura of facturas) {
        factura.sincronizado == 'S'
          ? (facturasValues.facturasActualizados += 1)
          : (facturasValues.facturasPendientesDeActualizacion += 1);

        facturasValues.facturasElaborados++;
      }

      setFacturas(facturasValues);

      setRecords(prevRecords => ({
        ...prevRecords,
        facturasActualizados: facturasValues.facturasActualizados,
        facturasPendientesDeActualizacion:
          facturasValues.facturasPendientesDeActualizacion,
        facturasElaborados: facturasValues.facturasElaborados,
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Fallo cargar valores de facturas ❌',
      });
    }
  };

  const loadFiles = async () => {
    try {
      const files = await filesService.getAllFiles();
      const filesValues = {
        filesActualizados: 0,
        filesPendientesDeActualizacion: 0,
        filesElaborados: 0,
      };
      for (let file of files) {
        file.sincronizado == 'S'
          ? (filesValues.filesActualizados += 1)
          : (filesValues.filesPendientesDeActualizacion += 1);

        filesValues.filesElaborados++;
      }
      setFiles(filesValues);
      setRecords(prevRecords => ({
        ...prevRecords,
        filesActualizados: filesValues.filesActualizados,
        filesPendientesDeActualizacion:
          filesValues.filesPendientesDeActualizacion,
        filesElaborados: filesValues.filesElaborados,
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Fallo cargar valores de archivos ❌',
      });
    }
  };

  const updateFacturas: () => void = async () => {
    setLoading(true);
    const facturasApiService = new FacturasApiService(
      objConfig.descargasIp,
      objConfig.puerto,
    );

    const facturas = await facturasService.getAllFacturas();

    for (let index = 0; index < facturas.length; index++) {
      const factura = facturas[index];

      try {
        await facturasApiService._saveFactura(
          factura,
          factura.guardadoEnServer == 'S' ? 'put' : 'post',
        );

        await facturasService.updateFactura(
          factura.operador.nro_factura.toString(),
          {
            ...factura,
            sincronizado: 'S',
          },
        );

        if (index === facturas.length - 1) {
          Toast.show({
            type: 'success',
            text1: 'Facturas actualizadas correctamente',
          });
        }

        loadFacturasValues();
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: error.message || 'Error al actualizar facturas ❌',
        });
      }
    }
  };

  const loadPedidosValues = async () => {
    try {
      const pedidos = await pedidosService.getAllPedidos();

      const pedidosValues = {
        pedidosActualizados: 0,
        pedidosPendientesDeActualizacion: 0,
        pedidosElaborados: 0,
      };

      for (let pedido of pedidos) {
        pedido.sincronizado == 'S'
          ? (pedidosValues.pedidosActualizados += 1)
          : (pedidosValues.pedidosPendientesDeActualizacion += 1);

        pedidosValues.pedidosElaborados++;
      }

      console.log('pedidosValues', pedidosValues);

      // Actualizar el estado de pedidos
      setPedidos(pedidosValues);

      // Actualizar el estado de records
      setRecords(prevRecords => ({
        ...prevRecords,
        pedidosActualizados: pedidosValues.pedidosActualizados,
        pedidosPendientesDeActualizacion:
          pedidosValues.pedidosPendientesDeActualizacion,
        pedidosElaborados: pedidosValues.pedidosElaborados,
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Fallo cargar valores de pedidos ❌',
      });
    }
  };

  // Ejecutar la carga de pedidos al cargar la vista
  useEffect(() => {
    // Cargar los valores de pedidos al cargar la vista
    checkConnection();
    loadFiles();
    loadPedidosValues();
  }, []);
  const updatePedidos = async (): Promise<UploadResultDetail> => {
    setLoading(true);
    let subidos = 0;
    let fallidos = 0;
    let mensajesError: string[] = [];
    try {
      const pedidosApiService = new PedidosApiService(
        objConfig.descargasIp,
        objConfig.puerto,
      );
      const numeroPedido = await getLastNroPedido(
        objOperador,
        objConfig,
        dispatch,
      );
      let nroPedido = Number(numeroPedido || objOperador.nro_pedido);
      const pedidos = await pedidosService.getAllPedidos();
      console.log(pedidos);
      const pedidosPendientesDeActualizacion = pedidos
        .filter(pedido => pedido.sincronizado == 'N' || !pedido.sincronizado)
        .reverse();

      for (
        let index = 0;
        index < pedidosPendientesDeActualizacion.length;
        index++
      ) {
        const pedido = pedidosPendientesDeActualizacion[index];
        try {
          const putOrpost = pedido.guardadoEnServer == 'S' ? 'put' : 'post';
          const response = await pedidosApiService._savePedido(
            pedido,
            pedido.guardadoEnServer == 'S' ? 'put' : 'post',
          );
          if (response && putOrpost == 'post') {
            const updateOperador: IOperadores = {
              ...objOperador,
              nro_pedido: nroPedido + 1,
            };
            await pedidosService.updatePedido(pedido.id.toString(), {
              ...pedido,
              sincronizado: 'S',
              guardadoEnServer: 'S',
              operador: {
                ...objOperador,
                nro_pedido: nroPedido,
              },
            });
            console.log('[UPDATE OPERADOR SYNC]', updateOperador);
            await operadoresService.updateOperador(
              pedido.operador.id,
              updateOperador,
            );
            dispatch(
              setObjOperator({
                ...objOperador,
                nro_pedido: nroPedido,
              }),
            );
            nroPedido++;
          } else if (response) {
            await pedidosService.updatePedido(pedido.id.toString(), {
              ...pedido,
              sincronizado: 'S',
              guardadoEnServer: 'S',
            });
            dispatch(
              setObjOperator({
                ...objOperador,
              }),
            );
          }
          subidos++;
          loadPedidosValues();
          setLoading(false);
        } catch (error: any) {
          fallidos++;
          const errorMessage =
            error.message ||
            `Error al actualizar el pedido ${pedido.operador.nro_pedido}`;
          mensajesError.push(errorMessage);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      return {
        exitosos: subidos,
        fallidos: fallidos,
        mensajesError: mensajesError,
      };
    }
  };

  const updateTerceros = async (): Promise<UploadResultDetail> => {
    setLoading(true);

    const tercerosApiService = new TercerosApiServices(
      objConfig.direccionIp,
      objConfig.puerto,
    );
    TercerosApiServices.setObjConfig(objConfig);

    const tercerosRepository = new TercerosRepository();

    try {
      setDialogContent('Subiendo terceros');

      // Obtener terceros creados y editados
      const createdTerceros = await tercerosService.getCreated();
      const editedTerceros = await tercerosService.getModified();

      // Subir terceros creados
      const createdResults = await Promise.allSettled(
        createdTerceros.map(async tercero => {
          const response = await tercerosApiService._saveTercero(tercero);
          if (response) {
            // Eliminar el tercero de la tabla de creados si se subió correctamente
            await tercerosService.deleteTerceroFromCreated(tercero.codigo);
          }
          return response;
        }),
      );

      // Subir terceros editados
      const editedResults = await Promise.allSettled(
        editedTerceros.map(async tercero => {
          const response = await tercerosApiService._updateTercero(tercero);
          if (response) {
            // Eliminar el tercero de la tabla de editados si se subió correctamente
            await tercerosService.deleteTerceroFromEdited(tercero.codigo);
          }
          return response;
        }),
      );

      console.log('createdResults', createdResults);
      // Contar resultados exitosos y fallidos
      const successfulCreated = createdResults.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;

      const failedCreated = createdResults.filter(
        // Considera que `result.value === false` también es un fallo de lógica de negocio
        result => result.status === 'rejected',
      ).length;
      const createdErrorMessages = createdResults
        .filter(result => result.status === 'rejected')
        .map(
          result =>
            (result as PromiseRejectedResult).reason?.message ||
            'Error desconocido',
        );

      const successfulEdited = editedResults.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;
      const failedEdited = editedResults.filter(
        result => result.status === 'rejected',
      ).length;
      const editedErrorMessages = editedResults
        .filter(result => result.status === 'rejected')
        .map(
          result =>
            (result as PromiseRejectedResult).reason?.message ||
            'Error desconocido',
        );

      // ... lógica para mostrar Toast (puedes mantenerla o moverla) ...

      if (failedCreated === 0 && failedEdited === 0) {
        // Si no hay fallos, eliminar las tablas de creados y editados
        await tercerosRepository.deleteAllTercerosCreated();
        await tercerosRepository.deleteAllTercerosEdited();
        console.log(
          'Tablas terceros_creados y terceros_editados eliminadas correctamente',
        );
      } else {
        console.warn(
          `${failedCreated} terceros creados y ${failedEdited} terceros editados fallaron al subir`,
        );
      }

      setLoading(false);
      return {
        exitosos: successfulCreated + successfulEdited,
        fallidos: failedCreated + failedEdited,
        mensajesError: [...createdErrorMessages, ...editedErrorMessages].filter(
          Boolean,
        ), // Filtra mensajes vacíos
      };
    } catch (error: any) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: error.message || 'Error al actualizar terceros ❌',
      });
      return {
        exitosos: 0,
        fallidos: 0,
        mensajesError: [error.message || 'Error desconocido'],
      };
    }
  };

  const updateEncuestas = async (): Promise<UploadResultDetail> => {
    setLoading(true);

    const encuestaApiService = new EncuestaApiServices(
      objConfig.direccionIp,
      objConfig.puerto,
    );
    EncuestaApiServices.setObjConfig(objConfig);
    try {
      // Obtener solo las encuestas con guardado = 'N'
      const encuestas = await encuestaService.getRespEncuestaByGuardado('N');
      console.log('encuestas', encuestas);

      const results = await Promise.allSettled(
        encuestas.map(async encuesta => {
          const response = await encuestaApiService._saveRespEncuesta(encuesta);

          await encuestaService.updateRespEncuestaByGuardado(
            encuesta.codigo,
            'S',
          );
          return response;
        }),
      );
      console.log('results', results);
      const successfulUpdates = results.filter(
        result => result.status === 'fulfilled',
      ).length;

      const failedUpdates = results.filter(
        result => result.status === 'rejected',
      );

      if (successfulUpdates > 0) {
        Toast.show({
          type: 'success',
          text1: `${successfulUpdates} encuestas actualizadas 🥳`,
        });
      }

      if (failedUpdates.length > 0) {
        failedUpdates.forEach(failure => {
          Toast.show({
            type: 'error',
            text1:
              failure.reason?.message ||
              'Error desconocido al actualizar encuesta ❌',
          });
        });
      }
      return {
        exitosos: successfulUpdates,
        fallidos: failedUpdates.length,
        mensajesError: failedUpdates.map(
          failure =>
            failure.reason?.message ||
            'Error desconocido al actualizar encuesta ❌',
        ),
      };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Error al actualizar encuestas ❌',
      });
      return {
        exitosos: 0,
        fallidos: 0,
        mensajesError: [
          error.message || 'Error desconocido al actualizar encuestas ❌',
        ],
      };
    } finally {
      setLoading(false);
    }
  };

  const updateFiles = async (): Promise<UploadResultDetail> => {
    setLoading(true);
    const filesApiService = new FilesApiServices(
      objConfig.direccionIp,
      objConfig.puerto,
    );
    try {
      setDialogContent('Subiendo archivos');
      const files = await filesService.getAllFiles();

      // Filtrar solo los archivos con sincronizado = 'N'
      const filesToSync = files.filter(
        file => file.sincronizado === 'N' || !file.sincronizado,
      );

      if (filesToSync.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No hay archivos pendientes de sincronización',
        });
        setLoading(false);
        return {
          exitosos: 0,
          fallidos: 0,
          mensajesError: ['No hay archivos pendientes de sincronización'],
        };
      }

      const results = await Promise.allSettled(
        filesToSync.map(async file => {
          const parsedFiles =
            typeof file.files === 'string'
              ? JSON.parse(file.files)
              : file.files;
          const safeParsedFiles = Array.isArray(parsedFiles) ? parsedFiles : [];

          if (safeParsedFiles.length === 0) {
            throw new Error(
              `El archivo con código ${file.codigo} no contiene datos válidos`,
            );
          }

          // Obtener el tercero relacionado con el archivo
          const tercero = await tercerosService.getByAttribute(
            'codigo',
            file.codigo,
          );

          if (!tercero) {
            throw new Error(
              `No se encontró el tercero con código ${file.codigo}`,
            );
          }

          // Subir cada archivo individualmente
          const uploadResults = await Promise.allSettled(
            safeParsedFiles.map(async singleFile => {
              const response = await filesApiService._uploadFiles(
                singleFile,
                tercero,
              );

              return response;
            }),
          );

          await filesService.updateSincronizado(tercero.codigo);
          // Verificar si todos los archivos individuales se subieron correctamente
          const successfulUploads = uploadResults.filter(
            result => result.status === 'fulfilled' && result.value === true,
          ).length;

          if (successfulUploads === safeParsedFiles.length) {
            // Cambiar sincronizado a 1 si todos los archivos se subieron correctamente
          }

          return true; // Indicar que todos los archivos de este grupo se subieron correctamente
        }),
      );

      const successfulUploads = results.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;

      const failedUploads = results.filter(
        result => result.status === 'rejected',
      );

      return {
        exitosos: successfulUploads,
        fallidos: failedUploads.length,
        mensajesError: failedUploads.map(
          failure =>
            failure.reason?.message || 'Error desconocido al subir archivos ❌',
        ),
      };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Error al subir archivos ❌',
      });
      console.error('Error al subir archivos:', error);
      return {
        exitosos: 0,
        fallidos: 0,
        mensajesError: [
          error.message || 'Error desconocido al subir archivos ❌',
        ],
      };
    } finally {
      loadFiles();
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const toggleUploadData = async () => {
    setShowProgressWindow(true);
    setDisabledCancel(true); // Deshabilita cancelar mientras se sube
    const summary: UploadSummary = {};
    // const syncQueries = new SyncQueries(direccionIp, puerto);
    // setSyncQueriesScope(syncQueries);
    // console.log("syncQueries", syncQueries);

    try {
      setDialogContent('Subiendo terceros');
      summary.terceros = await updateTerceros();
      // setDialogContent('Subiendo facturas');
      // await updateFacturas();
      setDialogContent('Subiendo pedidos');
      summary.pedidos = await updatePedidos();
      setDialogContent('Subiendo archivos');
      summary.archivos = await updateFiles();
      setDialogContent('Subiendo respuestas de encuestas');
      summary.encuestas = await updateEncuestas();
      setDisabledCancel(false);
      setShowProgressWindow(false);
      setUploadSummary(summary); // Guarda el resumen completo
      setShowSummaryModal(true); // Muestra la ventana de resumen
      loadRecord();
      // dispatch(showAlert('05'));
    } catch (error: any) {
      setShowProgressWindow(false);
      Toast.show({
        type: 'error',
        text1: error.message || 'Error al sincronizar datos ❌',
      });
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
    try {
      const createdTerceros = await tercerosService.getCreated();
      const editedTerceros = await tercerosService.getModified();
      const quantityTerceros = (
        createdTerceros.length + editedTerceros.length
      ).toString();

      // Actualizar el estado de records sin sobrescribir los valores de pedidos
      setRecords(prevRecords => ({
        ...prevRecords,
        quantityTerceros,
        createdTerceros: createdTerceros.length,
        editedTerceros: editedTerceros.length,
        // Mantener los valores actuales de pedidos y facturas
        pedidosActualizados: prevRecords.pedidosActualizados,
        pedidosPendientesDeActualizacion:
          prevRecords.pedidosPendientesDeActualizacion,
        pedidosElaborados: prevRecords.pedidosElaborados,
        facturasActualizados: prevRecords.facturasActualizados,
        facturasPendientesDeActualizacion:
          prevRecords.facturasPendientesDeActualizacion,
        facturasElaborados: prevRecords.facturasElaborados,
      }));
    } catch (error) {
      console.error('Error loading records from database', error);
    }
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
      maxHeight: screenHeight * 0.13,
      minHeight: screenHeight * 0.1,
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
          {/* <CoolButton
            value="Sincronizar datos"
            iconName="upload"
            colorButton="#365AC3"
            colorText="#fff"
            iconSize={20}
            pressCoolButton={() => toggleUploadData()}
            disabled={isConnectToInternet}
          /> */}
          <TouchableOpacity
            onPress={toggleUploadData}
            style={{
              width: 'auto', // Si quieres que el botón ocupe un ancho específico y centrar el contenido en ese espacio, cambia 'auto' por un valor numérico o '100%'
              backgroundColor: isConnectToInternet ? '#365AC3' : '#365AC37a',
              alignItems: 'center', // Centra los hijos (Icon y Text) verticalmente en el contenedor
              justifyContent: 'center', // Centra los hijos (Icon y Text) horizontalmente en el contenedor
              borderRadius: 8,
              padding: 8, // Añade un espaciado interno
              marginVertical: 'auto', // Nota: 'auto' para márgenes verticales no es el método estándar de centrado de componentes en React Native; usualmente se maneja desde el contenedor padre.
              flexDirection: 'row', // Organiza el Icon y Text en una fila
            }}>
            <Icon
              name="upload"
              color="#FFFF"
              size={20}
              style={{marginRight: 4}}
            />
            <Text
              style={{color: '#ffff', fontSize: 18, fontWeight: 'semibold'}}>
              Sincronizar datos
            </Text>
          </TouchableOpacity>
          {!isConnectToInternet && (
            <Text style={{color: 'red', fontSize: 10, textAlign: 'center'}}>
              Se necesita conexion a internet para sincronizar datos con el
              servidor 🛜🛜
            </Text>
          )}
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
      <UploadResultsModal
        visible={showSummaryModal}
        summary={uploadSummary}
        onClose={() => {
          setShowSummaryModal(false);
          setUploadSummary(null); // Limpia el resumen
        }}
      />
      <TercerosFinder searchTable="terceros_creados" />
    </View>
  );
};

export {SyncDispositivo};
