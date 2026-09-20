import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardList,
  History,
  Utensils,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '@/ui/reusables/AdminLayout/AdminLayout.tsx';
import { useAppSelector } from '@/store/hooks.ts';
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
  todayRevenue: number;
  recentOrders: OrderBO[];
}

const CARD_ANIM = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminScreen() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
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
        const today = new Date().toDateString();
        const todayRevenue = orders
          .filter((o) => new Date(o.createdAt).toDateString() === today)
          .reduce((sum, o) => sum + Number(o.total), 0);
        setStats({
          employeeCount: employees.length,
          activeOrderCount: orders.filter((o) => activeStatuses.includes(o.kitchenStatus)).length,
          totalOrderCount: orders.length,
          menuItemCount: menuItems.length,
          todayRevenue,
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

  const displayName = user?.name ?? 'there';

  const dashboardCards = [
    {
      label: 'Employees',
      description: 'Total staff members',
      icon: Users,
      value: stats?.employeeCount ?? 0,
      to: '/admin/employee',
      tile: 'from-blue-500 to-blue-600',
      glow: 'group-hover:shadow-blue-500/40',
    },
    {
      label: 'Active Orders',
      description: 'Currently in kitchen',
      icon: ClipboardList,
      value: stats?.activeOrderCount ?? 0,
      to: '/orders',
      tile: 'from-soroco-amber to-soroco-sienna',
      glow: 'group-hover:shadow-soroco-amber/40',
    },
    {
      label: 'Order History',
      description: 'All-time orders',
      icon: History,
      value: stats?.totalOrderCount ?? 0,
      to: '/order-history',
      tile: 'from-emerald-500 to-green-600',
      glow: 'group-hover:shadow-emerald-500/40',
    },
    {
      label: 'Menu Items',
      description: 'Available on menu',
      icon: Utensils,
      value: stats?.menuItemCount ?? 0,
      to: '/menu',
      tile: 'from-violet-500 to-purple-600',
      glow: 'group-hover:shadow-violet-500/40',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-soroco-espresso via-soroco-charcoal to-soroco-mocha px-6 sm:px-8 py-8 mb-8 shadow-warm-lg">
        <div className="pointer-events-none absolute -top-20 -right-10 w-72 h-72 bg-soroco-amber/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-40 h-40 bg-soroco-sienna/30 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 font-body text-xs font-semibold tracking-widest text-soroco-amber uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-soroco-cream">
              {greeting()}, {displayName}
            </h1>
            <p className="font-body text-soroco-cream/60 text-sm mt-1">
              Here's what's happening at Soroco House.
            </p>
          </div>
          {/* Today's revenue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3"
          >
            <p className="font-body text-xs text-soroco-cream/60 uppercase tracking-widest">
              Today's Revenue
            </p>
            <p className="font-body text-2xl font-bold text-soroco-amber">
              ₹{(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card, i) => {
          const Icon = card.icon;
          const animatedValue = useCountUp(isLoading ? 0 : card.value);
          return (
            <motion.button
              key={card.label}
              custom={i}
              variants={CARD_ANIM}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.to)}
              className="card card-hover group p-5 text-left w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.tile} flex items-center justify-center shadow-warm-md transition-shadow duration-300 ${card.glow}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-soroco-tan group-hover:text-soroco-amber group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <div>
                {isLoading ? (
                  <div className="skeleton h-9 w-16 mb-2" />
                ) : (
                  <p className="font-display text-4xl font-bold text-soroco-charcoal tracking-tight">
                    {animatedValue}
                  </p>
                )}
                <p className="font-body font-semibold text-soroco-espresso text-sm mt-0.5">{card.label}</p>
                <p className="font-body text-soroco-mocha text-xs mt-0.5">{card.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-soroco-linen flex items-center justify-between bg-gradient-to-r from-soroco-parchment/60 to-transparent">
          <h2 className="heading-sm text-base font-semibold text-soroco-charcoal">Recent Orders</h2>
          <button
            onClick={() => navigate('/order-history')}
            className="font-body text-sm text-soroco-amber hover:text-soroco-sienna transition-colors font-medium inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
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
                {stats.recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="border-b border-soroco-linen/60 last:border-0 hover:bg-soroco-linen/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-body font-semibold text-sm text-soroco-espresso">
                      #{order.orderNumber}
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
                  </motion.tr>
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