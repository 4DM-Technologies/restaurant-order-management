import { useState, useEffect, useCallback } from 'react';
import { orderScreenService } from '@/services/screens/orderScreenService/OrderScreenService.ts';
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

export function useOrdersVM() {
  const [orders, setOrders] = useState<OrderBO[]>([]);
  const [activeTab, setActiveTab] = useState<KitchenTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderScreenService.getOrders();
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const filteredOrders =
    activeTab === 'ALL'
      ? orders
      : orders.filter((o) => o.kitchenStatus === activeTab);

  const countByStatus = (status: KitchenStatusENUM) =>
    orders.filter((o) => o.kitchenStatus === status).length;

  async function handleStatusUpdate(orderId: string, newStatus: KitchenStatusENUM) {
    setUpdatingId(orderId);
    try {
      const updated = await orderScreenService.updateKitchenStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
    } catch {
      // Silently fail; UI stays the same
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
