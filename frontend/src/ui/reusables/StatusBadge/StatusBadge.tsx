import {
  Clock,
  ChefHat,
  CheckCircle,
  PackageCheck,
  CircleAlert,
} from 'lucide-react';
import { KitchenStatusENUM } from '@/types/order/KitchenStatusENUM.ts';
import { PaymentStatusENUM } from '@/types/order/PaymentStatusENUM.ts';
import { OrderStatusENUM }   from '@/types/order/OrderStatusENUM.ts';

type AnyStatus =
  | KitchenStatusENUM
  | PaymentStatusENUM
  | OrderStatusENUM;

interface StatusConfig {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className: string;
}

const STATUS_MAP: Record<AnyStatus, StatusConfig> = {
  /* Kitchen */
  [KitchenStatusENUM.IN_QUEUE]:  { label: 'In Queue',  icon: Clock,         className: 'status-queue' },
  [KitchenStatusENUM.PREPARING]: { label: 'Preparing', icon: ChefHat,       className: 'status-preparing' },
  [KitchenStatusENUM.PREPARED]:  { label: 'Prepared',  icon: CheckCircle,   className: 'status-prepared' },
  [KitchenStatusENUM.DELIVERED]: { label: 'Delivered', icon: PackageCheck,  className: 'status-delivered' },

  /* Payment */
  [PaymentStatusENUM.PAID]:      { label: 'Paid',      icon: CheckCircle,   className: 'status-paid' },
  [PaymentStatusENUM.PENDING]:   { label: 'Pending',   icon: Clock,         className: 'status-pending' },
  [PaymentStatusENUM.FAILED]:    { label: 'Failed',    icon: CircleAlert,   className: 'status-failed' },
  [PaymentStatusENUM.CANCELLED]: { label: 'Cancelled', icon: CircleAlert,   className: 'status-failed' },
  [PaymentStatusENUM.REFUNDED]:  { label: 'Refunded',  icon: CheckCircle,   className: 'status-prepared' },

  /* Order */
  [OrderStatusENUM.PENDING]:   { label: 'Pending',   icon: Clock,       className: 'status-pending' },
  [OrderStatusENUM.CONFIRMED]: { label: 'Confirmed', icon: CheckCircle, className: 'status-prepared' },
  [OrderStatusENUM.CANCELLED]: { label: 'Cancelled', icon: CircleAlert, className: 'status-failed' },
  [OrderStatusENUM.COMPLETED]: { label: 'Completed', icon: PackageCheck,className: 'status-delivered' },
};

interface StatusBadgeProps {
  status: AnyStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status];

  if (!config) {
    return (
      <span className="badge bg-gray-100 text-gray-500 border border-gray-200">
        {status}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span className={config.className} aria-label={`Status: ${config.label}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
