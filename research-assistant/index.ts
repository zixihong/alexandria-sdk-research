import KeybindManager from './types/keybinds';
import Config from './types/config';
import AIContext from './types/aicontext';
import AIPopup from './types/aipopup';
import dotenv from 'dotenv';
dotenv.config();
import LlamaAI from 'llamaai';

const apiToken = process.env.API_KEY || '';
if (!process.env.API_KEY) {
  console.warn('unable to find API_KEY in environment variables');
}
const llama = new LlamaAI(apiToken);

export default class AlexandriaResearch {
  #config: Config;
  #keybindManager: KeybindManager;

  constructor(config: Partial<Config> = {}) {
    this.#config = {
      aiApiKey: '',
      maxTokens: 500,
      ...config
    };
    
    this.#keybindManager = new KeybindManager();
    this.#initializeKeybinds();
    this.#addScanButton();
  }

  #initializeKeybinds(): void {
    this.#keybindManager.register('shift+a', (e: KeyboardEvent) => {
      const selection = window.getSelection()!.toString();
      const context = this.#getPageContext();
      this.#showAIPopup(selection, context);
    });
  }

  #getPageContext(): AIContext {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    let paragraphText = '';

    if (range) {
      const commonAncestor = range.commonAncestorContainer;
      const elementAncestor = commonAncestor.nodeType === Node.ELEMENT_NODE
        ? commonAncestor as Element
        : commonAncestor.parentElement;

      const paragraph = elementAncestor?.closest('p');
      paragraphText = paragraph?.textContent || '';
    }

    return {
      title: document.title,
      abstract: document.querySelector('.abstract')?.textContent || '',
      sections: Array.from(document.querySelectorAll('section')).map(section => ({
        heading: section.querySelector('h2')?.textContent || '',
        content: section.textContent || ''
      })),
      context: paragraphText
    };
  }

  #showAIPopup(selection: string, context: AIContext): void {
    const popup = new AIPopup(selection, context);
    document.body.appendChild(popup.render());
  }

  #addScanButton(): void {
    const button = document.createElement('button');
    button.textContent = 'Scan for Difficult Words';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    document.body.appendChild(button);

    button.addEventListener('click', async () => {
      await this.#scanForDifficultWords();
    });
  }

  async #scanForDifficultWords(): Promise<void> {
    const textContent = document.body.innerText;
    const chunks = this.#chunkText(textContent, 4); // Divide into 4-page chunks

    for (const chunk of chunks) {
      const difficultWords = await this.#getDifficultWordsFromLLM(chunk);
      this.#underlineDifficultWords(difficultWords);
    }
  }

  #chunkText(text: string, pages: number): string[] {
    const wordsPerPage = 300; // Approximate words per page
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage * pages) {
      chunks.push(words.slice(i, i + wordsPerPage * pages).join(' '));
    }

    return chunks;
  }

  async #getDifficultWordsFromLLM(text: string): Promise<{ word: string, definition: string }[]> {
    const apiRequestJson = {
      "model": "llama3.2-3b",
      "messages": [
        {"role": "user", "content": text},
      ],
      "functions": [
        {
          "name": "identify_difficult_words",
          "description": "Identify difficult words and provide definitions with context from the rest of the sentence.",
          "parameters": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string",
                "description": "The text to analyze for difficult words",
              }
            },
            "required": ["text"]
          }
        }
      ],
      "stream": false,
      "function_call": "identify_difficult_words",
      "max_tokens": this.#config.maxTokens || 500
    };
    const response = await llama.run(apiRequestJson);
    const data = await response.json();
    return data.choices[0].message; // adjust based on the actual response structure
  }


  #underlineDifficultWords(difficultWords: { word: string, definition: string }[]): void {
    const textNodes = this.#getTextNodes(document.body);

    textNodes.forEach(node => {
      const parent = node.parentElement;
      if (parent) {
        const words = node.textContent?.split(/\s+/) || [];
        const newContent = words.map(word => {
          const difficultWord = difficultWords.find(dw => dw.word.toLowerCase() === word.toLowerCase());
          if (difficultWord) {
            return `<span class="difficult-word" style="text-decoration: underline; cursor: pointer;" data-definition="${difficultWord.definition}">${word}</span>`;
          }
          return word;
        }).join(' ');

        parent.innerHTML = newContent;
      }
    });

    this.#addDefinitionListeners();
  }

  #addDefinitionListeners(): void {
    const difficultWords = document.querySelectorAll('.difficult-word');
    difficultWords.forEach(word => {
      word.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const definition = target.getAttribute('data-definition');
        const definitionBox = document.createElement('div');
        definitionBox.textContent = definition || 'No definition available.';
        definitionBox.style.position = 'absolute';
        definitionBox.style.background = 'white';
        definitionBox.style.border = '1px solid black';
        definitionBox.style.padding = '5px';
        definitionBox.style.zIndex = '1000';
        document.body.appendChild(definitionBox);

        const rect = target.getBoundingClientRect();
        definitionBox.style.left = `${rect.left}px`;
        definitionBox.style.top = `${rect.bottom + window.scrollY}px`;
      });
    });
  }

  #getTextNodes(node: Node): Node[] {
    const textNodes: Node[] = [];
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      node.childNodes.forEach(child => {
        textNodes.push(...this.#getTextNodes(child));
      });
    }
    return textNodes;
  }
} 