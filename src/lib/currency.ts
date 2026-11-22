const cordobaFormatter = new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formatea precios como córdobas nicaragüenses. */
export const formatCordobas = (amount: number) => cordobaFormatter.format(amount);
