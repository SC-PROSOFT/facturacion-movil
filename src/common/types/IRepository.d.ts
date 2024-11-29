export interface IRepository<T> {
  /**
   * Busca un elemento en el repositorio por un atributo o campo específico.
   * @param attributeName El nombre del atributo o campo por el cual se va a realizar la búsqueda.
   * @param attributeValue El valor del atributo que se está buscando.
   * @returns Una promesa que resuelve en el elemento encontrado o nulo si no se encuentra.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  getByAttribute?(attributeName: string, attributeValue: any): Promise<T | T[]>;
  // Implementación: Realiza la búsqueda en el repositorio por attributeName y attributeValue.
  // Retorna el elemento encontrado o nulo si no se encuentra.

  /**
   * Recupera todos los elementos del repositorio.
   * @returns Una promesa que resuelve en un array de elementos o un elemento único.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  getAll?(): Promise<T | T[]>;

  /**
   * Recupera todos los elementos desde una fuente de datos externa a través de una API.
   * @param direccionIp La dirección IP de la API desde la cual se van a recuperar los elementos.
   * @param puerto El puerto de la API a través del cual se realizará la solicitud.
   * @returns Una promesa que resuelve en un array de elementos o un elemento único obtenido desde la API.
   * @throws {Error} Si la solicitud a la API no se puede completar o si hay un error en la respuesta.
   * @template T El tipo de entidad que se obtiene de la API.
   */
  getAllByApi?(direccionIp: string, puerto: string): Promise<T | T[]>;

  /**
   * Obtiene la cantidad de elementos de una tabla
   * @returns una promesa que resuelve un string con la cantidad de elementos de una tabla
   */
  getQuantity?(): Promise<string>;

  /**
   * Crea uno o varios elementos en el repositorio.
   * @param item El elemento o elementos que se van a crear.
   * @returns Una promesa que resuelve en `true` si la creación fue exitosa, o `false` si no se pudo crear.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  create?(item: T): Promise<boolean>;

  /**
   * Actualiza un elemento en el repositorio por su ID.
   * @param id El ID del elemento que se va a actualizar.
   * @param item El elemento actualizado.
   * @returns Una promesa que resuelve en `true` si la actualización fue exitosa, o `false` si no se pudo actualizar.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  update?(id: string, item: T): Promise<boolean>;

  /**
   * Elimina un elemento en el repositorio por su ID.
   * @param id El ID del elemento que se va a eliminar.
   * @returns Una promesa que resuelve en `true` si la eliminación fue exitosa, o `false` si no se pudo eliminar.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  delete?(id: string): Promise<boolean>;

  /**
   * Crea una tabla o estructura de datos en el repositorio (si es aplicable).
   * @returns Una promesa que resuelve en `true` si la creación de la tabla fue exitosa, o `false` si no se pudo crear.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  createTable?(): Promise<boolean>;

  /**
   * Elimina una tabla o estructura de datos en el repositorio (si es aplicable).
   * @returns Una promesa que resuelve en `true` si la eliminación de la tabla fue exitosa, o `false` si no se pudo eliminar.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  deleteTable?(): Promise<boolean>;

  /**
   * Llena una tabla o estructura de datos en el repositorio con datos proporcionados.
   * @param data Los datos que se van a insertar en la tabla.
   * @returns Una promesa que resuelve en `true` si el llenado de la tabla fue exitoso, o `false` si no se pudo llenar.
   * @template T El tipo de entidad que se almacena en el repositorio.
   */
  fillTable?(data: T[]): Promise<boolean>;
}
