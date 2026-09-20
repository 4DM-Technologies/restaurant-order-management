import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  CheckCircle,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import type { OrderBO } from '@/types/order/OrderBO.ts';
import { useOrdersVM, TABS } from '@/ui/screens/OrdersScreen/OrdersScreen.vm.ts';
import AdminLayout from '@/ui/reusables/AdminLayout/AdminLayout.tsx';
import StatusBadge from '@/ui/reusables/StatusBadge/StatusBadge.tsx';
import LoadingSkeleton from '@/ui/reusables/LoadingSkeleton/LoadingSkeleton.tsx';
import EmptyState from '@/ui/reusables/EmptyState/EmptyState.tsx';
import DelayedLoader from '@/ui/reusables/BrandLoader/DelayedLoader.tsx';

/* ── Helpers ── */
function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
}

const BORDER_COLORS: Record<KitchenStatusENUM, string> = {
  [KitchenStatusENUM.IN_QUEUE]:  'border-l-amber-400',
  [KitchenStatusENUM.PREPARING]: 'border-l-blue-400',
  [KitchenStatusENUM.PREPARED]:  'border-l-green-400',
  [KitchenStatusENUM.DELIVERED]: 'border-l-gray-300',
};

/* ── Order Card ── */
interface OrderCardProps {
  order: OrderBO;
  isUpdating: boolean;
  onStatusUpdate: (orderId: string, status: KitchenStatusENUM) => void;
}

function OrderCard({ order, isUpdating, onStatusUpdate }: OrderCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl shadow-warm border-l-4 ${BORDER_COLORS[order.kitchenStatus]} overflow-hidden`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-soroco-linen">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-body text-lg font-bold text-soroco-charcoal">
              {order.orderNumber}
            </h3>
            <p className="font-body text-xs text-soroco-mocha mt-0.5">
              {timeAgo(order.createdAt)}
            </p>
          </div>
          <span className="badge bg-soroco-amber/15 text-soroco-sienna border border-soroco-amber/30 font-semibold">
            Table {order.tableNumber}
          </span>
        </div>

        {/* Customer */}
        <div className="mt-3">
          <p className="font-body font-semibold text-soroco-espresso text-sm">{order.customerName}</p>
          <p className="font-body text-soroco-mocha text-xs">{order.customerPhone}</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 border-b border-soroco-linen">
        <ul className="space-y-1.5">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="font-body text-sm text-soroco-charcoal">
                <span className="font-semibold text-soroco-amber">×{item.quantity}</span>{' '}
                {item.name}
                {item.variant && (
                  <span className="text-soroco-mocha text-xs ml-1">({item.variant})</span>
                )}
              </span>
              <span className="font-body text-xs text-soroco-mocha shrink-0">
                ₹{item.totalPrice}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-soroco-linen flex justify-between items-center">
          <span className="font-body text-xs text-soroco-mocha">Total</span>
          <span className="font-body font-bold text-soroco-espresso">₹{order.total}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.kitchenStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>

        {/* Action button */}
        {order.kitchenStatus === KitchenStatusENUM.IN_QUEUE && (
          <button
            disabled={isUpdating}
            onClick={() => onStatusUpdate(order.id, KitchenStatusENUM.PREPARING)}
            className="btn-primary text-sm py-2 w-full"
          >
            <ChefHat className="w-4 h-4" />
            Start Preparing
          </button>
        )}
        {order.kitchenStatus === KitchenStatusENUM.PREPARING && (
          <button
            disabled={isUpdating}
            onClick={() => onStatusUpdate(order.id, KitchenStatusENUM.PREPARED)}
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold text-sm py-2 px-4 rounded-full transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50 w-full"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Prepared
          </button>
        )}
        {order.kitchenStatus === KitchenStatusENUM.PREPARED && (
          <button
            disabled={isUpdating}
            onClick={() => onStatusUpdate(order.id, KitchenStatusENUM.DELIVERED)}
            className="inline-flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold text-sm py-2 px-4 rounded-full transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50 w-full"
          >
            <PackageCheck className="w-4 h-4" />
            Mark Delivered
          </button>
        )}
        {order.kitchenStatus === KitchenStatusENUM.DELIVERED && (
          <p className="text-center font-body text-xs text-soroco-mocha/60 py-1">✓ Order complete</p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Screen ── */
export default function OrdersScreen() {
  const {
    filteredOrders,
    activeTab,
    setActiveTab,
    isLoading,
    updatingId,
    handleStatusUpdate,
    countByStatus,
    refresh,
  } = useOrdersVM();

  return (
    <AdminLayout title="Kitchen Board">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-md text-soroco-charcoal">Kitchen Board</h1>
          <p className="font-body text-soroco-mocha text-sm mt-1">
            Track and manage live orders.
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary text-sm shrink-0"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

        {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {TABS.map(({ id, label }) => {
          const count = id === 'ALL'
            ? undefined
            : countByStatus(id as KitchenStatusENUM);
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-body font-medium text-sm whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-soroco-espresso text-soroco-cream shadow-warm'
                  : 'bg-white text-soroco-mocha hover:bg-soroco-linen border border-soroco-linen'
              }`}
            >
              {label}
              {count !== undefined && (
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                  isActive ? 'bg-white/20 text-soroco-cream' : 'bg-soroco-linen text-soroco-mocha'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <DelayedLoader variant="inline" fallback={<LoadingSkeleton variant="card" count={8} />} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No orders here"
          description="There are no orders in this category right now."
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isUpdating={updatingId === order.id}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AdminLayout>
  );
}
