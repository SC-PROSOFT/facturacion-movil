import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IVisita} from '../../common/types';

interface VisitasState {
  arrVisita: IVisita[];
}

const initialState: VisitasState = {
  arrVisita: [],
};

export const visitasSlice = createSlice({
  name: 'visitas',
  initialState,
  reducers: {
    setArrVisita: (state, action: PayloadAction<IVisita[]>) => {
      state.arrVisita = action.payload;
    },
  },
});

export const {setArrVisita} = visitasSlice.actions;

export default visitasSlice.reducer;
