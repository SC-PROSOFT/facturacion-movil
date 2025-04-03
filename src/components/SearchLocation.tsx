import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Dimensions} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getUbication} from '../utils';

interface IModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (location: {latitude: number; longitude: number}) => void;
}

const SearchLocation: React.FC<IModalProps> = ({visible, onClose, onSave}) => {
    const [latitude, setLatitude] = useState<string>('*************');
    const [longitude, setLongitude] = useState<string>('*************');
    const [isSearching, setIsSearching] = useState<boolean>(true);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null); // Referencia para la animación
  
    const modalWidth = Dimensions.get('window').width < 400 ? '90%' : '80%';
  
    useEffect(() => {
      if (visible) {
        // Inicia la animación de "pulse"
        animationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );
        animationRef.current.start();
  
        // Simula la búsqueda de la ubicación
        const fetchLocation = async () => {
          try {
            const location = await getUbication();
            setLatitude(location.latitude.toString());
            setLongitude(location.longitude.toString());
            setIsSearching(false);
  
            // Detiene la animación cuando se encuentra la ubicación
            if (animationRef.current) {
              animationRef.current.stop();
            }
          } catch (error) {
            console.error('Error obteniendo la ubicación:', error);
            setLatitude('Error');
            setLongitude('Error');
            setIsSearching(false);
  
            // Detiene la animación en caso de error
            if (animationRef.current) {
              animationRef.current.stop();
            }
          }
        };
  
        fetchLocation();
      }
    }, [visible]);
  
    const handleSave = () => {
      if (latitude !== '*************' && longitude !== '*************') {
        onSave({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        });
        onClose();
      }
    };
  
    const title = isSearching ? 'Buscando ubicación' : 'Ubicación encontrada'; // Título dinámico
  
    return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={onClose}
          style={[styles.dialog, {width: modalWidth}]}>
          <View style={[styles.headContainer, styles.row]}>
            <Icon name="map-marker" size={25} color="#fff" style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
          </View>
          <Dialog.Content style={styles.dialogContent}>
            <Animated.View
              style={[
                styles.iconContainer,
                {transform: [{scale: pulseAnim}]}, // Aplica la animación de escala
              ]}>
              <Icon name="map-marker-radius" size={50} color="#092254" />
            </Animated.View>
            <Text style={styles.coordinates}>Latitud: {latitude}</Text>
            <Text style={styles.coordinates}>Longitud: {longitude}</Text>
            <Text style={styles.instruction}>
              Por favor conserve el lugar y no se mueva mientras el sistema
              calcula la ubicación geográfica.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.actionsContainer}>
            <View style={styles.buttonWrapper}>
              <Button onPress={handleSave} disabled={isSearching}>
                <Text style={styles.textButton}>Guardar ubicación</Text>
              </Button>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    padding: 0,
  },
  headContainer: {
    backgroundColor: '#092254',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    marginTop: 0,
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 2, // Espacio entre el icono y el texto
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  dialogContent: {
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  coordinates: {
    color: '#092254',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  instruction: {
    color: '#092254',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  textButton: {
    color: '#fff',
    backgroundColor: '#092254',
    padding: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  actionsContainer: {
    justifyContent: 'center', // Centra el contenido horizontalmente
    alignItems: 'center', // Asegura que los elementos estén alineados al centro
    width: '100%', // Asegura que ocupe todo el ancho del modal
  },
  buttonWrapper: {
    alignItems: 'center', // Centra el botón horizontalmente
  },
});

export {SearchLocation};
