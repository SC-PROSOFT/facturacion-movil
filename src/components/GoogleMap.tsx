import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {Modal, Portal, IconButton} from 'react-native-paper';

interface GoogleMapProps {
  latitude?: number; // Hacer opcionales las coordenadas
  longitude?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({latitude, longitude}) => {
  const [visible, setVisible] = React.useState(false);

  const showModal = () => {
    console.log('Ubicación disponible:', latitude, longitude);
    if (latitude && longitude) {
      console.log('Ubicación disponible:', latitude, longitude);
      setVisible(true); // Solo abrir si las coordenadas están definidas
    } else {
      console.warn('Ubicación no disponible');
    }
  };

  const hideModal = () => setVisible(false);

  return (
    <View>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: latitude || 0, // Valor por defecto si no hay coordenadas
                longitude: longitude || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onMapReady={() => console.log('Mapa listo')}
              onRegionChangeComplete={region =>
                console.log('Región del mapa:', region)
              }>
              {latitude && longitude && (
                <Marker
                  coordinate={{latitude, longitude}}
                  title="Ubicación"
                  description="Esta es la ubicación seleccionada"
                />
              )}
            </MapView>
          </View>
          <IconButton
            icon="close"
            onPress={hideModal}
            style={styles.closeButton}
          />
        </Modal>
      </Portal>

      <IconButton
        mode="contained"
        style={{backgroundColor: '#eee'}}
        onPress={showModal}
        icon={'google-maps'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: 0,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
  },
});

export {GoogleMap};