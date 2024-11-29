import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';
import Toast from 'react-native-toast-message';

/* components */
import {CoolButton, PrincipalHeader} from '../components';
/* redux hook */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* redux slices */
import {setObjInfoAlert} from '../redux/slices';
/* local database services */
import {facturasService} from '../data_queries/local_database/services';
/* api queries */
import {FacturasApiService} from '../data_queries/api/queries';

/* local types */
interface State {
  facturasActualizados: number;
  facturasPendientesDeActualizacion: number;
  facturasElaborados: number;
}

const ActualizarFacturas: React.FC = () => {
  const dispatch = useAppDispatch();

  const objConfig = useAppSelector(store => store.config.objConfig);

  const [state, setState] = useState<State>({
    facturasActualizados: 0,
    facturasPendientesDeActualizacion: 0,
    facturasElaborados: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadFacturasValues();
  }, []);

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

      setState(facturasValues);
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

  const styles = StyleSheet.create({
    container: {},
    pedidosSummary: {
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      elevation: 3,
      marginTop: 10,
      backgroundColor: 'white',
      borderColor: '#ddd',
    },
    pedidosSummaryTitle: {
      borderBottomColor: 'grey',
      borderTopColor: '#fff',
      borderLeftColor: '#fff',
      borderRightColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      marginHorizontal: 10,
      marginBottom: 20,
      paddingVertical: 10,
      backgroundColor: '#fff',
    },
    itemsContainer: {
      padding: 20,
      paddingTop: 0,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    itemTitle: {
      width: '90%',
      fontSize: 18,
      color: '#000',
    },
    itemContent: {
      width: '10%',
      fontSize: 13,
      fontWeight: 'bold',
      color: '#464646',
    },
  });

  return (
    <View style={styles.container}>
      <View>
        <PrincipalHeader />
      </View>
      <View style={{paddingHorizontal: 15, paddingTop: 10}}>
        <View>
          <CoolButton
            pressCoolButton={updateFacturas}
            value="Actualizar facturas"
            iconName="sync"
            colorButton="#19C22A"
            colorText={
              state.facturasPendientesDeActualizacion > 0 ? '#fff' : 'grey'
            }
            loading={loading}
            iconSize={25}
            disabled={
              state.facturasPendientesDeActualizacion > 0 ? false : true
            }
          />
        </View>

        <View style={styles.pedidosSummary}>
          <View style={styles.pedidosSummaryTitle}>
            <Text
              allowFontScaling={false}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              }}>
              Todos los facturas
            </Text>
          </View>

          <View style={styles.itemsContainer}>
            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Facturas actualizados
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: 'green',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.facturasActualizados}
                </Badge>
              </View>
            </View>

            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Facturas pendientes por actualizar
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: 'orange',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.facturasPendientesDeActualizacion}
                </Badge>
              </View>
            </View>

            <View style={styles.item}>
              <Text allowFontScaling={false} style={styles.itemTitle}>
                Total facturas elaborados
              </Text>

              <View style={{minWidth: 20}}>
                <Badge
                  size={25}
                  style={{
                    backgroundColor: '#365AC3',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}>
                  {state.facturasElaborados}
                </Badge>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export {ActualizarFacturas};
