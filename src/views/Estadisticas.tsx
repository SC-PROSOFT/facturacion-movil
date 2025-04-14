import React, {useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {formatToMoney} from '../utils';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Switch,
} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {pedidosService} from '../data_queries/local_database/services';
import {PrincipalHeader} from '../components';

const {width} = Dimensions.get('window');

interface BarChartData {
  value: number; // Cantidad total del tipo de arroz
  label: string; // Tipo de arroz
  frontColor: string; // Color de la barra
}

export const Estadisticas = () => {
  const [dataPeso, setDataPeso] = useState<BarChartData[]>([]);
  const [dataArroz, setDataArroz] = useState<BarChartData[]>([]);
  const [totalAcumulado, setTotalAcumulado] = useState<number>(0); // Total acumulado en KG
  const [totalPedidos, setTotalPedidos] = useState<number>(0); // Total de pedidos
  const [isDaily, setIsDaily] = useState<boolean>(true); // Estado para alternar entre datos diarios y mensuales
  const [totalValorAcumulado, setTotalValorAcumulado] = useState<number>(0); // Total acumulado del precio

  // Función para calcular el peso total vendido en KG
  const calculateTotalPeso = (pedidos: any[]): number => {
    return pedidos.reduce((sum, pedido) => {
      if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) {
        console.warn('Pedido sin artículos o con formato incorrecto:', pedido);
        return sum;
      }

      const pesoPedido = pedido.articulosAdded.reduce((s, art: any) => {
        if (!art.peso || !art.cantidad) {
          console.warn('Artículo con datos faltantes:', art);
          return s;
        }
        return s + art.peso * Number(art.cantidad);
      }, 0);
      return sum + pesoPedido;
    }, 0);
  };

  // Función para agrupar los datos por tipo de arroz
  const calculateArrozData = (pedidos: any[]): BarChartData[] => {
    const arrozMap: {[key: string]: number} = {};

    pedidos.forEach(pedido => {
      if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) {
        console.warn('Pedido sin artículos o con formato incorrecto:', pedido);
        return;
      }

      pedido.articulosAdded.forEach((art: any) => {
        if (!art.descrip || !art.cantidad) {
          console.warn('Artículo con datos faltantes:', art);
          return;
        }

        // Agrupar por tipo de arroz
        const tipoArroz = art.descrip.toUpperCase(); // Convertir a mayúsculas para evitar duplicados
        arrozMap[tipoArroz] = (arrozMap[tipoArroz] || 0) + Number(art.cantidad);
      });
    });

    // Convertir el mapa en un arreglo para el gráfico
    return Object.keys(arrozMap).map((tipo, index) => ({
      value: arrozMap[tipo],
      label: tipo,
      frontColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722'][index % 4], // Colores cíclicos
    }));
  };

  const calculateTotalValor = (pedidos: any[]): number => {
    return pedidos.reduce((sum, pedido) => {
      if (!pedido.articulosAdded || !Array.isArray(pedido.articulosAdded)) {
        console.warn('Pedido sin artículos o con formato incorrecto:', pedido);
        return sum;
      }

      const valorPedido = pedido.articulosAdded.reduce((s, art: any) => {
        if (!art.valorTotal) {
          console.warn('Artículo con datos faltantes:', art);
          return s;
        }
        return s + Number(art.valorTotal);
      }, 0);

      return sum + valorPedido;
    }, 0);
  };

  const fetchData = async () => {
    try {
      const pedidos = isDaily
        ? await pedidosService.getPedidosDeHoy()
        : await pedidosService.getPedidosDeEsteMes();

      console.log(
        isDaily ? 'Pedidos de hoy:' : 'Pedidos de este mes:',
        pedidos,
      );

      // Calcular el peso total en KG
      const pesoTotalKG = calculateTotalPeso(pedidos);
      const valorTotal = calculateTotalValor(pedidos);

      // Convertir a otras unidades
      const pesoTotalArroba = pesoTotalKG / 11.5; // 1 ARROBA = 11.5 KG
      const pesoTotalLibra = pesoTotalKG * 2.20462; // 1 KG = 2.20462 LIBRAS
      const pesoChartData: BarChartData[] = [
        {
          value: parseFloat(pesoTotalKG.toFixed(2)),
          label: 'KG',
          frontColor: '#4CAF50',
        },
        {
          value: parseFloat(pesoTotalArroba.toFixed(2)),
          label: 'ARROBA',
          frontColor: '#FFC107',
        },
        {
          value: parseFloat(pesoTotalLibra.toFixed(2)),
          label: 'LIBRA',
          frontColor: '#2196F3',
        },
      ];

      // Calcular datos por tipo de arroz
      const arrozData = calculateArrozData(pedidos);

      // Actualizar los estados
      setDataPeso(pesoChartData);
      setDataArroz(arrozData);

      // Actualizar el total acumulado y el total de pedidos
      setTotalAcumulado(pesoTotalKG);
      setTotalValorAcumulado(valorTotal);
      setTotalPedidos(pedidos.length);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Volver a cargar los datos cuando cambie el estado isDaily
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [isDaily]),
  );
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Totales */}
      <View>
        <PrincipalHeader />
      </View>

      {/* Selector de rango de datos */}
      <View style={styles.switchContainer}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Mostrar datos:</Text>
          <Text style={styles.switchLabel}>
            {isDaily ? 'Diarios' : 'Mensuales'}
          </Text>
          <Switch
            value={isDaily}
            onValueChange={setIsDaily}
            thumbColor={isDaily ? '#0B2863' : 'gray'}
            trackColor={{false: 'gray', true: '#0B2863'}}
          />
        </View>
        <View style={styles.totalsContainer}>
          <Text style={styles.totalText}>
            Total acumulado (peso): {totalAcumulado.toFixed(2)} KG
          </Text>
          <Text style={styles.totalText}>
            Total acumulado (precio): {formatToMoney(totalValorAcumulado)}
          </Text>
          <Text style={styles.totalText}>Total de Pedidos: {totalPedidos}</Text>
        </View>
      </View>

      {/* Gráfico de peso total */}
      <View style={styles.container}>
        <Text style={styles.title}>
          Peso total vendido ({isDaily ? 'Hoy' : 'Este Mes'})
        </Text>
        <BarChart
          data={dataPeso}
          width={width - 40 * 3}
          height={250}
          barWidth={40}
          spacing={20}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor="#000"
          yAxisColor="#000"
          xAxisLabelTextStyle={{color: '#000'}}
          yAxisTextStyle={{color: '#000'}}
          noOfSections={5}
          maxValue={Math.max(...dataPeso.map(d => d.value)) * 1.2}
          showValuesAsTopLabel
        />
      </View>

      {/* Gráfico por tipo de arroz */}
      <View style={styles.container}>
        <Text style={styles.title}>Cantidad vendida por tipo de arroz</Text>
        <BarChart
          data={dataArroz}
          width={width - 40 * 3}
          height={250}
          barWidth={40}
          spacing={20}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor="#000"
          yAxisColor="#000"
          xAxisLabelTextStyle={{color: '#000', fontSize: 10}}
          yAxisTextStyle={{color: '#000'}}
          noOfSections={5}
          maxValue={Math.max(...dataArroz.map(d => d.value)) * 1.2}
          showValuesAsTopLabel
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  switchContainer: {
    margin: 20,
    marginBottom: 0,
    padding: 10,
    backgroundColor: '#fff', // Fondo blanco
    borderRadius: 10,
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Sombra para Android
    flexDirection: 'column', // Apilar elementos verticalmente
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10, // Espacio entre el selector y los totales
  },
  totalsContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '100%',
  },
  totalText: {
    fontSize: 14,
    color: '#0B2863',
    marginVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#000',
  },
  container: {
    margin: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
});
