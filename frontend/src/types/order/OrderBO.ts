import type { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import type { OrderStatusENUM } from '@/types/order/OrderStatusENUM.ts';
import type { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import type { PaymentStatusENUM } from '@/types/order/PaymentStatusENUM.ts';

export interface OrderItemBO {
  menuItemId: string;
  name: string;
  image: string;
  variant?: string;
  addons?: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface OrderBO {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItemBO[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethodENUM;
  paymentStatus: PaymentStatusENUM;
  orderStatus: OrderStatusENUM;
  kitchenStatus: KitchenStatusENUM;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
