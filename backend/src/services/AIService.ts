import { GoogleGenAI, Type, Schema } from '@google/genai';
import { GroqService } from './GroqService';

export class AIService {
  private ai: GoogleGenAI;
  private groq: GroqService;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });
    this.groq = new GroqService();
  }

  async analyzeFailure(paymentData: any, memoryContext: string = "No previous history.") {
    const prompt = `You are the RecoverAI Revenue Recovery Agent.
Analyze this payment failure and recommend a recovery action.
You must choose one of: RETRY_PAYMENT, GENERATE_PAYMENT_LINK, ESCALATE_HUMAN, DO_NOTHING.

Customer Historical Memory:
${memoryContext}

Payment Data:
${JSON.stringify(paymentData, null, 2)}

Return ONLY valid JSON with keys:
- recommendedAction: string ("RETRY_PAYMENT", "GENERATE_PAYMENT_LINK", "ESCALATE_HUMAN", or "DO_NOTHING")
- confidence: number between 0.0 and 1.0
- reason: detailed explanation grounded in available data
- riskLevel: "LOW", "MEDIUM", or "HIGH"`;
    
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        recommendedAction: {
          type: Type.STRING,
          description: "Action to take: RETRY_PAYMENT, GENERATE_PAYMENT_LINK, ESCALATE_HUMAN, DO_NOTHING"
        },
        confidence: {
          type: Type.NUMBER,
          description: "Confidence from 0.0 to 1.0"
        },
        reason: {
          type: Type.STRING,
          description: "Detailed explanation grounded in the available transaction data."
        },
        riskLevel: {
          type: Type.STRING,
          description: "LOW, MEDIUM, or HIGH"
        }
      },
      required: ["recommendedAction", "confidence", "reason", "riskLevel"]
    };

    // 1. Try Google Gemini
    try {
      if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder')) {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });
        
        const text = response.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (geminiError: any) {
      console.warn('Gemini API call failed (rate limit/quota or network). Checking Groq fallback...', geminiError?.message || geminiError);
    }

    // 2. Try Groq Fallback
    try {
      if (this.groq.isAvailable()) {
        console.log('Using Groq fallback for failure analysis...');
        const groqResponse = await this.groq.chatCompletion([
          {
            role: 'system',
            content: 'You are the RecoverAI Revenue Recovery Agent. Output only valid JSON matching the requested schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ], true);

        if (groqResponse) {
          return JSON.parse(groqResponse);
        }
      }
    } catch (groqError: any) {
      console.warn('Groq API fallback also failed:', groqError?.message || groqError);
    }

    // 3. Deterministic Fallback
    console.log('Falling back to deterministic rule engine...');
    return this.fallbackAnalysis(paymentData);
  }

  private fallbackAnalysis(paymentData: any) {
    const isTimeout = paymentData.error_description?.toLowerCase().includes('timeout');
    
    if (isTimeout) {
      return {
        recommendedAction: 'RETRY_PAYMENT',
        confidence: 0.92,
        reason: 'The transaction failed due to a timeout which is typically a transient network issue. High probability of success on retry.',
        riskLevel: 'LOW'
      };
    } else {
      return {
        recommendedAction: 'GENERATE_PAYMENT_LINK',
        confidence: 0.85,
        reason: 'Payment declined by issuer. Recommend sending a payment link for alternate method.',
        riskLevel: 'MEDIUM'
      };
    }
  }
}
