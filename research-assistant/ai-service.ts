// change the API
import AIContext from './types/aicontext';
import LlamaAI from 'llamaai';

const apiToken = process.env.API_KEY || '';
if (!process.env.API_KEY) {
  console.warn('unable to find API_KEY in environment variables');
}
const llama = new LlamaAI(apiToken);

export class AIService {
  constructor(private apiKey: string) {}

  async #generateAnnotation(context: AIContext, selection: string): Promise<string> {
    const apiRequestJson = {
      "model": "llama3.2-3b",
      "messages": [
        {"role": "user", "content": selection},
      ],
      "functions": [
        {
          "name": "generate_annotation",
          "description": "Generate an annotation for the selected text in context.",
          "parameters": {
            "type": "object",
            "properties": {
              "context": {
                "type": "object",
                "description": "The context of the selected text",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "The title of the document"
                  },
                  "abstract": {
                    "type": "string",
                    "description": "The abstract of the document"
                  },
                  "sections": {
                    "type": "array",
                    "description": "Sections of the document",
                    "items": {
                      "type": "object",
                      "properties": {
                        "heading": {
                          "type": "string",
                          "description": "The heading of the section"
                        },
                        "content": {
                          "type": "string",
                          "description": "The content of the section"
                        }
                      }
                    }
                  },
                  "context": {
                    "type": "string",
                    "description": "The paragraph text where the selection is made"
                  }
                }
              },
              "selection": {
                "type": "string",
                "description": "The text selected by the user"
              }
            },
            "required": ["context", "selection"]
          }
        }
      ],
      "stream": false,
      "function_call": "generate_annotation",
    };
    const response = await llama.run(apiRequestJson);
    const data = await response.json();
    return data.choices[0].message;
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