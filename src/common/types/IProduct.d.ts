export interface IProduct {
  codigo: string;
  descrip: string;
  ref: string;
  saldo: string;
  unidad: string;
  peso: string;
  iva: string;
  iva_usu: string;
  ipto_consumo: string;
  vlr_ipto_consumo: string;
  vlr1: string;
  vlr2: string;
  vlr3: string;
  vlr4: string;
  vlr5: string;
  vlr6: string;
  vlr7: string;
  vlr8: string;
  vlr9: string;
  vlr10: string;
  vlr11: string;
  vlr12: string;
  vlr13: string;
  vlr14: string;
  vlr15: string;
}

export interface IProductAdded {
  codigo: string;
  descrip: string; // nombre del producto
  saldo: number; // cantidad de unidades disponibles del producto
  descuento: number;
  cantidad: number;
  peso: number; // peso del producto
  valorUnidad: number;
  valorDescuento: number;
  valorBase: number;
  valorIva: number;
  valorTotal: number;
  instalado: 'S' | 'N';
  detalles: string;
  index_lista: number; // indice de una lista para saber el precio. [Power cobol lo requiere].
}
