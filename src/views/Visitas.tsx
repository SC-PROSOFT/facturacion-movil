import React, {useState, useEffect, useRef} from 'react';

import {View, StyleSheet, VirtualizedList, SafeAreaView} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

/* components */
import {Visita, PrincipalHeader, Searcher, TercerosFinder} from '../components';
/* types */
import {ITerceros, IVisita} from '../common/types';
/* redux */
import {useAppDispatch} from '../redux/hooks';
import {
  setArrAlmacenes,
  setArrCartera,
  setObjConfig,
  setObjVisita,
  setObjTercero,
  setObjInfoAlert,
  setArrFactura,
  setArrPedido,
} from '../redux/slices';
/* local db */
import {
  almacenesService,
  carteraService,
  configService,
  tercerosService,
  facturasService,
  pedidosService,
} from '../data_queries/local_database/services';

const visitas: IVisita[] = [
  {
    client: 'Raul Arauco',
    adress: 'Carrera 24 # 55-64',
    status: '1',
    observation:
      'Se realiza pedido normal como esta establecido en los procesos de la empresa',
    saleValue: 350000,
    appointmentDate: '2025-02-26',
    location: {
      latitude: '',
      longitude: '',
    },

    id_tercero: '0000001035',
  },
  {
    client: 'Diego Parrado',
    adress: 'Carrera 24 # 55-64',
    status: '2',
    observation: '',
    saleValue: 350000,
    appointmentDate: '2025-02-26',
    location: {
      latitude: '',
      longitude: '',
    },

    id_tercero: '0000002276',
  },
  {
    client: 'Diego Parrado',
    adress: 'Carrera 24 # 55-64',
    status: '2',
    observation: '',
    saleValue: 350000,
    appointmentDate: '2025-02-26',
    location: {
      latitude: '',
      longitude: '',
    },

    id_tercero: '0000000112',
  },
];

const currentDate = new Date().toISOString().slice(0, 10);

const Visitas: React.FC = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState<string>('');

  const lastAppointmentDate = useRef<any>(null);

  useEffect(() => {
    bringAlmacenes();
    bringCartera();
    loadSettings();
  }, []);

  const bringAlmacenes = async () => {
    const almacenes = await almacenesService.getAllAlmacenes();

    dispatch(setArrAlmacenes(almacenes));
  };
  const bringCartera = async () => {
    const cartera = await carteraService.getAllCartera();

    dispatch(setArrCartera(cartera));
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
  const addOneDay = (dateString: string) => {
    // Convertir la fecha en formato "YYYY-MM-DD" a un objeto Date
    const date = new Date(dateString);

    // Sumar un día (86400000 ms en un día)
    date.setDate(date.getDate() + 1);

    // Formatear la fecha de nuevo a "YYYY-MM-DD"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes de 0 a 11, sumamos 1
    const day = String(date.toISOString()).slice(8, 10);

    return `${year}-${month}-${day}`;
  };
  const filterVisitas = (visitas: IVisita[]) => {
    const tomorrow = addOneDay(currentDate);
    const trimmedSearch = search.trim();

    return visitas.filter(
      visita =>
        visita.appointmentDate >= currentDate &&
        visita.appointmentDate <= tomorrow &&
        (!trimmedSearch || visita.client.includes(trimmedSearch)),
    );
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
          description: `No se encontraron pedidos registradas a ${tercero.nombre}`,
        }),
      );
    }
  };

  const toggleTercero = async (tercero: ITerceros) => {
    console.log('tercero =>>>>', tercero);
    visitas.filter(visita => {
      if (visita.id_tercero === tercero.codigo) {
        setSearch(visita.client);
      }
    });
  };

  const renderItem = ({item, index}: {item: IVisita; index: any}) => {
    let showHeader = false;

    if (item.appointmentDate !== lastAppointmentDate.current) {
      showHeader = true;
      lastAppointmentDate.current = item.appointmentDate;
    }

    return (
      <>
        {showHeader && (
          <Text style={styles.sectionTitle}>
            {item.appointmentDate === currentDate ? 'Hoy' : 'Mañana'}
          </Text>
        )}
        <Visita
          key={index}
          visita={item}
          disabled={item.appointmentDate === currentDate ? false : true}
          toggleVisita={() => toggleVisita(item)}
        />
      </>
    );
  };

  return (
    <View>
      <PrincipalHeader>
        <Searcher search={search} setSearch={setSearch} />
      </PrincipalHeader>

      <SafeAreaView>
        <VirtualizedList
          data={filterVisitas(visitas)}
          renderItem={renderItem}
          getItemCount={data => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={<View style={{height: 100}} />}
          style={{
            paddingHorizontal: 15,
            paddingVertical: 5,
            height: 780,
          }}
        />
      </SafeAreaView>

      <TercerosFinder toggleTercero={toggleTercero} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginBottom: 140,
  },
  searcher: {
    width: '100%',
    backgroundColor: '#092254',
  },
  sectionTitle: {
    color: '#0B2863',
    fontSize: 24,
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#485E8A',
    paddingHorizontal: 10,
    paddingRight: 5,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'flex-start', // Hace que el botón se ajuste al contenido
  },
});

export {Visitas};
