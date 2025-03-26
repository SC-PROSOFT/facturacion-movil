export interface IVisita {
  client: string;
  adress: string;
  status: '1' | '2' | '3'; // 1 visitado, 2 sin visitar, 3 visitado y no estaba
  observation: string;
  saleValue: number;
  appointmentDate: string;
  location: {
    latitude: string;
    longitude: string;
  };

  id_tercero: string;
  zona: string;
  ruta: string;
  frecuencia: string;
  frecuencia_2?: string;
  frecuencia_3?: string;
}

export interface IFrecuencia {
  tipo: string;
  zona: string;
  nombre: string;
}

export interface IRuta {
  tipo: string;
  zona: string;
  nombre: string;
}

export interface IZona {
  tipo: string;
  zona: string;
  nombre: string;
}
