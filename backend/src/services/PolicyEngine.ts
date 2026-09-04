import { PrismaClient, RevenueRisk } from '@prisma/client';

const prisma = new PrismaClient();

export class PolicyEngine {
  async evaluate(risk: RevenueRisk, aiDecision: any) {
    const rules = await prisma.policyRule.findMany({
      where: { merchantId: risk.merchantId, isActive: true }
    });

    let status = 'ALLOW';
    let reasons: string[] = [];

    // Evaluate dynamic rules
    for (const rule of rules) {
      const conditionValue = parseFloat(rule.conditionValue);
      
      if (rule.ruleType === 'HIGH_VALUE_THRESHOLD') {
        if (risk.amount > conditionValue) {
          status = this.escalateStatus(status, rule.action);
          reasons.push(`Amount exceeds threshold of ${conditionValue}`);
        }
      }
      
      if (rule.ruleType === 'MIN_CONFIDENCE_THRESHOLD') {
        if (aiDecision.confidence < conditionValue) {
          status = this.escalateStatus(status, rule.action);
          reasons.push(`Confidence ${aiDecision.confidence} is below threshold ${conditionValue}`);
        }
      }

      if (rule.ruleType === 'MAX_RETRY_ATTEMPTS') {
        // Count previous actions
        const pastActions = await prisma.recoveryAction.count({
          where: { riskId: risk.id }
        });
        if (pastActions >= conditionValue) {
          status = this.escalateStatus(status, rule.action);
          reasons.push(`Max retry limit of ${conditionValue} reached`);
        }
      }

      if (rule.ruleType === 'BLOCK_ACTION_TYPE') {
        if (aiDecision.recommendedAction === rule.conditionValue) {
           status = this.escalateStatus(status, rule.action);
           reasons.push(`Action ${aiDecision.recommendedAction} is blocked by policy`);
        }
      }
    }

    // Default static guardrails if dynamic rules don't catch it
    if (aiDecision.recommendedAction === 'DO_NOTHING') {
       status = 'BLOCK';
       reasons.push('AI recommended no action.');
    }
    
    // Always require human if above 1,00,000 INR natively to prevent abuse, unless a rule overrides? 
    // Usually best to leave to DB rules, but fallback is safe:
    if (rules.length === 0 && risk.amount > 100000) {
      status = 'REQUIRE_HUMAN';
      reasons.push('System fallback: high value transaction requires human review.');
    }

    return {
      status,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Passed all guardrails'
    };
  }
  
  private escalateStatus(currentStatus: string, action: string) {
    if (currentStatus === 'BLOCK') return 'BLOCK'; // Block is highest precedence
    if (action === 'BLOCK') return 'BLOCK';
    if (action === 'REQUIRE_HUMAN') return 'REQUIRE_HUMAN';
    return currentStatus;
  }
}
