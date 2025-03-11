import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IFiles} from '../../common/types';

interface FilesState {
  file: IFiles;
}

const initialState: FilesState = {
  file: {
    codigo: '',
    nombre: '',
    tipo: '',
    rut: false,
    cam_com: false,
    doc_id: false,
    files: [],
  },
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFile(state, action: PayloadAction<IFiles>) {
      state.file = action.payload;
    },
  },
});

export const {setFile} = filesSlice.actions;

export default filesSlice.reducer;
