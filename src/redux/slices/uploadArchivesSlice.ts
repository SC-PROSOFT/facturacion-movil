import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface UploadArchivesState {
  isShowUploadArchives: boolean;
}

const initialState: UploadArchivesState = {
  isShowUploadArchives: false,
};

const uploadArchivesSlice = createSlice({
  name: 'uploadArchives',
  initialState,
  reducers: {
    setIsShowUploadArchives(state, action: PayloadAction<boolean>) {
      state.isShowUploadArchives = action.payload;
    },
  },
});

export const {setIsShowUploadArchives} = uploadArchivesSlice.actions;

export default uploadArchivesSlice.reducer;