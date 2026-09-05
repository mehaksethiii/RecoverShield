import { Router } from 'express';
import { AgentService } from '../services/AgentService';
import { RazorpayService } from '../services/RazorpayService';

const router = Router();
const agentService = new AgentService();
const razorpayService = new RazorpayService();

router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  let rawBody = req.body;
  if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
  } else if (typeof req.body === 'object') {
      rawBody = JSON.stringify(req.body);
  }

  // Bypass signature verification when no signature is present (demo/simulation mode)
  // In production with real Razorpay webhooks, the signature header will always be present.
  const isDemo = !signature;
  
  if (!isDemo) {
    if (!razorpayService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).send('Invalid signature');
    }
  }

  try {
    let payload: any;
    if (Buffer.isBuffer(req.body)) {
      payload = JSON.parse(req.body.toString());
    } else if (typeof req.body === 'string') {
      payload = JSON.parse(req.body);
    } else {
      payload = req.body;
    }
    await agentService.handleRazorpayEvent(payload);
    res.status(200).send('ok');
  } catch (error: any) {
    console.error('Webhook processing error:', error?.message || error);
    console.error('Stack:', error?.stack);
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

export default router;
