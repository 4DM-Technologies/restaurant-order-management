import { useState } from 'react';
import { Plus, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks.ts';
import { addItem, updateQuantity } from '@/store/slices/cartSlice.ts';
import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';
import QuantityControl from '@/ui/reusables/QuantityControl/QuantityControl.tsx';

interface FoodCardProps {
  item: MenuItemBO;
  onAddToCart: (item: MenuItemBO) => void;
  onViewDetail: (item: MenuItemBO) => void;
}

export default function FoodCard({ item, onAddToCart, onViewDetail }: FoodCardProps) {
  const dispatch   = useAppDispatch();
  const cartItems  = useAppSelector((s) => s.cart.items);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* Find this item in the cart (match by menuItemId, no variant) */
  const cartEntry = cartItems.find(
    (ci) => ci.menuItemId === item.id && !ci.variantId,
  );
  const qty = cartEntry?.quantity ?? 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.isAvailable) return;

    dispatch(
      addItem({
        cartItemId: `${item.id}-default`,
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
        isVeg: item.isVeg,
      }),
    );
    onAddToCart(item);
  }

  function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (!cartEntry) return;
    dispatch(updateQuantity({ cartItemId: cartEntry.cartItemId, quantity: qty + 1 }));
  }

  function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (!cartEntry) return;
    dispatch(updateQuantity({ cartItemId: cartEntry.cartItemId, quantity: qty - 1 }));
  }

  return (
    <article
      onClick={() => onViewDetail(item)}
      className={[
        'card card-hover cursor-pointer group relative overflow-hidden',
        !item.isAvailable ? 'opacity-60' : '',
      ].join(' ')}
      aria-label={`${item.name}, ₹${item.price}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-soroco-linen">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" aria-hidden="true" />
        )}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={[
            'w-full h-full object-cover transition-all duration-500 img-fade group-hover:scale-105',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />

        {/* Bestseller badge */}
        {item.isBestseller && item.isAvailable && (
          <span className="absolute top-2.5 left-2.5 badge-bestseller flex items-center gap-1 shadow-warm-sm">
            <Star className="w-3 h-3 fill-current" />
            Bestseller
          </span>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-soroco-charcoal/40 flex items-center justify-center">
            <span className="badge-unavailable flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Veg / non-veg + title row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Veg indicator dot */}
            <span
              className={[
                'w-4 h-4 border-2 rounded-sm shrink-0 flex items-center justify-center',
                item.isVeg
                  ? 'border-green-600'
                  : 'border-red-600',
              ].join(' ')}
              aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
            >
              <span
                className={[
                  'w-2 h-2 rounded-full',
                  item.isVeg ? 'bg-green-600' : 'bg-red-600',
                ].join(' ')}
              />
            </span>
            <h3 className="font-body font-semibold text-soroco-charcoal text-sm sm:text-base leading-snug truncate">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="font-body text-xs sm:text-sm text-soroco-mocha leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Price + Add button row */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-body font-bold text-soroco-espresso text-base">
            ₹{item.price.toFixed(2)}
          </span>

          <div onClick={(e) => e.stopPropagation()}>
            {qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAdd}
                disabled={!item.isAvailable}
                aria-label={`Add ${item.name} to cart`}
                className={[
                  'flex items-center gap-1 px-3 py-1.5 rounded-full border-2 text-sm font-semibold font-body',
                  'transition-all duration-200',
                  item.isAvailable
                    ? 'border-soroco-amber text-soroco-amber hover:bg-soroco-amber hover:text-white active:scale-95'
                    : 'border-soroco-linen text-soroco-tan cursor-not-allowed',
                ].join(' ')}
              >
                <Plus className="w-3.5 h-3.5" />
                ADD
              </motion.button>
            ) : (
              <QuantityControl
                quantity={qty}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                min={0}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Prep time tag */}
        {item.preparationTime && item.isAvailable && (
          <p className="mt-2 font-body text-[11px] text-soroco-tan">
            ⏱ ~{item.preparationTime} min
          </p>
        )}
      </div>
    </article>
  );
}
