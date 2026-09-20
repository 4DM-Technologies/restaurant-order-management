export interface PaymentOrderItemBO {
  menu_uuid: string;
  item_name: string | null;
  selected_size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface PaymentOrderBO {
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
  total_price: number;
  created_at: string;
  items: PaymentOrderItemBO[];
}

export interface PaymentResultBO {
  payment_status: 'success' | 'failed' | 'cancelled';
  order_number?: number | null;
  order_uuid?: string | null;
  total?: number | null;
  message?: string | null;
  order?: PaymentOrderBO | null;
}