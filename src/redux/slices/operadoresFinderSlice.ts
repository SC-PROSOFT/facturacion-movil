import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface OperadoresFinder {
  isShowOperadoresFinder: boolean;
}

const initialState: OperadoresFinder = {
  isShowOperadoresFinder: false,
};

export const operadoresFinderSlice = createSlice({
  name: 'operadoresFinder',
  initialState,
  reducers: {
    setIsShowOperadoresFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowOperadoresFinder = action.payload;
    },
  },
});

export const {setIsShowOperadoresFinder} = operadoresFinderSlice.actions;

export default operadoresFinderSlice.reducer;
