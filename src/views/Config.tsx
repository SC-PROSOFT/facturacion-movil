import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Divider, List, Dialog, Button} from 'react-native-paper';

/* components */
import {
  SwitchButton,
  StandardInput,
  CoolButton,
  PrincipalHeader,
} from '../components';
/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {setObjConfig, setObjInfoAlert} from '../redux/slices';
/* local database services */
import {configService} from '../data_queries/local_database/services';
/* api services */
import {ConfigQueriesService} from '../data_queries/api/queries';
/* queries */
import {api_saveConfig} from '../data_queries/api/queries/config_queries';
/* utils */
import {showAlert} from '../utils/showAlert';
import {IConfig} from '../common/types';
/* local types */
interface GeneralConfigProps {
  handleInputchange: (input: string, value: string | boolean) => void;
}
interface ServerConfigProps {
  handleInputchange: (input: string, text: string) => void;
}
interface CompanyConfigProps {
  handleInputchange: (input: string, text: string) => void;
}
interface ModalLoadConfigProps {
  showModalLoadConfig: boolean;
  toggleShowModalLoadConfig: (visible: boolean) => void;
  saveInLocalDb: (configData: IConfig) => Promise<void>;
}

const GeneralConfig: React.FC<GeneralConfigProps> = ({handleInputchange}) => {
  const objConfig = useAppSelector(store => store.config.objConfig);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 10,
    },
    switchRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputContainer: {
      paddingHorizontal: 20,
    },
    buttonRow: {
      paddingVertical: 5,
    },
    switchTitle: {
      color: 'black',
      fontSize: 18,
    },
    divider: {
      marginTop: 15,
      marginBottom: 15,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.switchRow, {marginTop: 5}]}>
        <SwitchButton
          switchMode={objConfig.facturarSinExistencias}
          switchName="facturarSinExistencias"
          description="Facturar sin existencias"
          onToggleSwitch={handleInputchange}
        />
      </View>
      <Divider style={styles.divider} />

      <View style={styles.switchRow}>
        <SwitchButton
          switchMode={objConfig.seleccionarAlmacen}
          switchName="seleccionarAlmacen"
          description="Habilitar seleccionar almacén"
          onToggleSwitch={handleInputchange}
        />
      </View>
      <Divider style={styles.divider} />

      <View style={styles.switchRow}>
        <SwitchButton
          switchMode={objConfig.localizacionGps}
          switchName="localizacionGps"
          description="Localización (GPS) obligatoria"
          onToggleSwitch={handleInputchange}
        />
      </View>
      <Divider style={styles.divider} />

      <View style={styles.switchRow}>
        <SwitchButton
          switchMode={objConfig.filtrarTercerosPorVendedor}
          switchName="filtrarTercerosPorVendedor"
          description="Filtrar terceros por vendedor"
          onToggleSwitch={handleInputchange}
        />
      </View>
      <Divider style={styles.divider} />

      <View style={styles.switchRow}>
        <SwitchButton
          switchMode={objConfig.modificarPrecio}
          switchName="modificarPrecio"
          description="Modificar precio"
          onToggleSwitch={handleInputchange}
        />
      </View>
      <Divider style={styles.divider} />

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.direccionIp}
          label="Direccion ip"
          name="direccionIp"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.puerto}
          label="Puerto"
          name="puerto"
          mode="flat"
          keyboardType="number-pad"
          onChange={handleInputchange}
        />
      </View>
    </View>
  );
};
const ServerConfig: React.FC<ServerConfigProps> = ({handleInputchange}) => {
  const objConfig = useAppSelector(store => store.config.objConfig);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      paddingTop: 10,
      paddingBottom: 10,
    },
    inputContainer: {
      paddingHorizontal: 20,
    },
    buttonContainer: {
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.descargasIp}
          label="Ip descargas"
          name="descargasIp"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.datosIp}
          label="Ip datos"
          name="datosIp"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.directorioContabilidad}
          label="Directorio de contabilidad"
          name="directorioContabilidad"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>
    </View>
  );
};
const CompanyConfig: React.FC<CompanyConfigProps> = ({handleInputchange}) => {
  const objConfig = useAppSelector(store => store.config.objConfig);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      paddingTop: 10,
      paddingBottom: 10,
    },
    inputContainer: {
      paddingHorizontal: 20,
    },
    buttonContainer: {
      paddingHorizontal: 10,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.empresa}
          label="Empresa"
          name="empresa"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.nit}
          label="Nit"
          name="nit"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.direccion}
          label="Dirección"
          name="direccion"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.ciudad}
          label="Ciudad"
          name="ciudad"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.tarifaIva1}
          label="Tarifa iva 1"
          name="tarifaIva1"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.tarifaIva2}
          label="Tarifa iva 2"
          name="tarifaIva2"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>

      <View style={styles.inputContainer}>
        <StandardInput
          value={objConfig.tarifaIva3}
          label="Tarifa iva 3"
          name="tarifaIva3"
          mode="flat"
          keyboardType="default"
          onChange={handleInputchange}
        />
      </View>
    </View>
  );
};
const ModalLoadConfig: React.FC<ModalLoadConfigProps> = ({
  showModalLoadConfig,
  toggleShowModalLoadConfig,
  saveInLocalDb,
}) => {
  const dispatch = useAppDispatch();

  const [inputs, setInputs] = useState({
    ip: '',
    puerto: '',
  });
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const handleInputChange = (input: string, text: string) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };

  const loadConfig = async (ip: string, puerto: string) => {
    setIsLoadingSave(true);
    const configQueriesService = new ConfigQueriesService(ip, puerto);

    try {
      const serverConfig = await configQueriesService._getConfig();

      dispatch(
        setObjConfig({
          direccionIp: serverConfig.direccionIp,
          puerto: serverConfig.puerto,
          facturarSinExistencias: serverConfig.facturarSinExistencias,
          seleccionarAlmacen: serverConfig.seleccionarAlmacen,
          localizacionGps: serverConfig.localizacionGps,
          filtrarTercerosPorVendedor: serverConfig.filtrarTercerosPorVendedor,
          modificarPrecio: serverConfig.modificarPrecio,

          descargasIp: serverConfig.descargasIp,
          datosIp: serverConfig.datosIp,
          directorioContabilidad: serverConfig.directorioContabilidad,

          empresa: serverConfig.empresa,
          nit: serverConfig.nit,
          direccion: serverConfig.direccion,
          ciudad: serverConfig.ciudad,
          tarifaIva1: serverConfig.tarifaIva1,
          tarifaIva2: serverConfig.tarifaIva2,
          tarifaIva3: serverConfig.tarifaIva3,
        }),
      );
      await saveInLocalDb(serverConfig);
      toggleShowModalLoadConfig(false);
      setIsLoadingSave(false);
    } catch (error) {
      setIsLoadingSave(false);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Error en los datos introducidos o la conexión',
        }),
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
    },
  });

  return (
    <Dialog visible={showModalLoadConfig} style={styles.container}>
      <Dialog.Title>Cargar configuración</Dialog.Title>

      <Dialog.Content>
        <View>
          <StandardInput
            value={inputs.ip}
            label="direccion ip"
            name="ip"
            mode="flat"
            keyboardType="number-pad"
            onChange={handleInputChange}
          />
        </View>

        <View>
          <StandardInput
            value={inputs.puerto}
            label="Puerto"
            name="puerto"
            mode="flat"
            keyboardType="number-pad"
            onChange={handleInputChange}
          />
        </View>
      </Dialog.Content>

      <Dialog.Actions>
        <Button
          onPress={() => loadConfig(inputs.ip, inputs.puerto)}
          loading={isLoadingSave}>
          <Text allowFontScaling={false}>{isLoadingSave ? '' : 'Aceptar'}</Text>
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
const Config: React.FC = () => {
  const dispatch = useAppDispatch();

  const objConfig = useAppSelector(store => store.config.objConfig);

  const [showModalLoadConfig, setShowModalLoadConfig] =
    useState<boolean>(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    loadInitialConfigFromLocalDB();
  }, []);

  const handleInputChange = (input: string, value: string | boolean) => {
    dispatch(
      setObjConfig({
        ...objConfig,
        [input]: value,
      }),
    );
  };

  const cleanDirectorioContabilidad = (directorio: string): string => {
    if (directorio.endsWith(' ')) {
      return directorio.trimEnd();
    }
    return directorio;
  };
  const toggleSaveConfig = async () => {
    setIsLoadingSave(true);
    try {
      const configData = {
        dir_ip: objConfig.direccionIp,

        nombre: objConfig.empresa,
        nit: objConfig.nit,
        direcc: objConfig.direccion,
        iva1: objConfig.tarifaIva1,
        iva2: objConfig.tarifaIva2,
        iva3: objConfig.tarifaIva3,

        directorio: objConfig.directorioContabilidad,
        ip_datos: objConfig.datosIp,
      };

      const resApi_saveConfig: any = await api_saveConfig(
        configData,
        objConfig.direccionIp,
        objConfig.puerto,
      );

      if (resApi_saveConfig?.data.MENSAJE == 'Grabado correctamente') {
        saveInLocalDb();
        setIsLoadingSave(false);
      } else {
        setIsLoadingSave(false);
        dispatch(showAlert('NN'));
      }
    } catch (error) {
      setIsLoadingSave(false);
      dispatch(showAlert('02'));
    }
  };
  const saveInLocalDb = async (configData?: IConfig) => {
    try {
      const config = configData || objConfig;
      const response = await configService.saveConfig({
        facturarSinExistencias: config.facturarSinExistencias,
        seleccionarAlmacen: config.seleccionarAlmacen,
        localizacionGps: config.localizacionGps,
        filtrarTercerosPorVendedor: config.filtrarTercerosPorVendedor,
        modificarPrecio: config.modificarPrecio,
        direccionIp: config.direccionIp,
        puerto: config.puerto,

        descargasIp: config.descargasIp,
        datosIp: config.datosIp,
        directorioContabilidad: cleanDirectorioContabilidad(
          config.directorioContabilidad,
        ),

        empresa: config.empresa,
        nit: config.nit,
        direccion: config.direccion,
        ciudad: config.ciudad,
        tarifaIva1: config.tarifaIva1,
        tarifaIva2: config.tarifaIva2,
        tarifaIva3: config.tarifaIva3,
      });
      console.log(response);
      dispatch(showAlert('03'));
    } catch (error) {
      dispatch(showAlert('04'));
    }
  };
  const loadInitialConfigFromLocalDB = async () => {
    try {
      const config = await configService.getConfig();
      dispatch(
        setObjConfig({
          direccionIp: config.direccionIp,
          puerto: config.puerto,
          facturarSinExistencias: config.facturarSinExistencias,
          seleccionarAlmacen: config.seleccionarAlmacen,
          localizacionGps: config.localizacionGps,
          filtrarTercerosPorVendedor: config.filtrarTercerosPorVendedor,
          modificarPrecio: config.modificarPrecio,

          descargasIp: config.descargasIp,
          datosIp: config.datosIp,
          directorioContabilidad: config.directorioContabilidad,

          empresa: config.empresa,
          nit: config.nit,
          direccion: config.direccion,
          ciudad: config.ciudad,
          tarifaIva1: config.tarifaIva1,
          tarifaIva2: config.tarifaIva2,
          tarifaIva3: config.tarifaIva3,
        }),
      );
    } catch (error: any) {
      if (error.message == 'no se ha guardado ninguna config') {
        setShowModalLoadConfig(true);
      } else {
        dispatch(showAlert('01'));
      }
    }
  };
  const toggleShowModalLoadConfig = (visible: boolean) => {
    setShowModalLoadConfig(visible);
  };
  const styles = StyleSheet.create({
    container: {
      height: '100%',
    },
    configContainer: {},
    title: {
      color: '#7B7B7B',
      fontWeight: 'bold',
      fontSize: 22,
    },
    tabButtonsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    coolButtonContainer: {
      paddingHorizontal: 20,
      paddingTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      <View>
        <PrincipalHeader />
      </View>
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.configContainer}>
          <List.AccordionGroup>
            <List.Accordion title="Configuración general" id="1">
              <GeneralConfig handleInputchange={handleInputChange} />
            </List.Accordion>

            <List.Accordion title="Configuración del servidor" id="2">
              <ServerConfig handleInputchange={handleInputChange} />
            </List.Accordion>

            <List.Accordion title="Configuración de la empresa" id="3">
              <CompanyConfig handleInputchange={handleInputChange} />
            </List.Accordion>
          </List.AccordionGroup>

          <View style={styles.coolButtonContainer}>
            <CoolButton
              value={isLoadingSave ? '' : 'Guardar cambios'}
              iconName="content-save"
              colorButton="#365AC3"
              colorText="#fff"
              iconSize={20}
              pressCoolButton={toggleSaveConfig}
              loading={isLoadingSave}
            />
          </View>
        </View>
      </ScrollView>

      <ModalLoadConfig
        showModalLoadConfig={showModalLoadConfig}
        toggleShowModalLoadConfig={toggleShowModalLoadConfig}
        saveInLocalDb={saveInLocalDb}
      />
    </View>
  );
};

export {Config};
