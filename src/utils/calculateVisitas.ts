import {ITerceros, IVisita} from '../common/types';

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

function isZoneScheduledForDate(zoneCode: string, date: Date): boolean {
  const day = date.getDay(); // 0: Domingo, 1: Lunes, 2: Martes, ...
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
    // Convertir el dígito de día (donde 7 representa domingo) a la notación de JavaScript (0 para domingo)
    const codeDay = parseInt(zoneCode.charAt(1), 10) % 7;
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

  // Si no se reconoce el código, se retorna false o se maneja según la lógica del negocio.
  return false;
}

// Función para generar las visitas para el día actual y el siguiente.
export function generateVisits(terceros: ITerceros[]): IVisita[] {
  const visits: IVisita[] = [];
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const datesToCheck = [today, tomorrow];

  terceros.forEach(tercero => {
    // Normalizamos las frecuencias considerando ambas nomenclaturas:
    const frecuencia1 =
      tercero.frecuencia || (tercero as any).frecuencia_1 || '';
    const frecuencia2 =
      tercero.frecuencia2 || (tercero as any).frecuencia_2 || '';
    const frecuencia3 =
      tercero.frecuencia3 || (tercero as any).frecuencia_3 || '';

    datesToCheck.forEach(date => {
      // Filtramos para asegurarnos de que solo se procesen los códigos definidos y no vacíos
      const zoneCodes = [
        tercero.zona,
        frecuencia1,
        frecuencia2,
        frecuencia3,
      ].filter(code => code !== undefined && code !== null && code !== '');

      const isScheduled = zoneCodes.some(zoneCode =>
        isZoneScheduledForDate(zoneCode, date),
      );

      if (isScheduled) {
        const visita: IVisita = {
          client: tercero.nombre,
          adress: tercero.direcc,
          status: '2', // Sin visitar
          observation: '',
          saleValue: 0,
          appointmentDate: date.toISOString().split('T')[0],
          location: {
            latitude: tercero.latitude,
            longitude: tercero.longitude,
          },
          id_tercero: tercero.codigo,
          zona: tercero.zona,
          ruta: tercero.ruta,
          frecuencia: frecuencia1,
          frecuencia_2: frecuencia2,
          frecuencia_3: frecuencia3,
          // Aquí usamos la frecuencia normalizada
        };

        visits.push(visita);
      }
    });
  });

  return visits;
}
