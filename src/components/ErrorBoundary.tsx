// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OtaUpdater from 'react-native-ota-hot-update';
import RNRestart from 'react-native-restart';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const CRASH_COUNT_KEY = 'crashCount';
const MAX_CRASHES = 3; // Hará rollback al 3er crash consecutivo

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback.
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Este método se ejecuta DESPUÉS de que ocurre un error.
    // Aquí ponemos nuestra lógica de rollback.
    console.error('[ErrorBoundary] Error atrapado:', error, errorInfo);

    try {
      let crashes = parseInt(await AsyncStorage.getItem(CRASH_COUNT_KEY) || '0', 10);
      crashes += 1;
      console.log(`[ErrorBoundary] Conteo de crashes: ${crashes}`);
      await AsyncStorage.setItem(CRASH_COUNT_KEY, crashes.toString());

      if (crashes >= MAX_CRASHES) {
        console.warn(`[ErrorBoundary] Límite de crashes alcanzado. Iniciando rollback...`);
        // Reseteamos el contador antes de intentar el rollback
        await AsyncStorage.setItem(CRASH_COUNT_KEY, '0');
        
        const success = await OtaUpdater.rollbackToPreviousBundle();
        if (success) {
          console.log('[ErrorBoundary] Rollback exitoso. Reiniciando la aplicación.');
          // Damos un momento para que el usuario pueda leer el mensaje si es necesario
          setTimeout(() => RNRestart.Restart(), 2000);
        } else {
          console.error('[ErrorBoundary] El rollback falló.');
          // Aquí podríamos mostrar un mensaje de error más permanente
        }
      }
    } catch (e) {
      console.error('[ErrorBoundary] Falló la lógica de rollback:', e);
    }
  }
  
  // Si la app funciona bien, este timer reseteará el contador de crashes.
  componentDidMount() {
      setTimeout(async () => {
        console.log('[ErrorBoundary] El componente se montó exitosamente. Reseteando contador de crashes.');
        await AsyncStorage.setItem(CRASH_COUNT_KEY, '0');
      }, 5000); // Si la app sobrevive 5 segundos, se considera un éxito.
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de fallback que quieras
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ocurrió un error</Text>
          <Text style={styles.subtitle}>Intentando restaurar la aplicación a un estado anterior...</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 10,
    }
});

export default ErrorBoundary;