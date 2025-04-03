import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IVisita} from '../../common/types';

interface VisitasState {
  arrVisita: IVisita[];
  objVisita: IVisita;
}

const initialState: VisitasState = {
  arrVisita: [],
  objVisita: {
    client: '',
    adress: '',
    status: '2',
    observation: '',
    saleValue: 0,
    appointmentDate: '',
    location: {
      latitude: '',
      longitude: '',
    },
    zona: '',
    ruta: '',
    frecuencia: '',
    id_tercero: '',
    frecuencia_2: '',
    frecuencia_3: '',
    vendedor: '',
  },
};

export const visitasSlice = createSlice({
  name: 'visitas',
  initialState,
  reducers: {
    setArrVisita: (state, action: PayloadAction<IVisita[]>) => {
      state.arrVisita = action.payload;
    },
    setObjVisita: (state, action: PayloadAction<IVisita>) => {
      state.objVisita = action.payload;
    },
  },
});

export const {setArrVisita} = visitasSlice.actions;
export const {setObjVisita} = visitasSlice.actions;

export default visitasSlice.reducer;
