import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IEncuesta} from '../../common/types';

interface EncuestaState {
  isShowEncuesta: boolean;
  objEncuesta: IEncuesta;
}

const initialState: EncuestaState = {
  isShowEncuesta: false,
  objEncuesta: {
    codigo: '',
    numero_preguntas: 0,
    preguntas: [],
    activar: '',
    admin_creacion: '',
    fecha_creacion: {anio: 0, mes: 0, dia: 0},
    admin_modificacion: '',
    fecha_modificacion: {anio: 0, mes: 0, dia: 0},
  },
};

export const encuestaSlice = createSlice({
  name: 'Encuesta',
  initialState,
  reducers: {
    setIsShowEncuesta(state, action: PayloadAction<boolean>) {
      state.isShowEncuesta = action.payload;
    },
    setObjEncuesta(state, action: PayloadAction<IEncuesta>) {
      state.objEncuesta = action.payload;
    },
  },
});

export const {setIsShowEncuesta, setObjEncuesta} = encuestaSlice.actions;
export default encuestaSlice.reducer;
