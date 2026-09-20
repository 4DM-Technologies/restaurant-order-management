import type { OrderBO, OrderItemBO } from '@/types/order/OrderBO.ts';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import { OrderStatusENUM } from '@/types/order/OrderStatusENUM.ts';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import { PaymentStatusENUM } from '@/types/order/PaymentStatusENUM.ts';
import { apiClient } from '@/services/apiClient.ts';
import { paymentService } from '@/services/screens/paymentScreenService/PaymentService.ts';

interface ApiOrderItem {
  menu_uuid: string;
  item_name: string | null;
  selected_size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface ApiOrder {
  order_uuid: string;
  order_id: number;
  order_number: number;
  table_name: string;
  customer_name: string;
  phone_number: string;
  payment_method: string;
  payment_status: string;
  kitchen_status: string;
  order_status: string;
  subtotal: number;
  tax: number;
  total_price: number;
  created_at: string;
  items: ApiOrderItem[];
}

const PM_MAP: Record<string, PaymentMethodENUM> = {
  phonepay: PaymentMethodENUM.PHONEPE,
  razorpay: PaymentMethodENUM.RAZORPAY,
};

const PS_MAP: Record<string, PaymentStatusENUM> = {
  pending: PaymentStatusENUM.PENDING,
  success: PaymentStatusENUM.PAID,
  failed: PaymentStatusENUM.FAILED,
  cancelled: PaymentStatusENUM.CANCELLED,
};

const OS_MAP: Record<string, OrderStatusENUM> = {
  ordered: OrderStatusENUM.CONFIRMED,
  delivered: OrderStatusENUM.COMPLETED,
  pending: OrderStatusENUM.PENDING,
  cancelled: OrderStatusENUM.CANCELLED,
};

const KS_MAP: Record<string, KitchenStatusENUM> = {
  in_queue: KitchenStatusENUM.IN_QUEUE,
  preparing: KitchenStatusENUM.PREPARING,
  prepared: KitchenStatusENUM.PREPARED,
  delivered: KitchenStatusENUM.DELIVERED,
};

export function mapOrder(o: ApiOrder): OrderBO {
  const items: OrderItemBO[] = (o.items ?? []).map((it) => ({
    menuItemId: it.menu_uuid,
    name: it.item_name ?? '',
    image: '',
    variant: it.selected_size ?? undefined,
    quantity: it.quantity,
    unitPrice: Number(it.unit_price),
    totalPrice: Number(it.line_total),
  }));
  const total = Number(o.total_price);
  const tax = Number(o.tax ?? 0);
  return {
    id: o.order_uuid,
    orderNumber: String(o.order_number),
    tableNumber: o.table_name,
    customerName: o.customer_name,
    customerPhone: o.phone_number,
    items,
    subtotal: Number(o.subtotal ?? total - tax),
    tax,
    total,
    paymentMethod: PM_MAP[o.payment_method] ?? PaymentMethodENUM.RAZORPAY,
    paymentStatus: PS_MAP[o.payment_status] ?? PaymentStatusENUM.PENDING,
    orderStatus: OS_MAP[o.order_status] ?? OrderStatusENUM.PENDING,
    kitchenStatus: KS_MAP[o.kitchen_status] ?? KitchenStatusENUM.IN_QUEUE,
    createdAt: o.created_at,
    updatedAt: o.created_at,
  };
}

export const orderScreenService = {
  getOrders: async (): Promise<OrderBO[]> => {
    const data = await apiClient.get<ApiOrder[]>('/orders/kitchen');
    return data.map(mapOrder);
  },

  getOrderById: async (id: string): Promise<OrderBO | null> => {
    const orders = await orderScreenService.getOrders();
    return orders.find((o) => o.id === id) ?? null;
  },

  createOrder: async (
    order: Omit<OrderBO, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
  ): Promise<OrderBO> => {
    const result = await paymentService.createPayment({
      order_ref: `rom-${Date.now()}`,
      gateway_status: 'success',
      payment_method:
        order.paymentMethod === PaymentMethodENUM.PHONEPE ? 'phonepay' : 'razorpay',
      table_name: order.tableNumber,
      customer_name: order.customerName,
      phone_number: order.customerPhone.replace(/\D/g, ''),
      items: order.items.map((it) => ({
        menu_uuid: it.menuItemId,
        quantity: it.quantity,
        selected_size:
          it.variant === 'small' || it.variant === 'large' || it.variant === 'standard'
            ? (it.variant as 'small' | 'large' | 'standard')
            : null,
      })),
    });
    if (!result.order) {
      throw new Error(result.message ?? 'Order creation failed');
    }
    return mapOrder(result.order);
  },

  updateKitchenStatus: async (orderId: string, status: KitchenStatusENUM): Promise<OrderBO> => {
    const data = await apiClient.patch<ApiOrder>(`/orders/${orderId}`, {
      kitchen_status: status.toLowerCase(),
    });
    return mapOrder(data);
  },

  getOrderHistory: async (): Promise<OrderBO[]> => {
    const data = await apiClient.get<ApiOrder[]>('/admin/orders');
    return data.map(mapOrder);
  },
};