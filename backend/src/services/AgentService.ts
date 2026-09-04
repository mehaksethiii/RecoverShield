import { PrismaClient } from '@prisma/client';
import { AIService } from './AIService';
import { PolicyEngine } from './PolicyEngine';
import { RazorpayService } from './RazorpayService';

const prisma = new PrismaClient();
const aiService = new AIService();
const policyEngine = new PolicyEngine();
const razorpayService = new RazorpayService();

export class AgentService {
  async handleRazorpayEvent(payload: any) {
    if (payload.event === 'payment.failed') {
      await this.processPaymentFailure(payload.payload.payment.entity);
    } else if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
      await this.processPaymentSuccess(payload.payload.payment.entity);
    }
  }

  async processPaymentSuccess(paymentData: any) {
    const payment = await prisma.payment.findFirst({
        where: { razorpayPaymentId: paymentData.id }
    });
    
    if (payment) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCESS' }
        });
    }

    // Try to find a pending risk with same amount for the customer, simulating resolution
    const pendingRisk = await prisma.revenueRisk.findFirst({
        where: { amount: paymentData.amount, status: 'PENDING' }
    });

    if (pendingRisk) {
        await prisma.revenueRisk.update({
            where: { id: pendingRisk.id },
            data: { status: 'RECOVERED', recoveredAmount: paymentData.amount }
        });
        await prisma.auditLog.create({
            data: { eventType: 'RECOVERY_VERIFIED', riskId: pendingRisk.id, actor: 'SYSTEM', details: 'Payment captured successfully. Revenue recovered.' }
        });
    }
  }

  async processPaymentFailure(paymentData: any) {
    // Ingestion & Detection
    let merchant = await prisma.merchant.findFirst();
    let customer = await prisma.customer.findFirst();
    if (!merchant || !customer) {
      merchant = await prisma.merchant.create({ data: { name: 'Demo Merchant' } });
      customer = await prisma.customer.create({ data: { name: 'Demo Customer', email: 'test@example.com', merchantId: merchant.id, phone: '9876543210' } });
    }
    
    let orderId = paymentData.order_id || `dummy_order_${Date.now()}`;
    let order = await prisma.order.findFirst({ where: { id: orderId } });
    if (!order) {
        order = await prisma.order.create({
            data: {
                id: orderId,
                merchantId: merchant.id,
                customerId: customer.id,
                amount: paymentData.amount,
                status: 'CREATED'
            }
        });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayPaymentId: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'FAILED',
        method: paymentData.method,
        failureReason: paymentData.error_description
      }
    });

    const risk = await prisma.revenueRisk.create({
      data: {
        merchantId: customer.merchantId,
        customerId: customer.id,
        paymentId: payment.id,
        sourceType: 'PAYMENT_FAILURE',
        amount: payment.amount,
        currency: payment.currency,
        status: 'PENDING',
        failureReason: payment.failureReason,
        recoveryProbability: 0.85, 
        expectedRecoverableAmount: Math.floor(payment.amount * 0.85)
      }
    });

    await prisma.auditLog.create({
      data: { eventType: 'RISK_DETECTED', riskId: risk.id, actor: 'SYSTEM', details: `Payment failed due to: ${payment.failureReason}` }
    });

    // Fetch customer memory
    const memories = await prisma.agentMemory.findMany({ where: { customerId: customer.id } });
    const memoryContext = memories.length > 0 
      ? memories.map(m => `- ${m.memoryKey}: ${m.memoryValue}`).join('\n') 
      : "No previous history.";

    // AI Diagnosis
    const aiDecision = await aiService.analyzeFailure(paymentData, memoryContext);
    
    await prisma.recoveryDecision.create({
      data: {
        riskId: risk.id,
        recommendedAction: aiDecision.recommendedAction,
        confidence: aiDecision.confidence,
        reason: aiDecision.reason,
        expectedAmount: risk.amount,
        riskLevel: aiDecision.riskLevel
      }
    });

    await prisma.auditLog.create({
      data: { eventType: 'AI_DIAGNOSIS', riskId: risk.id, actor: 'AI', details: `Recommended: ${aiDecision.recommendedAction}. Reason: ${aiDecision.reason}. Used memory context.` }
    });

    // Policy Guardrails
    const policyResult = await policyEngine.evaluate(risk, aiDecision);
    
    await prisma.policyDecision.create({
      data: {
        riskId: risk.id,
        action: aiDecision.recommendedAction,
        status: policyResult.status,
        reason: policyResult.reason
      }
    });

    await prisma.auditLog.create({
      data: { eventType: 'POLICY_CHECK', riskId: risk.id, actor: 'SYSTEM', details: `Policy result: ${policyResult.status}. Reason: ${policyResult.reason}` }
    });

    // Execution / Escalation
    if (policyResult.status === 'ALLOW') {
      try {
        let apiResponse = '';

        if (aiDecision.recommendedAction === 'GENERATE_PAYMENT_LINK') {
          const link = await razorpayService.createPaymentLink(
            risk.amount,
            risk.currency,
            'RazorShield Payment Recovery',
            { name: customer.name, email: customer.email, contact: customer.phone || '' }
          );
          apiResponse = JSON.stringify({ linkId: link.id, url: link.short_url });
        }

        if (aiDecision.recommendedAction === 'RETRY_PAYMENT') {
          const retryResult = await razorpayService.retryPayment(
            payment.razorpayPaymentId || payment.id,
            risk.amount,
            risk.currency,
            payment.method || null,
            { name: customer.name, email: customer.email, contact: customer.phone || '' }
          );
          apiResponse = JSON.stringify({
            orderId: retryResult.orderId,
            linkId: retryResult.linkId,
            url: retryResult.shortUrl,
          });
        }

        await prisma.recoveryAction.create({
          data: {
            riskId: risk.id,
            actionType: aiDecision.recommendedAction,
            status: 'SUCCESS',
            apiResponse
          }
        });

        // For RETRY and PAYMENT_LINK we optimistically mark revenue as recovered
        // once the action is dispatched (Razorpay confirmation comes via webhook)
        if (['RETRY_PAYMENT', 'GENERATE_PAYMENT_LINK'].includes(aiDecision.recommendedAction)) {
          await prisma.revenueRisk.update({
            where: { id: risk.id },
            data: {
              status: 'RECOVERED',
              recoveredAmount: risk.amount,
            }
          });
        }
        
        await prisma.auditLog.create({
          data: { eventType: 'ACTION_EXECUTED', riskId: risk.id, actor: 'SYSTEM', details: `Executed ${aiDecision.recommendedAction} successfully.` }
        });
        
        // Save Agent Memory
        await prisma.agentMemory.create({
            data: {
                customerId: customer.id,
                memoryKey: 'PREVIOUS_ACTION',
                memoryValue: `Executed ${aiDecision.recommendedAction} for failure ${payment.failureReason}.`
            }
        });

      } catch (e: any) {
         await prisma.recoveryAction.create({
           data: {
             riskId: risk.id,
             actionType: aiDecision.recommendedAction,
             status: 'FAILED',
             apiResponse: e.message
           }
         });
         await prisma.revenueRisk.update({
             where: { id: risk.id },
             data: { status: 'FAILED' }
         });
         await prisma.auditLog.create({
            data: { eventType: 'ACTION_FAILED', riskId: risk.id, actor: 'SYSTEM', details: `Failed to execute action: ${e.message}` }
         });
      }
    } else if (policyResult.status === 'REQUIRE_HUMAN' || policyResult.status === 'BLOCK') {
      await prisma.revenueRisk.update({
        where: { id: risk.id },
        data: { status: 'ESCALATED' }
      });
      
      await prisma.humanReview.create({
        data: {
          riskId: risk.id,
          reason: policyResult.reason,
          status: 'PENDING'
        }
      });

      await prisma.auditLog.create({
        data: { eventType: 'ESCALATED_TO_HUMAN', riskId: risk.id, actor: 'SYSTEM', details: `Escalated due to policy: ${policyResult.reason}` }
      });
    }
  }
}
