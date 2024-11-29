import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CarteraFinder {
  isShowCarteraFinder: boolean;
}

const initialState: CarteraFinder = {
  isShowCarteraFinder: false,
};

export const carteraFinderSlice = createSlice({
  name: 'carteraFinder',
  initialState,
  reducers: {
    setIsShowCarteraFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowCarteraFinder = action.payload;
    },
  },
});

export const {setIsShowCarteraFinder} = carteraFinderSlice.actions;

export default carteraFinderSlice.reducer;
