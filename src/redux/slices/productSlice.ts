import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IProductAdded, IProduct} from '../../common/types';

interface ProductState {
  intIndexProduct: number;
  objProduct: IProduct;
  objProductAdded: IProductAdded;
  arrProductAdded: IProductAdded[];
  isShowProductFinder: boolean;
  isShowProductSheet: boolean;
  isShowProductSheetEdit: boolean;
}

const initialState: ProductState = {
  intIndexProduct: 0,
  objProduct: {
    codigo: '',
    descrip: '',
    ref: '',
    saldo: '',
    unidad: '',
    peso: '',
    iva: '',
    iva_usu: '',
    ipto_consumo: '',
    vlr_ipto_consumo: '',
    vlr1: '',
    vlr2: '',
    vlr3: '',
    vlr4: '',
    vlr5: '',
    vlr6: '',
    vlr7: '',
    vlr8: '',
    vlr9: '',
    vlr10: '',
    vlr11: '',
    vlr12: '',
    vlr13: '',
    vlr14: '',
    vlr15: '',
  },
  objProductAdded: {
    codigo: '',
    descrip: '',
    saldo: 0,
    descuento: 0,
    cantidad: 0,
    valorUnidad: 0,
    valorDescuento: 0,
    valorBase: 0,
    valorIva: 0,
    valorTotal: 0,
    instalado: 'N',
    detalles: '',
    index_lista: 0,
  },
  arrProductAdded: [],
  isShowProductFinder: false,
  isShowProductSheet: false,
  isShowProductSheetEdit: false,
};

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setArrProductAdded: (state, action: PayloadAction<IProductAdded[]>) => {
      state.arrProductAdded = action.payload;
    },
    setObjProduct: (state, action: PayloadAction<IProduct>) => {
      state.objProduct = action.payload;
    },
    setIsShowProductFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowProductFinder = action.payload;
    },
    setIsShowProductSheet: (state, action: PayloadAction<boolean>) => {
      state.isShowProductSheet = action.payload;
    },
    setIsShowProductSheetEdit: (state, action: PayloadAction<boolean>) => {
      state.isShowProductSheetEdit = action.payload;
    },
    setObjProductAdded: (state, action: PayloadAction<IProductAdded>) => {
      state.objProductAdded = action.payload;
    },
    setIntIndexProduct: (state, action: PayloadAction<number>) => {
      state.intIndexProduct = action.payload;
    },
  },
});

export const {
  setArrProductAdded,
  setObjProduct,
  setIsShowProductFinder,
  setIsShowProductSheet,
  setIsShowProductSheetEdit,
  setObjProductAdded,
  setIntIndexProduct,
} = productSlice.actions;

export default productSlice.reducer;
