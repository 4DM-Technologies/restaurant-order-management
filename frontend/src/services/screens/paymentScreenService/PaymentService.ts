import { apiClient } from '@/services/apiClient';
import { log } from '@/services/logger';
import type { PaymentRequestBO } from '@/types/payment/PaymentRequestBO';
import type { PaymentResultBO } from '@/types/payment/PaymentResultBO';

export const paymentService = {
  createPayment: async (request: PaymentRequestBO): Promise<PaymentResultBO> => {
    try {
      log.info('paymentService', `submitting payment order_ref=${request.order_ref}`);
      const result = await apiClient.post<PaymentResultBO>('/payments', request);
      log.info(
        'paymentService',
        `payment done order_ref=${request.order_ref} status=${result.payment_status}`,
      );
      return result;
    } catch (err) {
      log.error('paymentService', `payment failed order_ref=${request.order_ref}`, err);
      throw err;
    }
  },
};