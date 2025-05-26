// Movimiento.tsx
import React, {useMemo} from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {Text, Avatar, IconButton} from 'react-native-paper';

import {IOperation} from '../common/types'; // Renombrar si hay conflicto
import {formatToMoney} from '../utils';
import {
  formatName,
  formatAddress,
  formatObservation,
  calculateTotalOperationValue,
} from '../utils/displayFormatters';

// Renombrar la interfaz de props importada si es necesario para evitar colisión
// o asegurarse que MovimientoProps definida aquí es la que se usa.
// Usaremos la interfaz definida aquí por ahora.
interface MovimientoProps {
  document: IOperation;
  disabled?: boolean;
  onPressItem: (document: IOperation) => void; // CAMBIADO: Espera el objeto completo
  onDeletePedido?: (pedidoId: string) => void;
}

interface OperationDisplayInfo {
  icon: 'check' | 'file-document-outline' | 'sync-off' | 'alert-circle-outline';
  color: string;
  statusText: string;
}

const getOperationDisplayInfo = (doc: IOperation): OperationDisplayInfo => {
  if (doc.tipo_operacion === 'factura') {
    return {icon: 'check', color: '#51B654', statusText: 'Facturado'};
  }
  if (doc.sincronizado === 'S') {
    return {
      icon: 'file-document-outline',
      color: '#0B2863',
      statusText: 'Pedido Sincronizado',
    };
  }
  return {icon: 'sync-off', color: '#FF8C00', statusText: 'Pedido Pendiente'};
};

const Movimiento: React.FC<MovimientoProps> = ({
  document,
  disabled = false,
  onPressItem, // Ahora esta prop espera el objeto 'document' completo
  onDeletePedido,
}) => {
  const displayInfo = useMemo(
    () => getOperationDisplayInfo(document),
    [document],
  );
  const totalValue = useMemo(
    () => calculateTotalOperationValue(document.articulosAdded),
    [document.articulosAdded],
  );

  const documentNumber = useMemo(() => {
    return document.tipo_operacion === 'factura'
      ? document.operador.nro_factura
      : document.operador.nro_pedido;
  }, [document.tipo_operacion, document.operador]);

  const canDeletePedido =
    document.tipo_operacion === 'pedido' && document.sincronizado === 'N';

  const handlePress = () => {
    onPressItem(document); // Llama con el objeto 'document' completo
  };

  const handleDelete = () => {
    if (canDeletePedido && document.id) {
      Alert.alert(
        'Confirmar Eliminación',
        `¿Está seguro de que desea eliminar el pedido N° ${document.id}? Esta acción no se puede deshacer.`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => onDeletePedido?.(document.id.toString()!),
          },
        ],
      );
    }
  };

  return (
    // Para un gap de MÁXIMO 2px, incluyendo la sombra:
    // offset y distance pequeños, y marginBottom pequeño o 0.
    <Shadow distance={2} offset={[0, 1]} style={styles.shadow}>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabledContainer]}
        disabled={disabled}
        onPress={handlePress}
        activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <Avatar.Icon
            icon={displayInfo.icon}
            style={{backgroundColor: displayInfo.color}}
            color="#fff"
            size={48} // Ligeramente más pequeño para ahorrar espacio vertical
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <Text style={styles.clientName} numberOfLines={1}>
              {formatName(document.tercero.nombre)}
            </Text>
            <Text style={styles.documentNumber}>
              N° {documentNumber || 'N/A'}
            </Text>
          </View>
          <Text style={styles.infoText} numberOfLines={1}>
            {formatAddress(document.tercero.direcc)}
          </Text>
          <Text style={styles.infoText} numberOfLines={1}>
            {formatObservation(document.observaciones) ||
              `Fecha: ${document.fecha}`}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.saleValue} numberOfLines={1}>
            {formatToMoney(totalValue)}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.statusText, {color: displayInfo.color}]}>
              {displayInfo.statusText}
            </Text>
            {canDeletePedido && document.operador.nro_pedido && (
              <IconButton
                icon="delete-outline"
                iconColor="#ffff"
                size={22} // Ligeramente más pequeño
                onPress={handleDelete}
                style={styles.deleteButton}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6, // Reducido
    paddingHorizontal: 6, // Reducido
    minHeight: 75, // Reducido, ajusta al contenido real
  },
  disabledContainer: {
    opacity: 0.5,
  },
  shadow: {
    width: '100%',
    // El offset [0,1] de la sombra ya crea 1px de espacio visual debajo.
    // Si quieres un gap TOTAL (incluyendo sombra) de MÁXIMO 2px,
    // marginBottom: 1 sería 1px (offset) + 1px (margin) = 2px.
    // marginBottom: 0 sería 1px (offset) + 0px (margin) = 1px.
    marginBottom: 20, // <--- AJUSTA ESTE VALOR (0, 1, o 2)
  },
  iconContainer: {
    width: '18%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8, // Ajustado
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Pequeño espacio entre filas de texto
  },
  clientName: {
    color: '#303134',
    fontSize: 14, // Reducido
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 4,
  },
  documentNumber: {
    color: '#52575C',
    fontSize: 13, // Reducido
    marginLeft: 'auto',
    textAlign: 'right',
  },
  infoText: {
    color: '#52575C',
    fontSize: 12, // Reducido
    lineHeight: 16, // Reducido
  },
  actionsContainer: {
    width: '26%', // Ajustado
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 4,
  },
  saleValue: {
    fontSize: 14, // Reducido
    fontWeight: '600',
    color: '#0B2863',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11, // Reducido
    fontWeight: '600',
    textAlign: 'right',
  },
  deleteButton: {
    marginLeft: 8,
    backgroundColor: '#D0392C',
    borderRadius: 8,
    margin: 0,
    padding: 0,
    height: 28, // Contener el icono
    width: 28, // Contener el icono
    marginTop: 2,
  },
});

export {Movimiento};
