import React, {useEffect, useState, useCallback} from 'react';
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
  encuestaService,
  filesService,
} from '../data_queries/local_database/services';
import {ITerceros} from '../common/types';
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
  };
  toggleTerceros: () => void;
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
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {quantityTerceros} registros
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {createdTerceros} creados, {editedTerceros} editados
          </Text>
        </View>
      </TouchableOpacity>
      <Divider style={styles.divider} />

      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text allowFontScaling={false} style={styles.itemLeftSuperiorText}>
            Pedidos
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {pedidosElaborados} Pedidos
          </Text>
          <Text allowFontScaling={false} style={styles.itemLeftInferiorText}>
            {pedidosPendientesDeActualizacion} pendientes, {pedidosActualizados}{' '}
            actualizados
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SyncDispositivo = () => {
  useEffect(() => {
    loadPedidosValues();
  }, []);

  const dispatch = useAppDispatch();
  const objConfig = useAppSelector(store => store.config.objConfig);
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
  const [loading, setLoading] = useState<boolean>(false);

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
    facturasActualizados: 0,
    facturasPendientesDeActualizacion: 0,
    facturasElaborados: 0,
    pedidosActualizados: 0,
    pedidosPendientesDeActualizacion: 0,
    pedidosElaborados: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadRecord();
      loadFacturasValues();
    }, []),
  );

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
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Fallo cargar valores de facturas',
        }),
      );
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
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error.message,
          }),
        );
      }
    }
  };

  const loadPedidosValues: () => void = async () => {
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

      setPedidos(pedidosValues);
      setRecords(prevRecords => ({
        ...prevRecords,
        pedidosActualizados: pedidosValues.pedidosActualizados,
        pedidosPendientesDeActualizacion:
          pedidosValues.pedidosPendientesDeActualizacion,
        pedidosElaborados: pedidosValues.pedidosElaborados,
      }));
    } catch (error) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Fallo cargar valores de pedidos',
        }),
      );
    }
  };

  const updatePedidos: () => void = async () => {
    setLoading(true);
    const pedidosApiService = new PedidosApiService(
      objConfig.descargasIp,
      objConfig.puerto,
    );

    const pedidos = await pedidosService.getAllPedidos();

    for (let index = 0; index < pedidos.length; index++) {
      const pedido = pedidos[index];

      try {
        console.log('pedido save', pedido.guardadoEnServer);
        console.log(
          'Verificacion de pedido',
          pedido.guardadoEnServer == 'S' ? 'put' : 'post',
        );
        await pedidosApiService._savePedido(
          pedido,
          pedido.guardadoEnServer == 'S' ? 'put' : 'post',
        );

        if (index === pedidos.length - 1) {
          Toast.show({
            type: 'success',
            text1: 'pedidos actualizados correctamente',
          });
        }

        loadPedidosValues();
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'error',
            description: error.message,
          }),
        );
      }
    }
  };

  const updateTerceros: () => void = async () => {
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

      // Contar resultados exitosos y fallidos
      const successfulCreated = createdResults.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;

      const failedCreated = createdResults.filter(
        result => result.status === 'rejected',
      ).length;

      const successfulEdited = editedResults.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;

      const failedEdited = editedResults.filter(
        result => result.status === 'rejected',
      ).length;

      // Mostrar mensajes al usuario
      if (successfulCreated > 0 || successfulEdited > 0) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: `${successfulCreated} terceros creados y ${successfulEdited} terceros editados subidos correctamente`,
          }),
        );
      }

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
    } catch (error: any) {
      setLoading(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message || 'Error al subir terceros',
        }),
      );
    }
  };

  const updateEncuestas: () => void = async () => {
    setLoading(true);

    console.log(objConfig.direccionIp, objConfig.puerto);

    const encuestaApiService = new EncuestaApiServices(
      objConfig.direccionIp,
      objConfig.puerto,
    );

    EncuestaApiServices.setObjConfig(objConfig);

    console.log('updating encuestas');

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
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: `${successfulUpdates} encuestas actualizadas correctamente`,
          }),
        );
      }

      if (failedUpdates.length > 0) {
        failedUpdates.forEach(failure => {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description: failure.reason.message || 'Error desconocido',
            }),
          );
        });
      }
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message || 'Error al obtener encuestas',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFiles = async () => {
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
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'info',
            description: 'No hay archivos pendientes de sincronización',
          }),
        );
        setLoading(false);
        return;
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
          console.log('Entro aqui');
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

      if (successfulUploads > 0) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: `${successfulUploads} archivos subidos correctamente`,
          }),
        );
      }

      if (failedUploads.length > 0) {
        failedUploads.forEach(failure => {
          dispatch(
            setObjInfoAlert({
              visible: true,
              type: 'error',
              description:
                failure.reason?.message || 'Error desconocido al subir archivo',
            }),
          );
        });
      }
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message || 'Error al subir archivos',
        }),
      );
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const toggleUploadData = async () => {
    setShowProgressWindow(true);

    // const syncQueries = new SyncQueries(direccionIp, puerto);
    // setSyncQueriesScope(syncQueries);
    // console.log("syncQueries", syncQueries);

    try {
      setDialogContent('Subiendo terceros');
      await updateTerceros();
      // setDialogContent('Subiendo facturas');
      // await updateFacturas();
      setDialogContent('Subiendo pedidos');
      await updatePedidos();
      setDialogContent('Subiendo archivos');
      await updateFiles();
      setDialogContent('Subiendo respuestas de encuestas');
      await updateEncuestas();
      setDisabledCancel(false);
      setShowProgressWindow(false);
      loadRecord();
      // dispatch(showAlert('05'));
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
    try {
      const createdTerceros = await tercerosService.getCreated();
      const editedTerceros = await tercerosService.getModified();
      const quantityTerceros = (
        createdTerceros.length + editedTerceros.length
      ).toString();

      setRecords({
        quantityTerceros,
        createdTerceros: createdTerceros.length,
        editedTerceros: editedTerceros.length,
        facturasActualizados: factura.facturasActualizados,
        facturasPendientesDeActualizacion:
          factura.facturasPendientesDeActualizacion,
        facturasElaborados: factura.facturasElaborados,
        pedidosActualizados: pedido.pedidosActualizados,
        pedidosPendientesDeActualizacion:
          pedido.pedidosPendientesDeActualizacion,
        pedidosElaborados: pedido.pedidosElaborados,
      });
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

      <TercerosFinder searchTable="terceros_nuevos" />
    </View>
  );
};

export {SyncDispositivo};
