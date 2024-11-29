import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IVisita} from '../../common/types';

interface Visita {
  objVisita: IVisita;
}

const initialState: Visita = {
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
    id_tercero: '',
  },
};

export const visitaSlice = createSlice({
  name: 'visita',
  initialState,
  reducers: {
    setObjVisita: (state, action: PayloadAction<IVisita>) => {
      state.objVisita = action.payload;
    },
  },
});

export const {setObjVisita} = visitaSlice.actions;

export default visitaSlice.reducer;
