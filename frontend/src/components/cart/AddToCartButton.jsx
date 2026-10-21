import { ShoppingBasket } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

export function AddToCartButton({ product, className, compact = false }) {
  const { currentUser } = useAuth();
  const { addItem, addingProductId, openDrawer, errorMessage } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const unavailable = !product.isAvailable || product.stock <= 0;
  const loading = addingProductId === product.id;

  const add = async () => {
    if (!currentUser) {
      notify('Sign in to add items to your basket.');
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await addItem(product.id, 1);
      notify(`${product.name} added to your basket.`);
      openDrawer();
    } catch (error) {
      notify(errorMessage(error));
    }
  };

  return (
    <Button
      type="button"
      onClick={add}
      loading={loading}
      disabled={unavailable}
      className={className}
      aria-label={unavailable ? `${product.name} is unavailable` : `Add ${product.name} to cart`}
    >
      {!loading && <ShoppingBasket className="size-4" />}
      {unavailable ? 'Unavailable' : compact ? 'Add' : 'Add to cart'}
    </Button>
  );
}
