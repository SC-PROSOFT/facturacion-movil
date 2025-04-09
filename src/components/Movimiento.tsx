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
  ): '#51B654' | '#51B654' | '#D0392C' => {
    switch (status) {
      case '1':
        return '#51B654';
      case '2':
        return '#51B654';
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
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 7,
      paddingVertical: 5,
      maxHeight: 90,
      opacity: disabled ? 0.5 : 1,
    },
    shadow: {
      width: '100%',
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
    infoContainer: {
      width: '52%',
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    infoText: {
      color: '#504D54',
      fontSize: 14,
      lineHeight: 16,
      flexShrink: 1,
    },
    infoTextClient: {
      color: '#3D3D3D',
      fontSize: 16,
    },
    actionsContainer: {
      justifyContent: 'space-evenly',
      width: '28%',
      height: '100%',
      alignItems: 'center',
    },
    saleValue: {
      fontSize: 18,
      color: '#0B2863',
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
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <Text
              style={[styles.infoTextClient, {fontWeight: 'bold', flex: 1}]}
              numberOfLines={1}>
              {getNameClient(document.tercero.nombre)}
            </Text>
            <Text
              style={[
                styles.infoTextClient,
                {fontWeight: 'bold', marginLeft: 10},
              ]}>
              N°{' '}
              {document.tipo_operacion == 'factura'
                ? document.operador.nro_factura
                : document.operador.nro_pedido}
            </Text>
          </View>
          <Text style={styles.infoText}>
            {getAddressClient(document.fecha)}
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
