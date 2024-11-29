interface ErrorInfo {
  type: string;
  message: string;
}

export const errorTypes = {
  systemErrors: {
    databaseConnection: {
      type: 'error',
      message: 'No se pudo conectar a la base de datos',
    } as ErrorInfo,
    apiFailed: {
      type: 'error',
      message:
        'No hay coneccion con el servidor, comprueba que estas conectado a la red de tu empresa, la direccion IP y el puerto. Si el error persiste comunicate con Prosoft SC',
    } as ErrorInfo,
  },
} as const;

// Tipo para los errores
export type ErrorType = keyof typeof errorTypes;
export type SubErrorType<T extends ErrorType> = keyof (typeof errorTypes)[T];

// Función de utilidad para obtener mensajes de error
export function getErrorMessage<T extends ErrorType, U extends SubErrorType<T>>(
  errorType: T,
  subType: U,
): string {
  return (errorTypes[errorType][subType] as ErrorInfo).message;
}
