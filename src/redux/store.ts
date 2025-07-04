import {configureStore} from '@reduxjs/toolkit';

import operatorReducer from './slices/operatorSlice';
import infoAlertReducer from './slices/infoAlertSlice';
import decisionAlertReducer from './slices/decisionAlertSlice';
import normalMenuReducer from './slices/normalMenuSlice';
import simpleTabButtonsReducer from './slices/simpleTabButtonsSlice';
import configReducer from './slices/configSlice';
import operadoresFinderReducer from './slices/operadoresFinderSlice';
import tercerosFinderReducer from './slices/tercerosFinderSlice';
import pedidosFinderReducer from './slices/pedidosFinderSlice';
import facturasFinderReducer from './slices/facturasFinderSlice';
import carteraFinderReducer from './slices/carteraFinderSlice';
import almacenesFinderReducer from './slices/almacenesFinderSlice';
import syncReducer from './slices/syncSlice';
import carteraPopupReducer from './slices/carteraPopupSlice';
import productReducer from './slices/productSlice';
import operationReducer from './slices/operationSlice';
import frecuenciaFinderReducer from './slices/frecuenciasFinderSlice';
import uploadArchivesReducer from './slices/uploadArchivesSlice';
import encuestaReducer from './slices/encuestaSlice';
import filesReducer from './slices/filesSlice';
import zonaFinderReducer from './slices/zonaFinderSilce';
import rutaFinderReducer from './slices/rutaFinderSlice';
import visitasReducer from './slices/visitasSlice';

export const store = configureStore({
  reducer: {
    operator: operatorReducer,
    infoAlert: infoAlertReducer,
    decisionAlert: decisionAlertReducer,
    normalMenu: normalMenuReducer,
    simpleTabButtons: simpleTabButtonsReducer,
    config: configReducer,
    operadoresFinder: operadoresFinderReducer,
    tercerosFinder: tercerosFinderReducer,
    pedidosFinder: pedidosFinderReducer,
    facturasFinder: facturasFinderReducer,
    carteraFinder: carteraFinderReducer,
    almacenesFinder: almacenesFinderReducer,
    sync: syncReducer,
    carteraPopup: carteraPopupReducer,
    product: productReducer,
    operation: operationReducer,
    frecuenciaFinder: frecuenciaFinderReducer,
    uploadArchives: uploadArchivesReducer,
    encuesta: encuestaReducer,
    files: filesReducer, // Añade el reducer aquí
    zonaFinder: zonaFinderReducer,
    rutaFinder: rutaFinderReducer,
    visitas: visitasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
