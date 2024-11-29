export interface IMovimiento {
  nroInvoice: number;
  client: string;
  adress: string;
  status: '1' | '2' | '3'; // 1 visitado, 2 sin visitar, 3 visitado y no estaba
  observation: string;
  saleValue: number;
  appointmentDate: string;
  invoiced: boolean;
}
