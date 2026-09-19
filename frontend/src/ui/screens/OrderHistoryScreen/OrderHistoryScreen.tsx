import { motion } from 'framer-motion';
import { Download, Search, History } from 'lucide-react';
import AdminLayout from '@/ui/reusables/AdminLayout/AdminLayout.tsx';
import StatusBadge from '@/ui/reusables/StatusBadge/StatusBadge.tsx';
import LoadingSkeleton from '@/ui/reusables/LoadingSkeleton/LoadingSkeleton.tsx';
import EmptyState from '@/ui/reusables/EmptyState/EmptyState.tsx';
import { useOrderHistoryVM } from '@/ui/screens/OrderHistoryScreen/OrderHistoryScreen.vm.ts';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import { PaymentStatusENUM } from '@/types/order/PaymentStatusENUM.ts';
import type { OrderBO } from '@/types/order/OrderBO.ts';

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="font-body text-xs font-medium text-soroco-mocha">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-field py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* Mobile card */
function OrderMobileCard({ order }: { order: OrderBO }) {
  return (
    <div className="p-4 border-b border-soroco-linen last:border-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-body font-bold text-soroco-espresso text-sm">{order.orderNumber}</p>
          <p className="font-body text-xs text-soroco-mocha">
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span className="font-display font-bold text-soroco-charcoal text-sm">₹{order.total}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs mb-3">
        <span className="font-body text-soroco-mocha">Table: <span className="text-soroco-charcoal font-medium">{order.tableNumber}</span></span>
        <span className="font-body text-soroco-mocha">Items: <span className="text-soroco-charcoal font-medium">{order.items.length}</span></span>
        <span className="font-body text-soroco-mocha col-span-2 truncate">Customer: <span className="text-soroco-charcoal font-medium">{order.customerName}</span></span>
        <span className="font-body text-soroco-mocha">Payment: <span className="text-soroco-charcoal font-medium">{order.paymentMethod}</span></span>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={order.kitchenStatus} />
        <StatusBadge status={order.paymentStatus} />
      </div>
    </div>
  );
}

export default function OrderHistoryScreen() {
  const vm = useOrderHistoryVM();

  const dateOptions: { value: 'today' | 'yesterday' | 'all'; label: string }[] = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
  ];

  const kitchenStatusOptions: { value: KitchenStatusENUM | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Kitchen Status' },
    { value: KitchenStatusENUM.IN_QUEUE, label: 'In Queue' },
    { value: KitchenStatusENUM.PREPARING, label: 'Preparing' },
    { value: KitchenStatusENUM.PREPARED, label: 'Prepared' },
    { value: KitchenStatusENUM.DELIVERED, label: 'Delivered' },
  ];

  const paymentStatusOptions: { value: PaymentStatusENUM | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Payment Status' },
    { value: PaymentStatusENUM.PAID, label: 'Paid' },
    { value: PaymentStatusENUM.PENDING, label: 'Pending' },
    { value: PaymentStatusENUM.FAILED, label: 'Failed' },
    { value: PaymentStatusENUM.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <AdminLayout title="Order History">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-md text-soroco-charcoal">Order History</h1>
          <p className="font-body text-soroco-mocha text-sm mt-1">
            Browse and export all-time order records.
          </p>
        </div>
        <button
          onClick={vm.handleExportCSV}
          className="btn-secondary text-sm shrink-0"
          disabled={vm.filteredOrders.length === 0}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-soroco-linen p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <FilterSelect
            label="Date"
            value={vm.dateFilter}
            onChange={vm.setDateFilter}
            options={dateOptions}
          />
          <FilterSelect
            label="Kitchen Status"
            value={vm.statusFilter}
            onChange={vm.setStatusFilter}
            options={kitchenStatusOptions}
          />
          <FilterSelect
            label="Payment Status"
            value={vm.paymentFilter}
            onChange={vm.setPaymentFilter}
            options={paymentStatusOptions}
          />
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="font-body text-xs font-medium text-soroco-mocha">Search</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
              <input
                type="text"
                value={vm.searchQuery}
                onChange={(e) => vm.setSearchQuery(e.target.value)}
                placeholder="Order #, customer, table…"
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        {/* Result count */}
        {!vm.isLoading && (
          <p className="font-body text-xs text-soroco-mocha mt-3">
            Showing <span className="font-semibold text-soroco-espresso">{vm.filteredOrders.length}</span> of{' '}
            <span className="font-semibold text-soroco-espresso">{vm.allOrders.length}</span> orders
          </p>
        )}
      </div>

      {/* Content */}
      {vm.isLoading ? (
        <LoadingSkeleton variant="row" count={6} />
      ) : vm.filteredOrders.length === 0 ? (
        <EmptyState
          icon={History}
          title="No orders found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soroco-linen bg-soroco-parchment/50">
                  {[
                    'Order #', 'Date / Time', 'Table', 'Customer',
                    'Items', 'Total', 'Payment', 'Pay Status', 'Kitchen',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-body font-semibold text-xs text-soroco-mocha uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vm.filteredOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-soroco-linen/60 last:border-0 hover:bg-soroco-linen/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-body font-semibold text-sm text-soroco-espresso whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-soroco-mocha whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-soroco-charcoal">{order.tableNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-body font-medium text-sm text-soroco-charcoal">{order.customerName}</p>
                        <p className="font-body text-xs text-soroco-mocha">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-soroco-charcoal">{order.items.length}</td>
                    <td className="px-4 py-3 font-body font-semibold text-sm text-soroco-charcoal whitespace-nowrap">
                      ₹{order.total}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-soroco-mocha">{order.paymentMethod}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.kitchenStatus} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden">
            {vm.filteredOrders.map((order) => (
              <OrderMobileCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
