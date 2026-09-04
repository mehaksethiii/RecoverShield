export class GroqService {
  private apiKey: string;
  private endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('placeholder') && this.apiKey.trim().length > 10);
  }

  async chatCompletion(messages: Array<{ role: string; content: string }>, jsonMode: boolean = false): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Groq API Key not configured');
    }

    const body: Record<string, any> = {
      model: 'openai/gpt-oss-120b',
      messages,
      temperature: 0.2
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  }
}
