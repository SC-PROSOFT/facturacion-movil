import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Text, Avatar } from 'react-native-paper';
import { GoogleMap } from '../components';
import { IVisita } from '../common/types';
import { formatToMoney } from '../utils';

interface VisitaProps {
  visita: IVisita;
  disabled: boolean;
  toggleVisita: () => void;
}

const getIconOfStatus = (
  status: '1' | '2' | '3'
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
  status: '1' | '2' | '3'
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
  return client === '' ? '***** ***** ***** *****' : client;
};

const getAddressClient = (adress: string) => {
  return adress === '' ? '***** ***** ***** *****' : adress;
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
  if (observation === '') {
    return '';
  } else {
    return observation.length > 15
      ? observation.slice(0, 26).trim() + '..'
      : observation;
  }
};

const renderObservation = (observation: string) => {
  if (!observation || observation.trim() === '') {
    return null;
  }
  const text =
    observation.length > 15
      ? observation.slice(0, 26).trim() + '..'
      : observation;
  return <Text style={styles.observationText}>{text}</Text>;
};

const Visita: React.FC<VisitaProps> = ({ visita, disabled, toggleVisita }) => {
  return (
    <Shadow distance={6} offset={[1, 5]} style={styles.shadow}>
      <TouchableOpacity
        style={[styles.container, { opacity: disabled ? 0.5 : 1 }]}
        disabled={disabled}
        onPress={toggleVisita}>
        <View style={styles.iconContainer}>
          <Avatar.Icon
            icon={getIconOfStatus(visita.status)}
            style={{ backgroundColor: getColorOfStatus(visita.status) }}
            color="#fff"
            size={50}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTextClient} numberOfLines={1}>
            {getNameClient(visita.client)}
          </Text>
          <Text style={styles.infoTextAdress}>
            {getAddressClient(visita.adress)}
          </Text>
          <Text style={[styles.infoText, { fontWeight: 'bold', fontSize: 12 }]}>
            {getStatusDescription(visita.status)}
          </Text>
          {visita.observation && renderObservation(visita.observation)}
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.saleValueText}>
            {formatToMoney(visita.saleValue)}
          </Text>
          <GoogleMap latitude={4.141933} longitude={-73.624267} />
        </View>
      </TouchableOpacity>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center', // Centra verticalmente todos los elementos
    backgroundColor: '#fff',
    borderRadius: 7,
    paddingVertical: 5,
    maxHeight: 90,
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
    alignItems: 'center', // Centra el Avatar horizontalmente
  },
  infoContainer: {
    width: '52%',
    justifyContent: 'center', // Centra verticalmente el contenido
    paddingHorizontal: 10,
    paddingVertical: 5, // Asegura que haya espacio para centrar
  },
  infoTextClient: {
    color: '#3D3D3D',
    fontSize: 16,
  },
  infoText: {
    color: '#504D54',
    fontSize: 14,
    lineHeight: 16,
  },
  infoTextAdress: {
    color: '#3D3D3D',
    fontSize: 12,
    lineHeight: 16,
  },
  observationText: {
    fontSize: 12, // Tamaño de fuente deseado
    color: '#3D3D3D', // Color del texto
    lineHeight: 16,
  },
  saleValueText: {
    fontSize: 18,
    color: '#0B2863',
    textAlign: 'center',
  },
  rightContainer: {
    justifyContent: 'space-evenly',
    width: '28%',
    height: '100%',
    alignItems: 'center',
  },
});

export { Visita };
