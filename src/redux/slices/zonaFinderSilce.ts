import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IZona} from '../../common/types';

interface ZonaFinderState {
  isShowZonaFinder: boolean;
  arrZona: IZona[];
}

const initialState: ZonaFinderState = {
  isShowZonaFinder: false,
  arrZona: [],
};

export const zonaFinderSlice = createSlice({
  name: 'zonaFinder',
  initialState,
  reducers: {
    setIsShowZonaFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowZonaFinder = action.payload;
    },
    setArrZona: (state, action: PayloadAction<IZona[]>) => {
      state.arrZona = action.payload;
    },
  },
});

export const {setIsShowZonaFinder, setArrZona} = zonaFinderSlice.actions;

export default zonaFinderSlice.reducer;
