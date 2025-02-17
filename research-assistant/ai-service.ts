interface AIContext {
  title: string;
  abstract: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  constructor(private apiKey: string) {}

  async generateAnnotation(context: AIContext, selection: string): Promise<AIResponse> {
    const prompt = this.createPrompt(context, selection);
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
    return response.json();
  }

  private createPrompt(context: AIContext, selection: string): string {
    return `As a research assistant, explain this highlighted text in context:
    
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