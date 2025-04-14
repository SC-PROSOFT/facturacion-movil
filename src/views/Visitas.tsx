import React, {useState, useEffect, memo} from 'react';
import {useFocusEffect} from '@react-navigation/native';
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
  const objOperador = useAppSelector(store => store.operator.objOperator);

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

  useFocusEffect(
    React.useCallback(() => {
      loadVisitas();
    }, []),
  );

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
      console.log(objOperador.cod_vendedor);
      const visitasData = await visitaService.getAllVisitas();
      const filteredVisitas = visitasData.filter(
        visita => visita.vendedor === objOperador.cod_vendedor,
      );
      setVisitas(filteredVisitas);
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
      sections.push({
        title: `Hoy (${currentDate})`,
        data: visitasHoy,
        disabled: false,
      });
    }
    if (visitasManana.length > 0) {
      sections.push({
        title: `Mañana (${tomorrow})`,
        data: visitasManana,
        disabled: true,
      });
    }
    return sections;
  };

  const renderSectionHeader = ({section}) => {
    const [mainTitle, date] = section.title.split('('); // Divide "Hoy (2023-03-27)"
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{mainTitle.trim()}</Text>
        <Text style={styles.sectionDate}>({date.trim()}</Text>
      </View>
    );
  };

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
          initialNumToRender={20} // Renderiza solo 10 elementos inicialmente
          windowSize={10}
          maxToRenderPerBatch={10}
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
  sectionHeader: {
    flexDirection: 'row', // Coloca los textos en línea
    alignItems: 'baseline', // Alinea correctamente los textos
    flexWrap: 'wrap', // Permite que el texto se ajuste si es necesario
    paddingHorizontal: 10, // Añade un margen lateral para evitar que el texto toque los bordes
  },
  sectionTitle: {
    color: '#0B2863',
    fontSize: 24,
    marginBottom: 5,
    marginTop: 15,
  },
  sectionDate: {
    fontSize: 14, // Tamaño más pequeño para la fecha
    color: '#666',
    marginLeft: 5, // Espaciado entre el título y la fecha
    flexShrink: 1, // Evita que el texto de la fecha se desborde
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
