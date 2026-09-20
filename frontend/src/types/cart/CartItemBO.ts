export interface CartItemBO {
  cartItemId: string;  // unique per cart entry
  menuItemId: string;
  name: string;
  image: string;
  variant?: string;
  variantId?: string;
  addons?: string[];
  addonIds?: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  isVeg: boolean;
}
