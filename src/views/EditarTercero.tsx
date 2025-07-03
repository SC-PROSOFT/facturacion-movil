import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {setIsShowTercerosFinder} from '../redux/slices';
import {IconButton, TercerosFinder} from '../components';
import {decisionAlertContext} from '../context';
import {ITerceros} from '../common/types';
import {_Input} from '../components/_Input';
import {Card, useTheme} from 'react-native-paper';
const defaultTercero: ITerceros = {
  codigo: '',
  nombre: '',
  direcc: '',
  tel: '',
  vendedor: '',
  plazo: 0,
  f_pago: '01',
  ex_iva: 'N',
  clasificacion: '',
  dv: '',
  tipo: 'CC',
  departamento: '',
  ciudad: '',
  barrio: '',
  email: '',
  reteica: 'N',
  frecuencia: '',
  frecuencia2: '',
  frecuencia3: '',
  zona: '',
  ruta: '',
  latitude: '',
  longitude: '',
  rut_pdf: 'N',
  camcom_pdf: 'N',
  di_pdf: 'N',
};
const EditarTercero = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const [tercero, setTercero] = useState<ITerceros>(defaultTercero);
  const theme = useTheme(); // Hook para acceder a los colores del tema (dark/light)

  return (
    <View style={styles.container}>
      <Text style={{color: '#092254', fontSize: 22, marginBottom: 10}}>
        Selecciona el cliente
      </Text>
      <Card style={styles.card}>
        <Card.Content style={{paddingVertical: 6, paddingHorizontal: 6}}>
          {/* 3. El contenedor para el input y el botón */}
          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <_Input
                value={tercero.codigo}
                onChangeText={text => setTercero({...tercero, codigo: text})}
                placeholder="Codigo cliente"
              />
            </View>
            <IconButton
              iconSize={32}
              iconName="magnify"
              onPress={() => {
                dispatch(setIsShowTercerosFinder(true));
              }}
              // 4. El color del ícono ahora se adapta al tema
              iconColor={'#FFFF'}
            />
          </View>
        </Card.Content>
      </Card>
      <TercerosFinder searchTable="terceros" />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12, // Padding general para la pantalla
  },
  card: {
    width: '100%', // La tarjeta ocupa todo el ancho disponible
    // La elevación y el borde redondeado son manejados por el componente Card
  },
  searchContainer: {
    flexDirection: 'row', // Los elementos se colocan en fila
    alignItems: 'center', // Se alinean verticalmente al centro
    width: '100%',
    gap: 2, // Espacio moderno y consistente entre el input y el botón
  },
  inputContainer: {
    flex: 1, // ¡La clave! Hace que este contenedor ocupe todo el espacio sobrante
  },
  iconButton: {
    // Generalmente no necesita estilos si el tamaño se controla con props,
    // pero se puede usar para márgenes o fondos si es necesario.
    // El componente IconButton se encargará de su propio padding.
  },
});
export {EditarTercero};
