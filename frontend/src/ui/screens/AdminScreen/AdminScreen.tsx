import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardList,
  History,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import AdminLayout from '@/ui/reusables/AdminLayout/AdminLayout.tsx';
import { orderScreenService } from '@/services/screens/orderScreenService/OrderScreenService.ts';
import { employeeScreenService } from '@/services/screens/employeeScreenService/EmployeeScreenService.ts';
import { menuScreenService } from '@/services/screens/menuScreenService/MenuScreenService.ts';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import type { OrderBO } from '@/types/order/OrderBO.ts';
import StatusBadge from '@/ui/reusables/StatusBadge/StatusBadge.tsx';

interface DashboardStats {
  employeeCount: number;
  activeOrderCount: number;
  totalOrderCount: number;
  menuItemCount: number;
  recentOrders: OrderBO[];
}

const CARD_ANIM = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AdminScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [employees, orders, menuItems] = await Promise.all([
          employeeScreenService.getEmployees(),
          orderScreenService.getOrders(),
          menuScreenService.getMenu(),
        ]);
        const activeStatuses: KitchenStatusENUM[] = [
          KitchenStatusENUM.IN_QUEUE,
          KitchenStatusENUM.PREPARING,
          KitchenStatusENUM.PREPARED,
        ];
        setStats({
          employeeCount: employees.length,
          activeOrderCount: orders.filter((o) => activeStatuses.includes(o.kitchenStatus)).length,
          totalOrderCount: orders.length,
          menuItemCount: menuItems.length,
          recentOrders: [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5),
        });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const dashboardCards = [
    {
      label: 'Employees',
      description: 'Total staff members',
      icon: Users,
      value: stats?.employeeCount ?? '—',
      to: '/admin/employee',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Orders',
      description: 'Currently in kitchen',
      icon: ClipboardList,
      value: stats?.activeOrderCount ?? '—',
      to: '/orders',
      color: 'bg-amber-50 text-soroco-amber',
    },
    {
      label: 'Order History',
      description: 'All-time orders',
      icon: History,
      value: stats?.totalOrderCount ?? '—',
      to: '/order-history',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Menu Items',
      description: 'Available on menu',
      icon: Utensils,
      value: stats?.menuItemCount ?? '—',
      to: '/menu',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="heading-md text-soroco-charcoal">Dashboard</h1>
        <p className="font-body text-soroco-mocha mt-1">
          Welcome back! Here's what's happening at Soroco House.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              custom={i}
              variants={CARD_ANIM}
              initial="hidden"
              animate="visible"
              onClick={() => navigate(card.to)}
              className="card card-hover p-5 text-left w-full group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-soroco-tan group-hover:text-soroco-amber transition-colors group-hover:translate-x-0.5 duration-200" />
              </div>
              <div>
                {isLoading ? (
                  <div className="skeleton h-8 w-16 mb-2" />
                ) : (
                  <p className="font-display text-3xl font-bold text-soroco-charcoal mb-1">
                    {card.value}
                  </p>
                )}
                <p className="font-body font-semibold text-soroco-espresso text-sm">{card.label}</p>
                <p className="font-body text-soroco-mocha text-xs mt-0.5">{card.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="px-5 py-4 border-b border-soroco-linen flex items-center justify-between">
          <h2 className="heading-sm text-base font-semibold text-soroco-charcoal">Recent Orders</h2>
          <button
            onClick={() => navigate('/order-history')}
            className="font-body text-sm text-soroco-amber hover:text-soroco-sienna transition-colors font-medium"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="p-5">
            <LoadingRows />
          </div>
        ) : !stats?.recentOrders.length ? (
          <div className="p-8 text-center">
            <p className="font-body text-soroco-mocha text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soroco-linen">
                  {['Order #', 'Table', 'Customer', 'Total', 'Status', 'Time'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-body font-semibold text-xs text-soroco-mocha uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-soroco-linen/60 last:border-0 hover:bg-soroco-linen/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-body font-semibold text-sm text-soroco-espresso">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-soroco-charcoal">
                      {order.tableNumber}
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-soroco-charcoal">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3.5 font-body font-semibold text-sm text-soroco-charcoal">
                      ₹{order.total}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.kitchenStatus} />
                    </td>
                    <td className="px-5 py-3.5 font-body text-xs text-soroco-mocha whitespace-nowrap">
                      {timeAgo(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-12" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
