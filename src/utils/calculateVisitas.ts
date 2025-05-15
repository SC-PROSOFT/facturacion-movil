import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  visitaService,
  tercerosService,
} from '../data_queries/local_database/services';
import {ITerceros, IVisita} from '../common/types';

/**
 * Obtiene la fecha local actual en formato "YYYY-MM-DD".
 */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifica si un código de zona está programado para una fecha específica.
 */
function isZoneScheduledForDate(zoneCode: string, date: Date): boolean {
  const day = date.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  const weekdayOccurrence = getWeekdayOccurrence(date);

  // Mapeo para las zonas con día fijo ("TODOS LOS ...")
  const simpleZoneMap: {[key: string]: number} = {
    '01': 1, // Lunes
    '02': 2, // Martes
    '03': 3, // Miércoles
    '04': 4, // Jueves
    '05': 5, // Viernes
    '06': 6, // Sábado
    '07': 0, // Domingo
  };

  if (simpleZoneMap[zoneCode] !== undefined) {
    return simpleZoneMap[zoneCode] === day;
  }

  // Zonas con día y ocurrencia específica, por ejemplo: "11" = primer lunes, "22" = segundo martes, etc.
  if (/^[1-4][1-7]$/.test(zoneCode)) {
    const weekNumber = parseInt(zoneCode.charAt(0), 10);
    const codeDay = parseInt(zoneCode.charAt(1), 10) % 7; // Convertir el dígito de día (donde 7 representa domingo) a la notación de JavaScript (0 para domingo)
    return day === codeDay && weekdayOccurrence === weekNumber;
  }

  // Zonas con dos días de visita (ejemplo: "51" = Lunes y Miércoles)
  if (/^5[1-3]$/.test(zoneCode)) {
    const dualZoneMap: {[key: string]: number[]} = {
      '51': [1, 3], // Lunes y Miércoles
      '52': [2, 4], // Martes y Jueves
      '53': [3, 5], // Miércoles y Viernes
    };
    return dualZoneMap[zoneCode]?.includes(day) || false;
  }

  return false; // Si no se reconoce el código, no está programado.
}

/**
 * Obtiene la ocurrencia del día de la semana en el mes (ejemplo: 2° martes).
 */
function getWeekdayOccurrence(date: Date): number {
  const dayOfMonth = date.getDate();
  let occurrence = 0;
  for (let i = 1; i <= dayOfMonth; i++) {
    const d = new Date(date.getFullYear(), date.getMonth(), i);
    if (d.getDay() === date.getDay()) {
      occurrence++;
    }
  }
  return occurrence;
}

/**
 * Verifica si es necesario recalcular las visitas (si es un nuevo día).
 */
async function shouldRecalculateVisits(): Promise<boolean> {
  try {
    const lastDate = await AsyncStorage.getItem('lastVisitGenerationDate');
    console.log('Última fecha de generación:', lastDate);

    const today = getLocalDateString(new Date());
    console.log('Fecha de hoy:', today);

    if (lastDate !== today) {
      await AsyncStorage.setItem('lastVisitGenerationDate', today);
      return true;
    }

    return false;
  } catch (e) {
    console.log('Error checking last generation date:', e);
    return true; // Si hay error, por seguridad recalculemos
  }
}

/**
 * Genera visitas para un conjunto de terceros en las fechas de hoy y mañana.
 */
export async function generateVisits(
  terceros?: ITerceros[],
): Promise<IVisita[]> {
  const visits: IVisita[] = [];
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  console.log('Hoy:', today);
  console.log('Mañana:', tomorrow);
  const todayString = getLocalDateString(today);
  const tomorrowString = getLocalDateString(tomorrow);

  console.log('Hoy:', todayString);
  console.log('Mañana:', tomorrowString);

  const datesToCheck = [today, tomorrow];

  try {
    if (!terceros) {
      terceros = await tercerosService.getAllTerceros();
    }

    const existingVisits = await visitaService.getAllVisitas();
    console.log('Visitas existentes:', existingVisits);

    terceros.forEach(tercero => {
      const frecuencia1 =
        tercero.frecuencia || (tercero as any).frecuencia_1 || '';
      const frecuencia2 =
        tercero.frecuencia2 || (tercero as any).frecuencia_2 || '';
      const frecuencia3 =
        tercero.frecuencia3 || (tercero as any).frecuencia_3 || '';

      datesToCheck.forEach(date => {
        const zoneCodes = [frecuencia1, frecuencia2, frecuencia3].filter(
          Boolean,
        );
        const isScheduled = zoneCodes.some(code =>
          isZoneScheduledForDate(code, date),
        );

        if (isScheduled) {
          const appointmentDate = getLocalDateString(date);

          const alreadyExistsInDb = existingVisits.some(
            visita =>
              visita.id_tercero === tercero.codigo &&
              visita.appointmentDate === appointmentDate,
          );

          const alreadyExistsInArray = visits.some(
            visita =>
              visita.id_tercero === tercero.codigo &&
              visita.appointmentDate === appointmentDate,
          );

          if (!alreadyExistsInDb && !alreadyExistsInArray) {
            visits.push({
              client: tercero.nombre,
              adress: tercero.direcc,
              status: '2',
              observation: '',
              saleValue: 0,
              appointmentDate,
              location: {
                latitude: tercero.latitude || '', // Asegúrate de que latitude esté definido
                longitude: tercero.longitude || '', // Asegúrate de que longitude esté definido
              },
              id_tercero: tercero.codigo,
              zona: tercero.zona,
              ruta: tercero.ruta,
              frecuencia: frecuencia1,
              frecuencia_2: frecuencia2,
              frecuencia_3: frecuencia3,
              vendedor: tercero.vendedor,
            });
          }
        }
      });
    });
  } catch (e) {
    console.log('Error al generar visitas:', e);
  }

  return visits;
}

export async function recalculateVisitsIfNeeded(terceros?: ITerceros[]) {
  try {
    const shouldRecalculate = await shouldRecalculateVisits();
    console.log(shouldRecalculate)// Verifica si es un nuevo día
    if (shouldRecalculate) {
      
      const visits = await generateVisits();
      return visits // Llama a generateVisits para recalcular
    } else {
      return []; // No es necesario recalcular, devuelve un array vacío
    }
  } catch (error) {
    console.error('Error al recalcular visitas:', error);
    return [];
  }
}
