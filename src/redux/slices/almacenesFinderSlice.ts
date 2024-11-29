import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AlmacenesFinder {
  isShowAlmacenesFinder: boolean;
}

const initialState: AlmacenesFinder = {
  isShowAlmacenesFinder: false,
};

export const almacenesFinderSlice = createSlice({
  name: 'almacenesFinder',
  initialState,
  reducers: {
    setIsShowAlmacenesFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowAlmacenesFinder = action.payload;
    },
  },
});

export const {setIsShowAlmacenesFinder} = almacenesFinderSlice.actions;

export default almacenesFinderSlice.reducer;
