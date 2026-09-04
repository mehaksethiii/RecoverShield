import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private razorpay: any;
  private webhookSecret: string;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  async fetchPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Error fetching Razorpay payment:', error);
      throw error;
    }
  }

  async createPaymentLink(amount: number, currency: string, description: string, customerData: { name: string; email: string; contact?: string }) {
    try {
      return await this.razorpay.paymentLink.create({
        amount: amount, // amount in smallest currency unit
        currency: currency,
        accept_partial: false,
        description: description,
        customer: customerData,
        notify: {
          sms: false,
          email: true
        },
        reminder_enable: true,
        notes: {
          reason: 'RazorShield Recovery Link'
        }
      });
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  async retryPayment(originalPaymentId: string, amount: number, currency: string, method: string | null, customerData: { name: string; email: string; contact?: string }) {
    // Razorpay does not have a direct "retry" API — the correct approach is:
    // 1. Create a new Order for the same amount
    // 2. Return the order so the frontend / agent can present it for payment
    // We also attempt to fetch the original payment for context (best-effort).
    try {
      let originalPayment: any = null;
      try {
        if (!originalPaymentId.startsWith('pay_sim_') && !originalPaymentId.startsWith('pay_')) {
          // skip fetch for obvious dummy IDs
        } else {
          originalPayment = await this.razorpay.payments.fetch(originalPaymentId);
        }
      } catch (_) {
        // non-fatal — dummy/sim IDs won't exist on Razorpay
      }

      // Create a fresh order for the retry
      const order = await this.razorpay.orders.create({
        amount,                          // in paise
        currency: currency || 'INR',
        notes: {
          reason: 'RazorShield Retry Recovery',
          original_payment_id: originalPaymentId,
          customer_name: customerData.name,
          customer_email: customerData.email,
        }
      });

      // Also generate a payment link so the customer can complete it
      const link = await this.razorpay.paymentLink.create({
        amount,
        currency: currency || 'INR',
        accept_partial: false,
        description: `Payment retry — order ${order.id}`,
        customer: customerData,
        notify: { sms: false, email: true },
        reminder_enable: true,
        notes: {
          reason: 'RazorShield Smart Retry',
          original_payment_id: originalPaymentId,
          preferred_method: method || 'any',
        }
      });

      return {
        orderId: order.id,
        linkId: link.id,
        shortUrl: link.short_url,
        originalPayment,
      };
    } catch (error) {
      console.error('Error executing retry payment:', error);
      throw error;
    }
  }


    try {
      if (amount) {
        return await this.razorpay.payments.refund(paymentId, { amount });
      }
      return await this.razorpay.payments.refund(paymentId, {});
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
}
