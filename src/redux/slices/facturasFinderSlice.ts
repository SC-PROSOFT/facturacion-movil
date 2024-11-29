import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IOperation} from '../../common/types';

interface FacturasFinder {
  isShowFacturasFinder: boolean;
  objFactura: IOperation;
}

const initialState: FacturasFinder = {
  isShowFacturasFinder: false,
  objFactura: {
    tipo_operacion: 'factura',
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

export const facturasFinderSlice = createSlice({
  name: 'facturasFinder',
  initialState,
  reducers: {
    setIsShowFacturasFinder: (state, action: PayloadAction<boolean>) => {
      state.isShowFacturasFinder = action.payload;
    },
    setObjFactura: (state, action: PayloadAction<IOperation>) => {
      state.objFactura = action.payload;
    },
  },
});

export const {setIsShowFacturasFinder, setObjFactura} =
  facturasFinderSlice.actions;

export default facturasFinderSlice.reducer;
