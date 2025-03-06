import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface FrecuenciaFinderState {
  isShowFrecuenciaFinder: boolean;
}

const initialState: FrecuenciaFinderState = {
  isShowFrecuenciaFinder: false,
};

const frecuenciaFinderSlice = createSlice({
  name: 'frecuenciaFinder',
  initialState,
  reducers: {
    setIsShowFrecuenciaFinder(state, action: PayloadAction<boolean>) {
      state.isShowFrecuenciaFinder = action.payload;
    },
  },
});

export const {setIsShowFrecuenciaFinder} = frecuenciaFinderSlice.actions;

export default frecuenciaFinderSlice.reducer;
