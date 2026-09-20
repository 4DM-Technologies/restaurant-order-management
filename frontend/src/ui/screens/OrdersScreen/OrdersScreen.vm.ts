import { useState, useEffect, useCallback } from 'react';
import { orderScreenService } from '@/services/screens/orderScreenService/OrderScreenService.ts';
import { subscribeOrders } from '@/services/websocket/liveClient.ts';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import type { OrderBO } from '@/types/order/OrderBO.ts';

export type KitchenTab = 'ALL' | KitchenStatusENUM;

export const TABS: { id: KitchenTab; label: string }[] = [
  { id: 'ALL',                       label: 'All' },
  { id: KitchenStatusENUM.IN_QUEUE,  label: 'In Queue' },
  { id: KitchenStatusENUM.PREPARING, label: 'Preparing' },
  { id: KitchenStatusENUM.PREPARED,  label: 'Prepared' },
  { id: KitchenStatusENUM.DELIVERED, label: 'Delivered' },
];

/* Status priority used to group cards so status changes are visible */
const STATUS_ORDER: Record<KitchenStatusENUM, number> = {
  [KitchenStatusENUM.IN_QUEUE]:  0,
  [KitchenStatusENUM.PREPARING]: 1,
  [KitchenStatusENUM.PREPARED]:  2,
  [KitchenStatusENUM.DELIVERED]: 3,
};

export function useOrdersVM() {
  const [orders, setOrders] = useState<OrderBO[]>([]);
  const [activeTab, setActiveTab] = useState<KitchenTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderScreenService.getOrders();
      // Group by status (queue → preparing → prepared → delivered), newest first within group
      data.sort((a, b) => {
        const statusA = STATUS_ORDER[a.kitchenStatus];
        const statusB = STATUS_ORDER[b.kitchenStatus];
        if (statusA !== statusB) return statusA - statusB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(data);
    } catch {
      // Keep existing data on polling error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadOrders();
  }, [loadOrders]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30_000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Live refresh for order updates pushed over WebSocket
  useEffect(() => {
    const unsubscribe = subscribeOrders(() => {
      void loadOrders();
    });
    return unsubscribe;
  }, [loadOrders]);

  const filteredOrders =
    activeTab === 'ALL'
      ? orders
      : orders.filter((o) => o.kitchenStatus === activeTab);

  const countByStatus = (status: KitchenStatusENUM) =>
    orders.filter((o) => o.kitchenStatus === status).length;

  async function handleStatusUpdate(orderId: string, newStatus: KitchenStatusENUM) {
    const previous = orders.find((o) => o.id === orderId);
    setUpdatingId(orderId);

    // Optimistically reflect the new status so the card moves instantly
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, kitchenStatus: newStatus } : o))
    );

    try {
      const updated = await orderScreenService.updateKitchenStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      // Revert on failure so the UI stays in sync with the server
      if (previous) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? previous : o)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    orders,
    filteredOrders,
    activeTab,
    setActiveTab,
    isLoading,
    updatingId,
    handleStatusUpdate,
    countByStatus,
    refresh: loadOrders,
  };
}
