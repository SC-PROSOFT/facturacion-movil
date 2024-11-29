import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/* types */
import {IOperadores, IAlmacen, IProduct, ICartera} from '../../common/types';

interface SyncState {
  arrOperadores: IOperadores[];
  arrArticulos: IProduct[];
  arrAlmacenes: IAlmacen[];
  arrCartera: ICartera[];
}

const initialState: SyncState = {
  arrOperadores: [],
  arrArticulos: [],
  arrAlmacenes: [],
  arrCartera: [],
};

export const syncSlice = createSlice({
  name: 'syncSlice',
  initialState,
  reducers: {
    setArrOperadores: (state, action: PayloadAction<IOperadores[]>) => {
      state.arrOperadores = action.payload;
    },
    setArrArticulos: (state, action: PayloadAction<IProduct[]>) => {
      state.arrArticulos = action.payload;
    },
    setArrAlmacenes: (state, action: PayloadAction<IAlmacen[]>) => {
      state.arrAlmacenes = action.payload;
    },
    setArrCartera: (state, action: PayloadAction<ICartera[]>) => {
      state.arrCartera = action.payload;
    },
  },
});

export const {
  setArrOperadores,
  setArrArticulos,
  setArrAlmacenes,
  setArrCartera,
} = syncSlice.actions;

export default syncSlice.reducer;
