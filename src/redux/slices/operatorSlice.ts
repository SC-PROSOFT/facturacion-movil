import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/* types */
import {IOperadores} from '../../common/types';

interface OperatorState {
  isSignedIn: boolean;
  isAdmin: boolean;
  objOperator: IOperadores;
}

const initialState: OperatorState = {
  isSignedIn: false,
  isAdmin: false,
  objOperator: {
    codigo: '',
    descripcion: '',
    clave: '',
    id: '',
    cod_vendedor: '',
    sucursal: '',
    nro_pedido: 0,
    nro_factura: 0,
    auto_dian: '',
    fecha_ini: '',
    fecha_fin: '',
    nro_ini: '',
    nro_fin: '',
    prefijo: '',
    vigencia: '',
  },
};

export const operatorSlice = createSlice({
  name: 'Operator',
  initialState,
  reducers: {
    setIsSignedIn: (state, action: PayloadAction<boolean>) => {
      state.isSignedIn = action.payload;
    },
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setObjOperator: (state, action: PayloadAction<IOperadores>) => {
      state.objOperator = action.payload;
    },
  },
});

export const {setIsSignedIn, setIsAdmin, setObjOperator} =
  operatorSlice.actions;

export default operatorSlice.reducer;
