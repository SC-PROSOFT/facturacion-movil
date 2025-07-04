type only = 'S' | 'N'; // S = true, N = false

export interface ITerceros {
  codigo: string;
  nombre: string;
  direcc: string;
  tel: string;
  vendedor: string;
  plazo: number;
  f_pago: '01' | '02'; // 01 contado, 02 credito
  ex_iva: 'S' | 'N'; // S = true, N = false, exento de iva (true: no paga, false: paga)
  clasificacion: string;
  dv: string;

  /* ADICIONALES */
  tipo?: 'CC' | 'NIT';
  departamento: string;
  ciudad: string;
  barrio: string;
  email: string;
  reteica: 'S' | 'N'; // S = true, N = false
  frecuencia: string;
  frecuencia2: string;
  frecuencia3: string;
  zona: string;
  ruta: string;
  latitude: string;
  longitude: string;
  rut_pdf: only;
  camcom_pdf: only;
  di_pdf: only;
  estado?: '1' | '2'; // 1 = Creado, 2 = Actualizado
}
