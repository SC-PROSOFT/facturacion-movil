import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  visitaService,
  tercerosService,
} from '../data_queries/local_database/services'; // Rutas verificadas
import {ITerceros, IVisita} from '../common/types'; // Rutas verificadas

const LAST_VISIT_GENERATION_DATE_KEY = 'lastVisitGenerationDate';

// --- Funciones de Utilidad de Fechas ---

/**
 * Obtiene la fecha local en formato "YYYY-MM-DD".
 */
function getLocalDateString(date: Date): string {
  // moment(date).format('YYYY-MM-DD') es una alternativa si ya usas moment
  return date.toISOString().split('T')[0];
}

/**
 * Obtiene la ocurrencia del día de la semana en el mes (ej: 1er Lunes, 2do Martes).
 * 1 = primera ocurrencia, 2 = segunda, etc.
 */
function getWeekdayOccurrenceInMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

// --- Lógica de Programación de Zonas/Frecuencias ---

// Tipos para mayor claridad en los códigos de zona
enum DayOfWeek { // Coincide con Date.getDay()
  Domingo = 0, Lunes = 1, Martes = 2, Miercoles = 3, Jueves = 4, Viernes = 5, Sabado = 6,
}

interface ZoneRule {
  matches: (zoneCode: string, date: Date) => boolean;
}

// Regla para días fijos (ej: "01" para Lunes)
const FixedDayRule: ZoneRule = {
  matches: (zoneCode, date) => {
    const dayMapping: Record<string, DayOfWeek> = {
      '01': DayOfWeek.Lunes, '02': DayOfWeek.Martes, '03': DayOfWeek.Miercoles,
      '04': DayOfWeek.Jueves, '05': DayOfWeek.Viernes, '06': DayOfWeek.Sabado,
      '07': DayOfWeek.Domingo,
    };
    return dayMapping[zoneCode] === date.getDay();
  },
};

// Regla para N-ésima ocurrencia del día en el mes (ej: "11" para 1er Lunes)
const NthWeekdayRule: ZoneRule = {
  matches: (zoneCode, date) => {
    if (!/^[1-4][0-6]$/.test(zoneCode)) return false; // Ajustado para usar 0-6 para días
    const occurrence = parseInt(zoneCode.charAt(0), 10);
    const dayOfWeekInCode = parseInt(zoneCode.charAt(1), 10) as DayOfWeek; // ej: '1' para Lunes
    
    // Para esta regla, `getWeekdayOccurrence` original era más preciso que `getWeekdayOccurrenceInMonth`
    // ya que calculaba la ocurrencia real contando desde el inicio del mes.
    // La función original:
    const getPreciseWeekdayOccurrence = (d: Date): number => {
        const dayOfMonth = d.getDate();
        let occ = 0;
        for (let i = 1; i <= dayOfMonth; i++) {
            const currentDate = new Date(d.getFullYear(), d.getMonth(), i);
            if (currentDate.getDay() === d.getDay()) {
                occ++;
            }
        }
        return occ;
    };

    return date.getDay() === dayOfWeekInCode && getPreciseWeekdayOccurrence(date) === occurrence;
  },
};


// Regla para días duales (ej: "51" para Lunes y Miércoles)
const DualDayRule: ZoneRule = {
  matches: (zoneCode, date) => {
    const dualDayMapping: Record<string, DayOfWeek[]> = {
      '51': [DayOfWeek.Lunes, DayOfWeek.Miercoles],
      '52': [DayOfWeek.Martes, DayOfWeek.Jueves],
      '53': [DayOfWeek.Miercoles, DayOfWeek.Viernes],
    };
    return dualDayMapping[zoneCode]?.includes(date.getDay()) || false;
  },
};

// Agregador de reglas. Puedes añadir más reglas aquí.
const zoneSchedulingRules: ZoneRule[] = [FixedDayRule, NthWeekdayRule, DualDayRule];

/**
 * Verifica si un código de zona está programado para una fecha específica
 * utilizando un conjunto de reglas.
 */
function isZoneScheduledForDate(zoneCode: string, date: Date): boolean {
  if (!zoneCode || zoneCode.trim() === '') return false;
  // Iterar sobre las reglas; si alguna coincide, está programado.
  for (const rule of zoneSchedulingRules) {
    if (rule.matches(zoneCode, date)) {
      return true;
    }
  }
  return false; // Ninguna regla coincidió
}


// --- Lógica de Recalculo de Visitas ---

/**
 * Verifica si es necesario recalcular las visitas (si es un nuevo día).
 */
async function shouldRecalculateVisits(): Promise<boolean> {
  try {
    const lastDate = await AsyncStorage.getItem(LAST_VISIT_GENERATION_DATE_KEY);
    const today = getLocalDateString(new Date());

    console.log('Visitas: Última fecha de generación:', lastDate, 'Hoy:', today);

    if (lastDate !== today) {
      await AsyncStorage.setItem(LAST_VISIT_GENERATION_DATE_KEY, today);
      return true;
    }
    return false;
  } catch (e: any) {
    console.error('Visitas: Error verificando última fecha de generación:', e.message);
    return true; // En caso de error, es más seguro recalcular.
  }
}

/**
 * Obtiene las frecuencias de un tercero de forma segura.
 */
function getTerceroFrequencies(tercero: ITerceros): string[] {
  const freqs: (string | undefined)[] = [
    tercero.frecuencia, (tercero as any).frecuencia_1, // Mantener alias por retrocompatibilidad
    tercero.frecuencia2, (tercero as any).frecuencia_2,
    tercero.frecuencia3, (tercero as any).frecuencia_3,
  ];
  // Filtrar undefined, null, o strings vacíos, y eliminar duplicados
  return [...new Set(freqs.filter(f => f && f.trim() !== ''))] as string[];
}


/**
 * Genera visitas para un conjunto de terceros en las fechas de hoy y mañana.
 * No guarda las visitas en la base de datos, solo las retorna.
 */
export async function generatePotentialVisits(
  allTerceros?: ITerceros[],
): Promise<IVisita[]> {
  const potentialVisits: IVisita[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const datesToCheck = [
    { dateObj: today, dateStr: getLocalDateString(today) },
    { dateObj: tomorrow, dateStr: getLocalDateString(tomorrow) },
  ];

  console.log('Visitas: Generando para fechas:', datesToCheck.map(d => d.dateStr).join(', '));

  try {
    const tercerosToProcess = allTerceros || (await tercerosService.getAllTerceros());
    if (!tercerosToProcess || tercerosToProcess.length === 0) {
      console.log('Visitas: No hay terceros para procesar.');
      return [];
    }

    // Optimización: Obtener solo visitas existentes para hoy y mañana y crear un lookup set
    const existingVisitsToday = await visitaService.getVisitasByDate(datesToCheck[0].dateStr);
    const existingVisitsTomorrow = await visitaService.getVisitasByDate(datesToCheck[1].dateStr);
    
    const existingVisitKeys = new Set<string>();
    [...existingVisitsToday, ...existingVisitsTomorrow].forEach(visita => {
      existingVisitKeys.add(`${visita.id_tercero}-${visita.appointmentDate}`);
    });
    console.log(`Visitas: Encontradas ${existingVisitKeys.size} visitas existentes para hoy y mañana.`);


    tercerosToProcess.forEach(tercero => {
      if (!tercero || !tercero.codigo) return; // Saltar si el tercero no es válido

      const frequencies = getTerceroFrequencies(tercero);
      if (frequencies.length === 0) return; // Saltar si no tiene frecuencias

      datesToCheck.forEach(({ dateObj, dateStr }) => {
        const isScheduledForThisDate = frequencies.some(code =>
          isZoneScheduledForDate(code, dateObj),
        );

        if (isScheduledForThisDate) {
          const visitKeyInDb = `${tercero.codigo}-${dateStr}`;
          const alreadyExistsInDb = existingVisitKeys.has(visitKeyInDb);

          // También verifica si ya se añadió en esta misma ejecución (para el mismo tercero y fecha)
          const alreadyExistsInCurrentBatch = potentialVisits.some(
            v => v.id_tercero === tercero.codigo && v.appointmentDate === dateStr,
          );

          if (!alreadyExistsInDb && !alreadyExistsInCurrentBatch) {
            potentialVisits.push({
              // id_visita: uuid.v4(), // Si necesitas un ID temporal antes de guardar en BD
              client: tercero.nombre,
              adress: tercero.direcc || 'Dirección no especificada',
              status: '2', // '2' para Pendiente
              observation: '', // Observación inicial vacía
              saleValue: 0,
              appointmentDate: dateStr,
              location: {
                latitude: tercero.latitude || '',
                longitude: tercero.longitude || '',
              },
              id_tercero: tercero.codigo,
              zona: tercero.zona || '',
              ruta: tercero.ruta || '',
              // Guardar la primera frecuencia que coincidió, o todas si es necesario
              frecuencia: frequencies[0], 
              // frecuencia_2: frequencies[1] || '', // Opcional
              // frecuencia_3: frequencies[2] || '', // Opcional
              vendedor: tercero.vendedor || '',
            });
          }
        }
      });
    });
  } catch (e: any) {
    console.error('Visitas: Error al generar visitas potenciales:', e.message);
  }
  console.log(`Visitas: Generadas ${potentialVisits.length} visitas potenciales.`);
  return potentialVisits;
}

/**
 * Recalcula y guarda las visitas si es un nuevo día.
 * Devuelve las visitas generadas (nuevas) o un array vacío si no se recalculó.
 */
export async function recalculateAndSaveVisitsIfNeeded(): Promise<IVisita[]> {
  try {
    const shouldRecalculate = await shouldRecalculateVisits();
    if (shouldRecalculate) {
      console.log('Visitas: Recalculando visitas para el nuevo día...');
      const newPotentialVisits = await generatePotentialVisits(); // Siempre genera para todos los terceros

      if (newPotentialVisits.length > 0) {
        // Aquí es donde realmente guardas las visitas en la base de datos
        // Asumo que visitaService.createBulkVisits o similar existe y maneja duplicados
        // o que generatePotentialVisits ya los filtró contra la BD.
        // Por ahora, la lógica de generatePotentialVisits ya filtra duplicados de BD.
        
        // Ejemplo de cómo podrías guardarlas una por una (o mejor, en lote)
        const savedVisits: IVisita[] = [];
        for (const visita of newPotentialVisits) {
            try {
                // Asumimos que createVisita devuelve la visita guardada con su ID de BD
                const saved = await visitaService.createVisita(visita); 
                if(saved) savedVisits.push(saved as IVisita); // Asegúrate que 'saved' sea del tipo IVisita
            } catch (saveError: any) {
                console.error(`Visitas: Error guardando visita para ${visita.id_tercero} en ${visita.appointmentDate}:`, saveError.message);
            }
        }
        console.log(`Visitas: Guardadas ${savedVisits.length} nuevas visitas en la BD.`);
        return savedVisits; 
      }
      return [];
    } else {
      console.log('Visitas: No es necesario recalcular hoy.');
      return [];
    }
  } catch (error: any) {
    console.error('Visitas: Error al recalcular visitas:', error.message);
    return [];
  }
}