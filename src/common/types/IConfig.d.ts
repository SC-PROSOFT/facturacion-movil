export interface IConfig {
  direccionIp: string;
  puerto: string;
  facturarSinExistencias: boolean;
  seleccionarAlmacen: boolean;
  localizacionGps: boolean;
  filtrarTercerosPorVendedor: boolean;
  modificarPrecio: boolean;

  descargasIp: string;
  datosIp: string;
  directorioContabilidad: string;

  empresa: string;
  nit: string;
  direccion: string;
  ciudad: string;
  tarifaIva1: string;
  tarifaIva2: string;
  tarifaIva3: string;
}
