import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

/* components */
import {Visita, PrincipalHeader, Searcher, TercerosFinder} from '../components';
/* types */
import {ITerceros, IVisita} from '../common/types';
/* redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {
  setArrAlmacenes,
  setArrCartera,
  setObjConfig,
  setObjVisita,
  setObjTercero,
  setObjInfoAlert,
  setArrFactura,
  setArrPedido,
  setObjEncuesta,
  setArrVisita,
} from '../redux/slices';
/* local db services */
import {
  almacenesService,
  carteraService,
  configService,
  tercerosService,
  facturasService,
  pedidosService,
  encuestaService,
  visitaService,
} from '../data_queries/local_database/services';

/**
 * Obtiene la fecha local actual en formato "YYYY-MM-DD"
 */

const add: IVisita[] = [
  {
    client: 'Raul Arauco',
    adress: 'Carrera 24 # 55-64',
    status: '1',
    observation:
      'Se realiza pedido normal como esta establecido en los procesos de la empresa',
    saleValue: 350000,
    appointmentDate: '2025-03-27',
    location: {
      latitude: '',
      longitude: '',
    },
    zona: '',
    ruta: '',
    frecuencia: '',

    id_tercero: '0000001035',
  },
  {
    client: 'Diego Parrado',
    adress: 'Carrera 24 # 55-64',
    status: '2',
    observation: '',
    saleValue: 350000,
    appointmentDate: '2025-03-27',
    location: {
      latitude: '',
      longitude: '',
    },
    zona: '',
    ruta: '',
    frecuencia: '',
    id_tercero: '0000002276',
  },
  {
    client: 'Diego Parrado',
    adress: 'Carrera 24 # 55-64',
    status: '2',
    observation: '',
    saleValue: 350000,
    appointmentDate: '2025-03-28',
    location: {
      latitude: '',
      longitude: '',
    },
    zona: '',
    ruta: '',
    frecuencia: '',
    id_tercero: '0000000112',
  },
];

const getLocalDateString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Suma un día a una fecha recibida en formato "YYYY-MM-DD", interpretándola como fecha local.
 */
const addOneDay = (dateString: string): string => {
  const parts = dateString.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1; // meses 0-11
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  date.setDate(date.getDate() + 1);
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
};

const Visitas: React.FC = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string>('');
  const [visitas, setVisitas] = useState<IVisita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Se obtienen las fechas locales
  const currentDate = getLocalDateString(); // Ej: "2025-03-27"
  const tomorrow = addOneDay(currentDate); // Ej: "2025-03-28"

  useEffect(() => {
    // Cargamos todos los datos y luego quitamos el loader.
    Promise.all([
      bringAlmacenes(),
      bringCartera(),
      loadSettings(),
      loadEncuesta(),
      loadVisitas(),
    ])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const bringAlmacenes = async () => {
    const almacenes = await almacenesService.getAllAlmacenes();
    dispatch(setArrAlmacenes(almacenes));
  };

  const bringCartera = async () => {
    const cartera = await carteraService.getAllCartera();
    dispatch(setArrCartera(cartera));
  };

  const loadVisitas = async () => {
    try {
      console.log('Entro a loadVisitas');
      const visitasData = await visitaService.getAllVisitas();
      // Se asume que las visitas ya tienen appointmentDate en formato "YYYY-MM-DD"
      setVisitas([...visitasData, ...add]);
      dispatch(setArrVisita(visitasData));
    } catch (error) {
      console.log(error);
    }
  };

  const loadSettings = async () => {
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
    } catch (error) {
      // Manejo de error si es necesario
    }
  };

  const loadEncuesta = async () => {
    try {
      const encuesta = await encuestaService.getEncuesta();
      dispatch(setObjEncuesta(encuesta));
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'info',
          description: `No se encontraron encuestas registradas`,
        }),
      );
    }
  };

  const loadFacturas = async (tercero: ITerceros) => {
    try {
      const facturas = await facturasService.getByAttribute(
        'tercero_codigo',
        tercero.codigo,
      );
      dispatch(setArrFactura(facturas));
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'info',
          description: `No se encontraron facturas registradas a ${tercero.nombre}`,
        }),
      );
    }
  };

  const loadPedidos = async (tercero: ITerceros) => {
    try {
      const pedidos = await pedidosService.getByAttribute(
        'tercero_codigo',
        tercero.codigo,
      );
      dispatch(setArrPedido(pedidos));
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'info',
          description: `No se encontraron pedidos registrados a ${tercero.nombre}`,
        }),
      );
    }
  };

  const toggleVisita = async (visita: IVisita) => {
    try {
      const tercero = await tercerosService.getByAttribute(
        'codigo',
        visita.id_tercero,
      );
      loadFacturas(tercero);
      loadPedidos(tercero);
      dispatch(setObjVisita(visita));
      dispatch(setObjTercero(tercero));
      navigation.navigate('TabNavTercero');
    } catch (error: any) {
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: error.message,
        }),
      );
    }
  };

  const toggleTercero = async (tercero: ITerceros) => {
    console.log('tercero =>>>>', tercero);
    visitas.forEach(visita => {
      if (visita.id_tercero === tercero.codigo) {
        setSearch(visita.client);
      }
    });
  };

  // Función que agrupa y ordena las visitas en secciones
  const getSections = () => {
    const trimmedSearch = search.trim().toLowerCase();
    const filteredVisitas = visitas.filter(
      visita =>
        !trimmedSearch || visita.client.toLowerCase().includes(trimmedSearch),
    );

    // Filtrar visitas según appointmentDate
    const visitasHoy = filteredVisitas
      .filter(visita => visita.appointmentDate === currentDate)
      .sort((a, b) => a.id_tercero.localeCompare(b.id_tercero));
    const visitasManana = filteredVisitas
      .filter(visita => visita.appointmentDate === tomorrow)
      .sort((a, b) => a.id_tercero.localeCompare(b.id_tercero));

    const sections = [];
    if (visitasHoy.length > 0) {
      sections.push({title: 'Hoy', data: visitasHoy, disabled: false});
    }
    if (visitasManana.length > 0) {
      sections.push({title: 'Mañana', data: visitasManana, disabled: true});
    }
    return sections;
  };

  const renderSectionHeader = ({section}: {section: {title: string}}) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const renderItem = ({item, section}: {item: IVisita; section: any}) => (
    <Visita
      visita={item}
      disabled={section.disabled}
      toggleVisita={() => toggleVisita(item)}
    />
  );

  return (
    <View style={{flex: 1}}>
      <PrincipalHeader>
        <Searcher search={search} setSearch={setSearch} />
      </PrincipalHeader>
      <SafeAreaView style={{flex: 1}}>
        <SectionList
          sections={getSections()}
          keyExtractor={(item, index) => item.id_tercero + index.toString()}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListFooterComponent={<View style={{height: 100}} />}
          contentContainerStyle={{paddingHorizontal: 15, paddingVertical: 5}}
        />
      </SafeAreaView>
      <TercerosFinder toggleTercero={toggleTercero} searchTable="terceros" />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#092254" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: '#0B2863',
    fontSize: 24,
    marginBottom: 5,
    marginTop: 15,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export {Visitas};
