const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => currency.format(Number(value));
export const effectivePrice = (product) => Number(product.discountPrice ?? product.price);
