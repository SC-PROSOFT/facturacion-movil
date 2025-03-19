import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IEncuesta} from '../../common/types';

interface EncuestaState {
  isShowEncuesta: boolean;
  objEncuesta: IEncuesta | null;
}

const initialState: EncuestaState = {
  isShowEncuesta: true,
  objEncuesta:
    {
      codigo: '',
      nro_preguntas: '',
      preguntas: [],
      activar: '',
      admin_creacion: '',
      fecha_creacion: '',
      admin_modificacion: '',
      fecha_modificacion: '',
    } || null,
};

export const encuestaSlice = createSlice({
  name: 'Encuesta',
  initialState,
  reducers: {
    setIsShowEncuesta(state, action: PayloadAction<boolean>) {
      state.isShowEncuesta = action.payload;
    },
    setObjEncuesta(state, action: PayloadAction<IEncuesta | null>) {
      state.objEncuesta = action.payload;
    },
  },
});

export const {setIsShowEncuesta, setObjEncuesta} = encuestaSlice.actions;
export default encuestaSlice.reducer;
