// change the API
import AIContext from './types/aicontext';

export class AIService {
  constructor(private apiKey: string) {}

  async generateAnnotation(context: AIContext, selection: string): Promise<string> {
    const prompt = this.#createPrompt(context, selection);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });
    const json = await response.json();
    return json.choices[0].message.content;
  }

  #createPrompt(context: AIContext, selection: string): string {
    return `explain this highlighted text in context:
    
    Article Title: ${context.title}
    Abstract: ${context.abstract}
    
    Selected Text: "${selection}"
    
    Provide:
    1. Simple explanation
    2. Key terms definitions
    3. Related concepts
    4. Potential questions for further research`;
  }
} 