import type { OrderBO } from '@/types/order/OrderBO.ts';
import type { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import { ordersData } from '@/services/screens/orderScreenService/ordersData.ts';

// In-memory mutable state for local-only mode
let _orders: OrderBO[] = [...ordersData];

export const orderScreenService = {
  getOrders: async (): Promise<OrderBO[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._orders];
  },

  getOrderById: async (id: string): Promise<OrderBO | null> => {
    await new Promise((r) => setTimeout(r, 200));
    return _orders.find((o) => o.id === id) ?? null;
  },

  createOrder: async (order: Omit<OrderBO, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<OrderBO> => {
    await new Promise((r) => setTimeout(r, 600));
    const newOrder: OrderBO = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `ROM-${String(_orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _orders = [newOrder, ..._orders];
    return newOrder;
  },

  updateKitchenStatus: async (orderId: string, status: KitchenStatusENUM): Promise<OrderBO> => {
    await new Promise((r) => setTimeout(r, 300));
    _orders = _orders.map((o) =>
      o.id === orderId ? { ...o, kitchenStatus: status, updatedAt: new Date().toISOString() } : o,
    );
    const updated = _orders.find((o) => o.id === orderId);
    if (!updated) throw new Error('Order not found');
    return updated;
  },

  getOrderHistory: async (): Promise<OrderBO[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
