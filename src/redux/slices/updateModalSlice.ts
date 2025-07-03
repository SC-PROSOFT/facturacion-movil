import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface UpdateModalState {
  visible: boolean;
  updateInfo: {
    version: number;
    url: string;
  } | null;
}

const initialState: UpdateModalState = {
  visible: false,
  updateInfo: null,
};


const updateModalSlice = createSlice({
  name: 'updateModal',
  initialState,
  reducers: {
    showUpdateModal(state, action: PayloadAction<{version: number; url: string}>) {
      state.visible = true;
      state.updateInfo = action.payload;
    },
    hideUpdateModal(state) {
      state.visible = false;
      state.updateInfo = null;
    },
  },
});

export const {showUpdateModal, hideUpdateModal} = updateModalSlice.actions;
export default updateModalSlice.reducer;