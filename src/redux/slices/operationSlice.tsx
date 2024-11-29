import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/* types */
import {IOperation} from '../../common/types';

interface OperationState {
  objOperation: IOperation;
}

const initialState: OperationState = {
  objOperation: {
    tipo_operacion: 'factura',
    fecha: '',
    hora: '',
    fechaTimestampUnix: 0,
    almacen: '',
    operador: {
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
    tercero: {
      codigo: '',
      nombre: '',
      direcc: '',
      tel: '',
      vendedor: '',
      plazo: 0,
      f_pago: '01', // 01 contado, 02 credito
      ex_iva: 'N', // S = true, N = false
      clasificacion: '',
    },
    articulosAdded: [],
    formaPago: '01', // 01 contado, 02 credito
    fechaVencimiento: '',
    valorPedido: 0,
    observaciones: '',
    ubicacion: {
      latitud: '',
      longitud: '',
    },
    guardadoEnServer: 'N',
    sincronizado: 'N',
  },
};

export const operationSlice = createSlice({
  name: 'operation',
  initialState,
  reducers: {
    setObjOperation: (state, action: PayloadAction<IOperation>) => {
      state.objOperation = action.payload;
    },
  },
});

export const {setObjOperation} = operationSlice.actions;

export default operationSlice.reducer;
