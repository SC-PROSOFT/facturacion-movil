import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type type = 'error' | 'success' | 'info';

interface DecisionAlertState {
  objDecisionAlert: {
    visible: boolean;
    type: type;
    description: string;
    textButton: string;
    executeFunction: string;
  };
}

interface DecisionAlertAction {
  visible: boolean;
  type: type;
  description: string;
  textButton: string;
  executeFunction: string;
}

const initialState: DecisionAlertState = {
  objDecisionAlert: {
    visible: false,
    type: 'info',
    description: 'Agrega una descripcion',
    textButton: 'intentar de nuevo',
    executeFunction: '',
  },
};

export const decisionAlertSlice = createSlice({
  name: 'decisionAlert',
  initialState,
  reducers: {
    setObjDecisionAlert: (
      state,
      action: PayloadAction<DecisionAlertAction>,
    ) => {
      state.objDecisionAlert = action.payload;
    },
  },
});

export const {setObjDecisionAlert} = decisionAlertSlice.actions;

export default decisionAlertSlice.reducer;
