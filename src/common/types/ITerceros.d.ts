export interface ITerceros {
  codigo: string;
  nombre: string;
  direcc: string;
  tel: string;
  vendedor: string;
  plazo: number;
  f_pago: '01' | '02'; // 01 contado, 02 credito
  ex_iva: 'S' | 'N'; // S = true, N = false
  clasificacion: string;
}
