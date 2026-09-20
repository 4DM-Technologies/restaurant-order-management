export type SelectedSize = 'standard' | 'small' | 'large' | null;

export interface PaymentItemBO {
  menu_uuid: string;
  quantity: number;
  selected_size?: SelectedSize;
}

export interface PaymentRequestBO {
  order_ref: string;
  gateway_status: 'success' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id?: string | null;
  table_name: string;
  customer_name: string;
  phone_number: string;
  customer_email?: string | null;
  items: PaymentItemBO[];
}