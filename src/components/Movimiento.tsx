import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {Text, Avatar} from 'react-native-paper';

/* types */
import {IOperation, IProductAdded} from '../common/types';
/* utils */
import {formatToMoney} from '../utils';

interface MovimientoProps {
  document: IOperation;
  disabled: boolean;
  toggleVisita: () => void;
}

const Movimiento: React.FC<MovimientoProps> = ({
  document,
  disabled,
  toggleVisita,
}) => {
  const getIconOfStatus = (
    status: '1' | '2' | '3',
  ): 'check' | 'dots-horizontal' | 'close' => {
    switch (status) {
      case '1':
        return 'check';
      case '2':
        return 'dots-horizontal';
      case '3':
        return 'close';
    }
  };
  const getColorOfStatus = (
    status: '1' | '2' | '3',
  ): '#51B654' | '#F29D38' | '#D0392C' => {
    switch (status) {
      case '1':
        return '#51B654';
      case '2':
        return '#F29D38';
      case '3':
        return '#D0392C';
    }
  };
  const getNameClient = (client: string) => {
    if (client == '') {
      return '***** ***** ***** *****';
    } else {
      return client;
    }
  };
  const getAddressClient = (client: string) => {
    if (client == '') {
      return '***** ***** ***** *****';
    } else {
      return client;
    }
  };
  const getStatusDescription = (status: '1' | '2' | '3') => {
    switch (status) {
      case '1':
        return 'Visita realizada';
      case '2':
        return 'Visita pendiente';
      case '3':
        return 'Visita cancelada';
      default:
        return '***** *****';
    }
  };
  const getObservationClient = (observation: string) => {
    if (observation == '') {
      return '';
    } else {
      return observation.length > 15
        ? observation.slice(0, 26).trim() + '..'
        : observation;
    }
  };
  const sumarTotales = (articulosAdded: IProductAdded[]): number => {
    let valorTotal = 0;

    articulosAdded.forEach(articulo => {
      valorTotal += articulo.valorTotal;
    });
    return valorTotal;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 7,
      paddingVertical: 5,
      maxHeight: 90,
      opacity: disabled ? 0.7 : 1, // Hace que el View sea translúcido al 50%
    },
    shadow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    iconContainer: {
      width: '20%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoText: {
      color: '#504D54',
    },
    infoContainer: {
      width: '52%',
      paddingRight: 20,
    },
    actionsContainer: {
      justifyContent: 'space-evenly',
      width: '28%',
      height: '100%',
    },
    saleValue: {
      fontSize: 18,
      color: '#0B2863',
    },
    ubicationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ddd',
      padding: 5,
      borderRadius: 5,
      alignSelf: 'flex-start', // Hace que el botón se ajuste al contenido
    },
    facturado: {
      color: document.tipo_operacion == 'factura' ? '#51B654' : '#0B2863',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <Shadow distance={6} offset={[1, 5]} style={styles.shadow}>
      <TouchableOpacity
        style={styles.container}
        disabled={disabled}
        onPress={toggleVisita}>
        <View style={styles.iconContainer}>
          <Avatar.Icon
            icon={getIconOfStatus(
              document.tipo_operacion == 'factura' ? '1' : '2',
            )}
            style={{
              backgroundColor: getColorOfStatus(
                document.tipo_operacion == 'factura' ? '1' : '2',
              ),
            }}
            color="#fff"
            size={50}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[styles.infoText, {fontWeight: 'bold', color: '#0B2863'}]}>
            N°{' '}
            {document.tipo_operacion == 'factura'
              ? document.operador.nro_factura
              : document.operador.nro_pedido}
          </Text>
          <Text style={styles.infoText}>
            {getNameClient(document.tercero.nombre)}
          </Text>
          <Text style={styles.infoText}>
            {getAddressClient(document.tercero.direcc)}
          </Text>
          <Text style={styles.infoText}>
            {getObservationClient(document.observaciones)}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.saleValue}>
            {formatToMoney(sumarTotales(document.articulosAdded))}
          </Text>
          <Text style={styles.facturado}>
            {document.tipo_operacion == 'factura'
              ? 'Facturado'
              : 'Sin facturar'}
          </Text>
        </View>
      </TouchableOpacity>
    </Shadow>
  );
};

export {Movimiento};
