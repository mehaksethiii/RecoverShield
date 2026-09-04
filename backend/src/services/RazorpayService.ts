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
          reason: 'RecoverAI Recovery Link'
        }
      });
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
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
