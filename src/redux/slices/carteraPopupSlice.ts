import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ICartera} from '../../common/types';

interface CarteraPopupState {
  isShowCarteraPopup: boolean;
  arrCarteraPopup: ICartera[];
}

const initialState: CarteraPopupState = {
  isShowCarteraPopup: false,
  arrCarteraPopup: [],
};

export const carteraPopupSlice = createSlice({
  name: 'carteraPopup',
  initialState,
  reducers: {
    setIsShowCarteraPopup: (state, action: PayloadAction<boolean>) => {
      state.isShowCarteraPopup = action.payload;
    },
    setArrCarteraPopup: (state, action: PayloadAction<ICartera[]>) => {
      state.arrCarteraPopup = action.payload;
    },
  },
});

export const {setIsShowCarteraPopup, setArrCarteraPopup} =
  carteraPopupSlice.actions;

export default carteraPopupSlice.reducer;
