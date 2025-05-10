import React, {useState, useEffect, memo, useMemo} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {
  View,
  StyleSheet,
  SectionList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {recalculateVisitsIfNeeded} from '../utils';
import Geolocation from '@react-native-community/geolocation';
/* components */
import {
  Visita,
  PrincipalHeader,
  Searcher,
  TercerosFinder,
  Loader,
} from '../components';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [dataReady, setDataReady] = useState<boolean>(false);
  const objOperador = useAppSelector(store => store.operator.objOperator);
  const [loadRecalcVisitas, setLoadRecalcVisitas] = useState<string>('');

  const currentDate = getLocalDateString();
  const tomorrow = addOneDay(currentDate);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await recalculateVisitas();
        await Promise.all([
          bringAlmacenes(),
          bringCartera(),
          loadSettings(),
          loadEncuesta(),
          loadVisitas(),
        ]);
        setLoading(false);
        setDataReady(true);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadVisitas();
    }, []),
  );
  const getUserLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });
      return location;
    } catch (error) {
      console.warn(error);
      return null;
    }
  };
  const recalculateVisitas = async () => {
    try {
      setLoadRecalcVisitas('Cargando visitas...');
      const result = await recalculateVisitsIfNeeded();
      if (result) {
        await visitaService.fillVisitas(result);
      }
      setLoadRecalcVisitas('');
    } catch (error) {
      setLoadRecalcVisitas('');
      console.error('Error al recálcular visitas:', error);
    }
  };

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
    } catch (error) {}
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

  const sections = useMemo(() => getSections(), [visitas, search]);

  type FlashListItem =
    | {type: 'header'; title: string; disabled: boolean}
    | (IVisita & {type: 'item'; disabled: boolean});

  const transformedData: FlashListItem[] = sections.flatMap(section => [
    {type: 'header', title: section.title, disabled: section.disabled},
    ...section.data.map(item => ({
      ...item,
      type: 'item',
      disabled: section.disabled,
    })),
  ]);

  const renderItem = ({item}: {item: FlashListItem}) => {
    if (item.type === 'header') {
      const [mainTitle, date] = item.title.split('(');
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{mainTitle.trim()}</Text>
          <Text style={styles.sectionDate}>({date.trim()}</Text>
        </View>
      );
    }

    return (
      <Visita
        visita={item}
        disabled={item.disabled}
        toggleVisita={() => toggleVisita(item)}
      />
    );
  };
  return (
    <View style={{flex: 1}}>
      <PrincipalHeader>
        <Searcher search={search} setSearch={setSearch} />
      </PrincipalHeader>
      <SafeAreaView style={{flex: 1}}>
        <FlashList
          data={transformedData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'header'
              ? `header-${index}`
              : `${item.id_visita}-${index}`
          }
          estimatedItemSize={100}
          ListFooterComponent={<View style={{height: 100}} />}
          contentContainerStyle={{paddingHorizontal: 15, paddingVertical: 5}}
        />
      </SafeAreaView>
      <TercerosFinder toggleTercero={toggleTercero} searchTable="terceros" />
      <Loader visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    color: '#0B2863',
    fontSize: 24,
    marginBottom: 5,
    marginTop: 15,
  },
  sectionDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    flexShrink: 1,
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
