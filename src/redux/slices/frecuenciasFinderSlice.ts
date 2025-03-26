import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IFrecuencia} from '../../common/types/IVisitas';

interface FrecuenciaFinderState {
  isShowFrecuenciaFinder: boolean;
  arrFrecuencia: IFrecuencia[]; // Cambiado a IFrecuencia[]
}

const initialState: FrecuenciaFinderState = {
  isShowFrecuenciaFinder: false,
  arrFrecuencia: [], // Iniciaslizado como un arreglo vacío de IFrecuencia
};

const frecuenciaFinderSlice = createSlice({
  name: 'frecuenciaFinder',
  initialState,
  reducers: {
    setIsShowFrecuenciaFinder(state, action: PayloadAction<boolean>) {
      state.isShowFrecuenciaFinder = action.payload;
    },
    setArrFrecuencia(state, action: PayloadAction<IFrecuencia[]>) {
      // Cambiado a IFrecuencia[]
      state.arrFrecuencia = action.payload;
    },
  },
});

export const {setIsShowFrecuenciaFinder, setArrFrecuencia} =
  frecuenciaFinderSlice.actions;

export default frecuenciaFinderSlice.reducer;
