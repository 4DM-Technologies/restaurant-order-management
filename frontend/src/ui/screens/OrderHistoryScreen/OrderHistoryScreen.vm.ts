import { useState, useEffect, useMemo } from 'react';
import { orderScreenService } from '@/services/screens/orderScreenService/OrderScreenService.ts';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import { PaymentStatusENUM } from '@/types/order/PaymentStatusENUM.ts';
import type { OrderBO } from '@/types/order/OrderBO.ts';

export type DateFilter = 'today' | 'yesterday' | 'all';

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
}

function csvCell(value: string | number): string {
  const text = String(value ?? '');
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

function exportCSV(orders: OrderBO[]) {
  const headers = [
    'Order #', 'Date', 'Table', 'Customer', 'Phone',
    'Total', 'Payment', 'Payment Status', 'Kitchen Status',
  ];
  const rows = orders.map((o) => [
    String(o.orderNumber),
    new Date(o.createdAt).toLocaleString(),
    String(o.tableNumber),
    String(o.customerName),
    String(o.customerPhone),
    String(o.total),
    String(o.paymentMethod),
    String(o.paymentStatus),
    String(o.kitchenStatus),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map(csvCell).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'soroco-orders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function useOrderHistoryVM() {
  const [allOrders, setAllOrders] = useState<OrderBO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<KitchenStatusENUM | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatusENUM | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await orderScreenService.getOrderHistory();
        setAllOrders(data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      if (dateFilter === 'today' && !isToday(o.createdAt)) return false;
      if (dateFilter === 'yesterday' && !isYesterday(o.createdAt)) return false;
      if (statusFilter !== 'ALL' && o.kitchenStatus !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.tableNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allOrders, dateFilter, statusFilter, paymentFilter, searchQuery]);

  function handleExportCSV() {
    exportCSV(filteredOrders);
  }

  return {
    allOrders,
    filteredOrders,
    isLoading,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    searchQuery,
    setSearchQuery,
    handleExportCSV,
  };
}
