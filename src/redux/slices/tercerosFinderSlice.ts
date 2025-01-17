import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IOperation, IOperationDb, ITerceros} from '../../common/types';

interface TercerosFinder {
  isShowTercerosFinder: boolean;
  objTercero: ITerceros;
  arrFactura: IOperation[];
  arrPedido: IOperation[];
  intCartera: number;
}

const initialState: TercerosFinder = {
  isShowTercerosFinder: false,
  objTercero: {
    codigo: '',
    nombre: '',
    direcc: '',
    tel: '',
    vendedor: '',
    plazo: 0,
    f_pago: '01',
    ex_iva: 'N',
    clasificacion: '',

    tipo: 'CC',
    departamento: '',
    ciudad: '',
    barrio: '',
    email: '',
    reteica: 'N',
    frecuencia: 'semanal',
    zona: '',
    ruta: '',
    latitude: '',
    longitude: '',
    rut_path: '',
    camaracomercio_path: '',
  },
  arrFactura: [],
  arrPedido: [],
  intCartera: 0,
};

export const tercerosFinderSlice = createSlice({
  name: 'tercerosFinder',
  initialState,
  reducers: {
    setIsShowTercerosFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowTercerosFinder = action.payload;
    },
    setObjTercero: (state, action: PayloadAction<ITerceros>) => {
      state.objTercero = action.payload;
    },
    setArrFactura: (state, action: PayloadAction<IOperation[]>) => {
      state.arrFactura = action.payload;
    },
    setArrPedido: (state, action: PayloadAction<IOperation[]>) => {
      state.arrPedido = action.payload;
    },
    setIntCartera: (state, action: PayloadAction<number>) => {
      state.intCartera = action.payload;
    },
  },
});

export const {
  setIsShowTercerosFinder,
  setObjTercero,
  setArrFactura,
  setArrPedido,
  setIntCartera,
} = tercerosFinderSlice.actions;

export default tercerosFinderSlice.reducer;
