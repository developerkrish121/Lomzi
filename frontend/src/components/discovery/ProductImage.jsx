import { useEffect, useState } from 'react';

export const PRODUCT_IMAGE_FALLBACK = '/images/product-placeholder.png';

export function ProductImage({
  src,
  alt,
  onError,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const handleError = (event) => {
    if (!failed) setFailed(true);
    onError?.(event);
  };

  return (
    <img
      src={!src || failed ? PRODUCT_IMAGE_FALLBACK : src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      {...props}
    />
  );
}
