export interface IVisita {
  id_visita: number;
  client: string;
  adress: string;
  status: '1' | '2' | '3'; 
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
  vendedor: string;
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
