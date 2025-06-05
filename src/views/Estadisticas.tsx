import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {formatToMoney} from '../utils'; // Asumo que esta utilidad existe y funciona
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Switch,
  ActivityIndicator, // Para el estado de carga
} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {pedidosService} from '../data_queries/local_database/services';
import {PrincipalHeader} from '../components';

// Tipos (puedes moverlos a un archivo types.ts)
interface Articulo {
  descrip: string;
  cantidad: number;
  peso?: number;
  valorTotal?: number;
}

interface Pedido {
  // Considera añadir un 'id' u otras propiedades que puedan tener tus pedidos
  articulosAdded: Articulo[];
}

interface BarChartDataItem {
  value: number;
  label: string;
  frontColor: string;
}

// Constantes
const {width: screenWidth} = Dimensions.get('window');
const KG_PER_ARROBA = 11.5;
const KG_PER_LIBRA = 2.20462;
const CHART_COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#9C27B0']; // Añade más si es necesario

const BAR_CHART_DEFAULT_PROPS = {
  height: 250,
  barWidth: 40,
  spacing: 20,
  roundedTop: true,
  hideRules: true,
  xAxisThickness: 1,
  yAxisThickness: 1,
  xAxisColor: '#000',
  yAxisColor: '#000',
  xAxisLabelTextStyle: {color: '#000', fontSize: 10},
  yAxisTextStyle: {color: '#000'},
  noOfSections: 5,
  showValuesAsTopLabel: true,
};

// --- Funciones de Cálculo Puras ---
const calculateTotalPesoKg = (pedidos: Pedido[]): number => {
  return pedidos.reduce((sum, pedido) => {
    if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) {
      console.warn('Pedido sin artículos o con formato incorrecto:', pedido);
      return sum;
    }
    const pesoPedido = pedido.articulosAdded.reduce((subSum, art) => {
      if (typeof art.peso !== 'number' || typeof art.cantidad !== 'number') {
        // console.warn('Artículo con datos de peso o cantidad faltantes o incorrectos:', art);
        return subSum;
      }
      return subSum + art.peso * art.cantidad;
    }, 0);
    return sum + pesoPedido;
  }, 0);
};

const calculateTotalValor = (pedidos: Pedido[]): number => {
  return pedidos.reduce((sum, pedido) => {
    if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) {
      console.warn('Pedido sin artículos o con formato incorrecto:', pedido);
      return sum;
    }
    const valorPedido = pedido.articulosAdded.reduce((subSum, art) => {
      if (typeof art.valorTotal !== 'number') {
        // console.warn('Artículo con valorTotal faltante o incorrecto:', art);
        return subSum;
      }
      return subSum + art.valorTotal;
    }, 0);
    return sum + valorPedido;
  }, 0);
};

const generateArrozData = (pedidos: Pedido[]): BarChartDataItem[] => {
  const arrozMap: {[key: string]: number} = {};
  pedidos.forEach(pedido => {
    if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) return;
    pedido.articulosAdded.forEach(art => {
      if (!art.descrip || typeof art.cantidad !== 'number') {
        // console.warn('Artículo con descripción o cantidad faltante:', art);
        return;
      }
      const tipoArroz = art.descrip.trim().toUpperCase();
      arrozMap[tipoArroz] = (arrozMap[tipoArroz] || 0) + art.cantidad;
    });
  });

  return Object.keys(arrozMap)
    .map((tipo, index) => ({
      value: parseFloat(arrozMap[tipo].toFixed(2)),
      label: tipo.length > 10 ? `${tipo.substring(0, 10)}.` : tipo, // Acortar etiquetas largas
      frontColor: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value); // Opcional: ordenar por valor
};

export const Estadisticas = () => {
  const [pedidosData, setPedidosData] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDaily, setIsDaily] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPedidos = isDaily
        ? await pedidosService.getPedidosDeHoy()
        : await pedidosService.getPedidosDeEsteMes();

      if (!Array.isArray(fetchedPedidos)) {
        console.warn(
          'La carga de pedidos no devolvió un array:',
          fetchedPedidos,
        );
        setPedidosData([]); // Establecer a array vacío si la data no es válida
      } else {
        setPedidosData(fetchedPedidos);
      }
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      setError('No se pudieron cargar las estadísticas. Intente más tarde.');
      setPedidosData([]); // Limpiar datos en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [isDaily]); // Dependencia: isDaily

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]), // fetchData ya es un useCallback, así que esto es correcto
  );

  // --- Datos Derivados con useMemo ---
  const totalAcumuladoKg = useMemo(
    () => calculateTotalPesoKg(pedidosData),
    [pedidosData],
  );
  const totalValorAcumulado = useMemo(
    () => calculateTotalValor(pedidosData),
    [pedidosData],
  );
  const dataArroz = useMemo(
    () => generateArrozData(pedidosData),
    [pedidosData],
  );

  const dataPeso = useMemo((): BarChartDataItem[] => {
    const pesoTotalArroba = totalAcumuladoKg / KG_PER_ARROBA;
    const pesoTotalLibra = totalAcumuladoKg * KG_PER_LIBRA;
    return [
      {
        value: parseFloat(totalAcumuladoKg.toFixed(2)),
        label: 'KG',
        frontColor: CHART_COLORS[0],
      },
      {
        value: parseFloat(pesoTotalArroba.toFixed(2)),
        label: 'ARROBA',
        frontColor: CHART_COLORS[1],
      },
      {
        value: parseFloat(pesoTotalLibra.toFixed(2)),
        label: 'LIBRA',
        frontColor: CHART_COLORS[2],
      },
    ];
  }, [totalAcumuladoKg]);

  const totalPedidos = pedidosData.length;

  // Ancho dinámico para gráficos considerando paddings/margins
  const chartVisibleWidth = screenWidth - 40 * 3;

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator size="large" color="#0B2863" style={styles.loader} />
      );
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (pedidosData.length === 0 && !isLoading) {
      return (
        <Text style={styles.emptyDataText}>
          No hay datos disponibles para el período seleccionado.
        </Text>
      );
    }

    return (
      <>
        {/* Gráfico de peso total */}
        <View style={styles.container}>
          <Text style={styles.title}>
            Peso total vendido ({isDaily ? 'Hoy' : 'Este Mes'})
          </Text>
          <BarChart
            {...BAR_CHART_DEFAULT_PROPS}
            data={dataPeso}
            width={chartVisibleWidth} // Usar ancho calculado
            maxValue={
              dataPeso.length > 0
                ? Math.max(...dataPeso.map(d => d.value)) * 1.2 || 10
                : 10
            }
          />
        </View>

        {/* Gráfico por tipo de arroz */}
        <View style={styles.container}>
          <Text style={styles.title}>Cantidad vendida por tipo de arroz</Text>
          <BarChart
            {...BAR_CHART_DEFAULT_PROPS}
            data={dataArroz}
            width={chartVisibleWidth} // Usar ancho calculado
            barWidth={dataArroz.length > 5 ? 30 : 40} // Ajustar ancho de barra si hay muchos items
            spacing={dataArroz.length > 5 ? 15 : 20}
            maxValue={
              dataArroz.length > 0
                ? Math.max(...dataArroz.map(d => d.value)) * 1.2 || 10
                : 10
            }
          />
        </View>
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <PrincipalHeader />

      <View style={styles.controlsAndTotalsContainer}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Mostrar datos:</Text>
          <Text style={styles.switchValueLabel}>
            {isDaily ? 'Diarios' : 'Mensuales'}
          </Text>
          <Switch
            value={isDaily}
            onValueChange={setIsDaily} // Esto disparará el re-fetch debido a la dependencia en fetchData
            thumbColor={isDaily ? '#0B2863' : '#bdc3c7'}
            trackColor={{false: '#ecf0f1', true: '#95a5a6'}}
            ios_backgroundColor="#ecf0f1"
          />
        </View>
        <View style={styles.totalsSummaryContainer}>
          <Text style={styles.totalText}>
            Total Peso: {totalAcumuladoKg.toFixed(2)} KG
          </Text>
          <Text style={styles.totalText}>
            Total Valor: {formatToMoney(totalValorAcumulado)}
          </Text>
          <Text style={styles.totalText}>Total Pedidos: {totalPedidos}</Text>
        </View>
      </View>

      {renderContent()}
    </ScrollView>
  );
};

// Estilos (se han reorganizado un poco para agrupar controles y totales)
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f0f0', // Un fondo general suave
    paddingBottom: 100, // Espacio para el final del scroll
  },
  controlsAndTotalsContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 5, // Reducido porque los gráficos tendrán su propio margen
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  switchValueLabel: {
    fontSize: 16,
    color: '#0B2863',
    fontWeight: 'bold',
  },
  totalsSummaryContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 15,
    color: '#2c3e50',
    marginVertical: 4,
  },
  container: {
    // Estilo para cada contenedor de gráfico
    marginHorizontal: 15,
    marginVertical: 10, // Espacio entre los gráficos y el bloque de totales
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center', // Centrar el título y el gráfico
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15, // Más espacio antes del gráfico
    color: '#2c3e50',
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    padding: 20,
    marginTop: 30,
  },
  emptyDataText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    padding: 20,
    marginTop: 30,
  },
});

// No olvides exportar si no lo haces ya en un index.ts
// export default Estadisticas;
