import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/* common types */
import {IConfig} from '../../common/types';

interface ConfigState {
  objConfig: IConfig;
}

const initialState: ConfigState = {
  objConfig: {
    direccionIp: '',
    puerto: '',
    facturarSinExistencias: false,
    seleccionarAlmacen: false,
    localizacionGps: false,
    filtrarTercerosPorVendedor: true,
    modificarPrecio: false,

    descargasIp: '',
    datosIp: '',
    directorioContabilidad: '',

    empresa: '',
    nit: '',
    direccion: '',
    ciudad: '',
    tarifaIva1: '',
    tarifaIva2: '',
    tarifaIva3: '',
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setObjConfig: (state, action: PayloadAction<IConfig>) => {
      state.objConfig = action.payload;
    },
  },
});

export const {setObjConfig} = configSlice.actions;

export default configSlice.reducer;
