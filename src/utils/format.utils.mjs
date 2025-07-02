export const formatRupiah = (value) => {
  const priceStr = String(value).replace('Rp', '').trim();
  const numeric = parseInt(priceStr, 10);

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numeric);
};
