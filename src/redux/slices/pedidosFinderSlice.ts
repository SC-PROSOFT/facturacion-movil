import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IOperation} from '../../common/types';

interface PedidosFinder {
  isShowPedidosFinder: boolean;
  objPedido: IOperation;
}

const initialState: PedidosFinder = {
  isShowPedidosFinder: false,
  objPedido: {
    tipo_operacion: 'pedido',
    fecha: '',
    hora: '',
    fechaTimestampUnix: 0, // fecha en timestamp Unix
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
      f_pago: '01',
      ex_iva: 'N',
      clasificacion: '',
    },
    articulosAdded: [],

    formaPago: '01',
    fechaVencimiento: '',
    valorPedido: 0,
    observaciones: '',
    ubicacion: {
      latitud: '',
      longitud: '',
    }, // Puede cambiar el tipo de dato dependiendo de como llegue la geolocalizacion
    guardadoEnServer: 'N',
    sincronizado: 'N',
  },
};

export const pedidosFinderSlice = createSlice({
  name: 'pedidosFinder',
  initialState,
  reducers: {
    setIsShowPedidosFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowPedidosFinder = action.payload;
    },
    setObjPedido: (state, action: PayloadAction<IOperation>) => {
      state.objPedido = action.payload;
    },
  },
});

export const {setIsShowPedidosFinder, setObjPedido} =
  pedidosFinderSlice.actions;

export default pedidosFinderSlice.reducer;
