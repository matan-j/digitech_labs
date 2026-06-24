'use client';

import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useAccessGate } from '@/components/auth/AccessModalProvider';
import { useCart } from '@/components/cart/CartProvider';

/**
 * "Add to cart" CTA, the companion to the quick-buy button. Courses only (V1).
 * Anonymous viewers are sent through the access gate (login) first, then the add
 * runs. When the item is already in the cart it flips to "בסל" and opens the cart.
 */
export default function AddToCartButton({
  slug,
  contentId,
  contentType = 'course',
  returnTo,
  className,
  label = 'הוספה לסל',
}: {
  slug: string;
  /** Used to show the in-cart state. */
  contentId?: string;
  contentType?: string;
  returnTo: string;
  className?: string;
  label?: string;
}) {
  const { requireAccess } = useAccessGate();
  const { add, has, setOpen, busy } = useCart();
  const inCart = contentId ? has(contentId) : false;

  function onClick() {
    if (inCart) {
      setOpen(true);
      return;
    }
    requireAccess({
      action: 'add_to_cart',
      returnTo,
      run: () => {
        void add(slug, contentType);
      },
    });
  }

  return (
    <button type="button" onClick={onClick} disabled={busy} className={className}>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {inCart ? 'בסל' : label}
    </button>
  );
}
