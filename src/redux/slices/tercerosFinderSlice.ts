import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IOperation, ITerceros} from '../../common/types';

interface TercerosFinder {
  isShowTercerosFinder: boolean;
  objTercero: ITerceros;
  arrFactura: IOperation[];
  arrPedido: IOperation[];
  intCartera: number;
  tercerosCreados: ITerceros[];
  tercerosEditados: ITerceros[];
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
    frecuencia: '',
    frecuencia2: '',
    frecuencia3: '',
    zona: '',
    ruta: '',
    latitude: '',
    longitude: '',
    rut_pdf: '',
    dv: '1',
    camcom_pdf: '',
    di_pdf: '',
  },
  arrFactura: [],
  arrPedido: [],
  intCartera: 0,
  tercerosCreados: [],
  tercerosEditados: [],
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
    addTerceroCreado: (state, action: PayloadAction<ITerceros>) => {
      state.tercerosCreados.push(action.payload);
    },
    addTerceroEditado: (state, action: PayloadAction<ITerceros>) => {
      state.tercerosEditados.push(action.payload);
    },
  },
});

export const {
  setIsShowTercerosFinder,
  setObjTercero,
  setArrFactura,
  setArrPedido,
  setIntCartera,
  addTerceroCreado,
  addTerceroEditado,
} = tercerosFinderSlice.actions;

export default tercerosFinderSlice.reducer;
