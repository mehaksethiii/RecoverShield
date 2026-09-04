import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EvaluationEngine {
  async evaluateSimulation(simulationId: string) {
    const sim = await prisma.simulationRun.findUnique({ where: { id: simulationId } });
    if (!sim) return null;

    const risks = await prisma.revenueRisk.findMany({
        where: {
            detectedAt: { gte: sim.createdAt }
        },
        include: { decisions: true, policyDecisions: true, actions: true }
    });

    let baselineRecovery = 0;
    let aiRecovery = 0;
    let successfulActions = 0;
    let failedActions = 0;
    let blockedActions = 0;
    let escalated = 0;
    let totalRisk = 0;

    for (const risk of risks) {
        totalRisk += risk.amount;

        // Baseline: simple retry logic would recover some percentage of timeout failures
        if (risk.failureReason?.includes('timeout')) {
             baselineRecovery += Math.floor(risk.amount * 0.4); // 40% baseline
        }

        // AI recovery calculations
        if (risk.status === 'RECOVERED') {
            aiRecovery += risk.recoveredAmount || 0;
        } else if (risk.actions.some(a => a.status === 'SUCCESS')) {
            aiRecovery += Math.floor(risk.amount * (risk.recoveryProbability || 0.8));
            successfulActions++;
        }

        if (risk.status === 'ESCALATED') escalated++;
        if (risk.policyDecisions.some(p => p.status === 'BLOCK')) blockedActions++;
        if (risk.actions.some(a => a.status === 'FAILED')) failedActions++;
    }

    const incrementalRevenue = Math.max(0, aiRecovery - baselineRecovery);
    const recoveryRate = totalRisk > 0 ? aiRecovery / totalRisk : 0;
    
    const evaluation = await prisma.evaluationRun.create({
        data: {
            simulationId,
            baselineRecovery,
            aiRecovery,
            incrementalRevenue,
            recoveryRate,
            interventionRate: risks.length > 0 ? successfulActions / risks.length : 0,
            escalationRate: risks.length > 0 ? escalated / risks.length : 0,
            blockedActions,
            successfulActions,
            failedActions
        }
    });

    return evaluation;
  }
}
