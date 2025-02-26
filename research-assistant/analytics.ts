import dotenv from 'dotenv';
dotenv.config();
import LlamaAI from 'llamaai'; //ts ignored 

const apiToken = process.env.API_KEY || '';
if (!process.env.API_KEY) {
  console.warn('unable to find API_KEY in environment variables');
}
const llama = new LlamaAI(apiToken);

interface AnalyticsData {
  type: string;
  content: string;
  position: DOMRect;
  timestamp: number;
  viewport: { width: number; height: number };
}


export default class AnalyticsService implements AnalyticsService {
  #config: { maxTokens?: number };
  
  constructor(private endpoint: string, config: { maxTokens?: number } = { maxTokens: 1000 }) {
    this.#config = config;
    this.#initHeatmapTracking();
  }

  #initHeatmapTracking(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      this.#trackInteraction('click', e.target as HTMLElement);
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'a' && e.shiftKey) {
        this.trackAnnotationEvent(window.getSelection()!);
      }
    });
  }

  trackAnnotationEvent(selection: Selection): void {
    const position = this.#getElementPosition(selection.focusNode?.parentElement!);
    const data: AnalyticsData = {
      type: 'annotation',
      content: selection.toString(),
      position,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.#sendToBackend(data);
  }

  #getElementPosition(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  #sendToBackend(data: AnalyticsData): void {
    navigator.sendBeacon(this.endpoint, JSON.stringify(data));
  }

  #trackInteraction(eventType: string, element: HTMLElement): void {
    const data: AnalyticsData = {
      type: eventType,
      content: element.textContent || '',
      position: this.#getElementPosition(element),
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.#sendToBackend(data);
  }

  #addChatbotButton(): void {
    const button = document.createElement('button');
    button.textContent = 'Chat!';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    document.body.appendChild(button);

    button.addEventListener('click', () => {
      this.#toggleChatbot();
    });
  }

  #toggleChatbot(): void {
    let chatbot = document.querySelector('.chatbot');
    if (!chatbot) {
      chatbot = document.createElement('div');
      chatbot.className = 'chatbot';
      (chatbot as HTMLElement).style.position = 'fixed';
      (chatbot as HTMLElement).style.bottom = '50px';
      (chatbot as HTMLElement).style.right = '10px';
      (chatbot as HTMLElement).style.width = '300px';
      (chatbot as HTMLElement).style.height = '400px';
      (chatbot as HTMLElement).style.background = 'white';
      (chatbot as HTMLElement).style.border = '1px solid black';
      (chatbot as HTMLElement).style.zIndex = '1000';
      (chatbot as HTMLElement).style.overflow = 'auto';
      document.body.appendChild(chatbot);

      const input = document.createElement('input');
      input.type = 'text';
      input.style.width = 'calc(100% - 20px)';
      input.style.margin = '10px';
      chatbot.appendChild(input);

      input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          const userMessage = input.value;
          input.value = '';
          this.#addMessageToChatbot(chatbot as HTMLElement, 'User', userMessage);
          const response = await this.#getResponseFromLLaMA(userMessage);
          this.#addMessageToChatbot(chatbot as HTMLElement, 'LLaMA', response);
        }
      });
    } else {
      (chatbot as HTMLElement).style.display = (chatbot as HTMLElement).style.display === 'none' ? 'block' : 'none';
    }
  }

  #addMessageToChatbot(chatbot: Element, sender: string, message: string): void {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    messageElement.style.margin = '10px';
    chatbot.appendChild(messageElement);
    chatbot.scrollTop = chatbot.scrollHeight;
  }

  async #getResponseFromLLaMA(message: string): Promise<string> {
    const apiRequestJson = {
      "model": "llama3.2-3b",
      "messages": [
        {"role": "user", "content": message},
      ],
      "functions": [
        {
          "name": "get_response",
          "description": "Get a response from the LLaMA model",
          "parameters": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string",
                "description": "The message to send to the LLaMA model",
              }
            },
            "required": ["message"]
          }
        }
      ],
      "stream": true,
      "function_call": "get_response",
      "max_tokens": this.#config.maxTokens || 1000
    };

    const response = await llama.run(apiRequestJson);
    const data = await response.json();
    return data.choices[0].message;
  }
} 