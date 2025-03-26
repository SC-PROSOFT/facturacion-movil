import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type type = 'error' | 'success' | 'info';

interface infoAlertState {
  objInfoAlert: {
    visible: boolean;
    type: type;
    description: string;
  };
}

interface infoAlertAction {
  visible: boolean;
  type: type;
  description: string;
}

const initialState: infoAlertState = {
  objInfoAlert: {
    visible: false,
    type: 'success',
    description: 'Agrega una descripcion',
  },
};

export const infoAlertSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setObjInfoAlert: (state, action: PayloadAction<infoAlertAction>) => {
      state.objInfoAlert = action.payload;
    },
  },
});

export const {setObjInfoAlert} = infoAlertSlice.actions;

export default infoAlertSlice.reducer;