const calcularDigitoVerificacion = (numero: string): number => {
  const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let suma = 0;

  for (let i = 0; i < numero.length; i++) {
    suma += parseInt(numero[numero.length - 1 - i], 10) * pesos[i];
  }

  const residuo = suma % 11;
  return residuo > 1 ? 11 - residuo : residuo;
};

export {calcularDigitoVerificacion};
