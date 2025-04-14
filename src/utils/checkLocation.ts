import {getUbication} from './getUbication';
// Función para calcular la distancia entre dos coordenadas
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Radio de la Tierra en metros

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en metros
};

// Función para verificar la distancia
const checkLocation = async (
  clientLatStr: string,
  clientLonStr: string,
): Promise<number> => {
  try {
    // Convertir coordenadas del cliente a número
    const clientLat = parseFloat(clientLatStr);
    const clientLon = parseFloat(clientLonStr);

    if (isNaN(clientLat) || isNaN(clientLon)) {
      console.error('Error: Coordenadas del cliente no son válidas.');
      return 1;
    }

    // Obtener ubicación del vendedor
    const {latitude, longitude} = await getUbication();

    // Validar si la ubicación del vendedor es válida
    if (!latitude || !longitude) {
      console.error('Error: No se pudo obtener la ubicación del vendedor.');
      return 2;
    }

    // Convertir coordenadas del vendedor a número
    const vendorLat = parseFloat(latitude);
    const vendorLon = parseFloat(longitude);

    // Calcular la distancia
    const distance = haversineDistance(
      vendorLat,
      vendorLon,
      clientLat,
      clientLon,
    );

    if (distance > 50) {
      console.log(`Vendedor fuera de rango: ${distance.toFixed(2)}m`);
      return 3;
    } else {
      console.log('Vendedor dentro del rango.');
      return 0;
    }
  } catch (error) {
    console.error('Error verificando la ubicación:', error);
    return 99;
  }
};

export {checkLocation};
