import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type StrTouchedButton = 'config' | 'sync';

interface SimpleTabButtonsState {
  strTouchedButton: StrTouchedButton;
}

const initialState: SimpleTabButtonsState = {
  strTouchedButton: 'config',
};

export const simpleTabButtonsSlice = createSlice({
  name: 'simpleTabButtons',
  initialState,
  reducers: {
    setStrTouchedButton: (state, action: PayloadAction<StrTouchedButton>) => {
      state.strTouchedButton = action.payload;
    },
  },
});

export const {setStrTouchedButton} = simpleTabButtonsSlice.actions;

export default simpleTabButtonsSlice.reducer;
