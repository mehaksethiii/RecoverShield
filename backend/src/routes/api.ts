import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SimulationEngine } from '../services/SimulationEngine';
import { EvaluationEngine } from '../services/EvaluationEngine';
import { AIService } from '../services/AIService';

const router = Router();
const prisma = new PrismaClient();
const simulationEngine = new SimulationEngine();
const evaluationEngine = new EvaluationEngine();
// We can use GoogleGenAI directly for Copilot or reuse AIService
import { GoogleGenAI } from '@google/genai';

router.get('/dashboard', async (req, res) => {
  const risks = await prisma.revenueRisk.findMany({
    include: { payment: true, customer: true },
    orderBy: { detectedAt: 'desc' },
    take: 50
  });
  
  const totalRisk = risks.reduce((sum, r) => sum + r.amount, 0);
  const recovered = risks.filter(r => r.status === 'RECOVERED').reduce((sum, r) => sum + (r.recoveredAmount || 0), 0);
  const activeRisks = risks.filter(r => r.status === 'PENDING').length;
  
  // Guarded actions
  const blockedActions = await prisma.policyDecision.count({ where: { status: 'BLOCK' }});

  res.json({
    totalRisk,
    recovered,
    activeRisks,
    blockedActions,
    risks
  });
});

// ── Real chart data endpoints ──────────────────────────────────────────────

// Recovery Trend: last 7 days — recovered amount vs risk amount per day
router.get('/charts/recovery-trend', async (req, res) => {
  try {
    const days: { name: string; recovered: number; risk: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const dayName = start.toLocaleDateString('en-US', { weekday: 'short' });

      const risksInDay = await prisma.revenueRisk.findMany({
        where: { detectedAt: { gte: start, lte: end } }
      });

      const risk = risksInDay.reduce((s, r) => s + r.amount, 0);
      const recovered = risksInDay
        .filter(r => r.status === 'RECOVERED')
        .reduce((s, r) => s + (r.recoveredAmount || 0), 0);

      days.push({ name: dayName, recovered: Math.round(recovered / 100), risk: Math.round(risk / 100) });
    }
    res.json(days);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Recovery Strategy Distribution: count of each actionType from RecoveryAction
router.get('/charts/strategy-distribution', async (req, res) => {
  try {
    const actions = await prisma.recoveryAction.groupBy({
      by: ['actionType'],
      _count: { actionType: true },
      where: { status: 'SUCCESS' }
    });

    const labelMap: Record<string, string> = {
      RETRY_PAYMENT: 'Smart Retry',
      GENERATE_PAYMENT_LINK: 'Payment Link',
      ESCALATE_HUMAN: 'Escalated',
      DO_NOTHING: 'No Action'
    };

    const data = actions.map(a => ({
      name: labelMap[a.actionType] || a.actionType,
      value: a._count.actionType
    }));

    // If no data yet, return empty so chart shows "no data" state
    res.json(data.length > 0 ? data : []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Common Failure Reasons: aggregate failureReason from RevenueRisk
router.get('/charts/failure-reasons', async (req, res) => {
  try {
    const risks = await prisma.revenueRisk.findMany({
      where: { failureReason: { not: null } },
      select: { failureReason: true }
    });

    const counts: Record<string, number> = {};
    for (const r of risks) {
      const raw = (r.failureReason || '').toLowerCase();
      let bucket = 'Other';
      if (raw.includes('timeout'))         bucket = 'UPI Timeout';
      else if (raw.includes('funds') || raw.includes('balance')) bucket = 'No Funds';
      else if (raw.includes('declined') || raw.includes('decline')) bucket = 'Declined';
      else if (raw.includes('bank'))       bucket = 'Bank Error';
      else if (raw.includes('upi'))        bucket = 'UPI Error';
      counts[bucket] = (counts[bucket] || 0) + 1;
    }

    const data = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json(data.length > 0 ? data : []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Live risk score metrics — UPI/card/chargeback computed from DB
router.get('/charts/risk-scores', async (req, res) => {
  try {
    const last100 = await prisma.revenueRisk.findMany({
      orderBy: { detectedAt: 'desc' },
      take: 100,
      include: { payment: true }
    });
    const total = last100.length || 1;

    const upiFailures = last100.filter(r =>
      r.payment?.method === 'upi' || (r.failureReason || '').toLowerCase().includes('upi') || (r.failureReason || '').toLowerCase().includes('timeout')
    ).length;

    const cardDeclines = last100.filter(r =>
      r.payment?.method === 'card' || (r.failureReason || '').toLowerCase().includes('decline')
    ).length;

    const escalated = last100.filter(r => r.status === 'ESCALATED').length;

    res.json({
      upiFailureRate: Math.min(99, Math.round((upiFailures / total) * 100)),
      cardDeclineRisk: Math.min(99, Math.round((cardDeclines / total) * 100)),
      chargebackRisk: Math.min(99, Math.round((escalated / total) * 100))
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/simulations', async (req, res) => {
    try {
        const { count = 10 } = req.body;
        let merchant = await prisma.merchant.findFirst();
        if (!merchant) {
            merchant = await prisma.merchant.create({ data: { name: 'Demo Merchant' } });
        }

        const sim = await simulationEngine.runSimulation(merchant.id, count);
        const evalResult = await evaluationEngine.evaluateSimulation(sim.id);
        
        res.json({ simulation: sim, evaluation: evalResult });
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/simulations', async (req, res) => {
    const sims = await prisma.simulationRun.findMany({
        include: { evaluation: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(sims);
});

router.get('/audit', async (req, res) => {
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    });
    res.json(logs);
});

router.post('/copilot', async (req, res) => {
    try {
        const { query } = req.body;
        const risks = await prisma.revenueRisk.findMany({ take: 20, orderBy: { detectedAt: 'desc' }});
        const evalData = await prisma.evaluationRun.findMany({ take: 1, orderBy: { createdAt: 'desc' }});
        
        const context = `
            Database Snapshot:
            Recent Risks: ${JSON.stringify(risks)}
            Recent Evaluation Metrics: ${JSON.stringify(evalData)}
        `;

        // 1. Try Gemini
        try {
            if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder')) {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: `You are the RazorShield Merchant Copilot. Answer the merchant's question based on this data: ${context}\n\nQuestion: ${query}`
                });
                if (response.text) {
                    return res.json({ response: response.text });
                }
            }
        } catch (geminiErr: any) {
            console.warn("Gemini copilot failed, attempting Groq fallback:", geminiErr?.message || geminiErr);
        }

        // 2. Try Groq
        if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 10) {
            try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`
                    },
                    body: JSON.stringify({
                        model: 'openai/gpt-oss-120b',
                        messages: [
                            {
                                role: 'system',
                                content: `You are the RazorShield Merchant Copilot. Answer the merchant's questions concisely using this merchant data:\n${context}`
                            },
                            { role: 'user', content: query }
                        ],
                        temperature: 0.4
                    })
                });

                if (groqRes.ok) {
                    const groqData: any = await groqRes.json();
                    const text = groqData?.choices?.[0]?.message?.content;
                    if (text) {
                        return res.json({ response: text });
                    }
                }
            } catch (groqErr) {
                console.warn("Groq copilot fallback failed:", groqErr);
            }
        }

        // 3. Fallback response based on data
        const totalRisk = risks.reduce((sum, r) => sum + r.amount, 0);
        const resolved = risks.filter(r => r.status === 'RECOVERED').length;
        res.json({
            response: `Based on your recent RazorShield telemetry, there are ${risks.length} recent risk events totaling ₹${(totalRisk / 100).toLocaleString()}, with ${resolved} successfully recovered or intervened by guardrails. Both Gemini and Groq fallbacks are safely managed.`
        });
    } catch(e: any) {
        console.error("Copilot Error:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/policies', async (req, res) => {
    let merchant = await prisma.merchant.findFirst();
    if (!merchant) return res.json([]);
    const policies = await prisma.policyRule.findMany({ where: { merchantId: merchant.id }});
    res.json(policies);
});

router.post('/policies', async (req, res) => {
    try {
        const { ruleType, conditionValue, action, isActive } = req.body;
        let merchant = await prisma.merchant.findFirst();
        if (!merchant) merchant = await prisma.merchant.create({ data: { name: 'Demo Merchant' } });

        const existing = await prisma.policyRule.findFirst({
            where: { merchantId: merchant.id, ruleType }
        });

        if (existing) {
            await prisma.policyRule.update({
                where: { id: existing.id },
                data: { conditionValue, action, isActive }
            });
        } else {
            await prisma.policyRule.create({
                data: { merchantId: merchant.id, ruleType, conditionValue, action, isActive }
            });
        }
        res.json({ success: true });
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
