import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface MenuState {
  isShowMenu: boolean;
}

const initialState: MenuState = {
  isShowMenu: false,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setIsShowMenu: (state, action: PayloadAction<boolean>) => {
      state.isShowMenu = action.payload;
    },
  },
});

export const {setIsShowMenu} = menuSlice.actions;

export default menuSlice.reducer;
