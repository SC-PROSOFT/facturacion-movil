import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
// No necesitas importar 'checkInternetConnection' DENTRO de esta función si quieres que funcione offline.
// El chequeo de internet puede hacerse ANTES de llamar a getUbication si la lógica de tu app lo requiere para OTRAS cosas.

/**
 * Obtiene la ubicación actual del dispositivo.
 * Intenta obtener la ubicación utilizando los métodos disponibles (GPS, A-GPS, Red).
 * Puede funcionar sin conexión a internet si el GPS está disponible.
 *
 * IMPORTANTE: Esta función asume que los permisos de localización ya han sido solicitados y concedidos.
 * Deberías manejar la solicitud de permisos en tu componente antes de llamar a esta función.
 *
 * @param {boolean} enableHighAccuracy - (Opcional) `true` para solicitar la máxima precisión posible (prioriza GPS),
 * `false` para optimizar batería/velocidad (puede usar red). Por defecto `true`.
 * @param {number} timeout - (Opcional) Tiempo máximo en milisegundos para esperar una respuesta. Por defecto 15000ms.
 * @param {number} maximumAge - (Opcional) Cuánto tiempo (en ms) puede tener una ubicación en caché para ser considerada válida.
 * `0` fuerza una nueva lectura. Por defecto 1000ms.
 * @returns {Promise<{latitude: string; longitude: string}>} Una promesa que resuelve con las coordenadas
 * o rechaza con un error si no se pudo obtener la ubicación.
 */
const getUbication = async (
  enableHighAccuracy: boolean = true, // Priorizar GPS por defecto para capacidad offline
  timeout: number = 15000, // Aumentar un poco el timeout para el GPS
  maximumAge: number = 1000, // Obtener una ubicación razonablemente fresca
): Promise<{latitude: string; longitude: string}> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeolocationResponse) => {
        const latitude = position.coords.latitude.toString();
        const longitude = position.coords.longitude.toString();
        console.log('Ubicación obtenida:', {latitude, longitude});
        resolve({latitude, longitude});
      },
      (error: GeolocationError) => {
        // Aquí puedes loguear o manejar diferentes códigos de error si es necesario
        // error.code puede ser: 1 (PERMISSION_DENIED), 2 (POSITION_UNAVAILABLE), 3 (TIMEOUT)
        console.log(
          `Error al obtener ubicación (Código: ${error.code}): ${error.message}`,
        );

        // Para un manejo de errores más granular en el lado del llamador:
        // reject(error);

        // O si prefieres que siempre resuelva, pero con un indicador de error o valores vacíos:
        // (Aunque rechazar es generalmente mejor para errores en promesas)
        // resolve({ latitude: '', longitude: '' }); // O considera rechazar para que el llamador maneje el error

        // Rechazando con un error más descriptivo para el llamador
        reject(
          new Error(
            `Fallo al obtener ubicación: ${error.message} (Código: ${error.code})`,
          ),
        );
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    );
  });
};

export {getUbication};
