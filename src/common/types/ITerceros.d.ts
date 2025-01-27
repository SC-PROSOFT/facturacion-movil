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

  /* ADICIONALES */
  tipo?: 'CC' | 'TI';
  departamento: string;
  ciudad: string;
  barrio: string;
  email: string;
  reteica: 'S' | 'N'; // S = true, N = false
  frecuencia: 'semanal' | 'mensual';
  zona: string;
  ruta: string;
  latitude: string;
  longitude: string;
  rut_path: string;
  camaracomercio_path: string;
}
