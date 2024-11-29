export const formatToMoney = (value: number): string => {
  let formatValue = value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatValue;
};
