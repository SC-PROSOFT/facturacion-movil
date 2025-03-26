import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IRuta} from '../../common/types';

interface RutaFinderState {
  isShowRutaFinder: boolean;
  arrRuta: IRuta[];
}

const initialState: RutaFinderState = {
  isShowRutaFinder: false,
  arrRuta: [],
};

export const rutaFinderSlice = createSlice({
  name: 'rutaFinder',
  initialState,
  reducers: {
    setIsShowRutaFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowRutaFinder = action.payload;
    },
    setArrRuta: (state, action: PayloadAction<IRuta[]>) => {
      state.arrRuta = action.payload;
    },
  },
});

export const {setIsShowRutaFinder, setArrRuta} = rutaFinderSlice.actions;

export default rutaFinderSlice.reducer;
