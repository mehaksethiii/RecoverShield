import { PrismaClient } from '@prisma/client';
import { AgentService } from './AgentService';

const prisma = new PrismaClient();
const agentService = new AgentService();

export class SimulationEngine {
  async runSimulation(merchantId: string, count: number) {
    const simulation = await prisma.simulationRun.create({
      data: {
        merchantId,
        name: `Batch Simulation ${count} Events`,
        totalEvents: count,
        status: 'RUNNING'
      }
    });

    let simulatedEvents = [];
    
    // Generate synthetic events
    for (let i = 0; i < count; i++) {
      const isTimeout = Math.random() > 0.4;
      const isHighValue = Math.random() > 0.9;
      const amount = isHighValue ? 15000000 : Math.floor(Math.random() * 50000) + 1000;

      const payload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_sim_' + Math.random().toString(36).substring(7),
              order_id: 'order_sim_' + Math.random().toString(36).substring(7),
              amount: amount,
              currency: 'INR',
              method: Math.random() > 0.3 ? 'upi' : 'card',
              error_description: isTimeout ? 'UPI transaction timeout' : 'Insufficient funds'
            }
          }
        }
      };
      
      const simEvent = await prisma.simulationEvent.create({
          data: {
              simulationId: simulation.id,
              eventType: payload.event,
              payload: JSON.stringify(payload)
          }
      });
      simulatedEvents.push({ event: simEvent, payload });
    }

    // Process events through agent
    for (const item of simulatedEvents) {
        try {
           await agentService.handleRazorpayEvent(item.payload);
        } catch(e) {
           console.error("Simulation error on event", e);
        }
    }

    await prisma.simulationRun.update({
        where: { id: simulation.id },
        data: { status: 'COMPLETED' }
    });

    return simulation;
  }
}
