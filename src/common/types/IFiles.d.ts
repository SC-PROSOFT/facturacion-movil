type sincronizado = 'N' | 'S'; // 0 = No sincronizado, 1 = Sincronizado
export interface IFiles {
  codigo: string;
  nombre: string;
  tipo: string;
  files?: DocumentPickerResponse[];
  sincronizado: sincronizado; // 0 = No sincronizado, 1 = Sincronizado
}
